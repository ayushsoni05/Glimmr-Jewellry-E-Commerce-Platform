import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useMetalRates } from '../contexts/MetalRatesContext';
import { INDIAN_STATES, fetchAddressFromPincode, isValidPincode } from '../utils/addressUtils';
import { INDIAN_CITIES } from '../utils/indianCities';
import { getProductImage } from '../utils/productImages';
import GlimmrLoader from '../components/GlimmrLoader';
import JewelryOrderStoryModal from '../components/JewelryOrderStoryModal';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ArrowRightIcon, 
  LockIcon, 
  CreditCardIcon, 
  MapPinIcon, 
  OrderIcon, 
  UserIcon,
  WalletIcon
} from '../components/Icons';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment
  const { user, loading: authLoading } = useAuth();
  const { updateCartCount } = useCart();
  const { getLiveProductPrice } = useMetalRates();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Jewelry Order Story Animation State
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyOrderData, setStoryOrderData] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toastError('Please log in to checkout');
      navigate('/auth');
      return;
    }
    api.get(`/cart/${user.id || user._id}`).then(res => setCart(res.data)).catch(console.error);
    fetchAddresses();
  }, [user, authLoading, navigate]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/user/addresses');
      const { addresses: list = [], defaultShippingAddressId } = res.data || {};
      setSavedAddresses(list);
      
      if (list.length > 0) {
        const defaultById = defaultShippingAddressId
          ? list.find(a => a._id === defaultShippingAddressId)
          : null;
        const defaultAddr = defaultById || list.find(a => a.isDefault) || list[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            name: defaultAddr.name,
            phone: defaultAddr.phone || '',
            line1: defaultAddr.line1,
            line2: defaultAddr.line2 || '',
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
            country: defaultAddr.country || 'India'
          });
        }
      }
    } catch (err) {
      console.error('[FETCH ADDRESSES] Error:', err);
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const addr = savedAddresses.find(a => a._id === addressId);
    if (addr) {
      setShippingAddress({
        name: addr.name,
        phone: addr.phone || '',
        line1: addr.line1,
        line2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
      });
    }
    setIsAddingNew(false);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    setPincodeError('');
    
    if (name === 'city') {
      handleCitySearch(value);
    }
  };

  const handlePincodeBlur = async (e) => {
    const pincode = e.target.value;
    if (!pincode) {
      setPincodeError('');
      return;
    }
    if (!isValidPincode(pincode)) {
      setPincodeError('Please enter a valid 6-digit pincode');
      return;
    }

    setPincodeLoading(true);
    setPincodeError('');

    try {
      const details = await fetchAddressFromPincode(pincode);
      if (details) {
        setShippingAddress(prev => ({
          ...prev,
          city: details.city,
          state: details.state
        }));
        toastSuccess(`City and State auto-filled for pincode ${pincode}`);
      } else {
        setPincodeError('Pincode not found. Please enter city and state manually.');
      }
    } catch (error) {
      setPincodeError('Could not fetch address details. Please try again.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleCitySearch = (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setFilteredCities([]);
      setShowCityDropdown(false);
      return;
    }
    const filtered = INDIAN_CITIES.filter(city => 
      city.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 50);
    setFilteredCities(filtered);
    setShowCityDropdown(filtered.length > 0);
  };

  const handleCitySelect = (city) => {
    setShippingAddress(prev => ({ ...prev, city }));
    setFilteredCities([]);
    setShowCityDropdown(false);
  };

  const handleSaveNewAddress = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      toastError('Please fill all required fields');
      return;
    }

    try {
      if (saveAddress) {
        const response = await api.post('/user/addresses', {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country,
          isDefault: savedAddresses.length === 0
        });
        
        if (response.data.addresses) {
          setSavedAddresses(response.data.addresses);
          const newAddr = response.data.addresses[response.data.addresses.length - 1];
          setSelectedAddressId(newAddr._id);
          toastSuccess('Address saved to your profile.');
        } else {
          toastError('Address saved but could not update list');
        }
      } else {
        toastSuccess('Using address for this order');
      }
      setIsAddingNew(false);
      setSaveAddress(true);
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to save address.');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toastError('Please log in to checkout');
      return;
    }
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      toastError('Please fill all shipping details');
      return;
    }
    if (!paymentMethod) {
      toastError('Please select a payment method');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/orders', { 
        userId: user.id || user._id,
        shippingAddress,
        paymentMethod
      });
      const orderData = response.data.order || response.data;
      setCart({ items: [] });
      try {
        await updateCartCount();
      } catch (e) {
        console.warn('Failed to update cart count:', e);
      }
      // Trigger the 5-Act Jewelry Order Story Animation
      setStoryOrderData(orderData);
      setShowStoryModal(true);
    } catch (err) {
      let errorMessage = 'Checkout failed. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getItemBreakdown = (p) => {
    if (!p) return { totalLivePrice: 0, rawMetalCost: 0, makingCharges: 0, gemstoneCost: 0, gstTax: 0, subtotal: 0, weight: 0, karat: 0, material: '', purityPercentageStr: '', diamondDetails: null };
    const isFramerProduct = typeof p.id === 'string' && !p._id;
    if (isFramerProduct) {
      const price = Number(p.price) || 0;
      return { totalLivePrice: price, rawMetalCost: price, makingCharges: 0, gemstoneCost: 0, gstTax: 0, subtotal: price, weight: 0, karat: 0, material: '', purityPercentageStr: '', diamondDetails: null };
    }
    return getLiveProductPrice(p);
  };

  const getItemPrice = (p) => getItemBreakdown(p).totalLivePrice;

  const getOrderBreakdown = () => {
    let totalMetal = 0, totalMaking = 0, totalDiamond = 0, totalGst = 0, totalSubtotal = 0, totalPayable = 0;
    cart.items.forEach((item) => {
      const bd = getItemBreakdown(item.product);
      const qty = item.quantity;
      totalMetal += bd.rawMetalCost * qty;
      totalMaking += bd.makingCharges * qty;
      totalDiamond += bd.gemstoneCost * qty;
      totalGst += bd.gstTax * qty;
      totalSubtotal += bd.subtotal * qty;
      totalPayable += bd.totalLivePrice * qty;
    });
    return { totalMetal, totalMaking, totalDiamond, totalGst, totalSubtotal, totalPayable };
  };

  const calculateTotal = () => getOrderBreakdown().totalPayable;

  if (authLoading || loading) {
    return <GlimmrLoader subtitle="INITIALIZING SECURE CHECKOUT..." fullScreen={true} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Luxury Breadcrumb & Header */}
        <div className="mb-10 text-center md:text-left border-b border-[#E5E2D9] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex justify-center md:justify-start items-center gap-2 text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2">
              <Link to="/" className="hover:text-[#111111] transition-colors">Atelier Home</Link>
              <span>/</span>
              <Link to="/cart" className="hover:text-[#111111] transition-colors">Cart</Link>
              <span>/</span>
              <span className="text-[#111111]">Secure Checkout</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-[#111111] tracking-tight">
              Atelier Checkout
            </h1>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 text-xs font-body text-gray-500 uppercase tracking-widest font-bold">
            <LockIcon size={18} className="text-[#B59A6C]" />
            <span>256-bit SSL Encrypted Guarantee</span>
          </div>
        </div>

        {/* Webflow & Framer Motion Stepper */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between relative px-4">
            
            {/* Background Stepper Track Line */}
            <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-gray-200 -translate-y-1/2 z-0" />
            <motion.div 
              className="absolute top-1/2 left-10 h-[2.5px] bg-[#111111] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {[
              { num: 1, icon: OrderIcon, label: '1. Review Portfolio' },
              { num: 2, icon: MapPinIcon, label: '2. Shipping Destination' },
              { num: 3, icon: CreditCardIcon, label: '3. Payment & Guarantee' }
            ].map((s) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              const StepIcon = s.icon;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (s.num < step) setStep(s.num);
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 shadow-sm ${
                      isCompleted
                        ? 'bg-[#FDF2F0] text-[#B59A6C] border-2 border-[#E8C8C1] cursor-pointer'
                        : isActive
                        ? 'bg-[#FDF2F0] text-[#B59A6C] border-2 border-[#B59A6C] ring-4 ring-[#E8C8C1]/30 cursor-default'
                        : 'bg-white text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? <CheckCircleIcon size={18} className="text-[#B59A6C]" /> : <StepIcon size={18} />}
                  </motion.button>
                  <span className={`text-[10px] font-body font-bold uppercase tracking-[0.18em] hidden sm:block ${
                    isActive ? 'text-[#111111]' : isCompleted ? 'text-[#B59A6C]' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Multi-Step Interactive Form */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Review Acquisitions */}
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }} 
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-[#E5E2D9] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-6"
                >
                  <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                    <div className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0">
                      <OrderIcon size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                        STEP 1 OF 3
                      </span>
                      <h2 className="text-2xl font-heading font-extrabold text-[#222222]">Review Your Portfolio</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {cart.items.length === 0 ? (
                      <div className="text-center py-12 bg-[#FAF9F7] border border-gray-200">
                        <p className="text-gray-400 font-body text-xs uppercase tracking-widest font-bold mb-4">Your cart is empty.</p>
                        <Link to="/products">
                          <button className="px-6 py-3 bg-[#111111] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] transition-colors cursor-pointer">
                            Explore Jewelry Collection
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        {cart.items.map((item, idx) => {
                          const p = item.product || {};
                          const itemPrice = getItemPrice(p);
                          const itemTotal = itemPrice * item.quantity;
                          return (
                            <div key={item._id || idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-[#FAF9F7] border border-gray-200 hover:border-[#111111] transition-all">
                              <img 
                                src={getProductImage(p)} 
                                alt={p.name} 
                                className="w-20 h-20 object-cover border border-gray-200 shrink-0 bg-white" 
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading font-extrabold text-base text-[#111111] leading-snug break-words">
                                  {p.name}
                                </h3>
                                <p className="text-xs font-body text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                                  {p.material} {p.material?.toLowerCase() === 'gold' && p.karat && `• ${p.karat}K Gold`} {p.weight && `• ${p.weight}g`}
                                </p>
                                <span className="text-[10px] font-body text-gray-400 font-mono block mt-1">
                                  Quantity: {item.quantity}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">VALUATION</span>
                                <span className="font-mono text-lg font-extrabold text-[#111111]">
                                  ₹{itemTotal.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        <div className="pt-4 flex justify-end">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStep(2)} 
                            className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.25em] shadow-md hover:bg-[#222222] transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <span>Continue to Shipping</span>
                            <ArrowRightIcon size={16} className="text-[#B59A6C]" />
                          </motion.button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Destination */}
              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }} 
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-[#E5E2D9] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-6"
                >
                  <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                    <div className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0">
                      <MapPinIcon size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                        STEP 2 OF 3
                      </span>
                      <h2 className="text-2xl font-heading font-extrabold text-[#222222]">Delivery Destination</h2>
                    </div>
                  </div>

                  {!isAddingNew && savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block">
                        SAVED ATELIER ADDRESSES
                      </span>
                      <div className="grid grid-cols-1 gap-4">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr._id;
                          return (
                            <div 
                              key={addr._id} 
                              onClick={() => handleSelectAddress(addr._id)} 
                              className={`p-5 border transition-all cursor-pointer flex items-start gap-4 ${
                                isSelected 
                                  ? 'border-[#111111] bg-[#FAF9F7] shadow-sm' 
                                  : 'border-gray-200 hover:border-gray-400 bg-white'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'border-[#111111] bg-[#111111]' : 'border-gray-300'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-[#B59A6C] rounded-full" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-heading font-bold text-base text-[#111111]">{addr.name}</p>
                                  {addr.isDefault && (
                                    <span className="text-[9px] font-body font-bold uppercase tracking-widest bg-[#111111] text-[#B59A6C] px-2 py-0.5">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-body text-gray-600 leading-relaxed">
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                                  {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.pincode}</span><br />
                                  {addr.country} • Phone: {addr.phone}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <button 
                        onClick={() => setIsAddingNew(true)} 
                        className="text-xs font-body font-bold uppercase tracking-wider text-[#B59A6C] hover:text-[#111111] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        + Add New Delivery Address
                      </button>
                    </div>
                  )}

                  {(isAddingNew || savedAddresses.length === 0) && (
                    <div className="space-y-5 pt-2">
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block">
                        {isAddingNew ? 'ADD NEW DELIVERY DESTINATION' : 'ENTER SHIPPING DETAILS'}
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Recipient Name *</label>
                          <input 
                            type="text" 
                            name="name" 
                            value={shippingAddress.name} 
                            onChange={handleAddressChange} 
                            className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Contact Phone *</label>
                          <input 
                            type="tel" 
                            name="phone" 
                            maxLength="10" 
                            value={shippingAddress.phone} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              handleAddressChange({ target: { name: 'phone', value } });
                            }} 
                            className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Address Line 1 *</label>
                          <input 
                            type="text" 
                            name="line1" 
                            value={shippingAddress.line1} 
                            onChange={handleAddressChange} 
                            className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Address Line 2 (Optional)</label>
                          <input 
                            type="text" 
                            name="line2" 
                            value={shippingAddress.line2} 
                            onChange={handleAddressChange} 
                            className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Pincode *</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              name="pincode" 
                              maxLength="6" 
                              value={shippingAddress.pincode} 
                              onChange={handleAddressChange} 
                              onBlur={handlePincodeBlur} 
                              className={`w-full px-4 py-3 bg-[#FAF9F7] border text-xs font-mono font-bold text-[#222222] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none ${pincodeError ? 'border-rose-300' : 'border-gray-200'}`} 
                            />
                            {pincodeLoading && <div className="absolute right-3 top-3 w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />}
                          </div>
                          {pincodeError && <p className="text-[10px] font-body text-rose-600 mt-1 font-bold">{pincodeError}</p>}
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">City *</label>
                          <input 
                            type="text" 
                            name="city" 
                            value={shippingAddress.city} 
                            onChange={handleAddressChange} 
                            onFocus={() => { if (shippingAddress.city.length >= 2) handleCitySearch(shippingAddress.city); }} 
                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)} 
                            className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#111111] focus:outline-none transition-all rounded-none" 
                            autoComplete="off" 
                          />
                          {showCityDropdown && filteredCities.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-md max-h-60 overflow-y-auto py-1">
                              {filteredCities.map((city) => (
                                <div key={city} onClick={() => handleCitySelect(city)} className="px-4 py-2.5 hover:bg-[#FAF9F7] cursor-pointer text-xs font-body text-[#222222] uppercase tracking-wider">{city}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">State *</label>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setIsStateMenuOpen(!isStateMenuOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                          >
                            <span>{shippingAddress.state || 'Select State'}</span>
                            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isStateMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.button>

                          <AnimatePresence>
                            {isStateMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-md z-50 py-1 max-h-60 overflow-y-auto"
                              >
                                {INDIAN_STATES.map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      handleAddressChange({ target: { name: 'state', value: st } });
                                      setIsStateMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${shippingAddress.state === st ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Country *</label>
                          <input type="text" name="country" value={shippingAddress.country} readOnly className="w-full px-4 py-3 bg-gray-100 border border-gray-200 text-xs font-body text-gray-500 uppercase tracking-wider cursor-not-allowed" />
                        </div>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer mt-4">
                        <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 text-[#111111] border-gray-300 rounded-none focus:ring-0" />
                        <span className="text-xs font-body text-gray-600 uppercase tracking-wider">Save this address to my profile</span>
                      </label>

                      {isAddingNew ? (
                        <div className="flex gap-4 pt-2">
                          <button onClick={() => setIsAddingNew(false)} className="flex-1 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider text-[#111111] hover:bg-gray-100 cursor-pointer">Cancel</button>
                          <button onClick={handleSaveNewAddress} className="flex-1 py-3 bg-[#111111] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer">Save & Use</button>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <button onClick={handleSaveNewAddress} className="w-full py-3.5 bg-[#111111] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer">Save Address</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button onClick={() => setStep(1)} className="px-6 py-3.5 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider text-[#111111] hover:bg-gray-100 cursor-pointer">Back</button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)} 
                      className="flex-1 py-3.5 bg-[#111111] text-white text-xs font-body font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#222222] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRightIcon size={16} className="text-[#B59A6C]" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Method & Order Placement */}
              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }} 
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-[#E5E2D9] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-6"
                >
                  <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                    <div className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0">
                      <CreditCardIcon size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                        STEP 3 OF 3
                      </span>
                      <h2 className="text-2xl font-heading font-extrabold text-[#222222]">Financial Option</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'cod', title: 'Cash on Delivery (COD)', icon: TruckIcon, desc: 'Pay with cash upon white-glove insured delivery' },
                      { id: 'card', title: 'Credit or Debit Card', icon: CreditCardIcon, desc: 'Instant encrypted payment via Visa, Mastercard, AMEX' },
                      { id: 'upi', title: 'UPI / Instant Banking', icon: WalletIcon, desc: 'Pay via Google Pay, PhonePe, Paytm, or Net Banking' }
                    ].map((pm) => {
                      const isSelected = paymentMethod === pm.id;
                      const IconComp = pm.icon;
                      return (
                        <div 
                          key={pm.id} 
                          onClick={() => setPaymentMethod(pm.id)} 
                          className={`p-6 border transition-all cursor-pointer flex items-center gap-5 ${
                            isSelected 
                              ? 'border-[#111111] bg-[#FAF9F7] shadow-sm' 
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#111111] bg-[#111111]' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-[#B59A6C] rounded-full" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-heading font-bold text-base text-[#111111] flex items-center gap-2">
                              <IconComp size={18} className="text-[#B59A6C]" /> {pm.title}
                            </p>
                            <p className="text-xs font-body text-gray-500 mt-0.5">{pm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button onClick={() => setStep(2)} className="px-6 py-3.5 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider text-[#111111] hover:bg-gray-100 cursor-pointer">Back</button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout} 
                      disabled={loading} 
                      className="flex-1 py-4 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-[#222222] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>{loading ? 'Processing Acquisition...' : `Place Order • ₹${calculateTotal().toLocaleString('en-IN')}`}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sticky Order Portfolio Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-5 xl:col-span-4 min-w-0"
          >
            <div className="bg-white border border-[#E5E2D9] shadow-[0_20px_50px_rgba(0,0,0,0.05)] sticky top-28 overflow-hidden">
              
              {/* Gold Top Accent Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#B59A6C] via-[#111111] to-[#B59A6C]" />

              <div className="p-8 space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                    VALUATION BREAKDOWN
                  </span>
                  <h2 className="text-2xl font-heading font-extrabold text-[#111111]">Order Summary</h2>
                </div>

                <div className="space-y-3.5 text-xs font-body">

                  {/* Per-Item Breakdown */}
                  {cart.items.map((item, idx) => {
                    const p = item.product || {};
                    const bd = getItemBreakdown(p);
                    const qty = item.quantity;
                    return (
                      <div key={item._id || idx} className="pb-3 border-b border-gray-100 last:border-b-0 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-heading font-bold text-[#111111] text-xs leading-snug break-words flex-1">{p.name || 'Jewelry Piece'}</span>
                          <span className="font-mono font-extrabold text-[#111111] whitespace-nowrap">₹{(bd.totalLivePrice * qty).toLocaleString('en-IN')}</span>
                        </div>
                        {bd.weight > 0 && (
                          <div className="pl-2 space-y-0.5 text-[10px] text-gray-500">
                            <div className="flex justify-between">
                              <span>{(bd.material || 'gold').charAt(0).toUpperCase() + (bd.material || 'gold').slice(1)} Cost ({bd.weight}g, {bd.karat}K {bd.purityPercentageStr})</span>
                              <span className="font-mono">₹{(bd.rawMetalCost * qty).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Artisan Making Charges</span>
                              <span className="font-mono">₹{(bd.makingCharges * qty).toLocaleString('en-IN')}</span>
                            </div>
                            {bd.gemstoneCost > 0 && (
                              <div className="flex justify-between">
                                <span>Diamond / Gemstone ({bd.diamondDetails?.carat}ct {bd.diamondDetails?.cut} {bd.diamondDetails?.color}/{bd.diamondDetails?.clarity})</span>
                                <span className="font-mono">₹{(bd.gemstoneCost * qty).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>GST (3%)</span>
                              <span className="font-mono">₹{(bd.gstTax * qty).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        )}
                        {qty > 1 && (
                          <span className="text-[10px] font-body text-gray-400 font-mono pl-2">Qty: {qty}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Aggregate Totals */}
                  {(() => {
                    const ob = getOrderBreakdown();
                    return (
                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Metal Value</span>
                          <span className="font-mono font-bold text-[#111111]">₹{ob.totalMetal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Making Charges</span>
                          <span className="font-mono font-bold text-[#111111]">₹{ob.totalMaking.toLocaleString('en-IN')}</span>
                        </div>
                        {ob.totalDiamond > 0 && (
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Diamond / Gemstone</span>
                            <span className="font-mono font-bold text-[#111111]">₹{ob.totalDiamond.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Subtotal (Before Tax)</span>
                          <span className="font-mono font-bold text-[#111111]">₹{ob.totalSubtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>GST (3%)</span>
                          <span className="font-mono font-bold text-[#111111]">₹{ob.totalGst.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <TruckIcon size={14} className="text-[#B59A6C]" /> Insured Transit
                          </span>
                          <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider">COMPLIMENTARY</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">NET PORTFOLIO TOTAL</span>
                        <span className="text-xl font-heading font-extrabold text-[#111111]">Total Payable</span>
                      </div>
                      <span className="font-mono text-3xl font-extrabold text-[#111111]">
                        ₹{calculateTotal().toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust & Guarantee Badges */}
                <div className="pt-6 border-t border-gray-100 space-y-3.5 text-xs font-body text-gray-600">
                  <div className="flex items-center gap-3">
                    <LockIcon size={18} className="text-[#B59A6C] flex-shrink-0" />
                    <span>256-Bit SSL Encrypted Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon size={18} className="text-[#B59A6C] flex-shrink-0" />
                    <span>BIS Hallmarked 100% Certified Jewelry</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon size={18} className="text-[#B59A6C] flex-shrink-0" />
                    <span>Complimentary 30-Day Atelier Returns</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* 5-Act Cinematic Jewelry Order Story Modal */}
      <JewelryOrderStoryModal
        isOpen={showStoryModal}
        orderData={storyOrderData}
        onClose={() => setShowStoryModal(false)}
      />
    </div>
  );
};

export default Checkout;
