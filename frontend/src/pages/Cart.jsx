import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useMetalRates } from '../contexts/MetalRatesContext';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { getProductImage } from '../utils/productImages';
import { AVAILABLE_VOUCHERS, validateVoucher } from '../utils/voucherConfig';
import GlimmrLoader from '../components/GlimmrLoader';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ArrowRightIcon, 
  LockIcon,
  TagIcon,
  SparklesIcon,
  RefreshIcon
} from '../components/Icons';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('glimmr_applied_voucher');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const { updateCartCount } = useCart();
  const { getLiveProductPrice } = useMetalRates();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/cart/${user.id || user._id}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user || quantity < 1) return;
    
    try {
      const res = await api.put(`/cart/${user.id || user._id}`, { productId, quantity });
      setCartItems(res.data.items || []);
      updateCartCount();
      toastSuccess('Portfolio quantity updated');
    } catch (err) {
      console.error('Error updating quantity:', err);
      toastError('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;
    
    try {
      const res = await api.delete(`/cart/${user.id || user._id}/${productId}`);
      setCartItems(res.data.items || []);
      updateCartCount();
      toastSuccess('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      toastError('Failed to remove item');
    }
  };

  const moveToWishlist = async (product) => {
    const pId = product._id || product.id;
    if (!pId) return;

    try {
      const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!existingWishlist.includes(pId)) {
        existingWishlist.push(pId);
        localStorage.setItem('wishlist', JSON.stringify(existingWishlist));
        toastSuccess('Saved to Atelier Wishlist');
      } else {
        toastSuccess('Already in your Wishlist');
      }
      await removeItem(pId);
    } catch (err) {
      console.error('Error moving to wishlist:', err);
    }
  };

  const getItemPrice = (p) => {
    if (!p) return 0;
    const isFramerProduct = typeof p.id === 'string' && !p._id;
    if (isFramerProduct) return Number(p.price) || 0;
    return getLiveProductPrice(p).totalLivePrice;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + getItemPrice(item.product) * item.quantity;
    }, 0);
  };

  const handleApplyCoupon = (e, explicitCode = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setCouponError('');
    const code = (explicitCode || couponCode || '').trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a voucher code');
      return;
    }

    const currentSubtotal = calculateSubtotal();
    const result = validateVoucher(code, currentSubtotal);

    if (result.valid) {
      setAppliedCoupon(result.voucher);
      setCouponCode(result.voucher.code);
      localStorage.setItem('glimmr_applied_voucher', JSON.stringify(result.voucher));
      toastSuccess(result.message);
    } else {
      setCouponError(result.message);
      toastError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    localStorage.removeItem('glimmr_applied_voucher');
    toastSuccess('Voucher removed');
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (!appliedCoupon) return 0;
    const res = validateVoucher(appliedCoupon.code, subtotal);
    if (res.valid) {
      return res.voucher.calculatedDiscount;
    }
    return 0;
  };

  const calculateFinalTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };

  if (loading || authLoading) {
    return <GlimmrLoader subtitle="SYNCHRONIZING ATELIER CART..." fullScreen={true} />;
  }

  /* Webflow & Framer Motion Unauthenticated Visitor Auth Requirement Card */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-[#B59A6C]/20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="max-w-4xl w-full bg-white border border-[#E5E2D9] rounded-[24px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.06)] relative"
        >
          {/* Subtle Radial Webflow Grid */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#E5E2D9_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10">
            
            {/* Left High-Resolution Fine Jewelry Image Showcase */}
            <div className="lg:col-span-5 relative bg-[#111111] min-h-[260px] lg:min-h-[460px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
                alt="Glimmr Fine Jewelry Acquisitions"
                className="w-full h-full object-cover object-center opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="px-3 py-1 bg-black/60 border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest inline-block">
                  ROYAL KUNDAN HERITAGE
                </span>
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                  Synchronized Atelier Portfolio
                </h3>
                <p className="text-xs font-body text-gray-300 font-light">
                  Sign in to view saved acquisitions, active welcome vouchers, and insured checkout.
                </p>
              </div>
            </div>

            {/* Right Form & Actions Column */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
              
              <div className="space-y-4 text-center sm:text-left">
                {/* Webflow Pill Badge with Gold Halo Indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#FAF9F7] border border-[#E5E2D9] rounded-full"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B59A6C] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B59A6C]" />
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
                    PATRON AUTHENTICATION REQUIRED
                  </span>
                </motion.div>

                <h2 className="font-heading text-3xl sm:text-4xl text-[#111111] uppercase tracking-wide font-extrabold leading-tight">
                  Sign In to Access Your Cart
                </h2>

                <p className="font-body text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                  To view your selected 24K Kundan gold, sterling silver, and luxury watches, please sign in or register your Glimmr Atelier patron account.
                </p>

                {/* Benefits Pill List */}
                <div className="space-y-2.5 pt-2 text-xs font-body text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon size={16} className="text-[#B59A6C] shrink-0" />
                    <span>Synchronize cart items across desktop & mobile devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon size={16} className="text-[#B59A6C] shrink-0" />
                    <span>Apply 10% welcome voucher code <strong className="font-mono text-[#111111]">WELCOME10</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon size={16} className="text-[#B59A6C] shrink-0" />
                    <span>100% BIS Hallmarked certified insured transit delivery</span>
                  </div>
                </div>
              </div>

              {/* Two Interactive Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-100">
                
                {/* Button 1: Continue to Explore */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/products')}
                  className="w-full sm:w-1/2 py-3.5 px-6 bg-[#FAF9F7] border border-[#E5E2D9] hover:border-[#111111] text-[#111111] font-body text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer text-center"
                >
                  CONTINUE TO EXPLORE
                </motion.button>

                {/* Button 2: Login / Signup to Visit Cart */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-1/2 py-3.5 px-6 bg-[#111111] text-[#FAF9F7] font-body text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#B59A6C] transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <span>LOGIN / SIGNUP FIRST</span>
                  <ArrowRightIcon size={14} className="text-[#B59A6C]" />
                </motion.button>

              </div>

            </div>

          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Luxury Breadcrumb & Header */}
        <div className="mb-10 text-center md:text-left border-b border-[#E5E2D9] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex justify-center md:justify-start items-center gap-2 text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2">
              <Link to="/" className="hover:text-[#111111] transition-colors">Atelier Home</Link>
              <span>/</span>
              <span className="text-[#111111]">Shopping Cart</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-[#111111] tracking-tight">
              Your Acquisitions <span className="text-[#B59A6C] font-normal text-2xl md:text-3xl">({calculateTotalItems()})</span>
            </h1>
          </div>

          {cartItems.length > 0 && (
            <div className="flex items-center justify-center md:justify-end gap-3 text-xs font-body text-gray-500 uppercase tracking-widest font-bold">
              <ShieldCheckIcon size={18} className="text-[#B59A6C]" />
              <span>BIS Hallmarked • 100% Certified Gold & Silver</span>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart Luxury Presentation */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E5E2D9] p-12 md:p-20 text-center max-w-3xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
          >
            <motion.div 
              whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
              className="w-24 h-24 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] mx-auto mb-6 shadow-sm"
            >
              <ShoppingBagIcon size={40} />
            </motion.div>
            <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] block mb-2">
              EMPTY ATELIER CART
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-[#111111] mb-4">
              Your Portfolio is Currently Empty
            </h2>
            <p className="text-xs font-body text-gray-500 max-w-md mx-auto leading-relaxed uppercase tracking-wider mb-8">
              Explore our handcrafted collections of 24K Kundan gold, hallmarked 925 silver, and luxury chronographs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {['Watches', 'Necklaces', 'Rings', 'Earrings', 'Bracelets'].map((cat) => (
                <Link key={cat} to={`/products?category=${cat}`}>
                  <button className="px-5 py-2.5 bg-[#FAF9F7] border border-gray-200 text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#111111] hover:bg-[#111111] hover:text-white transition-all cursor-pointer">
                    {cat}
                  </button>
                </Link>
              ))}
            </div>

            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.25em] shadow-lg hover:bg-[#222222] transition-colors cursor-pointer"
              >
                Explore High Jewelry Collections
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          /* Responsive 2-Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List Column */}
            <div className="lg:col-span-7 xl:col-span-8 min-w-0 space-y-6">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => {
                  const p = item.product || {};
                  const itemPrice = getItemPrice(p);
                  const itemTotal = itemPrice * item.quantity;
                  const itemId = p._id || p.id || item._id;

                  return (
                    <motion.div
                      key={itemId || index}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-[#E5E2D9] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-[#111111] transition-all relative group flex flex-col sm:flex-row items-start sm:items-stretch gap-5 sm:gap-6 min-w-0 overflow-hidden"
                    >
                      {/* Product Thumbnail with Fixed Aspect Ratio */}
                      <Link to={`/products/${itemId}`} className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-[#FAF9F7] border border-gray-200 overflow-hidden shrink-0 flex-shrink-0 relative self-center sm:self-auto">
                        <motion.img
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4 }}
                          src={getProductImage(p)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        {p.category && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#111111]/80 backdrop-blur-xs text-[#B59A6C] text-[9px] font-body font-bold uppercase tracking-widest">
                            {p.category}
                          </span>
                        )}
                      </Link>

                      {/* Product Specifications & Details */}
                      <div className="flex-1 min-w-0 w-full flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <Link to={`/products/${itemId}`} className="min-w-0 flex-1">
                              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#111111] hover:text-[#B59A6C] transition-colors leading-snug break-words">
                                {p.name}
                              </h3>
                            </Link>
                            {/* Remove Item Cross Button */}
                            <motion.button
                              whileHover={{ scale: 1.15, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(itemId)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1 shrink-0 cursor-pointer"
                              title="Remove item"
                            >
                              <TrashIcon size={18} />
                            </motion.button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-body text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                            {p.material && <span>{p.material}</span>}
                            {p.material?.toLowerCase() === 'gold' && p.karat && (
                              <span className="text-[#B59A6C] font-bold">• {p.karat}K Gold</span>
                            )}
                            {p.weight && <span>• {p.weight}g</span>}
                          </div>
                        </div>

                        {/* Quantity Counter & Live Portfolio Value */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-200 bg-[#FAF9F7] shrink-0">
                            <button
                              onClick={() => updateQuantity(itemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#111111] hover:bg-gray-200 disabled:opacity-30 transition-colors font-bold text-sm cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-8 sm:w-10 text-center font-mono font-bold text-xs text-[#111111]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(itemId, item.quantity + 1)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#111111] hover:bg-gray-200 transition-colors font-bold text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Price Calculation */}
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">TOTAL VALUE</span>
                            <span className="font-mono text-lg sm:text-xl font-extrabold text-[#111111]">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] font-body text-gray-400 block">
                                (₹{itemPrice.toLocaleString('en-IN')} each)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Save to Wishlist Link */}
                        <div className="pt-1">
                          <button
                            onClick={() => moveToWishlist(p)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-widest text-gray-400 hover:text-[#B59A6C] transition-colors cursor-pointer"
                          >
                            <HeartIcon size={13} /> Save to Atelier Wishlist
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Atelier Collection Return */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-body font-bold uppercase tracking-widest">
                <Link to="/products" className="inline-flex items-center gap-2 text-[#111111] hover:text-[#B59A6C] transition-colors">
                  ← Continue Exploring Atelier
                </Link>
                <button
                  onClick={fetchCart}
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <RefreshIcon size={14} /> Refresh Portfolio
                </button>
              </div>
            </div>

            {/* Order Portfolio Summary Column */}
            <div className="lg:col-span-5 xl:col-span-4 min-w-0">
              <div className="bg-white border border-[#E5E2D9] shadow-[0_20px_50px_rgba(0,0,0,0.05)] sticky top-28 overflow-hidden">
                
                {/* Gold Top Accent Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#B59A6C] via-[#111111] to-[#B59A6C]" />

                <div className="p-8 space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                      PORTFOLIO VALUATION
                    </span>
                    <h2 className="text-2xl font-heading font-extrabold text-[#111111]">Order Summary</h2>
                  </div>

                  {/* Summary Cost Breakdown */}
                  <div className="space-y-3.5 text-xs font-body">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal ({calculateTotalItems()} items)</span>
                      <span className="font-mono font-bold text-[#111111]">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <TruckIcon size={14} className="text-[#B59A6C]" /> Insured Transit
                      </span>
                      <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider">COMPLIMENTARY</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>GST & Metal Certificate</span>
                      <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">INCLUDED</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 p-3 border border-emerald-300/80">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-[11px] tracking-wider text-emerald-900">{appliedCoupon.code}</span>
                            <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 font-bold uppercase tracking-widest">{appliedCoupon.badge || 'Applied'}</span>
                          </div>
                          <p className="text-[10px] text-emerald-700 font-medium">{appliedCoupon.description || appliedCoupon.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-emerald-800">-₹{calculateDiscount().toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[10px] text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider underline cursor-pointer ml-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">NET PORTFOLIO TOTAL</span>
                          <span className="text-xl font-heading font-extrabold text-[#111111]">Total Payable</span>
                        </div>
                        <span className="font-mono text-3xl font-extrabold text-[#111111]">
                          ₹{calculateFinalTotal().toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Luxury Promo Voucher Drawer */}
                  <div className="pt-5 border-t border-gray-100 space-y-3">
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <label className="block text-[10px] font-body font-bold uppercase tracking-widest text-gray-500">
                        Atelier Voucher / Privilege Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g. WELCOME10"
                          className="flex-1 px-3.5 py-2.5 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold uppercase text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#111111] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[10px] font-body text-rose-600 font-bold">{couponError}</p>
                      )}
                    </form>

                    {/* Available Privileges Carousel / Quick Apply Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">
                        Available Atelier Privileges:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {AVAILABLE_VOUCHERS.map((v) => {
                          const isCurrent = appliedCoupon?.code === v.code;
                          return (
                            <button
                              key={v.code}
                              type="button"
                              onClick={() => handleApplyCoupon(null, v.code)}
                              className={`text-left p-2 border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                                isCurrent 
                                  ? 'border-emerald-600 bg-emerald-50/60' 
                                  : 'border-gray-200 bg-[#FAF9F7] hover:border-[#111111] hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-0.5">
                                <span className="font-mono font-extrabold text-[11px] text-[#111111]">{v.code}</span>
                                <span className={`text-[8px] font-bold uppercase px-1 py-0.2 tracking-wider ${isCurrent ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                  {isCurrent ? 'Active' : v.badge}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-500 line-clamp-1">{v.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Checkout CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/checkout', { state: { appliedVoucher: appliedCoupon } })}
                    className="w-full py-4 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-[#222222] transition-all flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <span>Proceed to Checkout</span>
                    <motion.span whileHover={{ x: 4 }}>
                      <ArrowRightIcon size={16} className="text-[#B59A6C]" />
                    </motion.span>
                  </motion.button>

                  {/* Trust & Guarantee Badges */}
                  <div className="pt-6 border-t border-gray-100 space-y-3.5 text-xs font-body text-gray-600">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon size={18} className="text-[#B59A6C] flex-shrink-0" />
                      <span>Encrypted SSL 256-bit Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TruckIcon size={18} className="text-[#B59A6C] flex-shrink-0" />
                      <span>Fully Insured Doorstep Express Delivery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon size={18} className="text-[#B59A6C] flex-shrink-0" />
                      <span>30-Day Atelier Returns & Lifetime Exchange</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
