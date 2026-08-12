import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { HeartIcon } from '../components/Icons';
import GlimmrLoader from '../components/GlimmrLoader';
import { getProductImage } from '../utils/productImages';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  const fetchWishlistProducts = async () => {
    setLoading(true);
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(wishlist);

      if (wishlist.length > 0) {
        const fetchedList = [];
        for (const id of wishlist) {
          try {
            const res = await api.get(`/products/${id}`);
            if (res.data) fetchedList.push(res.data);
          } catch (err) {
            console.warn(`Could not fetch product ${id}:`, err);
          }
        }
        setProducts(fetchedList);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlistItems(updatedWishlist);
    setProducts(products.filter(p => (p._id || p.id) !== productId));
    window.dispatchEvent(new Event('wishlist-updated'));
    toastSuccess('Item removed from wishlist');
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      localStorage.setItem('wishlist', '[]');
      setWishlistItems([]);
      setProducts([]);
      window.dispatchEvent(new Event('wishlist-updated'));
      toastSuccess('Wishlist cleared');
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }

    const productId = product._id || product.id;
    try {
      await api.post('/cart', { userId: user.id || user._id, productId, quantity: 1 });
      await updateCartCount();
      toastSuccess(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const moveToCart = async (product) => {
    await addToCart(product);
    removeFromWishlist(product._id || product.id);
  };

  const formatPrice = (product) => {
    const isFramerProduct = typeof product.id === 'string' && !product._id;
    if (isFramerProduct) return `$${Number(product.price).toFixed(2)}`;
    return product.price ? `₹${Math.round(product.price).toLocaleString('en-IN')}` : '—';
  };

  if (loading) {
    return <GlimmrLoader subtitle="RETRIEVING SAVED WISHLIST..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Header & Breadcrumb Banner */}
      <div className="bg-[#FAF9F7] pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100 mb-10">
        <div className="max-w-[1520px] mx-auto text-center">
          {/* Breadcrumb */}
          <div className="text-xs font-body text-[#808080] mb-4 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Link to="/" className="hover:text-[#222222] transition-colors">Home</Link>
            <span className="text-gray-300">|</span>
            <span className="text-[#222222] font-semibold">Wishlist</span>
          </div>

          {/* Hero Title */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#222222] font-normal tracking-tight mb-3"
          >
            My Wishlist
          </motion.h1>

          <p className="font-body text-[#808080] text-xs sm:text-sm tracking-wider uppercase font-medium">
            {products.length === 0 ? 'Your saved collection is empty' : `${products.length} ${products.length === 1 ? 'saved piece' : 'saved pieces'}`}
          </p>
        </div>
      </div>

      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 max-w-md mx-auto"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full bg-[#FAF9F7] border border-gray-200/80 flex items-center justify-center text-[#222222] shadow-sm"
              >
                <HeartIcon size={40} className="text-[#222222]" />
              </motion.div>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl text-[#222222] font-normal mb-3 uppercase tracking-wider">
              YOUR WISHLIST IS EMPTY
            </h2>
            <p className="font-body text-[#808080] text-sm leading-relaxed mb-8">
              Explore our fine luxury jewelry collections and save your favorite pieces to curate your personal wishlist.
            </p>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/products"
                className="inline-block bg-[#222222] hover:bg-black text-white px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-md rounded-none"
              >
                EXPLORE COLLECTION →
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div>
            {/* Top Toolbar Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pb-6 mb-8 border-b border-gray-100 gap-4">
              <span className="font-body text-xs text-[#808080] uppercase tracking-wider font-medium">
                Saved Items ({products.length})
              </span>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={clearWishlist}
                  className="font-body text-xs text-[#808080] hover:text-[#222222] uppercase tracking-wider font-semibold border-b border-gray-300 hover:border-[#222222] transition-colors pb-0.5"
                >
                  Clear All
                </motion.button>
              </div>
            </div>

            {/* Wishlist Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {products.map((product, idx) => {
                  const productId = product._id || product.id;
                  const categoryName = (product.category || 'Jewelry').toUpperCase();

                  return (
                    <motion.div
                      layout
                      key={productId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                      className="group relative flex flex-col justify-between bg-white border border-[#EAE7E1] hover:border-[#222222] transition-all duration-300 rounded-none overflow-hidden"
                    >
                      {/* Image Box Container */}
                      <div className="relative aspect-square bg-[#FAF9F7] p-6 flex items-center justify-center overflow-hidden">
                        {/* Remove Button on Top Right */}
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromWishlist(productId)}
                          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-[#222222] text-[#222222] hover:text-white shadow-md flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>

                        <Link to={`/products/${productId}`} className="w-full h-full flex items-center justify-center">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-contain max-h-[190px] sm:max-h-[210px] transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>

                        {/* Hover Overlay Move to Cart Button */}
                        <div className="absolute inset-x-4 bottom-4 z-20 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => moveToCart(product)}
                            className="w-full bg-[#222222] hover:bg-black text-white py-2.5 px-4 text-center font-body text-[11px] font-bold uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-1.5 rounded-none"
                          >
                            <span>MOVE TO CART</span>
                            <span className="text-xs">→</span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 text-left flex flex-col flex-1 justify-between bg-white">
                        <div>
                          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B59A6C] mb-1.5 block">
                            {categoryName}
                          </span>

                          <Link to={`/products/${productId}`}>
                            <h3 className="font-body text-base text-[#222222] font-bold truncate group-hover:text-black transition-colors mb-1">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="font-body text-sm font-semibold text-[#222222] mb-4">
                            {formatPrice(product)}
                          </p>
                        </div>

                        {/* Secondary Button Row */}
                        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-transparent border border-[#222222] hover:bg-[#222222] hover:text-white text-[#222222] py-2 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-none"
                          >
                            Add to Cart
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => removeFromWishlist(productId)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#808080] hover:text-[#222222] text-[11px] font-bold uppercase tracking-wider transition-colors rounded-none"
                            title="Remove item"
                          >
                            Remove
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom Navigation Link */}
            <div className="mt-16 text-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 border border-[#222222] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
                >
                  <span>CONTINUE SHOPPING</span>
                  <span className="text-xs">→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
