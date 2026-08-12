import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useMetalRates } from '../contexts/MetalRatesContext';
import { HeartIcon } from '../components/Icons';
import GlimmrLoader from '../components/GlimmrLoader';
import { getProductImage, getProductImages } from '../utils/productImages';
import { motion, AnimatePresence } from 'framer-motion';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center group focus:outline-none"
      >
        <h3 className="text-sm font-heading uppercase tracking-widest text-[#222222] group-hover:text-[#B59A6C] transition-colors">{title}</h3>
        <span className="text-[#222222] text-xl font-light">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 font-body text-sm text-[#808080]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const { getLiveProductPrice } = useMetalRates();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [perGramRates, setPerGramRates] = useState({ gold: 6500, silver: 80 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  
  const livePricing = getLiveProductPrice(product);

  useEffect(() => {
    if (!id) return;
    
    // Safety guard: prevent static page routes from triggering product fallback
    const staticSlugs = ['privacy-policy', 'privacy', 'sitemap', 'terms-and-conditions', 'about', 'contact', 'size-guide', 'care-instructions', 'business-card', 'cart', 'checkout', 'thank-you', 'profile', 'admin', 'prices', 'recommender', 'auth', 'login', 'signup'];
    if (staticSlugs.includes(id.toLowerCase())) {
      navigate(`/${id.toLowerCase()}`, { replace: true });
      return;
    }

    setLoading(true);
    api.get(`/products/${id}`)
      .then(res => {
        if (res.data) {
          setProduct(res.data);
          api.get('/products')
            .then(allRes => {
              const list = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.products || []);
              setRelatedProducts(list.filter(p => (p._id || p.id) !== (res.data._id || res.data.id)).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.error('Error loading product details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id, product?._id]);

  const addToCart = async () => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }
    try {
      await api.post('/cart', { userId: user.id || user._id, productId: id, quantity: 1 });
      updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const toggleWishlist = () => {
    let updatedWishlist;
    if (wishlist.includes(id)) {
      updatedWishlist = wishlist.filter(itemId => itemId !== id);
      toastSuccess('Removed from wishlist');
    } else {
      updatedWishlist = [...wishlist, id];
      toastSuccess('Added to wishlist');
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  if (loading || !product) {
    return <GlimmrLoader subtitle="LOADING PIECE SPECIFICATIONS..." />;
  }l;

  const images = getProductImages(product);
  const prevImage = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);

  const formatMoney = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '—';
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const isFramerItem = typeof product.id === 'string' && !product._id;

  const calculateDisplayPrice = () => {
    if (isFramerItem) return `$${Number(product.price).toFixed(2)}`;
    
    const breakdownPrice = product.priceBreakdown?.finalPrice;
    const isDiamondProduct = ((product.material || '').toLowerCase() === 'diamond') || product.diamond?.hasDiamond;
    if (isDiamondProduct) {
      if (breakdownPrice) return `₹${Math.round(breakdownPrice).toLocaleString('en-IN')}`;
      if (product.price) return `₹${Math.round(product.price).toLocaleString('en-IN')}`;
      return 'Pricing pending';
    }

    if (breakdownPrice) return `₹${Math.round(breakdownPrice).toLocaleString('en-IN')}`;

    const isGold = (product.material || '').toLowerCase() === 'gold';
    const isSilver = (product.material || '').toLowerCase() === 'silver';
    const perGram = isSilver ? perGramRates.silver : perGramRates.gold;
    if (!perGram || !product.weight) return product.price ? `₹${Math.round(product.price).toLocaleString('en-IN')}` : '—';

    const weight = Number(product.weight) || 0;
    const karat = Number(product.karat || 24);
    const purity = isGold ? (karat / 24) : 1.0;
    return `₹${Math.round(perGram * weight * purity).toLocaleString('en-IN')}`;
  };

  const priceFormatted = calculateDisplayPrice();
  const diamondInfo = product?.diamond?.hasDiamond ? product.diamond : livePricing?.diamondDetails;

  return (
    <div className="min-h-screen bg-white pt-8 lg:pt-12 relative">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Compact Main Image & Thumbnails (~40% width -> col-span-5) */}
          <div className="md:col-span-5 lg:col-span-5 max-w-[380px] sm:max-w-[420px] w-full space-y-3 ml-0 mr-auto">
            {/* Main Image Box */}
            <div className="relative w-full aspect-square bg-[#FAF9F7] rounded-none p-5 sm:p-6 flex items-center justify-center overflow-hidden group">
              <img
                src={images[activeIndex] || getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-contain max-h-[200px] sm:max-h-[230px] transition-transform duration-700 group-hover:scale-105"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#222222] rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm text-base"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#222222] rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm text-base"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Squares Row */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`aspect-square bg-[#FAF9F7] border p-2 flex items-center justify-center transition-all ${
                      activeIndex === idx ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain max-h-[50px]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions (~60% width -> col-span-7) */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-start pl-0 md:pl-4 lg:pl-6">
            {/* Inline Right Breadcrumbs with Framer Motion Back Button */}
            <div className="flex items-center justify-between text-xs font-body text-[#808080] gap-2 mb-6">
              <div className="flex items-center gap-2">
                <Link to="/" className="hover:text-[#222222] transition-colors">Home</Link>
                <span className="text-gray-300">|</span>
                <Link to="/products" className="hover:text-[#222222] transition-colors">Products</Link>
                <span className="text-gray-300">|</span>
                <span className="text-[#222222] font-semibold">Detail</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF9F7] hover:bg-[#222222] hover:text-white text-[#222222] border border-gray-200 hover:border-[#222222] rounded-full transition-all text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                <span>← Back</span>
              </motion.button>
            </div>

            {/* Gold Category Eyebrow Tag */}
            <div className="mb-2">
              <span className="font-body text-xs font-medium uppercase tracking-[0.25em] text-[#B59A6C]">
                {product.categoryName || product.category || 'RING'}
              </span>
            </div>

            {/* Title & Wishlist */}
            <div className="flex justify-between items-start mb-3">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-5xl text-[#222222] font-normal leading-tight">
                {product.name}
              </h1>
              <button 
                onClick={toggleWishlist} 
                className="p-2 text-[#808080] hover:text-[#B59A6C] transition-colors"
                title="Add to Wishlist"
              >
                <HeartIcon size={24} className={wishlist.includes(id) ? 'fill-[#B59A6C] text-[#B59A6C]' : ''} />
              </button>
            </div>
            
            {/* Price */}
            <p className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#222222] mb-4 font-normal">
              ₹{livePricing.totalLivePrice?.toLocaleString('en-IN')}
            </p>

            {/* Real-Time Live Metal Rate Price Breakdown (Borderless & Seamless Inline Display) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 space-y-3.5 pt-2"
            >
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-heading text-xs font-bold text-[#111111] uppercase tracking-[0.15em]">
                    REAL-TIME LIVE METAL & DIAMOND VALUATION
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-[#B59A6C]">
                  IBJA LIVE RATE: ₹{livePricing.baseRatePerGram?.toLocaleString('en-IN')}/g
                </span>
              </div>

              <div className="space-y-2.5 font-body text-xs text-[#444444]">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-600">Net Metal Weight ({livePricing.weight}g • {livePricing.karat}K Gold • {livePricing.purityPercentageStr} Purity)</span>
                  <span className="font-mono font-bold text-[#111111]">₹{livePricing.rawMetalCost?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-600">Artisan Making Charges (₹{livePricing.makingChargeRate}/g)</span>
                  <span className="font-mono font-bold text-[#111111]">₹{livePricing.makingCharges?.toLocaleString('en-IN')}</span>
                </div>
                {livePricing.gemstoneCost > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-y border-gray-100 my-1">
                    <div>
                      <span className="font-bold text-[#111111] block">Certified Diamond Valuation</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {livePricing.diamondDetails?.carat || 0.5} Carat • Cut: {String(livePricing.diamondDetails?.cut || 'excellent').toUpperCase()} • Color: {livePricing.diamondDetails?.color || 'G'} • Clarity: {livePricing.diamondDetails?.clarity || 'VVS1'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#B59A6C]">₹{livePricing.gemstoneCost?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200/80">
                  <span className="font-semibold text-[#111111]">Subtotal (Metal + Diamond + Making)</span>
                  <span className="font-mono font-bold text-[#111111]">₹{livePricing.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 py-0.5">
                  <span>GST Tax (3%)</span>
                  <span className="font-mono">₹{livePricing.gstTax?.toLocaleString('en-IN')}</span>
                </div>
              </div>             
              
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">FINAL PATRON LIVE PRICE</span>
                  <span className="font-heading text-3xl font-bold text-[#111111]">
                    ₹{livePricing.totalLivePrice?.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#B59A6C] uppercase tracking-widest">
                  100% BIS HALLMARKED
                </span>
              </div>
            </motion.div>

            {/* Description Excerpt */}
            <p className="font-body text-[#808080] text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
              {product.description || 'Celebrate life\'s precious moments with our Golden Birthday Charm Bracelet, a delightful piece adorned with charming symbols of joy and love. Crafted in gleaming gold, this bracelet captures the essence of cherished memories, making it a thoughtful and meaningful gift. Embrace the enchanting journey of life.'}
            </p>

            {/* Main Action Button */}
            <button 
              onClick={addToCart} 
              className="w-full bg-[#222222] text-white font-body py-4 sm:py-5 uppercase tracking-[0.15em] font-bold text-xs sm:text-sm hover:bg-[#B59A6C] transition-colors rounded-none mb-8 shadow-sm"
            >
              PURCHASE NOW
            </button>

            {/* Product Meta Details */}
            <div className="border-t border-b border-gray-100 py-4 mb-8 space-y-2 text-xs font-body text-[#808080]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#222222]">Product Number:</span>
                <span>{product.productNumber || '5672-9013-4826'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#222222]">Category:</span>
                <span className="capitalize text-[#222222]">{product.categoryName || product.category || 'Ring'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#222222]">Tags:</span>
                <span className="capitalize text-[#222222]">{product.tags || 'Bracelet, Accessories'}</span>
              </div>
            </div>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-[#FAF9F7] rounded-none border border-gray-100/80">
              <div className="flex flex-col text-left">
                <span className="font-body text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">Free Shipping</span>
                <span className="font-body text-[11px] text-[#808080]">Complimentary insured express delivery</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-body text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">Authenticity</span>
                <span className="font-body text-[11px] text-[#808080]">Certified genuine luxury jewelry</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-body text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">Easy Returns</span>
                <span className="font-body text-[11px] text-[#808080]">30-day hassle-free return policy</span>
              </div>
            </div>

            {/* Description / Size Guide Tabs */}
            <div className="mb-8">
              <div className="flex border-b border-gray-200 mb-4 gap-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 font-heading uppercase text-xs tracking-wider transition-colors relative ${
                    activeTab === 'description' ? 'text-[#222222] font-semibold' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  Description
                  {activeTab === 'description' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B59A6C]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sizeGuide')}
                  className={`pb-3 font-heading uppercase text-xs tracking-wider transition-colors relative ${
                    activeTab === 'sizeGuide' ? 'text-[#222222] font-semibold' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  Size Guide
                  {activeTab === 'sizeGuide' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B59A6C]" />
                  )}
                </button>
              </div>

              {activeTab === 'description' ? (
                <p className="font-body text-[#808080] leading-relaxed text-sm">
                  {product.description || 'Introducing our exquisite jewelry piece. Crafted with meticulous attention to detail, showcasing the timeless beauty of diamonds and fine materials in a breathtaking design.'}
                </p>
              ) : (
                <div className="font-body text-[#808080] text-sm space-y-2">
                  <p>• Ring Sizes: 5, 6, 7, 8, 9 Standard US sizes.</p>
                  <p>• Necklace Length: 18 inches + 2-inch extension chain.</p>
                  <p>• Bracelet Circumference: 7 inches flexible fit.</p>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div className="border-b border-gray-200">
              <Accordion title="Metal & Purity Specifications" defaultOpen={true}>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Material Type</span>
                    <span className="text-[#222222] capitalize font-medium">{product.material || '—'}</span>
                  </div>
                  {product.material?.toLowerCase() === 'gold' && (
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Gold Karat</span>
                      <span className="text-[#222222] font-semibold">{product.karat || 22}K Gold</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Metal Purity Percentage</span>
                    <span className="text-[#222222] font-medium">{product.purityPercentage || (product.karat ? Number((product.karat/24)*100).toFixed(1) : 92.5)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Net Weight</span>
                    <span className="text-[#222222] font-medium">{product.weight ? `${product.weight}g` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Hallmarking Stamp</span>
                    <span className="text-[#222222] font-medium">{product.hallmarkDetails || 'BIS Hallmarked'}</span>
                  </div>
                  {product.makingChargePerGram && (
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Estimated Making Charge</span>
                      <span className="text-[#222222] font-medium">₹{product.makingChargePerGram}/g</span>
                    </div>
                  )}
                </div>
              </Accordion>

              {diamondInfo && (
                <Accordion title="Diamond Details">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Carat</span>
                      <span className="text-[#222222]">{diamondInfo.carat || '—'} ct</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Cut</span>
                      <span className="text-[#222222] capitalize">{diamondInfo.cut?.replace('-', ' ') || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Color</span>
                      <span className="text-[#222222]">{diamondInfo.color || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Clarity</span>
                      <span className="text-[#222222]">{diamondInfo.clarity || '—'}</span>
                    </div>
                  </div>
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-16 mt-16 border-t border-gray-100">
            <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-[#222222] mb-10 text-left font-normal">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.map((fp) => {
                const livePricingItem = getLiveProductPrice(fp);
                return (
                  <motion.div key={fp._id || fp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group relative cursor-pointer bg-white border border-[#EAE7E1] hover:border-[#B59A6C] transition-all duration-300 rounded-none overflow-hidden flex flex-col justify-between">
                    <div className="relative aspect-square bg-[#FAF9F7] p-6 flex items-center justify-center overflow-hidden">
                      <Link to={`/products/${fp._id || fp.id}`} className="w-full h-full flex items-center justify-center">
                        <img src={getProductImage(fp)} alt={fp.name} className="w-full h-full object-contain max-h-[180px] transition-transform duration-500 group-hover:scale-105" />
                      </Link>
                    </div>
                    <div className="p-5 text-left flex flex-col flex-1 justify-between bg-white">
                      <div>
                        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B59A6C] mb-1 block">
                          {(fp.category || 'JEWELRY').toUpperCase()}
                        </span>
                        <Link to={`/products/${fp._id || fp.id}`}>
                          <h3 className="font-heading text-xl text-[#222222] font-normal truncate group-hover:text-[#B59A6C] transition-colors mb-1">{fp.name}</h3>
                        </Link>
                        <p className="font-heading text-base text-[#222222] font-bold mb-4">₹{livePricingItem.totalLivePrice.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <Link
                          to={`/products/${fp._id || fp.id}`}
                          className="font-body text-xs font-bold text-[#222222] uppercase tracking-[0.15em] inline-flex items-center gap-2 group-hover:text-[#B59A6C] transition-colors"
                        >
                          <span>View Product</span>
                          <span className="text-[#B59A6C] text-sm transition-transform group-hover:translate-x-1.5">→</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Newsletter Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#222222] text-white py-16 sm:py-20 my-12 text-center px-4 sm:px-6 lg:px-8 rounded-none relative overflow-hidden"
        >
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2 font-normal">
            Get Monthly Updates
          </h2>
          <p className="font-body text-gray-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
            Join the Social Club for exclusive Rewards and news.
          </p>
          
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-center justify-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full sm:flex-1 px-6 py-4 rounded-none border border-gray-700 bg-white text-[#222222] focus:outline-none focus:border-[#B59A6C] font-body text-sm"
              required
            />
            <button 
              type="submit"
              className="w-full sm:w-auto bg-[#B59A6C] text-white rounded-none px-8 py-4 uppercase tracking-[0.15em] text-xs font-bold hover:bg-white hover:text-[#222222] transition-colors"
            >
              SUBSCRIBE
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default ProductDetail;
