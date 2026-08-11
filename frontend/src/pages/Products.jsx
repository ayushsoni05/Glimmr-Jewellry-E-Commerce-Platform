import { useState, useEffect } from 'react';
import api from '../api';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useMetalRates } from '../contexts/MetalRatesContext';
import axios from 'axios';
import apiClient from '../api';
import { useToast } from '../contexts/ToastContext';
import { HeartIcon } from '../components/Icons';
import { getProductImage } from '../utils/productImages';
import { FRAMER_PRODUCTS, FRAMER_IMAGES } from '../utils/framerAssets';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const { getLiveProductPrice } = useMetalRates();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isMetalMenuOpen, setIsMetalMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const routeParams = useParams();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const [perGramGold, setPerGramGold] = useState(null);
  const [perGramSilver, setPerGramSilver] = useState(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleWishlist = (productId) => {
    let updatedWishlist;
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
      toastSuccess('Item removed from wishlist');
    } else {
      updatedWishlist = [...wishlist, productId];
      toastSuccess('Item added to wishlist');
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialFilters = {};
    if (routeParams.material) {
      initialFilters.material = routeParams.material;
    }
    if (routeParams.category) {
      initialFilters.category = routeParams.category;
    }
    searchParams.forEach((value, key) => {
      initialFilters[key] = value;
    });
    setFilters(initialFilters);
  }, [location.search, routeParams]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setError(null);
      try {
        const params = { ...filters };
        if (params.minPrice) params.minPrice = Number(params.minPrice);
        if (params.maxPrice) params.maxPrice = Number(params.maxPrice);

        const res = await api.get('/products', { params });
        if (!cancelled && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [filters]);

  useEffect(() => {
    let cancel = false;
    async function fetchLatest() {
      try {
        const res = await apiClient.get('/prices/latest?currency=inr');
        if (!cancel) {
          setPerGramGold(res.data?.gold?.price || null);
          setPerGramSilver(res.data?.silver?.price || null);
        }
      } catch (e) {
        try {
          const res2 = await apiClient.get('/prices?currency=inr');
          if (!cancel) {
            setPerGramGold(res2.data?.gold?.price || null);
            setPerGramSilver(res2.data?.silver?.price || null);
          }
        } catch {}
      }
    }
    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);
    return () => { cancel = true; clearInterval(interval); };
  }, []);

  const addToCart = async (productId) => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }
    try {
      await api.post('/cart', { userId: user.id || user._id, productId: productId, quantity: 1 });
      updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const categories = ['ALL', 'EARRING', 'NECKLACE', 'BRACELET', 'RINGS', 'WATCHES'];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header & Breadcrumbs Section */}
      <div className="bg-[#FAF9F7] pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-[1520px] mx-auto text-center">
          {/* Breadcrumb */}
          <div className="text-xs font-body text-[#808080] mb-6 uppercase tracking-widest flex items-center justify-center gap-3">
            <Link to="/" className="hover:text-[#222222] transition-colors">Home</Link>
            <span className="text-gray-300">|</span>
            <span className="text-[#222222] font-semibold">Products</span>
          </div>

          {/* Hero Title */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#222222] font-normal mb-8 tracking-tight">
            {routeParams.material ? routeParams.material.charAt(0).toUpperCase() + routeParams.material.slice(1) : 'All Products'}
          </h1>

          {/* Category Filter Text Links (Centered) */}
          <div className="flex items-center justify-center space-x-6 sm:space-x-10 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((cat) => {
              const catValue = cat.toLowerCase();
              const isActive = (cat === 'ALL' && !filters.category) || filters.category === catValue || filters.category === catValue + 's';
              return (
                <button 
                  key={cat}
                  onClick={() => handleFilter('category', cat === 'ALL' ? '' : catValue)} 
                  className={`whitespace-nowrap font-body text-xs sm:text-sm tracking-[0.15em] uppercase transition-colors pb-1 cursor-pointer ${
                    isActive 
                      ? 'text-[#222222] font-bold border-b-2 border-[#222222]' 
                      : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Results Indicator */}
        {filters.search && (
          <div className="mb-4 flex items-center justify-between">
            <span className="font-body text-[#222222] text-sm">
              Showing results for: "{filters.search}"
            </span>
            <button 
              onClick={() => handleFilter('search', '')} 
              className="text-[#808080] hover:text-[#222222] text-xs uppercase tracking-wider"
            >
              Clear
            </button>
          </div>
        )}

        {/* Filter / Toolbar Divider Bar */}
        <div className="py-3 border-t border-b border-gray-200 mb-8 flex justify-between items-center text-xs font-body text-[#808080]">
          <span>Showing results.</span>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-white text-[#222222] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-white text-[#222222] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
            {/* Framer Motion Animated Metal Selector Button (Borderless matching Sort By) */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMetalMenuOpen(!isMetalMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-body border-none bg-transparent focus:outline-none text-[#222222] font-medium tracking-wider uppercase cursor-pointer py-1"
              >
                <span>
                  {filters.material === 'gold' ? 'GOLD ONLY' : filters.material === 'silver' ? 'SILVER ONLY' : 'METAL TYPE'}
                </span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isMetalMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {isMetalMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                  >
                    <button
                      onClick={() => { handleFilter('material', ''); setIsMetalMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${!filters.material ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      ALL METALS
                    </button>
                    <button
                      onClick={() => { handleFilter('material', 'gold'); setIsMetalMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors flex items-center justify-between ${filters.material === 'gold' ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      <span>GOLD ONLY</span>
                      <span className="text-[10px] text-gray-500 font-mono font-bold">24K/22K</span>
                    </button>
                    <button
                      onClick={() => { handleFilter('material', 'silver'); setIsMetalMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors flex items-center justify-between ${filters.material === 'silver' ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      <span>SILVER ONLY</span>
                      <span className="text-[10px] text-gray-500 font-mono font-bold">925/999</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Framer Motion Animated Sort By Dropdown (Matching Metal Type Style) */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsSortMenuOpen(!isSortMenuOpen);
                  setIsMetalMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-body border-none bg-transparent focus:outline-none text-[#222222] font-medium tracking-wider uppercase cursor-pointer py-1"
              >
                <span>
                  {filters.sort === 'price-asc' ? 'PRICE: LOW TO HIGH' : filters.sort === 'price-desc' ? 'PRICE: HIGH TO LOW' : filters.sort === 'newest' ? 'NEWEST ARRIVALS' : 'SORT BY'}
                </span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isSortMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {isSortMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                  >
                    <button
                      onClick={() => { handleFilter('sort', ''); setIsSortMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${!filters.sort ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      DEFAULT SORT
                    </button>
                    <button
                      onClick={() => { handleFilter('sort', 'price-asc'); setIsSortMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${filters.sort === 'price-asc' ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      PRICE: LOW TO HIGH
                    </button>
                    <button
                      onClick={() => { handleFilter('sort', 'price-desc'); setIsSortMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${filters.sort === 'price-desc' ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      PRICE: HIGH TO LOW
                    </button>
                    <button
                      onClick={() => { handleFilter('sort', 'newest'); setIsSortMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${filters.sort === 'newest' ? 'font-bold text-[#222222]' : 'text-gray-600'}`}
                    >
                      NEWEST ARRIVALS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Products Grid / List */}
        {loading ? (
          <div className={`grid gap-6 lg:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#FAF9F7] aspect-square mb-3 rounded-[4px]"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {(() => {
              const sourceList = (products.length > 0 ? products : FRAMER_PRODUCTS);
              const displayList = sourceList.filter(product => {
                if (filters.material && product.material) {
                  if (String(product.material).toLowerCase() !== String(filters.material).toLowerCase()) {
                    return false;
                  }
                }
                if (!filters.category) return true;
                const catParam = (filters.category || '').toLowerCase().replace(/s$/, '');
                const prodCat = (product.category || '').toLowerCase().replace(/s$/, '');
                if (catParam === 'ring' && prodCat === 'ring') return true;
                if (catParam === 'earring' && prodCat === 'earring') return true;
                if (catParam === 'necklace' && prodCat === 'necklace') return true;
                if (catParam === 'bracelet' && prodCat === 'bracelet') return true;
                if ((catParam === 'watche' || catParam === 'watch') && (prodCat === 'watche' || prodCat === 'watch')) return true;
                return prodCat.includes(catParam) || catParam.includes(prodCat);
              });

              if (displayList.length === 0) {
                return (
                  <div className="text-center py-16">
                    <p className="font-body text-[#808080] text-lg mb-4">No products found matching your filter.</p>
                    <button 
                      onClick={() => setFilters({})} 
                      className="bg-[#222222] text-white px-6 py-2.5 uppercase tracking-wider text-xs font-semibold hover:bg-[#B59A6C] transition-colors rounded-none"
                    >
                      View All Products
                    </button>
                  </div>
                );
              }

              return (
                <div className={`grid gap-6 lg:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {displayList.map((product, idx) => {
                    const isFramerProduct = typeof product.id === 'string' && !product._id;
                    const productId = product._id || product.id;
                    let priceDisplay = '—';

                    if (isFramerProduct) {
                      priceDisplay = `$${Number(product.price).toFixed(2)}`;
                    } else {
                      const liveCalc = getLiveProductPrice(product);
                      priceDisplay = `₹${liveCalc.totalLivePrice.toLocaleString('en-IN')}`;
                    }

                    // Check if item has a sale discount
                    const hasDiscount = idx === 3 || idx === 7 || product.salePercent;
                    const discountLabel = product.salePercent ? `-${product.salePercent}%` : '-50%';

                    if (viewMode === 'list') {
                      const categoryName = (product.category || 'Jewelry').toUpperCase();
                      const desc = product.description || 'A stunning testament to elegance and luxury sophistication.';

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 30, scale: 0.98 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0], delay: (idx % 2) * 0.1 }}
                          key={productId} 
                          className="bg-white border border-[#FAF9F7] hover:border-[#222222] transition-all duration-300 flex flex-col sm:flex-row p-5 sm:p-6 rounded-none group cursor-pointer items-center shadow-sm hover:shadow-md"
                        >
                          {/* Left: Perfect Square Off-White Image Container */}
                          <div className="w-full sm:w-[200px] h-[200px] aspect-square bg-[#FAF9F7] p-5 flex items-center justify-center relative flex-shrink-0">
                            {hasDiscount && (
                              <span className="absolute top-2 left-2 bg-[#222222] text-white text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 uppercase rounded-none z-10">
                                {discountLabel}
                              </span>
                            )}
                            <Link to={`/products/${productId}`} className="w-full h-full flex items-center justify-center">
                              <img 
                                src={getProductImage(product)} 
                                alt={product.name} 
                                className="w-full h-full object-contain max-h-[140px] transition-transform duration-500 group-hover:scale-105"
                              />
                            </Link>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(productId);
                              }} 
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm z-10 transition-colors"
                            >
                              <HeartIcon size={16} className={wishlist.includes(productId) ? 'fill-[#B59A6C] text-[#B59A6C]' : 'text-gray-400'} />
                            </button>
                          </div>

                          {/* Right: Product Information */}
                          <div className="flex-1 flex flex-col justify-center pt-4 sm:pt-0 sm:pl-6 text-left bg-white w-full">
                            <span className="font-body text-[11px] sm:text-xs font-normal uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                              {categoryName}
                            </span>

                            <Link to={`/products/${productId}`}>
                              <h2 className="font-body text-xl sm:text-2xl text-[#222222] font-bold mb-2 group-hover:text-[#B59A6C] transition-colors leading-snug">
                                {product.name}
                              </h2>
                            </Link>

                            <div className="font-body text-base text-[#222222] font-normal mb-4 flex items-center gap-2">
                              <span>{priceDisplay}</span>
                              {hasDiscount && (
                                <span className="text-xs font-normal text-gray-400 line-through">
                                  ${(Number(product.price || 149.99) * 1.5).toFixed(2)}
                                </span>
                              )}
                            </div>

                            <p className="font-body text-[#808080] text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2 max-w-sm">
                              {desc}
                            </p>

                            <div>
                              <Link
                                to={`/products/${productId}`}
                                className="font-body text-xs sm:text-sm font-bold text-[#222222] uppercase tracking-[0.05em] inline-flex items-center gap-2.5 group-hover:text-[#B59A6C] transition-colors"
                              >
                                <span>View Product</span>
                                <svg className="w-5 h-3 text-[#B59A6C] transition-transform group-hover:translate-x-1" viewBox="0 0 25 16" fill="currentColor">
                                  <path d="M 17.707 8.707 C 18.097 8.317 18.097 7.683 17.707 7.293 L 11.343 0.929 C 11.092 0.669 10.72 0.565 10.37 0.656 C 10.021 0.748 9.748 1.021 9.656 1.37 C 9.565 1.72 9.669 2.092 9.929 13.657 C 9.55 14.049 9.555 14.673 9.941 15.059 C 10.327 15.445 10.951 15.45 11.343 15.071 Z M 0 9 L 16 9 L 16 7 L 0 7 Z" fill="#B59A6C"/>
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // Grid View (Webflow & Framer Motion Scroll-Driven Staggered Grid Reveal)
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 35, scale: 0.97 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0], delay: (idx % 4) * 0.08 }}
                        key={productId} 
                        className="group relative cursor-pointer"
                      >
                        <div className="relative aspect-square bg-[#FAF9F7] p-8 flex items-center justify-center mb-3 overflow-hidden transition-all">
                          {hasDiscount && (
                            <span className="absolute top-3 left-3 bg-[#B59A6C] text-white text-[11px] font-mono px-2.5 py-1 z-10 font-bold uppercase tracking-wider">
                              {discountLabel}
                            </span>
                          )}

                          {/* Top-Right Wishlist Button on Hover */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(productId);
                            }} 
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-full bg-white/90 hover:bg-white shadow-md z-20 text-gray-400 hover:text-[#222222]"
                            title="Add to Wishlist"
                          >
                            <HeartIcon size={16} className={wishlist.includes(productId) ? 'fill-[#222222] text-[#222222]' : ''} />
                          </button>

                          <Link to={`/products/${productId}`} className="w-full h-full flex items-center justify-center">
                            <img 
                              src={getProductImage(product)} 
                              alt={product.name} 
                              className="w-full h-full object-contain max-h-[190px] sm:max-h-[220px] transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>

                          {/* Framer Motion Hover Overlay "SHOP NOW" Button */}
                          <motion.div 
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="absolute inset-x-4 bottom-4 z-20 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex justify-center"
                          >
                            <Link
                              to={`/products/${productId}`}
                              className="bg-transparent hover:bg-[#222222] text-[#222222] hover:text-white py-1.5 px-4 text-center font-body text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-1.5 rounded-none border border-[#222222] backdrop-blur-[2px]"
                            >
                              <span>SHOP NOW</span>
                              <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className="text-xs font-bold"
                              >
                                →
                              </motion.span>
                            </Link>
                          </motion.div>
                        </div>

                        <Link to={`/products/${productId}`} className="block text-left px-0.5">
                          <h3 className="font-body text-base font-bold text-[#222222] truncate mt-2 group-hover:text-black transition-colors">{product.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <p className="font-body text-sm text-[#222222] font-semibold">{priceDisplay}</p>
                            {product.karat ? (
                              <span className="text-[10px] font-mono font-bold text-[#B59A6C] px-2 py-0.5 bg-[#FAF9F7] border border-[#B59A6C]/30">
                                {product.karat}K GOLD
                              </span>
                            ) : product.purityPercentage ? (
                              <span className="text-[10px] font-mono font-bold text-[#808080] px-2 py-0.5 bg-[#FAF9F7] border border-gray-200">
                                {product.purityPercentage}% SILVER
                              </span>
                            ) : null}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Center LOAD MORE Button with Framer Motion */}
        <div className="text-center mt-14 mb-16">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            onClick={() => {}}
            className="inline-flex items-center gap-2 border border-[#222222] px-9 py-4 text-xs tracking-[0.2em] uppercase font-bold text-[#222222] hover:bg-[#222222] hover:text-white transition-colors cursor-pointer rounded-none shadow-sm"
          >
            <span>LOAD MORE</span>
            <motion.span
              animate={{ y: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-xs font-bold"
            >
              ↓
            </motion.span>
          </motion.button>
        </div>

        {/* Simple Engagement Ring Banner (1:1 Exact Replica of Reference Design) */}
        {viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full rounded-none my-12 overflow-hidden bg-[#EAEAE8] border border-gray-200/80 p-6 sm:p-10 lg:p-14 min-h-[420px] sm:min-h-[480px] flex items-center justify-end"
          >
            {/* Background Studio Image with Pedestal, Standing Ring, and White Vase */}
            <div className="absolute inset-0 z-0">
              <img
                src={FRAMER_IMAGES.weddingBanner}
                alt="Simple Engagement Ring Studio"
                className="w-full h-full object-cover object-left"
              />
            </div>

            {/* Right Floating White Card with Inner Gold Border Frame */}
            <div className="relative z-10 w-full md:w-[480px] lg:w-[520px] bg-white p-4 sm:p-6 text-center shadow-lg border border-gray-100">
              <div className="border border-[#C5A572]/60 p-6 sm:p-10 flex flex-col items-center justify-center">
                <span className="font-body text-[11px] font-bold tracking-[0.25em] uppercase text-[#B59A6C] mb-3 block">
                  FLASH SALE
                </span>
                <h2 className="font-body text-xl sm:text-2xl lg:text-3xl text-[#222222] font-bold mb-3 tracking-tight">
                  Simple Engagement Ring
                </h2>
                <p className="font-body text-[#777777] text-xs sm:text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                  Embrace the beauty of understated elegance with our simple engagement ring, a timeless symbol of love and commitment.
                </p>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}>
                  <Link
                    to="/products/vintage-cuff-ring"
                    className="inline-block bg-[#B59A6C] hover:bg-[#A38B5F] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] transition-all rounded-none shadow-sm"
                  >
                    SHOP NOW
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#222222] text-white rounded-[24px] p-8 lg:p-12 my-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="max-w-xl z-10">
              <span className="text-[#B59A6C] text-xs font-mono tracking-[0.2em] uppercase block mb-3">
                COLLECTION
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl text-white font-bold mb-4">
                Cleopatra Glam
              </h2>
              <p className="font-body text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                Introducing our new mesmerizing jewelry collection. Embrace your inner allure with the timeless elegance and radiant beauty of ancient Egypt.
              </p>
              <Link
                to="/store-grid"
                className="inline-block border border-white text-white bg-transparent px-8 py-3 text-xs tracking-[0.2em] font-mono font-semibold uppercase hover:bg-white hover:text-[#222222] transition-colors"
              >
                SHOP NOW
              </Link>
            </div>
            <div className="w-full md:w-1/3 aspect-square rounded-[20px] overflow-hidden bg-white/5 p-4 flex items-center justify-center">
              <img
                src={FRAMER_IMAGES.minimalMeBanner}
                alt="Cleopatra Glam"
                className="w-full h-full object-cover rounded-[16px]"
              />
            </div>
          </motion.div>
        )}

        {/* Sponsor Logos Section (1:1 Framer Spec) */}
        <section className="max-w-[1520px] mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8 border-t border-b border-gray-100">
          <div className="flex items-center justify-between gap-8 overflow-x-auto hide-scrollbar opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center justify-center flex-1 min-w-[120px]">
              <span className="font-heading text-xl tracking-[0.3em] font-bold text-[#222222] uppercase">VOGUE</span>
            </div>
            <div className="flex items-center justify-center flex-1 min-w-[120px]">
              <img src="https://framerusercontent.com/images/A8SdN3SLQJqn2PXa6VtIcMfvBk.svg" alt="Sponsor Logo 2" className="h-8 object-contain" />
            </div>
            <div className="flex items-center justify-center flex-1 min-w-[120px]">
              <span className="font-heading text-xl tracking-[0.3em] font-bold text-[#222222] uppercase">ELLE</span>
            </div>
            <div className="flex items-center justify-center flex-1 min-w-[120px]">
              <span className="font-heading text-xl tracking-[0.3em] font-bold text-[#222222] uppercase">HARPER'S</span>
            </div>
            <div className="flex items-center justify-center flex-1 min-w-[120px]">
              <span className="font-heading text-xl tracking-[0.3em] font-bold text-[#222222] uppercase">BAZAAR</span>
            </div>
            <div className="flex items-center justify-center flex-1 min-w-[120px]">
              <span className="font-heading text-xl tracking-[0.3em] font-bold text-[#222222] uppercase">GLAMOUR</span>
            </div>
          </div>
        </section>

        {/* Newsletter Banner */}
        <section className="bg-[#FAF9F7] py-16 rounded-[24px] my-8 text-center px-4 border border-gray-100">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#222222] uppercase tracking-wider mb-4 font-bold">
            Get Monthly Updates
          </h2>
          <p className="font-body text-[#808080] text-sm mb-8">
            Join the Social Club for exclusive Rewards & Customer Support
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your Email Address"
              className="flex-1 bg-white border border-gray-200 rounded-full px-6 py-3 text-sm font-body focus:outline-none focus:border-[#B59A6C]"
            />
            <button className="bg-[#222222] text-white rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Products;
