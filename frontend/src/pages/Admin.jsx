import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminUsers from './AdminUsers';
import DiamondPricingManager from '../components/DiamondPricingManager';
import { getProductImage } from '../utils/productImages';

const Admin = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    material: '',
    karat: 24,
    weight: '',
    images: [],
    imageUrls: [],
    imageUrlInput: '',
    diamondHasDiamond: false,
    diamondCarat: '',
    diamondCut: '',
    diamondColor: '',
    diamondClarity: '',
  });

  // Custom Framer Motion Dropdown States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isKaratOpen, setIsKaratOpen] = useState(false);
  const [isDiamondCutOpen, setIsDiamondCutOpen] = useState(false);
  const [isDiamondColorOpen, setIsDiamondColorOpen] = useState(false);
  const [isDiamondClarityOpen, setIsDiamondClarityOpen] = useState(false);
  const [isProdFilterOpen, setIsProdFilterOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  // Keep in sync with backend ALLOWED_CATEGORIES
  const allowedCategories = [
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
    'watches'
  ];
  const formatCategoryLabel = (value) => value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  // Materials list for dropdown (kept in sync with backend expectations for live pricing)
  const allowedMaterials = [
    'gold',
    'silver',
    'diamond',
    'platinum',
    'rose gold',
    'white gold'
  ];
  const formatMaterialLabel = (value) => value
    .split(/[-\s]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [perGramRates, setPerGramRates] = useState({ gold: 0, silver: 0 });
  const { error: toastError, success: toastSuccess } = useToast();

  // Fetch current gold/silver rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/prices');
        setPerGramRates({
          gold: res.data.gold?.price || 0,
          silver: res.data.silver?.price || 0
        });
      } catch (err) {
        console.error('Error fetching rates:', err);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (authLoading) return; // wait for auth context to finish validating token
    if (!user || !token) {
      navigate('/auth');
      return;
    }
    if (user.role !== 'admin') {
      // Not an admin - redirect to home
      navigate('/');
      return;
    }
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'orders') fetchOrders();
  }, [activeTab, user, authLoading, productCategoryFilter]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (productCategoryFilter) params.category = productCategoryFilter;
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token || user?.role !== 'admin') return;
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error fetching users:', err);
      }
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token || user?.role !== 'admin') return;
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Error fetching orders:', err);
      }
    }
  };

  const calculateLivePrice = (product) => {
    const material = String(product.material).trim().toLowerCase();
    const weight = parseFloat(product.weight) || 0;
    const karat = parseInt(product.karat) || 24;

    if (material === 'gold') {
      const purity = karat / 24;
      return Math.round(perGramRates.gold * weight * purity);
    } else if (material === 'silver') {
      return Math.round(perGramRates.silver * weight);
    }
    return product.price || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        const skip = key === 'images' || key === 'imageUrls' || key === 'imageUrlInput' || key.startsWith('diamond');
        if (skip) return;
        if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      // Diamond fields (dot-notation for backend nesting)
      const isDiamond = String(form.material).trim().toLowerCase() === 'diamond';
      const hasDiamond = isDiamond || form.diamondHasDiamond;
      formData.set('diamond.hasDiamond', hasDiamond ? 'true' : 'false');
      if (hasDiamond) {
        if (form.diamondCarat !== '') formData.set('diamond.carat', form.diamondCarat);
        if (form.diamondCut) formData.set('diamond.cut', form.diamondCut);
        if (form.diamondColor) formData.set('diamond.color', form.diamondColor);
        if (form.diamondClarity) formData.set('diamond.clarity', form.diamondClarity);
      }
      
       // Append multiple image files if provided
       if (form.images && form.images.length > 0) {
         Array.from(form.images).forEach(file => {
           formData.append('images', file);
         });
       }

       // Append image URLs if provided
       if (form.imageUrls && form.imageUrls.length > 0) {
         formData.append('imageUrls', JSON.stringify(form.imageUrls));
       }
      // Ensure category normalized
      if (form.category) {
        formData.set('category', form.category.trim().toLowerCase());
      }

      if (editing) {
        const res = await api.put(`/products/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.debug('[ADMIN] Updated product', res.data._id);
        toastSuccess('Product updated successfully!');
        setEditing(null);
        await fetchProducts();
      } else {
        const res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.debug('[ADMIN] Created product', res.data._id, 'category:', res.data.category);
        toastSuccess('Product created successfully!');
        // Rely on fresh fetch to avoid stale list discrepancies
        await fetchProducts();
      }
      setForm({
        name: '',
        description: '',
        category: '',
        material: '',
        karat: 24,
        weight: '',
         images: [],
        imageUrls: [],
        imageUrlInput: '',
        diamondHasDiamond: false,
        diamondCarat: '',
        diamondCut: '',
        diamondColor: '',
        diamondClarity: '',
      });
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save product';
      toastError(`Error saving product: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const editProduct = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      material: product.material,
      karat: product.karat || 24,
      weight: product.weight,
      images: [], // Don't pre-fill file input
      imageUrls: Array.isArray(product.images) ? product.images : [],
      imageUrlInput: '',
      diamondHasDiamond: product?.diamond?.hasDiamond || false,
      diamondCarat: product?.diamond?.carat ?? '',
      diamondCut: product?.diamond?.cut || '',
      diamondColor: product?.diamond?.color || '',
      diamondClarity: product?.diamond?.clarity || '',
    });
    setEditing(product._id);
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toastSuccess('Product loaded for editing');
  };

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const deleteProduct = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmProductDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      toastError('Failed to delete product');
    }
  };

  const handleCancelProductDelete = () => setConfirmDelete({ open: false, id: null });

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating user role:', err);
      toastError('Failed to update user role');
    }
  };

  // Order Management Functions
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder._id}`, { status: newStatus });
      setOrders(orders.map(o => o._id === selectedOrder._id ? res.data.order : o));
      toastSuccess('Order status updated successfully');
      closeStatusModal();
    } catch (err) {
      console.error('Error updating order status:', err);
      toastError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      category: '',
      material: '',
      karat: 24,
      weight: '',
      images: [],
      imageUrls: [],
      imageUrlInput: '',
      diamondHasDiamond: false,
      diamondCarat: '',
      diamondCut: '',
      diamondColor: '',
      diamondClarity: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-body text-[#222222] py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header & Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-8">
            <div>
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] block mb-1">
                ATELIER CONTROL CENTER
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading text-[#222222] font-bold">
                Admin Management
              </h1>
            </div>

            {/* Live Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 p-3.5 px-4 shadow-xs text-left">
                <span className="text-[9px] font-body font-bold uppercase tracking-widest text-gray-400 block">COLLECTION</span>
                <span className="text-lg font-mono font-bold text-[#222222]">{products.length} Products</span>
              </div>
              <div className="bg-white border border-gray-200 p-3.5 px-4 shadow-xs text-left">
                <span className="text-[9px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">LIVE GOLD (24K)</span>
                <span className="text-lg font-mono font-bold text-[#222222]">₹{perGramRates.gold ? Math.round(perGramRates.gold).toLocaleString('en-IN') : '—'}/g</span>
              </div>
              <div className="bg-white border border-gray-200 p-3.5 px-4 shadow-xs text-left col-span-2 sm:col-span-1">
                <span className="text-[9px] font-body font-bold uppercase tracking-widest text-gray-500 block">LIVE SILVER (999)</span>
                <span className="text-lg font-mono font-bold text-[#222222]">₹{perGramRates.silver ? Math.round(perGramRates.silver).toLocaleString('en-IN') : '—'}/g</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confirm Delete Product Modal */}
        <ConfirmDialog
          open={confirmDelete.open}
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmProductDelete}
          onCancel={handleCancelProductDelete}
        />

        {/* Webflow & Framer Motion Luxury Sliding Tabs */}
        <div className="flex border-b border-gray-200 mb-10 overflow-x-auto">
          {[
            { id: 'products', label: 'PRODUCTS' },
            { id: 'users', label: 'USERS' },
            { id: 'orders', label: 'ORDERS' },
            { id: 'diamond-pricing', label: 'DIAMOND PRICING' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 px-6 text-xs font-body tracking-[0.2em] font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? 'text-[#222222]' : 'text-gray-400 hover:text-[#222222]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeAdminTab"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#222222]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-heading text-dark mb-2">Product Management</h2>
            <p className="text-muted">Add, edit, and manage your jewelry collection</p>
          </div>

          {/* Add/Edit Product Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="mb-12 bg-white rounded-2xl shadow-soft p-8 border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-heading text-dark">{editing ? 'Edit Product' : 'Add New Product'}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Royal Diamond Engagement Ring" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none" 
                  required 
                />
              </div>
              {/* Framer Motion Custom Category Dropdown */}
              <div className="relative">
                <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Category</label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsMaterialOpen(false);
                    setIsKaratOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                >
                  <span>{form.category ? formatCategoryLabel(form.category) : 'Select Category'}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                    >
                      {allowedCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, category: c });
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${form.category === c ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                        >
                          {formatCategoryLabel(c)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {allowedCategories.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`px-2.5 py-1 text-[10px] font-body font-bold uppercase tracking-wider border transition-all ${
                        form.category === c
                          ? 'bg-[#222222] text-white border-[#222222]'
                          : 'bg-white border-gray-200 text-gray-500 hover:text-[#222222]'
                      }`}
                    >
                      {formatCategoryLabel(c)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framer Motion Custom Material Dropdown */}
              <div className="relative">
                <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Material</label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setIsMaterialOpen(!isMaterialOpen);
                    setIsCategoryOpen(false);
                    setIsKaratOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                >
                  <span>{form.material ? formatMaterialLabel(form.material) : 'Select Material'}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isMaterialOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {isMaterialOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                    >
                      {allowedMaterials.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            const isDiamond = m === 'diamond';
                            setForm({
                              ...form,
                              material: m,
                              diamondHasDiamond: isDiamond ? true : form.diamondHasDiamond,
                            });
                            setIsMaterialOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${String(form.material).toLowerCase() === m ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                        >
                          {formatMaterialLabel(m)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {allowedMaterials.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const isDiamond = m === 'diamond';
                        setForm({
                          ...form,
                          material: m,
                          diamondHasDiamond: isDiamond ? true : form.diamondHasDiamond,
                        });
                      }}
                      className={`px-2.5 py-1 text-[10px] font-body font-bold uppercase tracking-wider border transition-all ${
                        String(form.material).toLowerCase() === m
                          ? 'bg-[#222222] text-white border-[#222222]'
                          : 'bg-white border-gray-200 text-gray-500 hover:text-[#222222]'
                      }`}
                    >
                      {formatMaterialLabel(m)}
                    </button>
                  ))}
                </div>
              </div>

              {String(form.material).trim().toLowerCase() === 'gold' && (
                <div className="relative">
                  <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Karat</label>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setIsKaratOpen(!isKaratOpen);
                      setIsCategoryOpen(false);
                      setIsMaterialOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                  >
                    <span>{form.karat ? `${form.karat}K Gold` : 'Select Karat'}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isKaratOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {isKaratOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                      >
                        {[24, 22, 18].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, karat: k });
                              setIsKaratOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${form.karat === k ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                          >
                            {k}K Gold
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Diamond-specific fields */}
              {(String(form.material).trim().toLowerCase() === 'diamond' || form.diamondHasDiamond) && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-gray-200 bg-[#FAF9F7]">
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-body font-bold text-[#222222] uppercase tracking-wider">Diamond Specifications</p>
                      <p className="text-[11px] text-gray-500 font-body">Set carat, cut, color, clarity for live pricing</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs text-[#222222] font-body font-bold uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={form.diamondHasDiamond || String(form.material).trim().toLowerCase() === 'diamond'}
                        onChange={(e) => setForm({ ...form, diamondHasDiamond: e.target.checked })}
                        className="h-4 w-4 text-[#222222] border-gray-300 rounded-none focus:ring-0"
                      />
                      Includes diamond
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Carat</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 1.25"
                      value={form.diamondCarat}
                      onChange={(e) => setForm({ ...form, diamondCarat: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 bg-white text-xs text-[#222222] font-body focus:outline-none focus:border-[#222222]"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Cut</label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsDiamondCutOpen(!isDiamondCutOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                    >
                      <span className="capitalize">{form.diamondCut || 'Select cut'}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isDiamondCutOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>
                    <AnimatePresence>
                      {isDiamondCutOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                        >
                          {['excellent', 'very-good', 'good', 'fair', 'poor'].map((cut) => (
                            <button
                              key={cut}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, diamondCut: cut });
                                setIsDiamondCutOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${form.diamondCut === cut ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                            >
                              {cut.replace('-', ' ')}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Color</label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsDiamondColorOpen(!isDiamondColorOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                    >
                      <span>{form.diamondColor || 'Select color'}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isDiamondColorOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>
                    <AnimatePresence>
                      {isDiamondColorOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                        >
                          {['D','E','F','G','H','I','J','K','L','M'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, diamondColor: c });
                                setIsDiamondColorOpen(false);
                              }}
                              className={`w-full text-left px-4 py-1.5 text-xs font-body hover:bg-[#FAF9F7] ${form.diamondColor === c ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                            >
                              Color {c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-wider mb-1">Clarity</label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsDiamondClarityOpen(!isDiamondClarityOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 text-xs font-body text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                    >
                      <span>{form.diamondClarity || 'Select clarity'}</span>
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isDiamondClarityOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>
                    <AnimatePresence>
                      {isDiamondClarityOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                        >
                          {['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, diamondClarity: c });
                                setIsDiamondClarityOpen(false);
                              }}
                              className={`w-full text-left px-4 py-1.5 text-xs font-body hover:bg-[#FAF9F7] ${form.diamondClarity === c ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                            >
                              Clarity {c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Weight (grams)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 5.5" 
                  value={form.weight} 
                  onChange={(e) => setForm({ ...form, weight: e.target.value })} 
                  className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">
                  Product Images (Local Upload)
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    id="productImagesUpload"
                    accept="image/*" 
                    multiple
                    onChange={(e) => setForm({ ...form, images: e.target.files })} 
                    className="hidden" 
                  />
                  <motion.label
                    htmlFor="productImagesUpload"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-[#222222] bg-[#FAF9F7] hover:bg-white transition-all cursor-pointer text-center group"
                  >
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-[#222222] transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-body font-bold uppercase tracking-[0.15em] text-[#222222]">
                      {form.images && form.images.length > 0
                        ? `✓ ${form.images.length} Image(s) Selected (Click to change)`
                        : 'Choose Files or Drag & Drop'}
                    </span>
                    <span className="text-[10px] font-body text-gray-400 mt-1 uppercase tracking-wider">
                      Supports JPG, PNG, WEBP high-res photos
                    </span>
                  </motion.label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Image URLs</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://example.com/jewelry-photo.jpg"
                    value={form.imageUrlInput}
                    onChange={(e) => setForm({ ...form, imageUrlInput: e.target.value })}
                    className="flex-1 px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all rounded-none"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const url = (form.imageUrlInput || '').trim();
                      if (!url) return;
                      setForm({
                        ...form,
                        imageUrls: [...form.imageUrls, url],
                        imageUrlInput: ''
                      });
                    }}
                    className="px-6 py-3 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-sm hover:bg-[#222222] transition-colors rounded-none whitespace-nowrap cursor-pointer"
                  >
                    + Add URL
                  </motion.button>
                </div>
                {form.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.imageUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F7] border border-gray-200 text-[11px] font-body font-medium text-[#222222]">
                        <span className="max-w-[200px] truncate" title={url}>{url}</span>
                        <button
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            imageUrls: form.imageUrls.filter((_, i) => i !== idx)
                          })}
                          className="text-gray-400 hover:text-rose-600 transition-colors ml-1"
                          aria-label="Remove URL"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">Description</label>
              <textarea 
                placeholder="Enter detailed product description, craftsmanship notes, and dimensions..." 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all resize-none h-36 rounded-none" 
                required 
              />
            </div>

            <div className="flex gap-4">
              <motion.button 
                type="submit" 
                disabled={actionLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#222222] transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Saving Product...' : editing ? 'Update Product' : 'Add New Product'}
              </motion.button>
              {editing && (
                <motion.button 
                  type="button" 
                  onClick={cancelEdit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 bg-white border border-gray-300 text-[#222222] text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </motion.form>

          {/* Products List */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                  CURRENT CATALOG
                </span>
                <h3 className="text-2xl font-heading font-bold text-[#222222]">Live Products ({products.length})</h3>
              </div>
              <div className="relative">
                <label className="block text-[10px] font-body font-bold text-[#222222] uppercase tracking-wider mb-1.5">Filter Collection</label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsProdFilterOpen(!isProdFilterOpen)}
                  className="w-[240px] flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 text-xs font-body font-bold text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer shadow-xs"
                >
                  <span>{productCategoryFilter ? formatCategoryLabel(productCategoryFilter) : 'All Categories'}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isProdFilterOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {isProdFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-[240px] max-h-56 overflow-y-auto bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 py-1"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setProductCategoryFilter('');
                          setIsProdFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${productCategoryFilter === '' ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                      >
                        All Categories
                      </button>
                      {allowedCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setProductCategoryFilter(c);
                            setIsProdFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${productCategoryFilter === c ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                        >
                          {formatCategoryLabel(c)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white p-16 text-center border border-gray-200 shadow-xs">
                <p className="text-gray-400 font-body text-xs uppercase tracking-widest font-bold">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <motion.div 
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3, delay: (index % 3) * 0.08 }}
                    className={`bg-white border transition-all duration-300 group overflow-hidden ${
                      editing === product._id 
                        ? 'border-[#222222] border-2 shadow-xl ring-2 ring-black ring-opacity-10' 
                        : 'border-gray-200 hover:border-[#222222] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {/* Editing Badge */}
                    {editing === product._id && (
                      <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-[#111111] text-[#FAF9F7] text-[10px] font-body font-bold uppercase tracking-widest shadow-md">
                        EDITING MODE
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <div className="relative h-64 bg-[#F7F6F2] overflow-hidden flex items-center justify-center p-4">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md border border-gray-200 text-[9px] font-body font-bold text-[#222222] uppercase tracking-wider">
                        {product.material} {product.karat ? `• ${product.karat}K` : ''}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h4 className="font-heading font-bold text-[#222222] text-base mb-2 line-clamp-1">{product.name}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-mono text-base font-bold text-[#111111]">
                          ₹{calculateLivePrice(product).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase tracking-wider">
                          LIVE PRICE
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => editProduct(product)}
                          className="flex-1 py-2.5 bg-[#FAF9F7] text-[#222222] border border-gray-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(product._id)}
                          className="flex-1 py-2.5 bg-white text-rose-600 border border-rose-200 text-xs font-body font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && <AdminUsers />}

      {/* Diamond Pricing Tab */}
      {activeTab === 'diamond-pricing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DiamondPricingManager />
        </motion.div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-heading text-dark mb-2">Order Management</h2>
            <p className="text-muted">Track and manage customer orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft p-12 text-center border border-gray-100">
              <p className="text-muted text-lg font-heading">No orders yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Products</th>
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Amount Paid</th>
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-heading text-dark uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <motion.tr 
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-muted">{order._id.slice(-8)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-dark">{order.user?.name || 'N/A'}</div>
                          <div className="text-xs text-muted">{order.user?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-col gap-3">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <div className="w-12 h-12 bg-light rounded-lg flex-shrink-0 overflow-hidden">
                                  {item.product ? (
                                    <img 
                                      src={getProductImage(item.product)} 
                                      alt={item.product?.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">No img</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-dark truncate text-sm">{item.product?.name || 'Product'}</p>
                                  <p className="text-xs text-muted capitalize">{item.product?.material || ''} {item.product?.karat ? `• ${item.product.karat}K` : ''}</p>
                                  <p className="text-xs text-dark font-medium">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <p className="text-xs text-gold font-medium">+{order.items.length - 2} more item(s)</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gold font-mono">₹{(order.totalAmount || order.total)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            order.status === 'processing' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            order.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs mt-1">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button 
                            onClick={() => viewOrderDetails(order)}
                            className="btn-secondary px-4 py-2 bg-white text-dark border border-gray-200 rounded-full text-xs font-medium hover:border-gold transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => openStatusModal(order)}
                            className="btn-secondary px-4 py-2 bg-white text-gold border border-gold rounded-full text-xs font-medium hover:bg-gold hover:text-white transition-colors"
                          >
                            Update
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeOrderDetails}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-3xl font-heading text-dark">Order Details</h2>
              <button
                onClick={closeOrderDetails}
                className="text-muted hover:text-dark transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-8">
              {/* Order Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-light p-6 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">Order ID</p>
                  <p className="text-sm font-mono text-dark">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">Customer</p>
                  <p className="text-sm font-medium text-dark">{selectedOrder.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedOrder.status === 'delivered' ? 'bg-green-50 text-green-700' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                    selectedOrder.status === 'processing' ? 'bg-purple-50 text-purple-700' :
                    selectedOrder.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>
                    {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">Order Date</p>
                  <p className="text-sm font-medium text-dark">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xl font-heading text-dark mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-soft transition-shadow">
                      <div className="flex gap-4 p-4 bg-white">
                        <div className="w-24 h-24 bg-light rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.product ? (
                            <img 
                              src={getProductImage(item.product)} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted">No Image</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-heading text-dark text-lg">{item.product?.name || 'Product'}</p>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                            {item.product?.material && (
                              <div>
                                <span className="text-muted">Material:</span>
                                <span className="ml-1 font-medium text-dark capitalize">{item.product.material}</span>
                              </div>
                            )}
                            {item.product?.karat && (
                              <div>
                                <span className="text-muted">Karat:</span>
                                <span className="ml-1 font-medium text-dark">{item.product.karat}K</span>
                              </div>
                            )}
                            {item.product?.weight && (
                              <div>
                                <span className="text-muted">Weight:</span>
                                <span className="ml-1 font-medium text-dark">{item.product.weight}g</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-light border-t border-gray-100 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-muted uppercase tracking-wider font-medium">Qty</p>
                            <p className="text-lg font-medium text-dark">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted uppercase tracking-wider font-medium">Price per Unit</p>
                            <p className="text-lg font-medium text-dark font-mono">₹{(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted uppercase tracking-wider font-medium">Subtotal</p>
                          <p className="text-xl font-bold text-gold font-mono">₹{((item.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                <h3 className="font-heading text-dark mb-4 text-xl">Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="space-y-3 pb-4 border-b border-gray-100">
                    {selectedOrder.items?.map((item, idx) => {
                      const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
                      return (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted">{item.product?.name || 'Item'} <span className="opacity-70">({item.quantity} × ₹{(Number(item.price) || 0).toLocaleString('en-IN')})</span></span>
                          <span className="font-medium text-dark">₹{itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {(() => {
                    const subtotal = selectedOrder.items?.reduce((sum, item) => {
                      return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
                    }, 0) || 0;
                    
                    const taxAmount = subtotal * 0.03;
                    const totalWithTax = subtotal + taxAmount;
                    const amountPaid = Number(selectedOrder.totalAmount) || totalWithTax;
                    
                    return (
                      <div className="pt-2 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Subtotal (Items):</span>
                          <span className="font-medium text-dark">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Tax (3%):</span>
                          <span className="font-medium text-dark">+ ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="flex justify-between text-xl font-bold bg-cream rounded-xl p-5 border border-gold border-opacity-30 mt-4">
                          <span className="text-dark">Total Amount Paid</span>
                          <span className="text-gold font-mono">₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-muted flex flex-col md:flex-row md:justify-between">
                          <p>Paid on: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p>Method: {selectedOrder.paymentIntentId ? 'Card Payment' : 'Cash on Delivery'}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Customer Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-xl font-heading text-dark mb-4">Shipping Address</h3>
                  <div className="p-6 bg-light rounded-2xl border border-gray-100">
                    <p className="text-dark font-medium">{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && <p className="text-dark font-medium">{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p className="text-muted mt-2">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeStatusModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-heading text-dark mb-2">Update Order Status</h2>
            <p className="text-muted mb-6">Order ID: {selectedOrder._id.slice(-8)}</p>

            <div className="relative mb-6">
              <label className="block text-xs font-body font-bold text-[#222222] uppercase tracking-wider mb-2">New Status</label>
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border border-gray-200 text-xs font-body font-bold text-[#222222] uppercase tracking-wider text-left focus:outline-none cursor-pointer"
              >
                <span className="capitalize">{newStatus || 'Select Status'}</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {isStatusDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                  >
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setNewStatus(st);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] ${newStatus === st ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-sm text-muted mb-8 bg-light p-4 rounded-xl border border-gray-100">
              Current Status: <span className="font-medium text-dark">{selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}</span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={updateOrderStatus}
                disabled={actionLoading || newStatus === selectedOrder.status}
                className="flex-1 btn-primary bg-gold text-white py-3 rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={closeStatusModal}
                disabled={actionLoading}
                className="flex-1 btn-secondary bg-white text-dark border border-gray-200 py-3 rounded-full font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Admin;
