import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import { normalizeImageUrl } from '../utils/productImages';
import {
  DiamondIcon,
  ShoppingBagIcon,
  WalletIcon,
  HeartIcon,
  StarIcon,
  UserIcon,
  MapPinIcon,
  OrderIcon,
  SettingsIcon,
  LockIcon,
  BookmarkIcon,
  MessageIcon,
  UsersIcon,
  GiftIcon,
  CreditCardIcon,
  LogoutIcon,
  RewardIcon,
  BellIcon,
  HelpCircleIcon,
  GlobeIcon,
  DownloadIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from '../components/Icons';
import api from '../api';
import { getProductImage } from '../utils/productImages';

import TaxInvoiceModal from '../components/TaxInvoiceModal';
import OrderTrackingModal from '../components/OrderTrackingModal';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [rewards, setRewards] = useState({ points: 0, history: [] });
  const [reviews, setReviews] = useState([]);
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: ''
  });
  const [isGenderMenuOpen, setIsGenderMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR (₹)');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const defaultAddressForm = {
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    isDefault: false,
    isDefaultShipping: false,
    isDefaultBilling: false
  };
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const tabScrollRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const showPopup = (type, text) => {
    if (type === 'success') {
      toastSuccess(text);
      return;
    }
    if (type === 'info') {
      toastInfo(text);
      return;
    }
    toastError(text || 'Something went wrong');
  };

  const computeLivePrice = (product) => {
    const base = Number(product?.livePrice ?? product?.price ?? product?.currentPrice ?? 0);
    const weight = Number(product?.weight) || 0;
    const goldRate = Number(product?.goldPrice) || 0;
    const fromWeight = weight && goldRate ? weight * goldRate : 0;
    return fromWeight || base || 0;
  };

  const computeOrderLiveTotal = (order) => {
    if (!order) return { subtotal: 0, tax: 0, total: 0 };
    const items = order.items || [];
    let subtotal = 0;
    if (items.length > 0) {
      subtotal = items.reduce((sum, item) => {
        const prod = item.product || item;
        const unit = computeLivePrice(prod) || Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        return sum + unit * qty;
      }, 0);
    }
    const totalFallback = Number(order.totalAmount) || Number(order.total) || 0;
    if (subtotal === 0 && totalFallback > 0) {
      subtotal = Math.round(totalFallback / 1.03);
    }
    const tax = Math.round(subtotal * 0.03);
    const total = totalFallback > 0 ? totalFallback : subtotal + tax;
    return { subtotal, tax, total };
  };

  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;
    setLoading(true);
    setError('');
    try {
      const [profileRes, addressesRes, ordersRes, couponsRes] = await Promise.all([
        api.get('/user/profile').catch(() => ({ data: {} })),
        api.get('/user/addresses').catch(() => ({ data: { addresses: [] } })),
        api.get('/user/orders').catch(() => ({ data: { orders: [] } })),
        api.get('/user/coupons').catch(() => ({ data: { coupons: [] } }))
      ]);

      const profileData = profileRes.data || {};
      setBasicInfo({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        gender: profileData.gender || '',
        dob: profileData.dob ? profileData.dob.substring(0, 10) : ''
      });
      setProfilePhoto(profileData.profilePhoto || '');

      const loadedAddresses = addressesRes?.data?.addresses || profileData.addresses || [];
      setAddresses(loadedAddresses);
      setAddressForm((prev) => ({ ...defaultAddressForm, phone: profileData.phone || prev.phone }));
      setEditingAddress(null);
      setShowAddressForm(false);

      const loadedOrders = ordersRes?.data?.orders || [];
      setOrders(loadedOrders);
      setStats({
        totalOrders: loadedOrders.length,
        totalSpent: loadedOrders.reduce((sum, o) => {
          const subtotal = Number(o.subtotal) || 0;
          const tax = Number(o.tax) || 0;
          const total = Number(o.totalAmount) || Number(o.total) || subtotal + tax;
          return sum + total;
        }, 0),
        loyaltyPoints: profileData.loyaltyPoints || 0
      });
      setRewards((prev) => ({ points: profileData.loyaltyPoints || 0, history: prev.history || [] }));
      setCoupons(couponsRes?.data?.coupons || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.error || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;
    loadProfile();
  }, [user]);

  useEffect(() => {
    const queryTab = new URLSearchParams(location.search).get('tab');
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [location.search]);

  const updateBasicInfo = async () => {
    // Basic validation
    if (!basicInfo.name || !basicInfo.email || !basicInfo.phone) {
      toastError('Name, email, and phone are required');
      return;
    }
    const emailOk = /.+@.+\..+/.test(basicInfo.email);
    const phoneOk = /^\+?\d{7,15}$/.test(basicInfo.phone);
    if (!emailOk) {
      toastError('Please enter a valid email');
      return;
    }
    if (!phoneOk) {
      toastError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', basicInfo.name);
      formData.append('email', basicInfo.email);
      formData.append('phone', basicInfo.phone);
      formData.append('gender', basicInfo.gender);
      formData.append('dob', basicInfo.dob);
      if (profilePhotoFile) {
        formData.append('profilePhoto', profilePhotoFile);
      }
      if (removeProfilePhoto) {
        formData.append('removeProfilePhoto', 'true');
      }
      
      await api.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toastSuccess('Profile updated successfully');
      setProfilePhotoFile(null);
      setProfilePhotoPreview('');
      setRemoveProfilePhoto(false);
      loadProfile();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemoveProfilePhoto(false);
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toastSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    // Address validation
    if (!addressForm.name || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.country) {
      toastError('Please fill all required address fields');
      return;
    }
    if (!/^\+?\d{7,15}$/.test(addressForm.phone)) {
      toastError('Please enter a valid phone number');
      return;
    }
    if (!/^\d{4,10}$/.test(addressForm.pincode)) {
      toastError('Please enter a valid pincode');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingAddress) {
        await api.put(`/user/addresses/${editingAddress._id}`, addressForm);
        toastSuccess('Address updated successfully');
      } else {
        await api.post('/user/addresses', addressForm);
        toastSuccess('Address added successfully');
      }
      loadProfile();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        ...defaultAddressForm,
        phone: basicInfo.phone || ''
      });
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const [confirmState, setConfirmState] = useState({ open: false, id: null });

  const deleteAddress = async (id) => {
    setConfirmState({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmState.id;
    setConfirmState({ open: false, id: null });
    try {
      await api.delete(`/user/addresses/${id}`);
      toastSuccess('Address deleted successfully');
      loadProfile();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleCancelDelete = () => setConfirmState({ open: false, id: null });

  const editAddress = (address) => {
    setAddressForm({ ...defaultAddressForm, ...address });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-soft border border-gray-100">
          <h1 className="text-3xl font-heading text-dark mb-4">Access Denied</h1>
          <p className="font-body text-muted mb-6">Please log in to view your profile.</p>
          <Link to="/auth" className="btn-primary inline-block px-8 py-3">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-20 lg:py-28">
      
      {/* Confirm Delete Address Modal */}
      <ConfirmDialog
        open={confirmState.open}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Dual-Column Webflow & Framer Motion High-Luxury Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Sticky Patron VIP Identity & Vertical Navigation (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Webflow Glassmorphic Identity Card with Motion Graphics */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/90 backdrop-blur-md rounded-[24px] p-8 border border-[#B59A6C]/30 shadow-[0_20px_50px_rgba(181,154,108,0.08)] relative overflow-hidden text-center"
            >
              {/* Animated Floating Gold Particle Motion Graphic */}
              <motion.div 
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-[#B59A6C]/20 via-[#FDF2F0]/40 to-transparent rounded-full blur-2xl pointer-events-none"
              />

              {/* Avatar Halo */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-[#B59A6C] via-[#FAF9F7] to-[#E8C8C1] shadow-md"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF9F7] flex items-center justify-center border border-[#E5E2D9]">
                  {profilePhoto || profilePhotoPreview ? (
                    <img 
                      src={profilePhotoPreview || normalizeImageUrl(profilePhoto)} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={38} className="text-[#B59A6C]" />
                  )}
                </div>
              </motion.div>

              {/* VIP Tag Badge */}
              <span className="inline-block px-3 py-1 bg-[#FDF2F0] border border-[#E8C8C1] text-[#B59A6C] font-mono text-[9px] font-bold uppercase tracking-[0.25em] mb-2 rounded-full shadow-xs">
                ● ATELIER PRIVÉ VIP ELITE
              </span>

              <h2 className="text-2xl font-heading font-bold text-[#111111] tracking-wide mb-1">
                {user?.name || 'Valued Patron'}
              </h2>
              
              <p className="text-xs font-body text-gray-500 mb-4 tracking-wider">
                {user?.email || 'patron@glimmr.com'}
              </p>

              {/* Copy Patron ID Badge */}
              <div className="inline-flex items-center gap-2 bg-[#FAF9F7] px-3.5 py-1.5 border border-[#E5E2D9] rounded-full font-mono text-xs text-[#111111] mb-6 shadow-2xs">
                <span>ID: <strong className="text-[#B59A6C] font-bold">{user?.customUserId || `GLM-${user?._id?.slice(-6).toUpperCase() || 'PATRON'}`}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    const idToCopy = user?.customUserId || `GLM-${user?._id?.slice(-6).toUpperCase() || 'PATRON'}`;
                    navigator.clipboard.writeText(idToCopy);
                    toastSuccess(`Patron ID ${idToCopy} copied to clipboard!`);
                  }}
                  className="text-[9px] text-[#B59A6C] hover:text-[#111111] uppercase tracking-wider underline cursor-pointer ml-1 font-bold"
                >
                  COPY
                </button>
              </div>

              {/* Portfolio Summary Bar */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E2D9] text-center">
                <div className="bg-[#FAF9F7] p-2.5 rounded-xl border border-gray-100">
                  <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">ORDERS</span>
                  <span className="font-heading text-lg font-bold text-[#111111]">{stats.totalOrders}</span>
                </div>
                <div className="bg-[#FAF9F7] p-2.5 rounded-xl border border-gray-100">
                  <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">INVESTED</span>
                  <span className="font-heading text-xs font-bold text-[#B59A6C] truncate block">₹{(stats.totalSpent / 1000).toFixed(1)}k</span>
                </div>
                <div className="bg-[#FAF9F7] p-2.5 rounded-xl border border-gray-100">
                  <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">REWARDS</span>
                  <span className="font-heading text-lg font-bold text-[#111111]">{stats.loyaltyPoints}</span>
                </div>
              </div>
            </motion.div>

            {/* Webflow Vertical Tab Drawer with Framer Motion Layout Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-[#E5E2D9] rounded-[20px] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.03)] space-y-1"
            >
              {[
                { id: 'basic', icon: UserIcon, label: 'Personal Information' },
                { id: 'portfolio', icon: WalletIcon, label: 'Jewelry Asset Portfolio' },
                { id: 'orders', icon: OrderIcon, label: 'Order Acquisitions' },
                { id: 'addresses', icon: MapPinIcon, label: 'Saved Addresses' },
                { id: 'password', icon: LockIcon, label: 'Security & Sessions' },
                { id: 'rewards', icon: RewardIcon, label: 'Rewards & Perks' },
                { id: 'reviews', icon: StarIcon, label: 'Product Reviews' },
                { id: 'payments', icon: CreditCardIcon, label: 'Payment Methods' },
                { id: 'support', icon: HelpCircleIcon, label: 'Client Support' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group relative flex items-center justify-between px-4 py-3.5 font-body text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer rounded-[12px] ${
                      isActive ? 'text-[#111111]' : 'text-gray-500 hover:text-[#111111]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeProfilePillVertical"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-[#FAF9F7] border border-[#B59A6C]/40 rounded-[12px] shadow-sm z-0"
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-3">
                      {/* Light Luxury Icon Badge (Warm Gold / Soft Rose, NO Dark/Black Backgrounds) */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#FDF2F0] text-[#B59A6C] border border-[#E8C8C1] shadow-xs' 
                          : 'bg-[#FAF9F7] text-[#B59A6C]/70 border border-[#E5E2D9] group-hover:bg-[#FDF2F0] group-hover:text-[#B59A6C]'
                      }`}>
                        <IconComponent size={14} className="text-[#B59A6C]" />
                      </div>
                      <span>{tab.label}</span>
                    </div>

                    <span className={`relative z-10 font-mono text-xs ${isActive ? 'text-[#B59A6C]' : 'text-gray-300'}`}>›</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold uppercase tracking-widest transition-colors rounded-[12px] cursor-pointer"
                >
                  <LogoutIcon size={14} className="text-rose-600" />
                  <span>SIGN OUT ATELIER</span>
                </button>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Atelier Workspace Canvas (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Canvas Header Bar with Motion Graphics */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-[#E5E2D9] rounded-[20px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                  GLIMMR ATELIER PRIVÉ PORTAL
                </span>
                <h1 className="font-heading text-2xl font-bold text-[#111111] uppercase tracking-wider">
                  Patron Concierge Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF9F7] border border-[#E5E2D9] px-4 py-2 rounded-full">
                <DiamondIcon size={14} className="text-[#B59A6C]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                  100% BIS HALLMARKED CERTIFIED
                </span>
              </div>
            </motion.div>

            {/* Main Content Area Card with Framer Motion On-Scroll Entrance */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-[#E5E2D9] rounded-[24px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-body text-xs font-bold uppercase tracking-wider"
                    >
                      {message}
                    </motion.div>
                  )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 font-body text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <UserIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      PERSONAL PROFILE
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Collector Information</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Gender</label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsGenderMenuOpen(!isGenderMenuOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                    >
                      <span className="capitalize">{basicInfo.gender || 'Select Gender'}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isGenderMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>

                    <AnimatePresence>
                      {isGenderMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-md z-50 py-1"
                        >
                          {['male', 'female', 'other'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                setBasicInfo({ ...basicInfo, gender: g });
                                setIsGenderMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${basicInfo.gender === g ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                            >
                              {g}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={basicInfo.dob || ''}
                      onChange={(e) => setBasicInfo({ ...basicInfo, dob: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                </div>

                {/* Profile Photo Section */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="border-b border-gray-200 pb-3 mb-6">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                      ATELIER AVATAR
                    </span>
                    <h3 className="text-lg font-heading font-bold text-[#222222]">Profile Photo</h3>
                  </div>

                  <div className="space-y-4">
                    {((profilePhotoPreview || profilePhoto) && !removeProfilePhoto) && (
                      <div className="flex items-center gap-6 p-4 bg-[#FAF9F7] border border-gray-200">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#B59A6C] flex-shrink-0">
                          <img 
                            src={profilePhotoPreview || normalizeImageUrl(profilePhoto)} 
                            alt="Profile Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-3">
                          <label htmlFor="photoInput" className="px-5 py-2.5 bg-white border border-gray-200 text-xs font-body font-bold uppercase tracking-wider text-[#222222] cursor-pointer hover:bg-gray-50 transition-colors">
                            Change Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setRemoveProfilePhoto(true);
                              setProfilePhotoFile(null);
                              setProfilePhotoPreview('');
                            }}
                            className="px-5 py-2.5 bg-white border border-rose-200 text-xs font-body font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        </div>
                      </div>
                    )}
                    {(!profilePhoto || removeProfilePhoto) && (
                      <div className="relative">
                        <input
                          id="photoInput"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                          className="hidden"
                        />
                        <motion.label
                          htmlFor="photoInput"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-[#222222] bg-[#FAF9F7] hover:bg-white transition-all cursor-pointer text-center group"
                        >
                          <UserIcon size={32} className="text-gray-400 group-hover:text-[#222222] transition-colors mb-2" />
                          <span className="text-xs font-body font-bold uppercase tracking-[0.15em] text-[#222222]">
                            Upload Profile Photo
                          </span>
                          <span className="text-[10px] font-body text-gray-400 mt-1 uppercase tracking-wider">
                            Supports JPG, PNG high-res portrait
                          </span>
                        </motion.label>
                      </div>
                    )}
                    {removeProfilePhoto && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 font-body text-xs flex items-center gap-2">
                        <AlertCircleIcon size={16} className="text-amber-700 shrink-0" />
                        <span>Profile photo will be removed when you click "Save Changes"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-start pt-4 border-t border-gray-100">
                  <motion.button
                    type="button"
                    onClick={updateBasicInfo}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#222222] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Jewelry Asset Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      LIVE IBJA SPOT ASSET TRACKER
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#111111]">Jewelry Asset Portfolio</h2>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded">
                    ● IBJA LIVE RATES ACTIVE
                  </span>
                </div>

                {/* Asset Portfolio Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#FAF9F7] p-5 rounded-2xl border border-[#E5E2D9]">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">TOTAL ACQUISITION COST</span>
                    <span className="font-mono text-2xl font-bold text-[#111111]">₹{stats.totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#FAF9F7] p-5 rounded-2xl border border-[#E5E2D9]">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">CURRENT ESTIMATED ASSET VALUE</span>
                    <span className="font-mono text-2xl font-bold text-[#B59A6C]">₹{Math.round(stats.totalSpent * 1.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#FAF9F7] p-5 rounded-2xl border border-[#E5E2D9]">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">ESTIMATED ASSET APPRECIATION</span>
                    <span className="font-mono text-2xl font-bold text-emerald-600">+18.0%</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 space-y-4">
                  <h3 className="font-heading text-base font-bold text-[#111111] uppercase">Patron Investment Breakdown</h3>
                  <p className="text-xs text-gray-500 font-body">
                    Your acquired 24K Gold, 18K Gold, and Platinum pieces automatically update in value based on official Indian Bullion and Jewellers Association (IBJA) hourly spot rates.
                  </p>

                  <div className="pt-2">
                    <Link
                      to="/live-rates"
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#B59A6C] hover:underline"
                    >
                      <span>VIEW LIVE IBJA SPOT TICKER MARKET RATES</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                      className="w-10 h-10 rounded-full bg-[#111111] border border-[#B59A6C] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                    >
                      <MapPinIcon size={20} />
                    </motion.div>
                    <div>
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                        DELIVERY DESTINATIONS
                      </span>
                      <h2 className="text-2xl font-heading font-bold text-[#222222]">Saved Addresses</h2>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddressForm(true)}
                    className="px-6 py-3 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#222222] transition-colors cursor-pointer"
                  >
                    + Add New Address
                  </motion.button>
                </div>

                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="border border-[#E5E2D9] p-8 bg-[#FAF9F7] shadow-xs"
                  >
                    <h3 className="text-xl font-heading font-bold text-[#222222] mb-6 uppercase tracking-wider">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                      />
                      <div className="flex flex-col gap-2.5 text-xs font-body text-[#222222]">
                        <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider font-bold">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0"
                          />
                          Set as Default Address
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider font-bold">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefaultShipping}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefaultShipping: e.target.checked })}
                            className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0"
                          />
                          Set as Default Shipping
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider font-bold">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefaultBilling}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefaultBilling: e.target.checked })}
                            className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0"
                          />
                          Set as Default Billing
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={saveAddress}
                        disabled={loading}
                        className="px-8 py-3 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Address'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setAddressForm({
                            ...defaultAddressForm,
                            phone: basicInfo.phone || ''
                          });
                        }}
                        className="px-8 py-3 bg-white border border-gray-300 text-[#222222] text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <motion.div
                      key={address._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      className="p-6 bg-[#FAF9F7] border border-gray-200 hover:border-[#222222] transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h4 className="font-heading font-bold text-base text-[#222222]">{address.name}</h4>
                          <div className="flex gap-1">
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-[#111111] text-white text-[9px] font-body font-bold uppercase tracking-wider">
                                DEFAULT
                              </span>
                            )}
                            {address.isDefaultShipping && (
                              <span className="px-2 py-0.5 bg-[#B59A6C] text-white text-[9px] font-body font-bold uppercase tracking-wider">
                                SHIPPING
                              </span>
                            )}
                            {address.isDefaultBilling && (
                              <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-body font-bold uppercase tracking-wider">
                                BILLING
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-body text-gray-700 leading-relaxed">{address.line1}</p>
                        {address.line2 && <p className="text-xs font-body text-gray-600">{address.line2}</p>}
                        <p className="text-xs font-body text-gray-700 font-bold mt-1">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="text-[11px] font-mono text-gray-500 mt-2">📞 {address.phone} • {address.country}</p>
                      </div>
                      <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                        <button
                          onClick={() => editAddress(address)}
                          className="flex-1 py-2 bg-white text-[#222222] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAddress(address._id)}
                          className="flex-1 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {addresses.length === 0 && !showAddressForm && (
                    <div className="md:col-span-2 p-12 text-center bg-[#FAF9F7] border border-gray-200">
                      <p className="text-gray-400 font-body text-xs uppercase tracking-widest font-bold">No saved addresses found. Add your primary shipping location above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                      className="w-10 h-10 rounded-full bg-[#111111] border border-[#B59A6C] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                    >
                      <OrderIcon size={20} />
                    </motion.div>
                    <div>
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                        ACQUISITION HISTORY
                      </span>
                      <h2 className="text-2xl font-heading font-bold text-[#222222]">Your Orders</h2>
                    </div>
                  </div>
                  {/* Order Filter Pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    {['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1.5 text-[10px] font-body font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          orderStatusFilter === status
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-[#FAF9F7] border-gray-200 text-gray-500 hover:text-[#222222]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="p-16 text-center bg-[#FAF9F7] border border-gray-200">
                      <ShoppingBagIcon size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-400 font-body text-xs uppercase tracking-widest font-bold mb-4">No order acquisitions recorded yet.</p>
                      <Link to="/products">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#222222] transition-colors"
                        >
                          Explore Jewelry Collection
                        </motion.button>
                      </Link>
                    </div>
                  ) : (
                    orders
                      .filter(o => orderStatusFilter === 'All' ? true : (o.status || '').toLowerCase() === orderStatusFilter)
                      .map((order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2 }}
                          className="bg-white border border-gray-200 p-6 hover:border-[#222222] transition-all shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-heading font-bold text-lg text-[#111111]">
                                  Order #{order._id.slice(-8).toUpperCase()}
                                </span>
                                <span className={`text-[9px] px-2.5 py-0.5 font-body font-bold uppercase tracking-widest border ${
                                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {order.status?.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs font-body text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">LIVE PORTFOLIO VALUE</span>
                              <span className="font-mono text-xl font-bold text-[#111111]">
                                ₹{computeOrderLiveTotal(order).total.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Item Thumbnails */}
                          {order.items && order.items.length > 0 && (
                            <div className="flex gap-3 mb-5 overflow-x-auto pb-2 no-scrollbar">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="relative flex-shrink-0 w-16 h-16 bg-[#FAF9F7] border border-gray-200 overflow-hidden">
                                  <img
                                    src={getProductImage(item.product)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap pt-2">
                            <button
                              onClick={() => {
                                setSelectedInvoiceOrder(order);
                                setInvoiceModalOpen(true);
                              }}
                              className="px-4 py-2 bg-[#FAF9F7] text-[#222222] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                            >
                              View Invoice & Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoiceOrder(order);
                                setInvoiceModalOpen(true);
                              }}
                              className="px-4 py-2 bg-white text-[#222222] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <DownloadIcon size={14} className="text-[#111111]" /> Download PDF
                            </button>
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => { setOrderDetail(order); setOrderTrackingOpen(true); }}
                                className="px-4 py-2 bg-white text-blue-700 border border-blue-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                Track Shipment
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <CreditCardIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      FINANCIAL METHODS
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Saved Payment Options</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CreditCardIcon size={20} className="text-[#B59A6C]" /> Saved Cards
                    </h3>
                    <p className="text-xs font-body text-gray-500 mb-6">No credit or debit cards currently saved.</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-[#222222] transition-colors cursor-pointer"
                    >
                      + Add New Card
                    </motion.button>
                  </div>

                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <WalletIcon size={20} className="text-[#B59A6C]" /> UPI Accounts
                    </h3>
                    <p className="text-xs font-body text-gray-500 mb-6">No Virtual Payment Addresses linked.</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-[#222222] transition-colors cursor-pointer"
                    >
                      + Link UPI VPA
                    </motion.button>
                  </div>

                  <div className="md:col-span-2 p-8 bg-[#111111] text-white border border-[#222222] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#B59A6C]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                      <span className="text-xs font-body font-extrabold uppercase tracking-[0.25em] text-[#D4AF37] block mb-1">
                        GLIMMR ATELIER WALLET
                      </span>
                      <h3 className="text-3xl font-heading font-extrabold text-white tracking-wide">Balance: <span className="text-white">₹0.00</span></h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative z-10 px-8 py-3.5 bg-white text-[#111111] text-xs font-body font-extrabold uppercase tracking-[0.2em] hover:bg-[#B59A6C] hover:text-white transition-colors cursor-pointer shadow-md"
                    >
                      Top Up Atelier Wallet
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards & Coupons Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <RewardIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      EXECUTIVE PRIVILEGES
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Rewards & Vouchers</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GiftIcon size={20} className="text-[#B59A6C]" /> Available Vouchers
                    </h3>
                    {coupons.length === 0 ? (
                      <p className="text-xs font-body text-gray-500">No active promotional vouchers assigned.</p>
                    ) : (
                      <div className="space-y-3">
                        {coupons.map((c) => (
                          <div key={c.code} className="p-4 bg-white border border-gray-200 flex items-center justify-between gap-4">
                            <div>
                              <span className="font-mono text-sm font-bold text-[#111111]">{c.code}</span>
                              <p className="text-xs font-body text-gray-500">{c.description}</p>
                            </div>
                            <button
                              onClick={() => showPopup('success', `Applied ${c.code}`)}
                              className="px-4 py-2 bg-[#111111] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] transition-colors cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <StarIcon size={20} className="text-[#B59A6C]" /> Reward Points
                    </h3>
                    <p className="text-3xl font-heading font-bold text-[#111111] mb-4">{rewards.points} <span className="text-xs font-body text-gray-500">PTS</span></p>
                    <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block mb-2">POINTS LOG</span>
                    {rewards.history.length === 0 ? (
                      <p className="text-xs font-body text-gray-400">No transaction logs available.</p>
                    ) : (
                      <div className="space-y-2">
                        {rewards.history.map((h, idx) => (
                          <div key={idx} className="p-3 bg-white border border-gray-200 text-xs font-body flex justify-between">
                            <span>{new Date(h.date).toLocaleDateString('en-IN')} • {h.type}</span>
                            <span className="font-bold text-emerald-700">+{h.points} PTS</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Refer & Earn Tab */}
            {activeTab === 'referral' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <UsersIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      COLLECTOR NETWORK
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Refer & Earn Rewards</h2>
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#222222] p-10 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#B59A6C]/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-3xl font-heading font-extrabold text-white mb-3 flex items-center gap-3">
                      Invite Fellow Connoisseurs <GiftIcon size={26} className="text-[#D4AF37]" />
                    </h3>
                    <p className="text-gray-100 text-sm font-body font-medium leading-relaxed max-w-2xl mb-8">
                      Share your exclusive invitation code. Your guest receives ₹500 toward their first acquisition, and your account is credited with ₹500 upon purchase.
                    </p>

                    <div className="bg-white/10 backdrop-blur-md border border-white/25 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl">
                      <div>
                        <span className="text-xs font-body font-extrabold uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">
                          YOUR INVITATION CODE
                        </span>
                        <span className="font-mono text-2xl font-extrabold text-white tracking-widest drop-shadow-sm">
                          {user?.referralCode || 'GLIM' + user?._id?.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigator.clipboard.writeText(user?.referralCode || 'GLIM' + user?._id?.slice(-6).toUpperCase());
                          toastSuccess('Referral code copied!');
                        }}
                        className="px-6 py-3 bg-white text-[#111111] text-xs font-body font-extrabold uppercase tracking-[0.2em] hover:bg-[#B59A6C] hover:text-white transition-colors cursor-pointer shadow-md"
                      >
                        Copy Code
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 text-center">
                    <UsersIcon size={28} className="mx-auto text-[#B59A6C] mb-2" />
                    <h4 className="font-heading font-bold text-2xl text-[#111111]">0</h4>
                    <p className="text-xs font-body text-gray-500 uppercase tracking-wider font-bold mt-1">Invites Sent</p>
                  </div>
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 text-center">
                    <CheckCircleIcon size={28} className="mx-auto text-emerald-600 mb-2" />
                    <h4 className="font-heading font-bold text-2xl text-emerald-700">0</h4>
                    <p className="text-xs font-body text-gray-500 uppercase tracking-wider font-bold mt-1">Successful Referrals</p>
                  </div>
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 text-center">
                    <WalletIcon size={28} className="mx-auto text-[#B59A6C] mb-2" />
                    <h4 className="font-heading font-bold text-2xl text-[#111111]">₹0</h4>
                    <p className="text-xs font-body text-gray-500 uppercase tracking-wider font-bold mt-1">Total Earned</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <BellIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      COMMUNICATION CHANNELS
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Notification Preferences</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BellIcon size={20} className="text-[#B59A6C]" /> Updates & Alerts
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white border border-gray-200 cursor-pointer">
                        <span className="text-xs font-body font-bold text-[#222222] uppercase tracking-wider">Email Dispatch Notifications</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white border border-gray-200 cursor-pointer">
                        <span className="text-xs font-body font-bold text-[#222222] uppercase tracking-wider">SMS Delivery Status</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0" />
                      </label>
                    </div>
                  </div>

                  <div className="p-8 bg-[#FAF9F7] border border-gray-200">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MessageIcon size={20} className="text-[#B59A6C]" /> Exclusive Announcements
                    </h3>
                    <label className="flex items-center justify-between p-4 bg-white border border-gray-200 cursor-pointer mb-4">
                      <span className="text-xs font-body font-bold text-[#222222] uppercase tracking-wider">Private Private Sale Invitations</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0" />
                    </label>
                    <p className="text-xs font-body text-gray-500 leading-relaxed">Receive early access invitations to limited-edition watch & jewelry releases.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'password' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <LockIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      AUTHENTICATION & PROTECTION
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Account Security</h2>
                  </div>
                </div>

                <div className="max-w-2xl space-y-6">
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-6 flex items-center gap-2">
                      <LockIcon size={20} className="text-[#B59A6C]" /> Change Password
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:border-[#222222] focus:outline-none transition-all rounded-none"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={changePassword}
                        disabled={loading}
                        className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#222222] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Active Login Sessions & Security Control Center */}
                  <div className="p-8 bg-white border border-[#E5E2D9] shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C] block mb-0.5">
                          SECURITY &amp; ACTIVE SESSIONS
                        </span>
                        <h3 className="font-heading font-bold text-lg text-[#111111] uppercase tracking-wider">
                          Active Patron Devices
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        SECURED WITH 256-BIT SSL
                      </span>
                    </div>

                    <div className="p-4 bg-[#FAF9F7] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#111111] uppercase tracking-wider">
                          <span>CURRENT ACTIVE SESSION</span>
                          <span className="px-2 py-0.5 bg-[#B59A6C] text-white text-[9px] font-mono font-bold">THIS DEVICE</span>
                        </div>
                        <p className="text-xs font-mono text-gray-500">
                          IP Address: <span className="text-[#111111] font-bold">{user?.lastIp || '127.0.0.1'}</span> • Last Activity: <span className="text-[#111111] font-bold">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                        <p className="text-[11px] font-body text-gray-400">
                          Patron ID: <strong className="text-[#B59A6C] font-mono">{user?.customUserId || `GLM-${user?._id?.slice(-6).toUpperCase() || 'PATRON'}`}</strong>
                        </p>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={async () => {
                          try {
                            setLoading(true);
                            await api.post('/auth/logout-all-devices');
                            toastSuccess('All active sessions revoked across devices.');
                            logout();
                          } catch (err) {
                            toastError('Failed to sign out all devices.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-colors shadow-sm shrink-0 cursor-pointer"
                      >
                        SIGN OUT ALL DEVICES
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <HelpCircleIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      CONCIERGE SERVICES
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Client Assistance</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <HelpCircleIcon size={20} className="text-[#B59A6C]" /> Concierge Support Ticket
                    </h3>
                    <p className="text-xs font-body text-gray-500 mb-6 leading-relaxed">Direct communication channel with our master jewelers and support team.</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 w-full bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-[#222222] transition-colors cursor-pointer"
                    >
                      Open Support Ticket
                    </motion.button>
                  </div>

                  <div className="p-8 bg-[#FAF9F7] border border-gray-200">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageIcon size={20} className="text-[#B59A6C]" /> Live Atelier Chat
                    </h3>
                    <p className="text-xs font-body text-gray-500 mb-6 leading-relaxed">Instant assistance regarding bespoke orders, sizing, and diamond certifications.</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 w-full bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-[#222222] transition-colors cursor-pointer"
                    >
                      Start Live Chat
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <StarIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      CLIENT FEEDBACK
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">My Product Reviews</h2>
                  </div>
                </div>

                <div className="p-8 bg-[#111111] text-[#FAF9F7] border border-[#222222] shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block mb-1">YOUR AVERAGE RATING</span>
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-4xl text-[#FAF9F7]">4.8</span>
                      <span className="text-[#B59A6C] text-lg">★★★★★</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block mb-1">TOTAL REVIEWS</span>
                    <span className="font-heading font-bold text-4xl text-[#FAF9F7]">{reviews.length}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="p-12 text-center bg-[#FAF9F7] border border-gray-200">
                      <StarIcon size={36} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 font-body text-xs uppercase tracking-widest font-bold">No product reviews recorded yet.</p>
                    </div>
                  ) : (
                    reviews.map((review, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-[#FAF9F7] border border-gray-200 flex gap-5 items-start"
                      >
                        <img src={review.productImage} alt="" className="w-20 h-20 object-cover border border-gray-200" />
                        <div className="flex-1">
                          <h4 className="font-heading font-bold text-base text-[#222222] mb-1">{review.productName}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#B59A6C] text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                            <span className="text-[10px] font-body text-gray-400">{new Date(review.date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <p className="text-xs font-body text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-white border border-gray-200 text-[10px] font-body font-bold uppercase text-[#222222] hover:bg-[#222222] hover:text-white transition-colors cursor-pointer">Edit</button>
                            <button className="px-3 py-1 bg-white border border-rose-200 text-[10px] font-body font-bold uppercase text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer">Delete</button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shadow-sm flex-shrink-0"
                  >
                    <SettingsIcon size={20} />
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-0.5">
                      SYSTEM & PRIVACY
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#222222]">Account Settings</h2>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Privacy Settings Card */}
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <LockIcon size={20} className="text-[#B59A6C]" /> Privacy Controls
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white border border-gray-200 cursor-pointer">
                        <span className="text-xs font-body font-bold text-[#222222] uppercase tracking-wider">Public Profile Visibility</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-white border border-gray-200 cursor-pointer">
                        <span className="text-xs font-body font-bold text-[#222222] uppercase tracking-wider">Personalized Bespoke Recommendations</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0" />
                      </label>
                    </div>
                  </div>

                  {/* Language & Currency Card */}
                  <div className="p-8 bg-[#FAF9F7] border border-gray-200 shadow-xs">
                    <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-6 flex items-center gap-2">
                      <GlobeIcon size={20} className="text-[#B59A6C]" /> Regional Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-xs font-body font-bold uppercase tracking-wider text-[#222222] mb-2">Preferred Language</label>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setIsLanguageMenuOpen(!isLanguageMenuOpen);
                            setIsCurrencyMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] font-bold uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                        >
                          <span>{language}</span>
                          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isLanguageMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.button>
                        <AnimatePresence>
                          {isLanguageMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-md z-50 py-1"
                            >
                              {['English', 'हिंदी (Hindi)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)'].map((lang) => (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => {
                                    setLanguage(lang);
                                    setIsLanguageMenuOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${language === lang ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-body font-bold uppercase tracking-wider text-[#222222] mb-2">Display Currency</label>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setIsCurrencyMenuOpen(!isCurrencyMenuOpen);
                            setIsLanguageMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 text-xs font-body text-[#222222] font-bold uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                        >
                          <span>{currency}</span>
                          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isCurrencyMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.button>
                        <AnimatePresence>
                          {isCurrencyMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-md z-50 py-1"
                            >
                              {['INR (₹)', 'USD ($)', 'EUR (€)'].map((curr) => (
                                <button
                                  key={curr}
                                  type="button"
                                  onClick={() => {
                                    setCurrency(curr);
                                    setIsCurrencyMenuOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${currency === curr ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                                >
                                  {curr}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Data Management & Danger Zone */}
                  <div className="p-8 bg-rose-50/50 border border-rose-200">
                    <h3 className="font-heading font-bold text-lg text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertCircleIcon size={20} className="text-rose-600" /> Account Deletion
                    </h3>
                    <p className="text-xs font-body text-rose-700 mb-6">Permanently remove your account and all associated order history.</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                          toastError('Account deletion is not yet implemented');
                        }
                      }}
                      className="px-6 py-3 bg-rose-600 text-white text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Delete Account
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>

    {/* GST Tax Invoice Modal */}
    <TaxInvoiceModal 
      isOpen={invoiceModalOpen} 
      onClose={() => setInvoiceModalOpen(false)} 
      order={selectedInvoiceOrder} 
    />

    {/* Order Tracking Modal */}
    <OrderTrackingModal
      isOpen={orderTrackingOpen}
      onClose={() => setOrderTrackingOpen(false)}
      order={orderDetail}
    />
  </div>
</div>
);
};

export default Profile;
