// Product image mapping based on category and material
// This ensures that products display images matching their material type

const categoryMaterialImageMap = {
  rings: {
    gold: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80'
    ],
    silver: [
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'
    ],
    diamond: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'
    ]
  },
  necklaces: {
    gold: [
      'https://images.pexels.com/photos/3622618/pexels-photo-3622618.jpeg',
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622618/pexels-photo-3622618.jpeg',
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg'
    ]
  },
  pendants: {
    gold: [
      'https://images.pexels.com/photos/3622620/pexels-photo-3622620.jpeg',
      'https://images.pexels.com/photos/4624698/pexels-photo-4624698.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632639/pexels-photo-5632639.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622620/pexels-photo-3622620.jpeg',
      'https://images.pexels.com/photos/4624698/pexels-photo-4624698.jpeg'
    ]
  },
  bangles: {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ]
  },
  bracelets: {
    gold: [
      'https://images.pexels.com/photos/3622627/pexels-photo-3622627.jpeg',
      'https://images.pexels.com/photos/4624699/pexels-photo-4624699.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632641/pexels-photo-5632641.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622627/pexels-photo-3622627.jpeg',
      'https://images.pexels.com/photos/4624699/pexels-photo-4624699.jpeg'
    ]
  },
  earrings: {
    gold: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622626/pexels-photo-3622626.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622626/pexels-photo-3622626.jpeg'
    ]
  },
  wedding: {
    gold: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ]
  },
  chains: {
    gold: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632642/pexels-photo-5632642.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ]
  },
  'nose-pins': {
    gold: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ]
  },
  'toe-rings': {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622629/pexels-photo-3622629.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622629/pexels-photo-3622629.jpeg'
    ]
  },
  anklets: {
    gold: [
      'https://images.pexels.com/photos/3622630/pexels-photo-3622630.jpeg',
      'https://images.pexels.com/photos/4624702/pexels-photo-4624702.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/8537908/pexels-photo-8537908.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622630/pexels-photo-3622630.jpeg',
      'https://images.pexels.com/photos/4624702/pexels-photo-4624702.jpeg'
    ]
  },
  kadas: {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ]
  },
  mangalsutra: {
    gold: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632643/pexels-photo-5632643.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ]
  },
  watches: {
    gold: [
      'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg',
      'https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg',
      'https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg',
      'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg'
    ]
  },
  sets: {
    gold: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ]
  }
};

// Backend origin for serving uploaded images in production
const API_BASE_ORIGIN = 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com';

export const normalizeImageUrl = (src) => {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  // Prefix relative backend paths
  if (src.startsWith('/api/') || src.startsWith('/uploads/')) {
    return `${API_BASE_ORIGIN}${src}`;
  }
  return src;
};

export const getProductImages = (product) => {
  // Prefer uploaded images if present
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images
      .filter(Boolean)
      .map(normalizeImageUrl);
  }
  // Fallback set based on category/material
  const category = product?.category?.toLowerCase() || 'rings';
  const material = product?.material?.toLowerCase() || 'gold';
  const categoryImages = categoryMaterialImageMap[category] || categoryMaterialImageMap['rings'];
  const materialImages = categoryImages[material] || categoryImages['gold'];
  return materialImages.map(normalizeImageUrl);
};

/**
 * Get the appropriate product image based on category and material
 * @param {Object} product - Product object with category, material, and images
 * @returns {string} - Image URL matching the product's category and material
 */
export const getProductImage = (product) => {
  const imgs = getProductImages(product);
  if (imgs && imgs.length > 0) return imgs[0];
  return normalizeImageUrl(getDefaultImage());
};

/**
 * Get a random image from the available images for a category and material
 * Useful for variety in listings
 * @param {Object} product - Product object with category, material, and images
 * @returns {string} - Random image URL matching the product's category and material
 */
export const getRandomProductImage = (product) => {
  const imgs = getProductImages(product);
  if (!imgs || imgs.length === 0) return normalizeImageUrl(getDefaultImage());
  return imgs[Math.floor(Math.random() * imgs.length)];
};

/**
 * Get default fallback image
 * @returns {string} - Default placeholder image
 */
export const getDefaultImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
};
