import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Minus, 
  Printer, 
  History, 
  CheckCircle, 
  ShieldCheck, 
  X,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function StockManagement({ api }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [material, setMaterial] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');

  // Vault summary & metrics
  const [vaultSummary, setVaultSummary] = useState(null);
  const [metrics, setMetrics] = useState({ lowStockCount: 0, outOfStockCount: 0, totalUnits: 0 });

  // Modals state
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustAction, setAdjustAction] = useState('manual_adjustment');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustLocation, setAdjustLocation] = useState('');
  const [adjustHuid, setAdjustHuid] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Tag Print Modal
  const [selectedProductForTag, setSelectedProductForTag] = useState(null);

  // Audit Logs Drawer
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [stockLogs, setStockLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [notification, setNotification] = useState('');

  const fetchVaultSummary = useCallback(async () => {
    try {
      const res = await api.get('/stock/vault-summary');
      setVaultSummary(res.data);
    } catch (err) {
      console.error('Error fetching vault summary:', err);
    }
  }, [api]);

  const fetchStockList = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        material: material !== 'all' ? material : undefined,
        stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
      };

      const res = await api.get('/stock', { params });
      setProducts(res.data.products || []);
      setTotalProducts(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching stock list:', err);
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, search, category, material, stockStatus]);

  const fetchLogs = useCallback(async (productId = null) => {
    try {
      setLoadingLogs(true);
      const params = { page: 1, limit: 40 };
      if (productId) params.productId = productId;
      const res = await api.get('/stock/logs', { params });
      setStockLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching stock logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [api]);

  useEffect(() => {
    fetchStockList();
  }, [fetchStockList]);

  useEffect(() => {
    fetchVaultSummary();
  }, [fetchVaultSummary]);

  const handleOpenAdjust = (prod) => {
    setSelectedProductForAdjust(prod);
    setAdjustDelta('1');
    setAdjustAction('manual_adjustment');
    setAdjustNotes('');
    setAdjustLocation(prod.location || 'Showroom Floor');
    setAdjustHuid(prod.huid || '');
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    try {
      setSubmittingAdjust(true);
      const deltaVal = parseInt(adjustDelta, 10);
      if (isNaN(deltaVal)) {
        setNotification('Please enter a valid stock quantity adjustment');
        return;
      }

      await api.patch(`/stock/${selectedProductForAdjust._id}/adjust`, {
        delta: deltaVal,
        action: adjustAction,
        notes: adjustNotes,
        location: adjustLocation,
        huid: adjustHuid
      });

      setNotification(`Stock successfully updated for ${selectedProductForAdjust.name}`);
      setTimeout(() => setNotification(''), 4000);
      setSelectedProductForAdjust(null);
      fetchStockList();
      fetchVaultSummary();
    } catch (err) {
      console.error('Stock adjust error:', err);
      setNotification(err.response?.data?.error || 'Failed to update stock');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const handlePrintTag = (product) => {
    setSelectedProductForTag(product);
  };

  const triggerDirectTagPrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=300');
    if (!printWindow || !selectedProductForTag) return;

    const p = selectedProductForTag;
    const sku = p.sku || `MJ-${p._id.slice(-6).toUpperCase()}`;
    const karatStr = p.material === 'gold' ? `${p.karat || 22}K 916` : '925 Silver';
    const wt = (p.netWeight || p.weight || 0).toFixed(3);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jewellery Tag - ${sku}</title>
          <style>
            @page { size: 50mm 25mm; margin: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 2mm 3mm;
              font-size: 8px;
              color: #111;
              line-height: 1.2;
            }
            .brand { font-size: 9px; font-weight: bold; letter-spacing: 0.1em; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 1px; margin-bottom: 2px; }
            .sku { font-family: monospace; font-size: 10px; font-weight: bold; text-align: center; }
            .row { display: flex; justify-content: space-between; margin-top: 1px; font-size: 8px; }
            .huid { font-size: 7px; color: #444; text-align: center; margin-top: 2px; }
            .barcode { letter-spacing: 3px; font-family: monospace; font-size: 11px; text-align: center; margin-top: 2px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="brand">NEW MONIKA JEWELLERS</div>
          <div class="sku">${sku}</div>
          <div class="row">
            <span><strong>Purity:</strong> ${karatStr}</span>
            <span><strong>Net Wt:</strong> ${wt}g</span>
          </div>
          <div class="row">
            <span><strong>Cat:</strong> ${(p.category || 'Jewellery').toUpperCase()}</span>
            <span><strong>BIS:</strong> Hallmarked</span>
          </div>
          ${p.huid ? `<div class="huid">HUID: ${p.huid}</div>` : ''}
          <div class="barcode">||| |||| || |||</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const getStatusBadge = (status, stock) => {
    if (stock <= 0 || status === 'out_of_stock') {
      return <span className="px-2.5 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">Out of Stock</span>;
    }
    if (status === 'low_stock' || stock <= 2) {
      return <span className="px-2.5 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Low Stock ({stock})</span>;
    }
    return <span className="px-2.5 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">In Stock ({stock})</span>;
  };

  return (
    <div className="space-y-8 font-heading text-[#222222]">
      {/* Top Banner / Notification */}
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

      {/* Header & Vault Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
            New Monika Jewellers Atelier
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#111111] tracking-wide uppercase">
            Vault Stock & Inventory Control
          </h1>
          <p className="text-xs text-gray-500 font-heading mt-1">
            Real-time physical bullion tracking, karatage reserves, live valuation, and SKU tag printing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowLogsDrawer(true); fetchLogs(); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-xs font-heading font-bold uppercase tracking-wider hover:border-[#222222] transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#B59A6C]" />
            Stock Audit Logs
          </button>
          <button
            onClick={() => { fetchStockList(); fetchVaultSummary(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222222] text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Vault
          </button>
        </div>
      </div>

      {/* Vault KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gold Vault Weight */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Pure Gold Reserves</span>
            <ShieldCheck className="w-4 h-4 text-[#B59A6C]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {vaultSummary ? `${vaultSummary.vault.totalGoldWt.toLocaleString('en-IN')} g` : 'Loading...'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex justify-between">
            <span>22K: {vaultSummary?.vault.gold22kWt || 0}g</span>
            <span>18K: {vaultSummary?.vault.gold18kWt || 0}g</span>
            <span>24K: {vaultSummary?.vault.gold24kWt || 0}g</span>
          </div>
        </div>

        {/* Card 2: Silver & Diamond Reserves */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Silver & Gems</span>
            <Package className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {vaultSummary ? `${vaultSummary.vault.silverWt.toLocaleString('en-IN')} g` : 'Loading...'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex justify-between">
            <span>925 Sterling Silver</span>
            <span>Diamonds: {vaultSummary?.vault.diamondCarats || 0} cts</span>
          </div>
        </div>

        {/* Card 3: Live Valuation */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Live Vault Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {vaultSummary ? `Rs. ${vaultSummary.valuation.totalValuation.toLocaleString('en-IN')}` : 'Calculating...'}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            Based on IBJA Spot: Gold Rs.{vaultSummary?.valuation.ratesUsed.goldRate}/g
          </div>
        </div>

        {/* Card 4: Inventory Units & Alerts */}
        <div className="bg-white p-5 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B59A6C]">Unit Stock Health</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
          </div>
          <div className="text-2xl font-heading font-bold text-[#111111]">
            {metrics.totalUnits.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-500 uppercase">Pieces</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] flex justify-between">
            <span className={metrics.lowStockCount > 0 ? 'text-amber-700 font-bold' : 'text-gray-500'}>
              {metrics.lowStockCount} Low Stock
            </span>
            <span className={metrics.outOfStockCount > 0 ? 'text-rose-700 font-bold' : 'text-gray-500'}>
              {metrics.outOfStockCount} Out of Stock
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF9F7] p-4 border border-gray-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Product Name, SKU, Barcode, or HUID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-white border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
            >
              <option value="all">All Categories</option>
              <option value="rings">Rings</option>
              <option value="necklaces">Necklaces</option>
              <option value="bracelets">Bracelets & Bangles</option>
              <option value="earrings">Earrings</option>
              <option value="watches">Watches</option>
            </select>

            <select
              value={material}
              onChange={(e) => { setMaterial(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-white border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
            >
              <option value="all">All Metals</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
            </select>

            <select
              value={stockStatus}
              onChange={(e) => { setStockStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-white border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (Alerts)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-heading">
            <thead className="bg-[#111111] text-white uppercase text-[9px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category & Purity</th>
                <th className="py-3 px-4 text-right">Net Weight</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4">Vault Location</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 font-heading">
                    Synchronizing physical vault records...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 font-heading">
                    No jewellery inventory found matching selected filters.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const sku = prod.sku || `MJ-${prod._id.slice(-6).toUpperCase()}`;
                  const netWt = prod.netWeight || prod.weight || 0;
                  const karat = prod.material === 'gold' ? `${prod.karat || 22}K` : '925';

                  return (
                    <tr key={prod._id} className="hover:bg-[#FAF9F7] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images && prod.images[0] ? prod.images[0] : '/placeholder-ring.png'}
                            alt={prod.name}
                            className="w-10 h-10 object-cover border border-gray-200 bg-gray-50 flex-shrink-0"
                            onError={(e) => { e.target.src = '/placeholder-ring.png'; }}
                          />
                          <div>
                            <span className="font-bold text-[#111111] block">{prod.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono tracking-wider">{sku}</span>
                            {prod.huid && (
                              <span className="ml-2 text-[9px] text-[#B59A6C] font-bold">HUID: {prod.huid}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="block font-bold capitalize text-gray-800">{prod.category}</span>
                        <span className="text-[10px] text-gray-500 capitalize">{prod.material} • {karat}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-[#111111]">
                        {netWt.toFixed(3)} g
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-base font-bold text-[#111111]">{prod.stock || 0}</span>
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {prod.location || 'Showroom Floor'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(prod.stockStatus, prod.stock)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAdjust(prod)}
                            className="px-2.5 py-1.5 border border-gray-200 hover:border-[#222222] bg-white text-[10px] font-heading font-bold uppercase tracking-wider text-gray-700 transition-colors cursor-pointer"
                            title="Adjust Stock Quantity & Location"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => handlePrintTag(prod)}
                            className="p-1.5 border border-gray-200 hover:border-[#B59A6C] bg-white text-[#B59A6C] hover:text-[#111111] transition-colors cursor-pointer"
                            title="Print Jewellery Barcode Tag"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center text-xs font-heading">
            <span className="text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalProducts} total jewellery items)
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

      {/* MODAL 1: Adjust Stock Quantity & Details */}
      <AnimatePresence>
        {selectedProductForAdjust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-heading"
            >
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] block">
                    Inventory Adjustment
                  </span>
                  <h3 className="text-lg font-bold text-[#111111]">
                    {selectedProductForAdjust.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    Current Stock: {selectedProductForAdjust.stock || 0} pcs
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProductForAdjust(null)}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjust} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                      Adjustment Action
                    </label>
                    <select
                      value={adjustAction}
                      onChange={(e) => setAdjustAction(e.target.value)}
                      className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                    >
                      <option value="manual_adjustment">Manual Recount / Correction</option>
                      <option value="initial_stock">New Consignment Received</option>
                      <option value="return_restock">Customer Return Restock</option>
                      <option value="damage_scrap">Damaged / Melt Scrap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                      Quantity Delta (+ / -)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAdjustDelta(prev => String((parseInt(prev, 10) || 0) - 1))}
                        className="px-2.5 py-2 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={adjustDelta}
                        onChange={(e) => setAdjustDelta(e.target.value)}
                        placeholder="e.g. +5 or -2"
                        className="w-full p-2 text-center bg-white border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#222222]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setAdjustDelta(prev => String((parseInt(prev, 10) || 0) + 1))}
                        className="px-2.5 py-2 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                      Vault / Display Location
                    </label>
                    <input
                      type="text"
                      value={adjustLocation}
                      onChange={(e) => setAdjustLocation(e.target.value)}
                      placeholder="e.g. Vault A, Counter 2"
                      className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                      Hallmark HUID
                    </label>
                    <input
                      type="text"
                      value={adjustHuid}
                      onChange={(e) => setAdjustHuid(e.target.value.toUpperCase())}
                      placeholder="e.g. 6R8W2M"
                      maxLength={6}
                      className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#222222]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                    Audit Note / Reference Invoice
                  </label>
                  <input
                    type="text"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="e.g. Consignment batch #842 from Karigar Ram"
                    className="w-full p-2 bg-[#FAF9F7] border border-gray-200 text-xs font-heading focus:outline-none focus:border-[#222222]"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={submittingAdjust}
                    className="flex-1 py-2.5 bg-[#222222] hover:bg-[#B59A6C] text-white text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submittingAdjust ? 'Updating...' : 'Commit Stock Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProductForAdjust(null)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs font-heading font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Jewellery Tag Preview & Print */}
      <AnimatePresence>
        {selectedProductForTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 shadow-2xl max-w-sm w-full p-6 space-y-4 font-heading"
            >
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] block">
                    Jewellery Tag Barcode
                  </span>
                  <h3 className="text-base font-bold text-[#111111]">
                    {selectedProductForTag.name}
                  </h3>
                </div>
                <button onClick={() => setSelectedProductForTag(null)} className="text-gray-400 hover:text-black cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tag Physical Preview */}
              <div className="border-2 border-dashed border-gray-300 p-4 bg-[#FAF9F7] text-center space-y-2 rounded">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#111111] block">
                  New Monika Jewellers
                </span>
                <div className="text-sm font-mono font-bold text-[#111111]">
                  {selectedProductForTag.sku || `MJ-${selectedProductForTag._id.slice(-6).toUpperCase()}`}
                </div>
                <div className="flex justify-between text-[11px] font-heading px-4 text-gray-700">
                  <span><strong>Purity:</strong> {selectedProductForTag.material === 'gold' ? `${selectedProductForTag.karat || 22}K 916` : '925 Silver'}</span>
                  <span><strong>Net Wt:</strong> {(selectedProductForTag.netWeight || selectedProductForTag.weight || 0).toFixed(3)}g</span>
                </div>
                {selectedProductForTag.huid && (
                  <div className="text-[10px] font-mono text-[#B59A6C] font-bold">
                    HUID: {selectedProductForTag.huid}
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                  <div className="font-mono text-sm tracking-widest font-bold">
                    |||||| | |||| || |||
                  </div>
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest">
                    Standard 50x25mm BIS Thermal Label
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={triggerDirectTagPrint}
                  className="flex-1 py-2.5 bg-[#222222] hover:bg-[#B59A6C] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Label
                </button>
                <button
                  onClick={() => setSelectedProductForTag(null)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs font-heading font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: Stock Audit Logs */}
      <AnimatePresence>
        {showLogsDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col font-heading"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#FAF9F7]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] block">
                    Security & Regulatory Record
                  </span>
                  <h2 className="text-xl font-bold uppercase text-[#111111]">
                    Stock Movement Audit Trail
                  </h2>
                </div>
                <button onClick={() => setShowLogsDrawer(false)} className="text-gray-400 hover:text-black cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingLogs ? (
                  <div className="text-center py-12 text-gray-400 font-heading">
                    Loading immutable audit ledgers...
                  </div>
                ) : stockLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-heading">
                    No stock adjustments logged yet.
                  </div>
                ) : (
                  stockLogs.map((log) => (
                    <div key={log._id} className="p-4 border border-gray-200 bg-[#FAF9F7] space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-[#111111] text-sm block">{log.productName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{log.sku || 'No SKU'}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          log.quantityDelta > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta} pcs
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 flex justify-between">
                        <span>Action: <strong>{log.action.replace('_', ' ').toUpperCase()}</strong></span>
                        <span>Operator: <strong>{log.operator}</strong></span>
                      </div>

                      {log.notes && (
                        <p className="text-[11px] text-gray-500 italic bg-white p-2 border border-gray-100">
                          {log.notes}
                        </p>
                      )}

                      <div className="text-[10px] text-gray-400 text-right">
                        {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
