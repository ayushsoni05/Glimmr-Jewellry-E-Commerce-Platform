import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { numberToIndianWords } from '../utils/numberToIndianWords';
import { calculateItemMakingAmount } from '../pages/OfflineBilling';
import { KARAT_PURITY } from '../utils/productPricing';
import { STORE_CONFIG } from '../config/storeConfig';
import { ShieldCheckIcon, TrashIcon, TagIcon } from './Icons';
import {
  Printer,
  Barcode,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Banknote,
  QrCode,
  Layers,
  Database,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Camera,
  Sparkles,
  Eye,
  ZoomIn
} from 'lucide-react';
import PhotoCaptureModal from './PhotoCaptureModal';
import ItemMasterModal from './ItemMasterModal';
import CustomerSuggestInput from './CustomerSuggestInput';
import CustomerHistoryDrawer from './CustomerHistoryDrawer';
import api from '../api';

const KARATS_OPTIONS = [
  { value: 24, label: '24K (99.9% Pure Gold)', purity: 99.9, material: 'gold' },
  { value: 22, label: '22K (916 BIS Hallmark)', purity: 91.67, material: 'gold' },
  { value: 18, label: '18K (750 BIS Hallmark)', purity: 75.0, material: 'gold' },
  { value: 14, label: '14K (585 BIS Hallmark)', purity: 58.33, material: 'gold' },
  { value: 925, label: '925 (Sterling Fine Silver)', purity: 92.5, material: 'silver' }
];

export default function BusyMagicBilling({
  billItems,
  setBillItems,
  billTotals,
  liveRates,
  setLiveRates,
  rateStatus,
  customGoldRate,
  setCustomGoldRate,
  customSilverRate,
  setCustomSilverRate,
  handleApplyCustomRates,
  handleResetToMarketRates,
  gstRate,
  setGstRate,
  taxSplitMode,
  setTaxSplitMode,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customerGstin,
  setCustomerGstin,
  customerPan,
  setCustomerPan,
  operatorName,
  setOperatorName,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  changeToReturn,
  paymentReference,
  setPaymentReference,
  splitCashAmount,
  setSplitCashAmount,
  splitCardAmount,
  setSplitCardAmount,
  splitUpiAmount,
  setSplitUpiAmount,
  splitCardRef,
  setSplitCardRef,
  splitUpiRef,
  setSplitUpiRef,
  isPartialPayment,
  setIsPartialPayment,
  advanceAmount,
  setAdvanceAmount,
  advanceMethod,
  setAdvanceMethod,
  advanceReference,
  setAdvanceReference,
  dueDate,
  setDueDate,
  hasOldGold,
  setHasOldGold,
  oldGoldWeight,
  setOldGoldWeight,
  oldGoldKarat,
  setOldGoldKarat,
  oldGoldRate,
  setOldGoldRate,
  billNotes,
  setBillNotes,
  handleGenerateInvoice,
  handleClearBill,
  products = [],
  setProducts,
  addProductToBill,
  handleHardwareScan,
  lastScannedTag,
  showHistory,
  setShowHistory,
  setShowZReport,
  setShowRateLockDrawer,
  activeLocks = [],
  catalogAlert,
  setCatalogAlert,
  onToggleViewMode
}) {
  // Selected line item for highlight / delete
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  // BUSY 21 Item Master Creation Modal State
  const [isItemMasterModalOpen, setIsItemMasterModalOpen] = useState(false);

  // Fast Add Line Item Bar (BUSY Magic Direct Entry)
  const [quickItemName, setQuickItemName] = useState('');
  const [quickKarat, setQuickKarat] = useState(22);
  const [quickMaterial, setQuickMaterial] = useState('gold');
  const [quickGrossWt, setQuickGrossWt] = useState('');
  const [quickStoneWt, setQuickStoneWt] = useState('');
  const [quickMakingMode, setQuickMakingMode] = useState('percent');
  const [quickMakingVal, setQuickMakingVal] = useState('12');
  const [quickStoneVal, setQuickStoneVal] = useState('');
  const [quickHuid, setQuickHuid] = useState('');
  const [quickImage, setQuickImage] = useState('');
  const [quickCatalogSearch, setQuickCatalogSearch] = useState('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // Live Camera & AI Studio Photo Capture State
  const [isPhotoCaptureOpen, setIsPhotoCaptureOpen] = useState(false);
  const [photoCaptureTargetIndex, setPhotoCaptureTargetIndex] = useState(null); // null = quick item, number = row index
  const [activePhotoPreview, setActivePhotoPreview] = useState(null);

  const handlePhotoCaptured = (dataUrl) => {
    if (photoCaptureTargetIndex === null) {
      setQuickImage(dataUrl);
      setCatalogAlert('AI Studio: Ornament photo attached to entry bar.');
      setTimeout(() => setCatalogAlert(''), 3000);
    } else {
      setBillItems(prev => prev.map((item, idx) => {
        if (idx !== photoCaptureTargetIndex) return item;
        return {
          ...item,
          image: dataUrl
        };
      }));
      setCatalogAlert(`Voucher Grid: Photo attached to row #${photoCaptureTargetIndex + 1}.`);
      setTimeout(() => setCatalogAlert(''), 3000);
    }
  };

  // Old Gold Extended Fields
  const [oldGoldDescription, setOldGoldDescription] = useState('Old Gold Ornaments Exchange');
  const [oldGoldDustDeduction, setOldGoldDustDeduction] = useState('0.100');

  // Manual Scanner Bar Input
  const [scannerBarInput, setScannerBarInput] = useState('');

  // Daily Board Rates Drawer in BUSY Magic Style
  const [showRatesEditor, setShowRatesEditor] = useState(false);

  // Patron Intelligence & Purchase History Drawer States
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Fast customer profile lookup when 10-digit phone number is entered
  useEffect(() => {
    const clean = (customerPhone || '').replace(/\D/g, '');
    if (clean.length === 10) {
      let isSubscribed = true;
      api.get('/billing/customers/search', { params: { q: clean } })
        .then(res => {
          if (!isSubscribed) return;
          const matches = res.data?.customers || [];
          if (matches.length > 0) {
            const matched = matches.find(c => c.phone.replace(/\D/g, '').endsWith(clean)) || matches[0];
            setSelectedPatron(matched);
            if (!customerName || customerName === 'Walk-in Customer') {
              setCustomerName(matched.name || '');
            }
            if (!customerAddress && matched.address) {
              setCustomerAddress(matched.address);
            }
            if (!customerPan && matched.panNumber) {
              setCustomerPan(matched.panNumber);
            }
            if (!customerGstin && matched.gstin) {
              setCustomerGstin(matched.gstin);
            }
          }
        })
        .catch(() => {});
      return () => { isSubscribed = false; };
    }
  }, [customerPhone]);

  // Quick Catalog Filter for Fast Entry (searches real store inventory)
  const quickCatalogMatches = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!quickCatalogSearch.trim()) return list.slice(0, 8);
    const q = quickCatalogSearch.toLowerCase().trim();
    return list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.barcode || '').toLowerCase().includes(q) ||
      (p.huid || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [products, quickCatalogSearch]);

  // Compute Fast Entry Calculated Values
  const quickNetWt = useMemo(() => {
    const gross = parseFloat(quickGrossWt) || 0;
    const stone = parseFloat(quickStoneWt) || 0;
    return Math.max(0, gross - stone);
  }, [quickGrossWt, quickStoneWt]);

  const quickRatePerGram = useMemo(() => {
    return quickMaterial === 'silver' ? liveRates.silver : liveRates.gold;
  }, [quickMaterial, liveRates]);

  const quickPurityPercent = useMemo(() => {
    const opt = KARATS_OPTIONS.find(k => k.value === Number(quickKarat));
    return opt ? opt.purity : 91.67;
  }, [quickKarat]);

  const quickMetalCost = useMemo(() => {
    const purityMult = KARAT_PURITY[quickKarat] || (quickKarat / 24);
    return Math.round(quickNetWt * quickRatePerGram * purityMult);
  }, [quickNetWt, quickRatePerGram, quickKarat]);

  const quickMakingCharges = useMemo(() => {
    const mVal = parseFloat(quickMakingVal) || 0;
    return calculateItemMakingAmount(quickMakingMode, mVal, quickMetalCost, quickNetWt);
  }, [quickMakingMode, quickMakingVal, quickMetalCost, quickNetWt]);

  const quickItemTotal = useMemo(() => {
    const stone = parseFloat(quickStoneVal) || 0;
    const subtotal = quickMetalCost + quickMakingCharges + stone;
    const gst = Math.round(subtotal * (gstRate / 100));
    return subtotal + gst;
  }, [quickMetalCost, quickMakingCharges, quickStoneVal, gstRate]);

  // Handle Quick Add to Grid
  const handleAddQuickItem = () => {
    if (!quickItemName.trim()) {
      setCatalogAlert('Validation: Please enter ornament description.');
      setTimeout(() => setCatalogAlert(''), 3000);
      return;
    }
    if (quickNetWt <= 0) {
      setCatalogAlert('Validation: Net weight must be greater than 0 grams.');
      setTimeout(() => setCatalogAlert(''), 3000);
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productId: `busy-item-${Date.now()}`,
      name: quickItemName.trim(),
      material: quickMaterial,
      karat: Number(quickKarat),
      weight: parseFloat(quickGrossWt) || quickNetWt,
      netWeight: quickNetWt,
      ratePerGram: quickRatePerGram,
      purityPercent: quickPurityPercent,
      makingChargeType: quickMakingMode,
      makingChargeValue: parseFloat(quickMakingVal) || 0,
      makingCharges: quickMakingCharges,
      metalCost: quickMetalCost,
      gemstoneCost: parseFloat(quickStoneVal) || 0,
      subtotal: quickMetalCost + quickMakingCharges + (parseFloat(quickStoneVal) || 0),
      gstTax: Math.round((quickMetalCost + quickMakingCharges + (parseFloat(quickStoneVal) || 0)) * (gstRate / 100)),
      totalPrice: quickItemTotal,
      quantity: 1,
      image: quickImage || '',
      fineWeight: parseFloat(((quickNetWt * quickPurityPercent) / 100).toFixed(3)),
      isCustomItem: true,
      huid: quickHuid.trim().toUpperCase()
    };

    setBillItems(prev => [...prev, newItem]);
    setSelectedRowIndex(billItems.length);

    // Reset quick fields
    setQuickItemName('');
    setQuickGrossWt('');
    setQuickStoneWt('');
    setQuickStoneVal('');
    setQuickHuid('');
    setQuickImage('');
    setQuickCatalogSearch('');

    setCatalogAlert(`Voucher Grid: Added "${newItem.name}" (${quickNetWt.toFixed(3)}g)`);
    setTimeout(() => setCatalogAlert(''), 3000);
  };

  // Handlers for BUSY 21 Item Master Creation
  const handleItemCreatedAndAdded = (billItem, savedProduct) => {
    setBillItems(prev => [...prev, billItem]);
    setSelectedRowIndex(billItems.length);
    if (setProducts && savedProduct) {
      setProducts(prev => [savedProduct, ...(Array.isArray(prev) ? prev : [])]);
    }
    setCatalogAlert(`BUSY 21 Master Created & Billed: "${billItem.name}" (${billItem.netWeight.toFixed(3)}g)`);
    setTimeout(() => setCatalogAlert(''), 3500);
  };

  const handleItemCreatedOnly = (savedProduct) => {
    if (setProducts && savedProduct) {
      setProducts(prev => [savedProduct, ...(Array.isArray(prev) ? prev : [])]);
    }
    setCatalogAlert(`BUSY 21 Master Created: "${savedProduct.name}" saved to showroom inventory.`);
    setTimeout(() => setCatalogAlert(''), 3500);
  };

  // Keyboard Navigation: F3 for Item Master, Escape for Modals / Drawers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showRatesEditor) {
          setShowRatesEditor(false);
        } else if (showCatalogDropdown) {
          setShowCatalogDropdown(false);
        } else if (isItemMasterModalOpen) {
          setIsItemMasterModalOpen(false);
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsItemMasterModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRatesEditor, showCatalogDropdown, isItemMasterModalOpen]);

  // Old Gold Calculation
  const computedOldGoldNetWt = useMemo(() => {
    const gross = parseFloat(oldGoldWeight) || 0;
    const deduction = parseFloat(oldGoldDustDeduction) || 0;
    return Math.max(0, gross - deduction);
  }, [oldGoldWeight, oldGoldDustDeduction]);

  const computedOldGoldTotal = useMemo(() => {
    if (!hasOldGold || computedOldGoldNetWt <= 0) return 0;
    const rate = parseFloat(oldGoldRate) || (liveRates.gold * 0.95);
    const karat = Number(oldGoldKarat) || 22;
    const purity = KARAT_PURITY[karat] || (karat / 24);
    return Math.round(computedOldGoldNetWt * rate * purity);
  }, [hasOldGold, computedOldGoldNetWt, oldGoldRate, liveRates.gold, oldGoldKarat]);

  // Update item making charge mode in table
  const handleUpdateItemMaking = (itemId, type, val) => {
    setBillItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const numVal = Math.max(0, parseFloat(val) || 0);
      const netWeight = item.netWeight || item.weight || 0;
      const makingCharges = calculateItemMakingAmount(type, numVal, item.metalCost, netWeight);
      const subtotal = item.metalCost + makingCharges + (item.gemstoneCost || 0);
      const gstTax = Math.round(subtotal * (gstRate / 100));
      return {
        ...item,
        makingChargeType: type,
        makingChargeValue: numVal,
        makingCharges,
        subtotal,
        gstTax,
        totalPrice: subtotal + gstTax
      };
    }));
  };

  // Update line item quantity
  const handleUpdateQuantity = (itemId, delta) => {
    setBillItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newQty = Math.max(1, (item.quantity || 1) + delta);
      return {
        ...item,
        quantity: newQty
      };
    }));
  };

  return (
    <div className="min-h-screen bg-[#0B1E36] text-[#1E293B] font-sans text-xs pb-24 sm:pb-20 selection:bg-[#B59A6C] selection:text-white">

      {/* ========================================================================= */}
      {/* 1. TOP BUSY 21 ENTERPRISE APPLICATION TITLE BAR                           */}
      {/* ========================================================================= */}
      <header className="bg-[#07162C] text-white border-b border-[#1E3A5F] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#B59A6C] text-[#07162C] font-black px-2.5 py-1 rounded text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-sm font-mono">
            <span>BUSY</span>
            <span className="bg-[#07162C] text-[#B59A6C] px-1.5 rounded text-[10px]">21</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-white">
                {STORE_CONFIG.name.toUpperCase()} (DIDWANA)
              </h1>
              <span className="text-[10px] text-[#B59A6C] font-mono font-semibold">
                [BUSY 21 Jewellery Edition - Release 21.0]
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Vch Series: Main | Mat. Centre: Main Vault (Shop Floor) | GSTIN: {STORE_CONFIG.gstin} | BIS Reg: {STORE_CONFIG.bisLicense}
            </p>
          </div>
        </div>

        {/* System & Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <div className="bg-[#102A4C] border border-[#1E3A5F] px-2.5 py-1 rounded flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live MongoDB Synced</span>
          </div>
          <div className="bg-[#102A4C] border border-[#1E3A5F] px-2 py-1 rounded text-slate-300">
            <span>FY: {STORE_CONFIG.financialYear}</span>
          </div>
          <div className="bg-[#102A4C] border border-[#1E3A5F] px-2 py-1 rounded text-[#B59A6C] font-bold">
            <span>{STORE_CONFIG.counterId}</span>
          </div>
          <div className="bg-[#102A4C] border border-[#1E3A5F] px-2 py-1 rounded text-slate-300">
            <span>Staff: {operatorName || 'Admin'}</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BUSY MAGIC MODULE NAVIGATION RIBBON                                    */}
      {/* ========================================================================= */}
      <nav className="bg-[#0E2746] text-slate-200 border-b border-[#1A385E] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-sm text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className="px-3 py-1 bg-[#B59A6C] text-[#07162C] font-bold rounded shadow-xs flex items-center gap-1 cursor-default"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sales Voucher</span>
          </button>

          <button
            type="button"
            onClick={() => setIsItemMasterModalOpen(true)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow-xs flex items-center gap-1 cursor-pointer border border-amber-400/50"
            title="Create New Item Master (F3)"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>+ New Item Master (F3)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRatesEditor(prev => !prev)}
            className={`px-3 py-1 rounded border border-[#1E3A5F] transition-colors flex items-center gap-1 cursor-pointer ${
              showRatesEditor ? 'bg-[#1E3A5F] text-[#B59A6C]' : 'hover:bg-[#15345A] text-slate-300'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-[#B59A6C]" />
            <span>Daily Board Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="px-3 py-1 rounded hover:bg-[#15345A] border border-[#1E3A5F] text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Sales Day Book</span>
          </button>

          <button
            type="button"
            onClick={() => setShowZReport(true)}
            className="px-3 py-1 rounded hover:bg-[#15345A] border border-[#1E3A5F] text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Z-Report Day End</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRateLockDrawer(true)}
            className="px-3 py-1 rounded hover:bg-[#15345A] border border-[#1E3A5F] text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rate Locks ({activeLocks.length})</span>
          </button>
        </div>

        {/* View Mode Switcher: BUSY Magic Voucher vs. Catalog Tile View */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleViewMode}
            className="px-3 py-1 bg-[#102A4C] hover:bg-[#1A3E6D] text-amber-300 border border-amber-400/40 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[10px]"
            title="Switch between high-density BUSY voucher grid and visual catalog cards"
          >
            <Layers className="w-3 h-3" />
            <span>Switch to Catalog Tiles View</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. LIVE BULLION BOARD RATES TICKER                                        */}
      {/* ========================================================================= */}
      <section className="bg-[#091D35] text-white border-b border-[#1A385E] px-4 py-2">
        <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-[#B59A6C] tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Today's Board Rates:
            </span>

            {/* 24K */}
            <div className="bg-[#0F2848] border border-[#1C3B63] px-2.5 py-1 rounded">
              <span className="text-slate-400 text-[10px]">Gold 24K (999): </span>
              <strong className="text-amber-300 font-bold">Rs. {liveRates.gold.toLocaleString('en-IN')}/g</strong>
            </div>

            {/* 22K 916 */}
            <div className="bg-[#0F2848] border border-[#1C3B63] px-2.5 py-1 rounded">
              <span className="text-slate-400 text-[10px]">22K 916 (91.67%): </span>
              <strong className="text-amber-300 font-bold">Rs. {Math.round(liveRates.gold * 0.9167).toLocaleString('en-IN')}/g</strong>
            </div>

            {/* 18K 750 */}
            <div className="bg-[#0F2848] border border-[#1C3B63] px-2.5 py-1 rounded">
              <span className="text-slate-400 text-[10px]">18K 750 (75%): </span>
              <strong className="text-amber-300 font-bold">Rs. {Math.round(liveRates.gold * 0.750).toLocaleString('en-IN')}/g</strong>
            </div>

            {/* 14K 585 */}
            <div className="bg-[#0F2848] border border-[#1C3B63] px-2.5 py-1 rounded">
              <span className="text-slate-400 text-[10px]">14K 585 (58.3%): </span>
              <strong className="text-amber-300 font-bold">Rs. {Math.round(liveRates.gold * 0.5833).toLocaleString('en-IN')}/g</strong>
            </div>

            {/* Silver 925 */}
            <div className="bg-[#0F2848] border border-[#1C3B63] px-2.5 py-1 rounded">
              <span className="text-slate-400 text-[10px]">Silver 925: </span>
              <strong className="text-slate-200 font-bold">Rs. {liveRates.silver.toLocaleString('en-IN')}/g</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rateStatus === 'custom' && (
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-700 text-[9px] uppercase font-bold rounded">
                Owner Custom Master
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowRatesEditor(prev => !prev)}
              className="text-[#B59A6C] hover:text-white underline text-[10px] cursor-pointer"
            >
              {showRatesEditor ? 'Close Rates Drawer' : 'Adjust Rates Master'}
            </button>
          </div>
        </div>

        {/* Expandable Rate Editor Drawer */}
        <AnimatePresence>
          {showRatesEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#1C3B63] mt-2 pt-2"
            >
              <div className="flex flex-wrap items-center gap-4 bg-[#0A203A] p-3 border border-[#1C3B63] rounded">
                <span className="text-[10px] font-bold uppercase text-[#B59A6C]">Manual Bullion Master Entry:</span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] text-slate-300">Gold 24K (Rs./g):</label>
                  <input
                    type="number"
                    value={customGoldRate}
                    onChange={(e) => setCustomGoldRate(e.target.value)}
                    className="w-24 px-2 py-1 bg-[#061426] border border-[#1E3A5F] text-white font-mono text-xs focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] text-slate-300">Silver 925 (Rs./g):</label>
                  <input
                    type="number"
                    value={customSilverRate}
                    onChange={(e) => setCustomSilverRate(e.target.value)}
                    className="w-24 px-2 py-1 bg-[#061426] border border-[#1E3A5F] text-white font-mono text-xs focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomRates}
                  className="px-3 py-1 bg-[#B59A6C] text-[#07162C] font-bold uppercase tracking-wider rounded hover:bg-white transition-colors cursor-pointer text-[10px]"
                >
                  Apply & Recalculate Voucher
                </button>
                <button
                  type="button"
                  onClick={handleResetToMarketRates}
                  className="px-2.5 py-1 bg-[#102A4C] text-slate-300 border border-[#1E3A5F] hover:bg-[#1A3E6D] rounded text-[10px] cursor-pointer"
                >
                  Reset to Live IBJA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ========================================================================= */}
      {/* 4. HARDWARE SCANNER TOOLBAR                                               */}
      {/* ========================================================================= */}
      <div className="bg-[#0D243F] border-b border-[#1A385E] px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-mono text-xs">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200">Hardware Scanner Machine Listening:</span>
          <span className="text-[10px] text-emerald-400 bg-[#061B2E] border border-emerald-600/40 px-2 py-0.5 rounded">
            USB / Bluetooth 2D QR Gun Ready
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              value={scannerBarInput}
              onChange={(e) => setScannerBarInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && scannerBarInput.trim()) {
                  e.preventDefault();
                  handleHardwareScan(scannerBarInput.trim());
                  setScannerBarInput('');
                }
              }}
              placeholder="Scan or type Barcode / SKU / HUID..."
              className="w-full px-3 py-1 bg-[#07172A] border border-[#1E3A5F] text-white font-mono text-xs focus:outline-none focus:border-[#B59A6C] rounded"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (scannerBarInput.trim()) {
                handleHardwareScan(scannerBarInput.trim());
                setScannerBarInput('');
              }
            }}
            disabled={!scannerBarInput.trim()}
            className="px-3 py-1 bg-[#B59A6C] text-[#07162C] font-bold uppercase rounded hover:bg-white transition-colors cursor-pointer disabled:opacity-40 text-[10px]"
          >
            Fetch Tag
          </button>
        </div>
      </div>

      {/* Real-time Alert / Scan Result */}
      {catalogAlert && (
        <div className="bg-amber-100 border-l-4 border-amber-600 text-amber-900 px-4 py-1.5 text-xs font-mono flex items-center justify-between">
          <span>{catalogAlert}</span>
          <button onClick={() => setCatalogAlert('')} className="text-amber-900 font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN VOUCHER CONTAINER                                                 */}
      {/* ========================================================================= */}
      <main className="max-w-[1720px] mx-auto p-3 sm:p-4 space-y-3">

        {/* VOUCHER MASTER PARTICULARS BOX */}
        <section className="bg-white border border-slate-300 rounded shadow-xs p-3">
          <div className="border-b border-slate-200 pb-2 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#0B2545] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Voucher Header
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                Tax Invoice / Retail Sales Voucher
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold text-[#0B2545]">
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            {/* Voucher Series & Number */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Voucher Series</label>
              <input
                type="text"
                readOnly
                value="MAIN (Showroom)"
                className="w-full px-2 py-1.5 bg-slate-100 border border-slate-300 font-mono text-slate-700 rounded font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Sale Type / GST</label>
              <select
                value={gstRate > 0 ? (taxSplitMode === 'single' ? 'igst' : 'lgst') : 'exempt'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'lgst') {
                    setGstRate(3);
                    setTaxSplitMode('split');
                  } else if (val === 'igst') {
                    setGstRate(3);
                    setTaxSplitMode('single');
                  } else {
                    setGstRate(0);
                  }
                }}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 font-mono text-slate-800 rounded font-bold focus:outline-none focus:border-[#0B2545]"
              >
                <option value="lgst">L-GST 3% (Local: 1.5% CGST + 1.5% SGST)</option>
                <option value="igst">I-GST 3% (Inter-State IGST: 3.0%)</option>
                <option value="exempt">EXEMPT (Bill of Supply / Non-GST)</option>
              </select>
            </div>

            {/* Customer Name with Real-Time Autosuggest & Past Purchases */}
            <div className="md:col-span-3 space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase text-slate-500">Party Account / Customer Name</label>
                {selectedPatron && (
                  <button
                    type="button"
                    onClick={() => setIsHistoryDrawerOpen(true)}
                    className="text-[9px] text-[#B59A6C] hover:text-[#0B2545] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>View History</span>
                  </button>
                )}
              </div>
              <CustomerSuggestInput
                value={customerName}
                onChange={setCustomerName}
                onSelectCustomer={(patron) => {
                  setSelectedPatron(patron);
                  if (patron.name) setCustomerName(patron.name);
                  if (patron.phone) setCustomerPhone(patron.phone);
                  if (patron.address) setCustomerAddress(patron.address);
                  if (patron.panNumber) setCustomerPan(patron.panNumber);
                  if (patron.gstin) setCustomerGstin(patron.gstin);
                }}
                placeholder="Type customer name or mobile..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded font-bold text-xs focus:outline-none focus:border-[#0B2545]"
              />
            </div>

            {/* Customer Mobile */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase text-slate-500">Mobile Number</label>
                <span className={`text-[9px] font-mono ${customerPhone.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  [{customerPhone.length}/10]
                </span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98XXXXXXXX"
                className="w-full px-2 py-1.5 bg-white border border-slate-300 font-mono text-slate-800 rounded focus:outline-none focus:border-[#0B2545]"
              />
            </div>

            {/* Customer PAN */}
            <div className="md:col-span-3 space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase text-slate-500">Customer PAN (Rule 114B)</label>
                {billTotals.totalPayable > 200000 && !customerPan && (
                  <span className="text-[9px] text-rose-600 font-bold font-mono">Mandatory &gt; 2L</span>
                )}
              </div>
              <input
                type="text"
                maxLength={10}
                value={customerPan}
                onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-2 py-1.5 bg-white border border-slate-300 font-mono text-slate-800 rounded uppercase focus:outline-none focus:border-[#0B2545]"
              />
            </div>

            {/* Address & GSTIN row */}
            <div className="md:col-span-7 space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Billing Address / Place of Supply</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="e.g. Karol Bagh, New Delhi 110005"
                className="w-full px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs focus:outline-none focus:border-[#0B2545]"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Customer GSTIN (B2B)</label>
              <input
                type="text"
                maxLength={15}
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                placeholder={STORE_CONFIG.gstin}
                className="w-full px-2 py-1 bg-white border border-slate-300 font-mono text-slate-700 rounded text-xs uppercase focus:outline-none focus:border-[#0B2545]"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Cashier / Staff</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Owner / Cashier"
                className="w-full px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs font-bold focus:outline-none focus:border-[#0B2545]"
              />
            </div>
          </div>

          {/* Active Patron Intelligence & Past Purchases Strip */}
          {selectedPatron && (
            <div className="mt-2.5 p-2.5 bg-[#071322] border border-[#B59A6C]/60 rounded-lg text-white font-mono flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-100 text-sm">{selectedPatron.name}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-amber-950/80 border border-amber-600/60 text-amber-300 font-bold uppercase">
                    {selectedPatron.patronTier || 'Bronze'}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  Total Spent: <span className="font-bold text-emerald-400">Rs. {(selectedPatron.totalSpent || 0).toLocaleString('en-IN')}</span> ({selectedPatron.totalBillsCount || 1} {selectedPatron.totalBillsCount === 1 ? 'bill' : 'bills'})
                </div>
                {selectedPatron.lastPurchaseDate && (
                  <div className="text-slate-300 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#B59A6C]" />
                    <span>Last Bought:</span>
                    <span className="font-bold text-amber-200">
                      {new Date(selectedPatron.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {selectedPatron.lastBillAmount > 0 && (
                  <div className="text-slate-300 text-[11px]">
                    Last Bill: <span className="font-bold text-white">Rs. {selectedPatron.lastBillAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedPatron.totalOutstanding > 0 && (
                  <div className="px-2 py-0.5 bg-rose-950/90 border border-rose-600 text-rose-300 rounded font-bold text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Pending Dues: Rs. {selectedPatron.totalOutstanding.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  className="px-3 py-1 bg-[#102A4C] hover:bg-[#B59A6C] hover:text-[#071322] text-[#B59A6C] rounded text-[11px] font-bold border border-[#1E3A5F] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>View All Invoices Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPatron(null)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  title="Dismiss Dossier Banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 6. HIGH-DENSITY BUSY MAGIC VOUCHER ITEM GRID                              */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
          <div className="bg-[#0B2545] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#1E3A5F]">
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Jewellery Items Voucher Grid
              </span>
              <span className="text-[10px] text-slate-300">
                ({billItems.length} Item{billItems.length !== 1 ? 's' : ''} in Bill)
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              Use Fast Entry row below to add items | Select row and click trash to delete
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[11px] font-mono min-w-[950px]">
              <thead>
                <tr className="bg-[#1E3A5F] text-white font-bold uppercase text-[10px] tracking-wider border-b border-slate-400">
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 text-center w-14">Photo</th>
                  <th className="p-2 min-w-[180px]">Ornament / Description</th>
                  <th className="p-2 w-24">HUID / Tag</th>
                  <th className="p-2 w-24">Purity</th>
                  <th className="p-2 text-center w-12">Qty</th>
                  <th className="p-2 text-right w-20">Gross Wt</th>
                  <th className="p-2 text-right w-20">Stone Wt</th>
                  <th className="p-2 text-right w-20 text-amber-200">Net Wt</th>
                  <th className="p-2 text-right w-24">Rate/g</th>
                  <th className="p-2 text-right w-28 text-emerald-200">Metal Val</th>
                  <th className="p-2 text-center min-w-[140px]">Making Mode</th>
                  <th className="p-2 text-right w-24">Making Chg</th>
                  <th className="p-2 text-right w-20">Diamond</th>
                  <th className="p-2 text-right w-28 font-bold text-white">Item Total</th>
                  <th className="p-2 text-center w-12">Act</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {billItems.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center py-12 text-slate-400 bg-slate-50 font-sans">
                      <div className="max-w-md mx-auto space-y-2">
                        <Barcode className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600 text-xs">
                          No items added to current sales voucher.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Scan jewellery barcode with scanner machine gun, or use the fast entry row below to add items.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  billItems.map((item, idx) => {
                    const isSelected = selectedRowIndex === idx;
                    const netWeight = item.netWeight || item.weight || 0;
                    const grossWeight = item.weight || netWeight;
                    const stoneWeight = Math.max(0, grossWeight - netWeight);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedRowIndex(idx)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100/70 border-l-4 border-amber-500'
                            : idx % 2 === 0
                            ? 'bg-white hover:bg-slate-50'
                            : 'bg-slate-50/70 hover:bg-slate-100'
                        }`}
                      >
                        {/* Row # */}
                        <td className="p-2 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Dedicated Item Photo (Click to zoom, snap or retake) */}
                        <td className="p-1.5 text-center">
                          {item.image ? (
                            <div className="relative group mx-auto w-11 h-11">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 object-cover rounded border border-[#B59A6C] mx-auto bg-white shadow-2xs hover:scale-105 transition-transform"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePhotoPreview({
                                    image: item.image,
                                    name: item.name,
                                    huid: item.huid || item.sku,
                                    weight: netWeight
                                  });
                                }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <button
                                type="button"
                                title="Change or retake photo with AI studio"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPhotoCaptureTargetIndex(idx);
                                  setIsPhotoCaptureOpen(true);
                                }}
                                className="absolute -bottom-1 -right-1 p-0.5 bg-[#0B2545] hover:bg-[#B59A6C] text-white rounded-full border border-white/60 shadow-xs cursor-pointer opacity-80 group-hover:opacity-100"
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              title="Click to snap or upload ornament photo"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoCaptureTargetIndex(idx);
                                setIsPhotoCaptureOpen(true);
                              }}
                              className="w-11 h-11 rounded border border-dashed border-[#B59A6C] hover:border-amber-500 mx-auto flex flex-col items-center justify-center bg-amber-50/50 hover:bg-amber-100 text-[8px] text-amber-800 font-sans cursor-pointer transition-colors"
                            >
                              <Camera className="w-3.5 h-3.5 text-amber-700 mb-0.5" />
                              <span>Snap</span>
                            </button>
                          )}
                        </td>

                        {/* Description */}
                        <td className="p-2">
                          <span className="font-bold text-[#0B2545] font-sans text-xs block">
                            {item.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            HSN: 7113 | BIS Hallmarked
                          </span>
                        </td>

                        {/* HUID */}
                        <td className="p-2">
                          <span className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-bold block text-center">
                            {item.huid || item.sku || 'N/A'}
                          </span>
                        </td>

                        {/* Karat */}
                        <td className="p-2">
                          <span className="bg-[#B59A6C]/20 text-[#0B2545] font-bold px-1.5 py-0.5 rounded text-[10px] block text-center">
                            {item.karat}K ({(item.purityPercent || 91.67).toFixed(1)}%)
                          </span>
                        </td>

                        {/* Quantity with +/- */}
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, -1); }}
                              className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-bold px-1">{item.quantity || 1}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, 1); }}
                              className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Gross Weight */}
                        <td className="p-2 text-right text-slate-700">
                          {grossWeight.toFixed(3)}g
                        </td>

                        {/* Stone Weight */}
                        <td className="p-2 text-right text-slate-500">
                          {stoneWeight > 0 ? `${stoneWeight.toFixed(3)}g` : '-'}
                        </td>

                        {/* Net Weight */}
                        <td className="p-2 text-right font-bold text-[#0B2545]">
                          {netWeight.toFixed(3)}g
                        </td>

                        {/* Rate/g */}
                        <td className="p-2 text-right text-slate-700">
                          Rs. {(item.ratePerGram || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Metal Value */}
                        <td className="p-2 text-right font-bold text-slate-800">
                          Rs. {((item.metalCost || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </td>

                        {/* Making Mode Selector Inline */}
                        <td className="p-2 text-center">
                          <div className="inline-flex border border-slate-300 rounded overflow-hidden text-[9px]">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateItemMaking(item.id, 'percent', item.makingChargeType === 'percent' ? (item.makingChargeValue || 12) : 12); }}
                              className={`px-1.5 py-0.5 font-bold ${
                                (item.makingChargeType || 'percent') === 'percent' ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateItemMaking(item.id, 'per_gram', item.makingChargeType === 'per_gram' ? (item.makingChargeValue || 500) : 500); }}
                              className={`px-1.5 py-0.5 font-bold ${
                                item.makingChargeType === 'per_gram' ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              Rs/g
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleUpdateItemMaking(item.id, 'flat', item.makingCharges || 1500); }}
                              className={`px-1.5 py-0.5 font-bold ${
                                item.makingChargeType === 'flat' ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              Flat
                            </button>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            {item.makingChargeType === 'percent' ? `${item.makingChargeValue || 12}%` : item.makingChargeType === 'per_gram' ? `Rs.${item.makingChargeValue || 500}/g` : 'Flat'}
                          </div>
                        </td>

                        {/* Making Charges Amount */}
                        <td className="p-2 text-right font-bold text-slate-700">
                          Rs. {((item.makingCharges || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </td>

                        {/* Stone/Diamond Cost */}
                        <td className="p-2 text-right text-slate-600">
                          {item.gemstoneCost > 0 ? `Rs. ${(item.gemstoneCost * (item.quantity || 1)).toLocaleString('en-IN')}` : '-'}
                        </td>

                        {/* Line Total */}
                        <td className="p-2 text-right font-black text-sm text-[#0B2545]">
                          Rs. {((item.totalPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </td>

                        {/* Delete Row Action */}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBillItems(prev => prev.filter(bi => bi.id !== item.id));
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Delete this row"
                          >
                            <TrashIcon size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* FAST ENTRY ROW (BUSY Magic Direct Row Add)                                */}
          {/* ========================================================================= */}
          <div className="bg-[#F1F5F9] border-t-2 border-[#0B2545] p-3 text-xs font-mono">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-[#0B2545] text-white px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider whitespace-nowrap">
                  Add Ornament to Voucher Grid
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  Select store piece or enter custom piece to append row:
                </span>
              </div>

              {/* Fast Input Grid */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Product Photo Preview / Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {quickImage ? (
                    <div className="relative group">
                      <img
                        src={quickImage}
                        alt="Piece"
                        className="w-8 h-8 object-cover rounded border border-amber-400 bg-white shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setPhotoCaptureTargetIndex(null);
                          setIsPhotoCaptureOpen(true);
                        }}
                        title="Click to edit with AI Studio or retake"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickImage('')}
                        title="Remove attached photo"
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center leading-none hover:bg-rose-700 cursor-pointer"
                      >
                        x
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoCaptureTargetIndex(null);
                      setIsPhotoCaptureOpen(true);
                    }}
                    className="px-2 py-1 bg-[#0B2545] hover:bg-[#153B6C] text-amber-300 rounded border border-[#1E3A5F] flex items-center gap-1 cursor-pointer text-[10px] font-bold shrink-0 shadow-2xs"
                    title="Capture live camera photo or upload from device"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{quickImage ? 'AI Edit' : 'Snap / Upload Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsItemMasterModalOpen(true)}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded border border-amber-400/50 flex items-center gap-1 cursor-pointer text-[10px] font-bold shrink-0 shadow-2xs"
                    title="Create Brand New Item Master & Add to Bill (F3)"
                  >
                    <Plus className="w-3 h-3 text-white" />
                    <span>+ Item Master (F3)</span>
                  </button>
                </div>

                {/* Catalog Picker / Search */}
                <div className="relative w-48 sm:w-56">
                  <input
                    id="busy-quick-name"
                    type="text"
                    value={quickItemName || quickCatalogSearch}
                    onChange={(e) => {
                      setQuickItemName(e.target.value);
                      setQuickCatalogSearch(e.target.value);
                      setShowCatalogDropdown(true);
                    }}
                    onFocus={() => setShowCatalogDropdown(true)}
                    placeholder="Description / Search inventory..."
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#0B2545]"
                  />
                  {showCatalogDropdown && (
                    <div className="absolute left-0 bottom-full mb-1 z-50 w-[calc(100vw-32px)] max-w-sm sm:w-80 bg-white border border-slate-300 shadow-xl rounded max-h-56 overflow-y-auto">
                      <div
                        onClick={() => {
                          setShowCatalogDropdown(false);
                          setIsItemMasterModalOpen(true);
                        }}
                        className="p-2 bg-amber-50 hover:bg-amber-100 cursor-pointer border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-700" />
                        <span>+ Create New Item Master (F3)</span>
                      </div>
                      <div className="p-1.5 bg-slate-100 text-[9px] font-bold uppercase text-slate-600 border-b border-slate-200 flex justify-between items-center">
                        <span>Real Store Inventory ({quickCatalogMatches.length} items):</span>
                        <span className="text-[8px] text-slate-400 font-normal">Click to load</span>
                      </div>
                      {quickCatalogMatches.map(p => {
                        const prodImg = (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.image || '');
                        return (
                          <div
                            key={p._id || p.id}
                            onClick={() => {
                              setQuickItemName(p.name);
                              setQuickKarat(p.karat || 22);
                              setQuickMaterial(p.material || 'gold');
                              setQuickGrossWt(String(p.metalWeight || p.weight || ''));
                              setQuickHuid(p.huid || p.sku || '');
                              setQuickImage(prodImg);
                              setShowCatalogDropdown(false);
                            }}
                            className="p-2 hover:bg-amber-50 cursor-pointer border-b border-slate-100 flex items-center justify-between text-xs gap-2 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {prodImg ? (
                                <img
                                  src={prodImg}
                                  alt=""
                                  className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0 bg-white"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[9px] text-slate-400">
                                  Pic
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block truncate">{p.name}</span>
                                <span className="text-[9px] text-slate-500 block truncate">
                                  {p.karat || 22}K | {p.sku || p.barcode || p.huid || 'HSN 7113'}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-amber-700 font-bold shrink-0">{p.metalWeight || p.weight || 0}g</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* HUID */}
                <input
                  type="text"
                  value={quickHuid}
                  onChange={(e) => setQuickHuid(e.target.value.toUpperCase())}
                  placeholder="HUID/Tag"
                  className="w-20 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono uppercase focus:outline-none focus:border-[#0B2545]"
                />

                {/* Karat */}
                <select
                  value={quickKarat}
                  onChange={(e) => {
                    const k = Number(e.target.value);
                    setQuickKarat(k);
                    setQuickMaterial(k === 925 ? 'silver' : 'gold');
                  }}
                  className="w-24 px-1 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold focus:outline-none focus:border-[#0B2545]"
                >
                  <option value={24}>24K Pure</option>
                  <option value={22}>22K 916</option>
                  <option value={18}>18K 750</option>
                  <option value={14}>14K 585</option>
                  <option value={925}>925 Silver</option>
                </select>

                {/* Gross Wt */}
                <div className="flex items-center gap-0.5">
                  <input
                    type="number"
                    step="0.001"
                    value={quickGrossWt}
                    onChange={(e) => setQuickGrossWt(e.target.value)}
                    placeholder="Gross Wt"
                    className="w-20 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold focus:outline-none focus:border-[#0B2545]"
                  />
                  <span className="text-[10px] text-slate-400">g</span>
                </div>

                {/* Stone Wt */}
                <div className="flex items-center gap-0.5">
                  <input
                    type="number"
                    step="0.001"
                    value={quickStoneWt}
                    onChange={(e) => setQuickStoneWt(e.target.value)}
                    placeholder="Less Wt"
                    className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-[#0B2545]"
                  />
                  <span className="text-[10px] text-slate-400">g</span>
                </div>

                {/* Net Wt Result */}
                <div className="bg-white border border-slate-300 px-2 py-1 rounded text-xs font-bold text-[#0B2545]">
                  Net: {quickNetWt.toFixed(3)}g
                </div>

                {/* Making Mode & Value */}
                <div className="flex items-center gap-1 border border-slate-300 bg-white rounded px-1.5 py-0.5">
                  <select
                    value={quickMakingMode}
                    onChange={(e) => setQuickMakingMode(e.target.value)}
                    className="text-[10px] bg-transparent font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="percent">% Mode</option>
                    <option value="per_gram">Rs/g Mode</option>
                    <option value="flat">Flat Mode</option>
                  </select>
                  <input
                    type="number"
                    value={quickMakingVal}
                    onChange={(e) => setQuickMakingVal(e.target.value)}
                    placeholder="12"
                    className="w-12 text-center text-xs font-bold font-mono focus:outline-none"
                  />
                </div>

                {/* Append Button */}
                <button
                  type="button"
                  onClick={handleAddQuickItem}
                  className="px-4 py-1.5 bg-[#0B2545] hover:bg-[#153A66] text-amber-300 border border-amber-400/30 rounded font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. LOWER DUAL-PANEL: OLD GOLD + PAYMENT TENDER & BILL SUNDRY TOTALS       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

          {/* LEFT 7 COLUMNS: OLD GOLD EXCHANGE & PAYMENT TENDER */}
          <div className="lg:col-span-7 space-y-3">

            {/* OLD GOLD / EXCHANGE PURCHASE VOUCHER */}
            <section className="bg-white border border-slate-300 rounded shadow-xs p-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="bg-[#B59A6C] text-[#07162C] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                    Exchange Desk
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                    Old Gold / Silver Exchange Voucher
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasOldGold}
                    onChange={(e) => setHasOldGold(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B2545] focus:ring-0 cursor-pointer"
                  />
                  <span>Accept Customer Old Gold</span>
                </label>
              </div>

              {hasOldGold ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
                    <div className="sm:col-span-5">
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Old Ornament Description</label>
                      <input
                        type="text"
                        value={oldGoldDescription}
                        onChange={(e) => setOldGoldDescription(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Gross Wt (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={oldGoldWeight}
                        onChange={(e) => setOldGoldWeight(e.target.value)}
                        placeholder="0.000"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Melt/Dust Less</label>
                      <input
                        type="number"
                        step="0.001"
                        value={oldGoldDustDeduction}
                        onChange={(e) => setOldGoldDustDeduction(e.target.value)}
                        placeholder="0.100"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Purity Touch</label>
                      <select
                        value={oldGoldKarat}
                        onChange={(e) => setOldGoldKarat(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                      >
                        <option value="22">22K (91.6% Touch)</option>
                        <option value="24">24K (99.9% Touch)</option>
                        <option value="18">18K (75.0% Touch)</option>
                        <option value="14">14K (58.3% Touch)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span>Net Melted: <strong>{computedOldGoldNetWt.toFixed(3)}g</strong></span>
                      <div className="flex items-center gap-1">
                        <span>Buying Rate: Rs.</span>
                        <input
                          type="number"
                          value={oldGoldRate}
                          onChange={(e) => setOldGoldRate(e.target.value)}
                          placeholder={String(Math.round(liveRates.gold * 0.95))}
                          className="w-20 px-1.5 py-0.5 bg-white border border-amber-300 rounded font-bold"
                        />
                        <span>/g</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-900 block uppercase">Old Gold Credit Value:</span>
                      <strong className="text-sm font-black text-rose-700">
                        - Rs. {computedOldGoldTotal.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">
                  Check box above to record old gold trade-in credit against this bill.
                </p>
              )}
            </section>

            {/* PAYMENT TENDER & SETTLEMENT */}
            <section className="bg-white border border-slate-300 rounded shadow-xs p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0B2545] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                    Settlement
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                    Payment Mode & Tender
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Mode:</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-xs"
                  >
                    <option value="cash">Cash Tender</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="upi">UPI / Dynamic QR</option>
                    <option value="mixed">Split Multi-Tender</option>
                    <option value="bank">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              {/* Mode-Specific Inputs */}
              {paymentMethod === 'cash' && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Cash Received from Customer</label>
                    <div className="flex items-center">
                      <span className="px-2 py-1.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l text-slate-600 font-bold">Rs.</span>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder={String(billTotals.totalPayable)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-r font-mono font-bold text-slate-800 text-sm focus:outline-none focus:border-[#0B2545]"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded flex flex-col justify-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Change to Return</span>
                    <span className={`text-base font-black ${changeToReturn > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                      Rs. {changeToReturn.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Card Transaction / Auth Ref</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. TXN-948201 / HDFC POS"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-mono"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded text-[11px] text-blue-900 flex items-center">
                    Collect Rs. {billTotals.totalPayable.toLocaleString('en-IN')} via Card Swipe / Chip Machine.
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">UPI UTR / Reference No</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. 429104928104"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-mono"
                    />
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-2 rounded text-[11px] text-purple-900 flex items-center justify-between">
                    <span>Showroom UPI ID: <strong>monika@icici</strong></span>
                    <span className="text-xs font-bold">Rs. {billTotals.totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'mixed' && (
                <div className="space-y-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500">Cash Portion</label>
                      <input
                        type="number"
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500">Card Portion</label>
                      <input
                        type="number"
                        value={splitCardAmount}
                        onChange={(e) => setSplitCardAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500">UPI Portion</label>
                      <input
                        type="number"
                        value={splitUpiAmount}
                        onChange={(e) => setSplitUpiAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Partial / Khata Payment Option */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 font-mono">
                  <input
                    type="checkbox"
                    checked={isPartialPayment}
                    onChange={(e) => setIsPartialPayment(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B2545] cursor-pointer"
                  />
                  <span>Customer Khata / Advance Credit</span>
                </label>
                {isPartialPayment && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <label className="text-[10px] text-slate-500 uppercase">Advance:</label>
                    <input
                      type="number"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                    />
                    <label className="text-[10px] text-slate-500 uppercase">Due:</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Bill Narration / Remarks */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Voucher Narration / Terms</label>
                <input
                  type="text"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  placeholder="e.g. Certified 100% BIS Hallmarked Jewellery. Goods once sold are non-refundable."
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700"
                />
              </div>
            </section>
          </div>

          {/* RIGHT 5 COLUMNS: BUSY BILL SUNDRY FINANCIAL SUMMARY */}
          <div className="lg:col-span-5">
            <section className="bg-white border-2 border-[#0B2545] rounded shadow-sm overflow-hidden flex flex-col justify-between h-full">
              <div className="bg-[#0B2545] text-white p-2.5 flex items-center justify-between border-b border-[#1E3A5F]">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold uppercase text-xs tracking-wider text-amber-300">
                    Bill Sundry / Accounting Summary
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">
                  GSTIN 07-Delhi
                </span>
              </div>

              <div className="p-3 space-y-2 text-xs font-mono divide-y divide-slate-100">
                {/* Weights summary */}
                <div className="flex justify-between text-slate-600 pb-1">
                  <span>Total Pieces / Units</span>
                  <span className="font-bold text-slate-800">
                    {billItems.reduce((acc, bi) => acc + (bi.quantity || 1), 0)} Pcs
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>Total Net Metal Weight</span>
                  <span className="font-bold text-[#0B2545]">
                    {billItems.reduce((acc, bi) => acc + ((bi.netWeight || bi.weight || 0) * (bi.quantity || 1)), 0).toFixed(3)} g
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>Total Metal Value</span>
                  <span className="font-bold text-slate-800">
                    Rs. {billTotals.totalMetal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>Total Making Charges</span>
                  <span className="font-bold text-slate-800">
                    Rs. {billTotals.totalMaking.toLocaleString('en-IN')}
                  </span>
                </div>

                {billTotals.totalDiamond > 0 && (
                  <div className="flex justify-between text-slate-600 pt-1.5">
                    <span>Total Diamond & Gemstones</span>
                    <span className="font-bold text-slate-800">
                      Rs. {billTotals.totalDiamond.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-slate-800 font-bold pt-2 text-sm bg-slate-50 p-1.5 rounded">
                  <span>Taxable Subtotal</span>
                  <span>Rs. {billTotals.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* GST Taxes */}
                {gstRate > 0 && (
                  taxSplitMode === 'single' ? (
                    <div className="flex justify-between text-slate-600 pt-1.5">
                      <span>Add: IGST (3.0%)</span>
                      <span className="font-bold text-slate-800">Rs. {billTotals.totalGst.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600 pt-1.5">
                        <span>Add: CGST (1.5%)</span>
                        <span className="font-bold text-slate-800">Rs. {billTotals.cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 pt-1">
                        <span>Add: SGST (1.5%)</span>
                        <span className="font-bold text-slate-800">Rs. {billTotals.sgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )
                )}

                {/* Old Gold Deduction */}
                {hasOldGold && computedOldGoldTotal > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold pt-1.5 bg-rose-50 p-1 rounded">
                    <span>Less: Old Gold Credit</span>
                    <span>- Rs. {computedOldGoldTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Discount */}
                {billTotals.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold pt-1.5">
                    <span>Less: Store Concession / Discount</span>
                    <span>- Rs. {billTotals.totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* NET VOUCHER AMOUNT BOX */}
              <div className="bg-[#0B2545] text-white p-3 border-t-2 border-[#B59A6C]">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B59A6C] block">
                      Net Voucher Amount Payable
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      (Inclusive of GST & Hallmarking)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-amber-300">
                      Rs. {billTotals.totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Amount in words */}
                <div className="mt-2 pt-1.5 border-t border-slate-700 text-[10px] font-mono text-slate-300 italic">
                  <strong>In Words:</strong> {numberToIndianWords(billTotals.totalPayable)}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 8. BUSY MAGIC BOTTOM ACTION BAR (Touch & Click Enabled)                   */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-[#07162C] text-white border-t border-[#1E3A5F] px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 shadow-2xl font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-nowrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={billItems.length === 0}
            className="px-3.5 sm:px-4 py-1.5 bg-[#B59A6C] text-[#07162C] font-black uppercase tracking-wider rounded shadow hover:bg-white transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>Save & Print Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('busy-quick-name');
              if (input) input.focus();
            }}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-slate-200 border border-[#1E3A5F] rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Add Item</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRatesEditor(prev => !prev)}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-slate-200 border border-[#1E3A5F] rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <Banknote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Rates Master</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-slate-200 border border-[#1E3A5F] rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Day Book</span>
          </button>

          <button
            type="button"
            onClick={() => setHasOldGold(prev => !prev)}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-slate-200 border border-[#1E3A5F] rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Old Gold</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod(prev => (prev === 'mixed' ? 'cash' : 'mixed'))}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-slate-200 border border-[#1E3A5F] rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Split Tender</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (billItems.length > 0) {
                const targetIndex = selectedRowIndex >= 0 && selectedRowIndex < billItems.length ? selectedRowIndex : billItems.length - 1;
                const targetId = billItems[targetIndex]?.id;
                if (targetId) {
                  setBillItems(prev => prev.filter(item => item.id !== targetId));
                  setSelectedRowIndex(prev => Math.max(0, prev - 1));
                }
              }
            }}
            disabled={billItems.length === 0}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-rose-300 border border-[#1E3A5F] rounded transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <TrashIcon size={13} className="text-rose-400 shrink-0" />
            <span>Delete Row</span>
          </button>

          <button
            type="button"
            onClick={handleClearBill}
            className="px-2.5 sm:px-3 py-1.5 bg-[#102A4C] hover:bg-rose-950 text-slate-400 hover:text-white border border-[#1E3A5F] rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Voucher</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[10px] shrink-0">
          <span>{STORE_CONFIG.name} POS</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300 font-bold">100% BIS Hallmarked</span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. LIVE CAMERA & AI STUDIO PHOTO CAPTURE MODAL                            */}
      {/* ========================================================================= */}
      <PhotoCaptureModal
        isOpen={isPhotoCaptureOpen}
        onClose={() => setIsPhotoCaptureOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        initialPhoto={photoCaptureTargetIndex !== null ? billItems[photoCaptureTargetIndex]?.image : quickImage}
        title={photoCaptureTargetIndex !== null ? `Photograph Piece #${photoCaptureTargetIndex + 1}: ${billItems[photoCaptureTargetIndex]?.name || 'Ornament'}` : 'Photograph Piece for Entry Bar'}
      />

      {/* ========================================================================= */}
      {/* 10. PHOTO PREVIEW ZOOM INSPECTOR                                         */}
      {/* ========================================================================= */}
      {activePhotoPreview && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActivePhotoPreview(null)}
        >
          <div
            className="max-w-md w-full bg-[#0D1B2A] border border-[#B59A6C] rounded-2xl p-4 shadow-2xl space-y-3 font-mono cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]">
              <div>
                <h4 className="text-sm font-bold text-white uppercase">{activePhotoPreview.name}</h4>
                <p className="text-[10px] text-[#B59A6C]">
                  HUID: {activePhotoPreview.huid || 'BIS Certified'} | Net Wt: {Number(activePhotoPreview.weight || 0).toFixed(3)}g
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoPreview(null)}
                className="w-7 h-7 rounded-full bg-[#102A4C] hover:bg-rose-900 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[#1E3A5F]">
              <img
                src={activePhotoPreview.image}
                alt={activePhotoPreview.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-2 bg-[#07162C] rounded border border-[#1E3A5F] text-[10px] text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Counter Photo Proof
              </span>
              <span className="text-slate-400">Printed on GST Invoice</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. BUSY 21 ITEM MASTER CREATION MODAL                                    */}
      {/* ========================================================================= */}
      <ItemMasterModal
        isOpen={isItemMasterModalOpen}
        onClose={() => setIsItemMasterModalOpen(false)}
        liveRates={liveRates}
        gstRate={gstRate}
        onItemCreatedAndAdded={handleItemCreatedAndAdded}
        onItemCreatedOnly={handleItemCreatedOnly}
      />

      {/* ========================================================================= */}
      {/* 12. SHOWROOM PATRON PURCHASE TIMELINE & DOSSIER DRAWER                     */}
      {/* ========================================================================= */}
      <CustomerHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        phone={customerPhone || selectedPatron?.phone}
        customer={selectedPatron}
      />
    </div>
  );
}
