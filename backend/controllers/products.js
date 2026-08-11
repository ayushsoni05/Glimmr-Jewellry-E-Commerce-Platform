const mongoose = require('mongoose');
const Product = require('../models/Product');
const axios = require('axios');
const { calculateProductPrice, getCurrentMetalPrices } = require('../utils/priceCalculator');
const { getImageForCategoryAndMaterial } = require('../utils/productImages');

const getProducts = async (req, res) => {
  try {
    let { category, material, minPrice, maxPrice, sort, page = 1, limit = 100, search } = req.query;

    // Safe parsing and validation
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 100;
    minPrice = minPrice ? parseFloat(minPrice) : undefined;
    maxPrice = maxPrice ? parseFloat(maxPrice) : undefined;

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 100;
    if (minPrice !== undefined && isNaN(minPrice)) minPrice = undefined;
    if (maxPrice !== undefined && isNaN(maxPrice)) maxPrice = undefined;

    // Build match object for non-price filters
    const match = {};

    // Search functionality
    if (search && String(search).trim() !== '') {
      const searchTerm = String(search).trim();
      match.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { material: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Normalize filters and ignore empty strings so "All" selections don't filter out everything
    const normalizedCategory = normalizeCategory(category);
    if (normalizedCategory) {
      const stem = normalizedCategory.replace(/s$/, '');
      match.category = { $regex: new RegExp(`^${stem}s?$`, 'i') };
    }
    if (material && String(material).trim() !== '') {
      match.material = String(material).trim();
    }

    // Fetch live per-gram prices (with fallbacks)
    let perGramGold = 6500;
    let perGramSilver = 75;
    try {
      const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
      const base = `http://localhost:${backendPort}/api/prices`;
      await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
      const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
      if (latest?.data?.gold?.price) {
        const g = Number(latest.data.gold.price);
        if (!isNaN(g) && g > 0) perGramGold = g;
      }
      if (latest?.data?.silver?.price) {
        const s = Number(latest.data.silver.price);
        if (!isNaN(s) && s > 0) perGramSilver = s;
      }
    } catch (e) {
      console.warn('Live per-gram fetch failed, using defaults:', e && e.message ? e.message : e);
    }

    // Computed price expression (gold/silver live; else stored price)
    const computedPriceExpr = {
      $cond: [
        { $eq: [{ $toLower: "$material" }, "gold"] },
        {
          $round: [
            {
              $multiply: [
                perGramGold,
                { $ifNull: ["$weight", 0] },
                {
                  $cond: [
                    { $eq: [{ $ifNull: ["$karat", 24] }, 24] },
                    1.0,
                    {
                      $cond: [
                        { $eq: [{ $ifNull: ["$karat", 24] }, 22] },
                        22 / 24,
                        {
                          $cond: [
                            { $eq: [{ $ifNull: ["$karat", 24] }, 18] },
                            18 / 24,
                            { $divide: [{ $ifNull: ["$karat", 24] }, 24] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            0
          ]
        },
        {
          $cond: [
            { $eq: [{ $toLower: "$material" }, "silver"] },
            { $round: [{ $multiply: [perGramSilver, { $ifNull: ["$weight", 0] }] }, 0] },
            { $ifNull: ["$price", 0] }
          ]
        }
      ]
    };

    // Build aggregation pipeline
    const basePipeline = [
      { $match: match },
      { $addFields: { computedPrice: computedPriceExpr } },
    ];

    // Apply price range on computedPrice
    const priceRange = {};
    if (minPrice !== undefined) priceRange.$gte = minPrice;
    if (maxPrice !== undefined) priceRange.$lte = maxPrice;
    if (Object.keys(priceRange).length > 0) {
      basePipeline.push({ $match: { computedPrice: priceRange } });
    }

    // Sorting
    let sortStage;
    if (sort === 'price') sortStage = { $sort: { computedPrice: 1 } };
    else if (sort === 'newest') sortStage = { $sort: { createdAt: -1 } };
    else if (sort === 'popularity') sortStage = { $sort: { rating: -1 } };
    else sortStage = { $sort: { createdAt: -1 } };

    const skip = (page - 1) * limit;
    const resultsPipeline = [...basePipeline, sortStage, { $skip: skip }, { $limit: limit }];
    const countPipeline = [...basePipeline, { $count: 'total' }];

    console.log('Products aggregate pipeline:', JSON.stringify(resultsPipeline));
    const [productsAgg, countAgg] = await Promise.all([
      Product.aggregate(resultsPipeline),
      Product.aggregate(countPipeline),
    ]);

    // Enrich results with full price calculation, especially for diamond items
    const enrichedProducts = await Promise.all(productsAgg.map(async (p) => {
      try {
        const { price, breakdown } = await calculateProductPrice(
          p,
          perGramGold,
          perGramSilver,
        );

        return {
          ...p,
          price,
          computedPrice: price,
          priceBreakdown: breakdown,
        };
      } catch (calcErr) {
        console.warn('Price calc failed for product', p._id, calcErr.message);
        return {
          ...p,
          computedPrice: p.computedPrice || null,
          priceBreakdown: p.priceBreakdown || null,
        };
      }
    }));

    const total = countAgg && countAgg.length ? countAgg[0].total : 0;
    res.json({ products: enrichedProducts, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      const cleanSlug = String(id).trim().toLowerCase();
      product = await Product.findOne({
        $or: [
          { slug: cleanSlug },
          { name: { $regex: new RegExp(`^${cleanSlug.replace(/-/g, ' ')}$`, 'i') } }
        ]
      });
    }
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Compute live price for all product types (gold, silver, diamond)
    try {
      const metalPrices = await getCurrentMetalPrices();
      const { price, breakdown } = await calculateProductPrice(
        product,
        metalPrices.gold,
        metalPrices.silver
      );
      
      // Update product price with calculated value
      product.price = price;
      
      // Optionally include price breakdown for transparency
      const productResponse = product.toObject();
      productResponse.priceBreakdown = breakdown;
      
      return res.json(productResponse);
    } catch (priceErr) {
      console.warn('Failed to compute live price for product detail:', priceErr.message);
      return res.json(product);
    }
  } catch (err) {
    console.error('Error in getProductById:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const ALLOWED_CATEGORIES = [
  'rings',
  'necklaces',
  'bracelets',
  'earrings',
  'pendants',
  'sets',
  'wedding',
  // expanded subcategories
  'nose-pins',
  'toe-rings',
  'anklets',
  'bangles',
  'chains',
  'kadas',
  'mangalsutra',
  'watches',
];

function normalizeCategory(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase();
}

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    // Normalize and validate category
    productData.category = normalizeCategory(productData.category);
    if (!productData.category || !ALLOWED_CATEGORIES.includes(productData.category)) {
      return res.status(400).json({ error: 'Invalid or missing category. Allowed: ' + ALLOWED_CATEGORIES.join(', ') });
    }
    // Basic numeric coercion
    if (productData.weight !== undefined) productData.weight = Number(productData.weight);
    if (productData.karat !== undefined) productData.karat = Number(productData.karat);

    // If material is gold, ensure karat and compute live price from backend pricing
    const materialLower = String(productData.material || '').trim().toLowerCase();
    if (materialLower === 'gold') {
      if (!productData.karat || ![24, 22, 18].includes(productData.karat)) {
        productData.karat = 24;
      }
      if (!productData.weight || isNaN(productData.weight) || productData.weight <= 0) {
        return res.status(400).json({ error: 'Weight (grams) is required to compute live price for gold products' });
      }
      try {
        // Populate/refresh cache and read per-gram
        const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
        const base = `http://localhost:${backendPort}/api/prices`;
        // Hit main endpoint to ensure cache has latest
        await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
        // Then compute directly using cached per-gram logic
        const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
        let perGram = 0;
        if (latest && latest.data && latest.data.gold && latest.data.gold.price) {
          perGram = Number(latest.data.gold.price) || 0;
        }
        if (!perGram || perGram <= 0) {
          // Fallback hardcoded per-gram to keep admin ops smooth
          perGram = 6500;
        }
        const purity = productData.karat === 24 ? 1.0 : productData.karat === 22 ? 22/24 : 18/24;
        productData.price = Math.round(perGram * productData.weight * purity);
      } catch (calcErr) {
        console.warn('Live price calc failed, using fallback:', calcErr && calcErr.message ? calcErr.message : calcErr);
        const purity = productData.karat === 24 ? 1.0 : productData.karat === 22 ? 22/24 : 18/24;
        const perGramFallback = 6500; // INR fallback
        productData.price = Math.round(perGramFallback * productData.weight * purity);
      }
    } else if (materialLower === 'silver') {
      if (!productData.weight || isNaN(productData.weight) || productData.weight <= 0) {
        return res.status(400).json({ error: 'Weight (grams) is required to compute live price for silver products' });
      }
      try {
        const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
        const base = `http://localhost:${backendPort}/api/prices`;
        await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
        const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
        let perGram = 0;
        if (latest && latest.data && latest.data.silver && latest.data.silver.price) {
          perGram = Number(latest.data.silver.price) || 0;
        }
        if (!perGram || perGram <= 0) {
          perGram = 75; // INR fallback for silver
        }
        productData.price = Math.round(perGram * productData.weight);
      } catch (calcErr) {
        console.warn('Live silver price calc failed, using fallback:', calcErr && calcErr.message ? calcErr.message : calcErr);
        const perGramFallback = 75;
        productData.price = Math.round(perGramFallback * productData.weight);
      }
    } else {
      // Other materials: keep price if provided, else default 0
      if (productData.price !== undefined) productData.price = Number(productData.price);
      else productData.price = 0;
    }

    // Collect image URLs from request body if provided
    let bodyImageUrls = [];
    if (req.body.imageUrls) {
      try {
        const parsed = JSON.parse(req.body.imageUrls);
        if (Array.isArray(parsed)) {
          bodyImageUrls = parsed.filter(Boolean);
        }
      } catch (e) {
        // ignore parse error, fallback handled below
      }
    }

    if (req.files && req.files.length > 0) {
      // Store paths under /api/uploads so frontend dev server proxy can resolve correctly
      productData.images = req.files.map(f => `/api/uploads/products/${f.filename}`);
      if (bodyImageUrls.length > 0) {
        productData.images = [...productData.images, ...bodyImageUrls];
      }
    } else if (bodyImageUrls.length > 0) {
      productData.images = bodyImageUrls;
    } else if (!productData.images || productData.images.length === 0) {
      // Set image based on category and material instead of generic placeholder
      const defaultImage = getImageForCategoryAndMaterial(productData.category, productData.material);
      productData.images = [defaultImage];
    }
    console.log('[PRODUCTS] create incoming data:', {
      name: productData.name,
      category: productData.category,
      material: productData.material,
      price: productData.price,
      weight: productData.weight,
      filesCount: req.files?.length || 0
    });
    const product = new Product(productData);
    await product.save();
    console.log('Product created successfully:', product._id, product.category);
    console.log('[PRODUCTS] persisted doc snapshot:', {
      _id: product._id.toString(),
      name: product.name,
      category: product.category,
      price: product.price,
      images: product.images,
      createdAt: product.createdAt
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(400).json({ error: err.message || 'Bad Request' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.category) {
      updateData.category = normalizeCategory(updateData.category);
      if (!ALLOWED_CATEGORIES.includes(updateData.category)) {
        return res.status(400).json({ error: 'Invalid category. Allowed: ' + ALLOWED_CATEGORIES.join(', ') });
      }
    }
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.weight !== undefined) updateData.weight = Number(updateData.weight);
    if (updateData.karat !== undefined) updateData.karat = Number(updateData.karat);
    // Collect image URLs from request body if provided
    let bodyImageUrls = [];
    if (req.body.imageUrls) {
      try {
        const parsed = JSON.parse(req.body.imageUrls);
        if (Array.isArray(parsed)) {
          bodyImageUrls = parsed.filter(Boolean);
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => `/api/uploads/products/${f.filename}`);
      if (bodyImageUrls.length > 0) {
        updateData.images = [...updateData.images, ...bodyImageUrls];
      }
    } else if (bodyImageUrls.length > 0) {
      updateData.images = bodyImageUrls;
    } else if (updateData.category || updateData.material) {
      // If category or material is being updated and no new file, update image accordingly
      let product = await Product.findById(req.params.id);
      if (product) {
        const currentImage = product.images && product.images[0];
        // Only update if current image is not a custom upload (starts with /api/uploads)
        if (!currentImage || !currentImage.startsWith('/api/uploads')) {
          const newCategory = updateData.category || product.category;
          const newMaterial = updateData.material || product.material;
          updateData.images = [getImageForCategoryAndMaterial(newCategory, newMaterial)];
        }
      }
    }
    // If material provided, normalize lowercase for branching
    const materialLower = String(updateData.material || '').trim().toLowerCase();

    // Fetch existing product for context if needed
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Merge updates for decision-making
    const next = {
      ...product.toObject(),
      ...updateData,
    };

    // Auto-recalc logic
    if (materialLower === 'gold' || String(next.material || '').trim().toLowerCase() === 'gold') {
      const karatVal = (updateData.karat !== undefined ? updateData.karat : product.karat) || 24;
      const weightVal = (updateData.weight !== undefined ? updateData.weight : product.weight) || 0;
      if (weightVal > 0) {
        try {
          const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
          const base = `http://localhost:${backendPort}/api/prices`;
          await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
          const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
          let perGram = 0;
          if (latest && latest.data && latest.data.gold && latest.data.gold.price) {
            perGram = Number(latest.data.gold.price) || 0;
          }
          if (!perGram || perGram <= 0) perGram = 6500;
          const purity = karatVal === 24 ? 1.0 : karatVal === 22 ? 22/24 : 18/24;
          updateData.price = Math.round(perGram * weightVal * purity);
          updateData.karat = karatVal; // ensure persisted
        } catch (e) {
          const purity = karatVal === 24 ? 1.0 : karatVal === 22 ? 22/24 : 18/24;
          updateData.price = Math.round(6500 * weightVal * purity);
          updateData.karat = karatVal;
        }
      }
    } else if (materialLower === 'silver' || String(next.material || '').trim().toLowerCase() === 'silver') {
      const weightVal = (updateData.weight !== undefined ? updateData.weight : product.weight) || 0;
      if (weightVal > 0) {
        try {
          const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
          const base = `http://localhost:${backendPort}/api/prices`;
          await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
          const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
          let perGram = 0;
          if (latest && latest.data && latest.data.silver && latest.data.silver.price) {
            perGram = Number(latest.data.silver.price) || 0;
          }
          if (!perGram || perGram <= 0) perGram = 75;
          updateData.price = Math.round(perGram * weightVal);
        } catch (e) {
          updateData.price = Math.round(75 * weightVal);
        }
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(400).json({ error: err.message || 'Bad Request' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error in deleteProduct:', err);
    res.status(400).json({ error: err.message || 'Bad Request' });
  }
};

/**
 * getFeaturedProducts - Returns a curated diverse set of products
 * with one from each material x category combination
 */
const getFeaturedProducts = async (req, res) => {
  try {
    // Fetch live per-gram prices
    let perGramGold = 6500;
    let perGramSilver = 75;
    
    try {
      const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
      const base = `http://localhost:${backendPort}/api/prices`;
      await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
      const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
      if (latest?.data?.gold?.price) {
        const g = Number(latest.data.gold.price);
        if (!isNaN(g) && g > 0) perGramGold = g;
      }
      if (latest?.data?.silver?.price) {
        const s = Number(latest.data.silver.price);
        if (!isNaN(s) && s > 0) perGramSilver = s;
      }
    } catch (e) {
      console.warn('Live per-gram fetch failed, using defaults:', e && e.message ? e.message : e);
    }

    // Define featured categories and materials to display
    const categories = ['rings', 'necklaces', 'earrings', 'pendants', 'bracelets', 'bangles'];
    const materials = ['gold', 'silver', 'diamond'];

    // Get one product from each category, cycling through materials
    const featuredProducts = [];
    const promises = [];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const material = materials[i % materials.length]; // Cycle through materials
      
      promises.push(
        Product.findOne({ category, material })
          .sort({ rating: -1, createdAt: -1 })
          .lean()
          .then(product => {
            if (product) {
              return {
                product,
                category,
                material
              };
            }
            return null;
          })
          .catch(err => {
            console.warn(`Failed to fetch featured product for ${category}/${material}:`, err.message);
            return null;
          })
      );
    }

    // Get additional diverse products from other materials
    const additionalMaterials = ['diamond', 'gold', 'silver'];
    const additionalCategories = ['sets', 'mangalsutra', 'wedding'];
    
    for (let i = 0; i < Math.min(additionalCategories.length, additionalMaterials.length); i++) {
      const category = additionalCategories[i];
      const material = additionalMaterials[i];
      
      promises.push(
        Product.findOne({ category, material })
          .sort({ rating: -1, createdAt: -1 })
          .lean()
          .then(product => {
            if (product) {
              return {
                product,
                category,
                material
              };
            }
            return null;
          })
          .catch(err => {
            console.warn(`Failed to fetch featured product for ${category}/${material}:`, err.message);
            return null;
          })
      );
    }

    const results = await Promise.all(promises);
    
    // Filter out null results and extract products
    const products = results
      .filter(r => r !== null)
      .slice(0, 6) // Limit to 6 featured products
      .map(r => r.product);

    // Compute prices for each product
    const computedPriceExpr = {
      $cond: [
        { $eq: [{ $toLower: "$material" }, "gold"] },
        {
          $round: [
            {
              $multiply: [
                perGramGold,
                { $ifNull: ["$weight", 0] },
                {
                  $cond: [
                    { $eq: [{ $ifNull: ["$karat", 24] }, 24] },
                    1.0,
                    {
                      $cond: [
                        { $eq: [{ $ifNull: ["$karat", 24] }, 22] },
                        22 / 24,
                        {
                          $cond: [
                            { $eq: [{ $ifNull: ["$karat", 24] }, 18] },
                            18 / 24,
                            { $divide: [{ $ifNull: ["$karat", 24] }, 24] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            0
          ]
        },
        {
          $cond: [
            { $eq: [{ $toLower: "$material" }, "silver"] },
            { $round: [{ $multiply: [perGramSilver, { $ifNull: ["$weight", 0] }] }, 0] },
            { $ifNull: ["$price", 0] }
          ]
        }
      ]
    };

    // Enrich products with proper pricing
    const enrichedProducts = await Promise.all(
      products.map(async (p) => {
        try {
          const { price, breakdown } = await calculateProductPrice(
            p,
            perGramGold,
            perGramSilver,
          );
          return {
            ...p,
            price,
            priceBreakdown: breakdown,
          };
        } catch (err) {
          console.warn('Price calc failed for featured product', p._id, err.message);
          return {
            ...p,
            price: p.price || 0,
          };
        }
      })
    );

    res.json({ products: enrichedProducts });
  } catch (err) {
    console.error('Error in getFeaturedProducts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts };
