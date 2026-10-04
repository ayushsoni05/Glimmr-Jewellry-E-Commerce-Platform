import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  MessageCircle, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Send
} from 'lucide-react';

export default function CustomerCRM({ api }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [hasDues, setHasDues] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);
  const [tiers, setTiers] = useState({ Bronze: 0, Silver: 0, Gold: 0, 'Royal Patron': 0 });
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);

  // Dossier Drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBills, setCustomerBills] = useState([]);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Edit Customer State in Dossier
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Backfill sync
  const [backfilling, setBackfilling] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/customers/stats/summary');
      if (res.data) {
        setStats(res.data.stats);
        setTiers(res.data.tiers || {});
        setUpcomingMilestones(res.data.upcomingMilestones || []);
      }
    } catch (err) {
      console.error('Error fetching CRM stats:', err);
    }
  }, [api]);

  const fetchCustomerList = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: search.trim() || undefined,
        tier: tier !== 'all' ? tier : undefined,
        hasDues: hasDues ? 'true' : undefined,
      };

      const res = await api.get('/customers', { params });
      setCustomers(res.data.customers || []);
      setTotalCustomers(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, search, tier, hasDues]);

  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleOpenDossier = async (cust) => {
    setSelectedCustomer(cust);
    setIsEditingCustomer(false);
    setEditForm({
      name: cust.name || '',
      email: cust.email || '',
      address: cust.address || '',
      city: cust.city || 'Mumbai',
      panNumber: cust.panNumber || '',
      gstin: cust.gstin || '',
      anniversaryDate: cust.anniversaryDate ? new Date(cust.anniversaryDate).toISOString().split('T')[0] : '',
      birthdayDate: cust.birthdayDate ? new Date(cust.birthdayDate).toISOString().split('T')[0] : '',
      preferredCategory: cust.preferredCategory || 'All',
      notes: cust.notes || ''
    });

    try {
      setLoadingDossier(true);
      const res = await api.get(`/customers/${cust.phone}`);
      if (res.data) {
        setCustomerBills(res.data.bills || []);
        if (res.data.customer) {
          setSelectedCustomer(res.data.customer);
        }
      }
    } catch (err) {
      console.error('Error loading customer dossier bills:', err);
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleSaveCustomerProfile = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      setSavingEdit(true);
      const res = await api.patch(`/customers/${selectedCustomer._id}`, editForm);
      if (res.data?.customer) {
        setSelectedCustomer(res.data.customer);
        setIsEditingCustomer(false);
        setNotification(`Patron profile updated for ${res.data.customer.name}`);
        setTimeout(() => setNotification(''), 4000);
        fetchCustomerList();
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      setNotification('Failed to update patron details');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleBackfillBills = async () => {
    try {
      setBackfilling(true);
      const res = await api.post('/customers/backfill');
      setNotification(`Consolidated ${res.data.totalBillsProcessed} historical bills into ${res.data.uniqueCustomersSaved} patron dossiers!`);
      setTimeout(() => setNotification(''), 6000);
      fetchCustomerList();
      fetchStats();
    } catch (err) {
      console.error('Backfill error:', err);
      setNotification('Failed to consolidate historical bills');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setBackfilling(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/customers/export/csv`, '_blank');
  };

  const openWhatsApp = (phone, text = '') => {
    if (!phone) return;
    const clean = phone.replace(/\D/g, '');
    const num = clean.length === 10 ? `91${clean}` : clean;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${num}?text=${encoded}`, '_blank');
  };

  const getTierBadge = (t) => {
    switch (t) {
      case 'Royal Patron':
        return <span className="px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">Royal Patron</span>;
      case 'Gold':
        return <span className="px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">Gold Patron</span>;
      case 'Silver':
        return <span className="px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">Silver Patron</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">Bronze Patron</span>;
    }
  };

  return (
    <div className="space-y-8 font-heading text-[#222222]">
      {/* Toast Notification */}
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-heading flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-emerald-700 font-bold text-xs uppercase cursor-pointer">Dismiss</button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
            New Monika Jewellers CRM
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#111111] tracking-wide uppercase">
            Patron Intelligence & Billing Dossier
          </h1>
          <p className="text-xs text-gray-500 font-heading mt-1">
            Consolidated patron portfolios, lifetime grammage bought, credit dues, and concierge management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBackfillBills}
            disabled={backfilling}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-xs font-heading font-bold uppercase tracking-wider hover:border-[#222222] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B59A6C] ${backfilling ? 'animate-spin' : ''}`} />
            {backfilling ? 'Consolidating...' : 'Sync Past Bills'}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222222] text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Patrons CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered Patrons */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Total Showroom Patrons</span>
            <Users className="w-4 h-4 text-[#B59A6C]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {stats ? stats.totalPatrons.toLocaleString('en-IN') : 'Loading...'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex justify-between">
            <span>Royal: {tiers['Royal Patron'] || 0}</span>
            <span>Gold: {tiers.Gold || 0}</span>
            <span>Silver: {tiers.Silver || 0}</span>
          </div>
        </div>

        {/* Card 2: Lifetime Purchases (LTV) */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Lifetime Revenue (LTV)</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {stats ? `Rs. ${stats.totalLtv.toLocaleString('en-IN')}` : 'Loading...'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            Gold Bought: {stats ? `${(stats.totalGoldGrams || 0).toFixed(1)} g` : '0 g'}
          </div>
        </div>

        {/* Card 3: Outstanding Customer Dues */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Customer Receivables</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {stats ? `Rs. ${stats.totalOutstanding.toLocaleString('en-IN')}` : 'Loading...'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            Total pending balance across all bills
          </div>
        </div>

        {/* Card 4: Upcoming Milestones */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Milestones (14 Days)</span>
            <Calendar className="w-4 h-4 text-[#B59A6C]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {upcomingMilestones.length} <span className="text-xs font-normal text-gray-500 uppercase">Patrons</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            Anniversaries & Birthdays to celebrate
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FAF9F7] p-4 border border-gray-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Patron Name, 10-digit Phone, PAN Number, or GSTIN..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={tier}
              onChange={(e) => { setTier(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-white border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
            >
              <option value="all">All Patron Tiers</option>
              <option value="Royal Patron">Royal Patron (&gt;15L)</option>
              <option value="Gold">Gold Patron (&gt;5L)</option>
              <option value="Silver">Silver Patron (&gt;1L)</option>
              <option value="Bronze">Bronze Patron</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-xs font-heading cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasDues}
                onChange={(e) => { setHasDues(e.target.checked); setCurrentPage(1); }}
                className="accent-[#B59A6C]"
              />
              <span className="text-amber-800 font-bold">Has Pending Dues</span>
            </label>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-heading">
            <thead className="bg-[#111111] text-white uppercase text-[9px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Patron Details</th>
                <th className="py-3 px-4">Tier Status</th>
                <th className="py-3 px-4 text-center">Visits</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-right">Gold Bought</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Concierge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400 font-heading">
                    Loading customer intelligence directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400 font-heading">
                    No customer records found. Click 'Sync Past Bills' to import all billed patrons!
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-[#FAF9F7] transition-colors cursor-pointer" onClick={() => handleOpenDossier(cust)}>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#111111] text-sm block">{cust.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono tracking-wider">{cust.phone}</span>
                      {cust.panNumber && (
                        <span className="ml-2 text-[9px] text-[#B59A6C] font-mono font-bold">PAN: {cust.panNumber}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {getTierBadge(cust.patronTier)}
                    </td>

                    <td className="py-3 px-4 text-center font-bold">
                      {cust.totalBillsCount || 1}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#111111]">
                      Rs. {(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {cust.totalOutstanding > 0 ? (
                        <span className="text-rose-700 font-bold font-mono">
                          Rs. {cust.totalOutstanding.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-mono text-[10px] uppercase">Settled</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right text-gray-700">
                      {(cust.totalGoldGramsPurchased || 0).toFixed(2)} g
                    </td>

                    <td className="py-3 px-4 text-gray-500 text-[10px]">
                      {cust.lastPurchaseDate ? new Date(cust.lastPurchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDossier(cust)}
                          className="px-2.5 py-1.5 border border-gray-200 hover:border-[#222222] bg-white text-[10px] font-heading font-bold uppercase tracking-wider text-gray-700 transition-colors cursor-pointer"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => openWhatsApp(cust.phone, `Namaste ${cust.name}, warm greetings from New Monika Jewellers!`)}
                          className="p-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                          title="WhatsApp Concierge"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center text-xs font-heading">
            <span className="text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalCustomers} total patrons)
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase text-[10px] font-bold"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase text-[10px] font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 360-DEGREE CUSTOMER DOSSIER DRAWER */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col font-heading overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-200 bg-[#FAF9F7] flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B59A6C]">
                      Patron Dossier
                    </span>
                    {getTierBadge(selectedCustomer.patronTier)}
                  </div>
                  <h2 className="text-xl font-bold uppercase text-[#111111]">
                    {selectedCustomer.name}
                  </h2>
                  <span className="text-xs font-mono text-gray-500">
                    Phone: {selectedCustomer.phone} • City: {selectedCustomer.city || 'Mumbai'}
                  </span>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-black cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Lifetime Portfolio Grid */}
                <div className="grid grid-cols-3 gap-3 bg-[#FAF9F7] p-4 border border-gray-200 text-center">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block font-bold">Lifetime Value</span>
                    <span className="text-base font-bold text-[#111111]">Rs. {(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block font-bold">Gold Purchased</span>
                    <span className="text-base font-bold text-[#B59A6C]">{(selectedCustomer.totalGoldGramsPurchased || 0).toFixed(2)} g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block font-bold">Outstanding Balance</span>
                    <span className={`text-base font-bold ${selectedCustomer.totalOutstanding > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      Rs. {(selectedCustomer.totalOutstanding || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Edit Form / Details Section */}
                <div className="border border-gray-200 p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                      Patron KYC & Milestone Details
                    </span>
                    <button
                      onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                      className="text-xs text-[#B59A6C] hover:text-[#111111] font-bold uppercase cursor-pointer"
                    >
                      {isEditingCustomer ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                  </div>

                  {isEditingCustomer ? (
                    <form onSubmit={handleSaveCustomerProfile} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Full Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Email</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">PAN Number</label>
                          <input
                            type="text"
                            value={editForm.panNumber}
                            onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase() })}
                            maxLength={10}
                            placeholder="e.g. ABCDE1234F"
                            className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">GSTIN</label>
                          <input
                            type="text"
                            value={editForm.gstin}
                            onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                            maxLength={15}
                            placeholder="e.g. 27AAAAA0000A1Z5"
                            className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Anniversary Date</label>
                          <input
                            type="date"
                            value={editForm.anniversaryDate}
                            onChange={(e) => setEditForm({ ...editForm, anniversaryDate: e.target.value })}
                            className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Birthday Date</label>
                          <input
                            type="date"
                            value={editForm.birthdayDate}
                            onChange={(e) => setEditForm({ ...editForm, birthdayDate: e.target.value })}
                            className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Address & City</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          placeholder="Showroom / Residence address"
                          className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Personal Preferences & Notes</label>
                        <textarea
                          rows={2}
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          placeholder="e.g. Prefers 22K Kundan Chokers, bangle size 2.4"
                          className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="w-full py-2 bg-[#222222] hover:bg-[#B59A6C] text-white text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {savingEdit ? 'Saving...' : 'Update Patron Dossier'}
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block font-bold">PAN / KYC</span>
                        <span className="font-mono font-bold text-gray-800">{selectedCustomer.panNumber || 'Not Quoted'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block font-bold">GSTIN</span>
                        <span className="font-mono font-bold text-gray-800">{selectedCustomer.gstin || 'B2C (Individual)'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block font-bold">Anniversary</span>
                        <span className="text-gray-800">
                          {selectedCustomer.anniversaryDate ? new Date(selectedCustomer.anniversaryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Not Recorded'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block font-bold">Birthday</span>
                        <span className="text-gray-800">
                          {selectedCustomer.birthdayDate ? new Date(selectedCustomer.birthdayDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Not Recorded'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-gray-400 uppercase block font-bold">Address</span>
                        <span className="text-gray-800">{selectedCustomer.address || 'Showroom Walk-in Client'}</span>
                      </div>
                      {selectedCustomer.notes && (
                        <div className="col-span-2 bg-[#FAF9F7] p-2.5 border border-gray-100">
                          <span className="text-[10px] text-[#B59A6C] uppercase block font-bold">Concierge Notes</span>
                          <p className="text-xs text-gray-700 italic">{selectedCustomer.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Concierge WhatsApp Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openWhatsApp(selectedCustomer.phone, `Namaste ${selectedCustomer.name}, warm greetings from New Monika Jewellers! We are delighted to invite you to view our bespoke festive gold collection.`)}
                    className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Festive Greetings
                  </button>

                  {selectedCustomer.totalOutstanding > 0 && (
                    <button
                      onClick={() => openWhatsApp(
                        selectedCustomer.phone,
                        `Namaste ${selectedCustomer.name}, gentle reminder regarding your pending balance of Rs. ${selectedCustomer.totalOutstanding.toLocaleString('en-IN')} with New Monika Jewellers. Please visit our showroom or contact us at +91 98200 12345.`
                      )}
                      className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Balance Reminder
                    </button>
                  )}
                </div>

                {/* Historical Bills Section */}
                <div className="border border-gray-200 p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                    Historical Purchases & Bills ({customerBills.length})
                  </span>

                  {loadingDossier ? (
                    <div className="text-center py-6 text-xs text-gray-400">Loading purchase register...</div>
                  ) : customerBills.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">No previous bills found.</div>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                      {customerBills.map((b) => (
                        <div key={b._id || b.billNumber} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#111111] block font-mono">{b.billNumber}</span>
                            <span className="text-[10px] text-gray-500">
                              {b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} • {b.items?.length || 1} pieces
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-[#111111] block">Rs. {(b.totalPayable || 0).toLocaleString('en-IN')}</span>
                            <span className={`text-[9px] uppercase font-bold ${
                              b.status === 'cancelled' ? 'text-gray-400 line-through' : b.balanceRemaining > 0 ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              {b.status === 'cancelled' ? 'Cancelled' : b.balanceRemaining > 0 ? `Due Rs. ${b.balanceRemaining.toLocaleString('en-IN')}` : 'Settled'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
