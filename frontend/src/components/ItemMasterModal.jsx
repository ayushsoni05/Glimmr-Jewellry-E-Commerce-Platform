import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Camera,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Scale,
  DollarSign,
  Tag,
  Building2,
  FileText
} from 'lucide-react';
import PhotoCaptureModal from './PhotoCaptureModal';
import api from '../api';

const CATEGORY_OPTIONS = [
  { value: 'rings', label: 'Rings (Anguthi)' },
  { value: 'necklaces', label: 'Necklaces & Choker (Haar)' },
  { value: 'bangles', label: 'Bangles & Kada (Chudi)' },
  { value: 'chains', label: 'Chains (Sone ki Chain)' },
  { value: 'earrings', label: 'Earrings & Jhumki' },
  { value: 'mangalsutra', label: 'Mangalsutra' },
  { value: 'bracelets', label: 'Bracelets & Kangan' },
  { value: 'pendants', label: 'Pendants & Lockets' },
  { value: 'anklets', label: 'Anklets (Payal / Bichhiya)' },
  { value: 'nose-pins', label: 'Nose Pins (Nath)' },
  { value: 'sets', label: 'Bridal Sets' },
  { value: 'wedding', label: 'Wedding Collection' },
  { value: 'coins', label: 'Gold / Silver Bullion Coins' }
];

const KARAT_OPTIONS = [
  { karat: 24, label: '24 Karat (99.9% Pure Bullion)', purity: 99.9, factor: 1.0 },
  { karat: 22, label: '22 Karat (91.6% BIS Hallmark)', purity: 91.6, factor: 0.9167 },
  { karat: 18, label: '18 Karat (75.0% Hallmarked)', purity: 75.0, factor: 0.75 },
  { karat: 14, label: '14 Karat (58.5% Hallmarked)', purity: 58.5, factor: 0.585 }
];

const MATERIAL_LOCATIONS = [
  'Main Showroom Counter',
  'Display Counter 1 (Gold)',
  'Display Counter 2 (Diamond)',
  'Main Safe Vault A',
  'Workshop / Karigar'
];

export default function ItemMasterModal({
  isOpen,
  onClose,
  liveRates = { gold: 13990, silver: 180.85 },
  gstRate = 3,
  onItemCreatedAndAdded,
  onItemCreatedOnly
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('necklaces');
  const [material, setMaterial] = useState('gold');
  const [karat, setKarat] = useState(22);
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [stoneValue, setStoneValue] = useState('');
  const [makingMode, setMakingMode] = useState('percent'); // 'percent' | 'perGram' | 'flat'
  const [makingValue, setMakingValue] = useState('12');
  const [huid, setHuid] = useState('');
  const [barcode, setBarcode] = useState('');
  const [location, setLocation] = useState('Main Showroom Counter');
  const [stockQty, setStockQty] = useState('1');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-generate barcode / SKU tag when category or karat changes
  useEffect(() => {
    if (!barcode) {
      const karatCode = material === 'gold' ? `${karat}K` : 'SLV';
      const catCode = category.substring(0, 3).toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setBarcode(`MJ-${karatCode}-${catCode}-${randomSuffix}`);
    }
  }, [category, karat, material, barcode]);

  // Compute Net Weight automatically
  const computedNetWeight = useMemo(() => {
    const gross = parseFloat(grossWeight) || 0;
    const stone = parseFloat(stoneWeight) || 0;
    return Math.max(0, parseFloat((gross - stone).toFixed(3)));
  }, [grossWeight, stoneWeight]);

  // Selected purity info
  const selectedKaratInfo = useMemo(() => {
    return KARAT_OPTIONS.find(k => k.karat === Number(karat)) || KARAT_OPTIONS[1];
  }, [karat]);

  // Current metal rate per gram
  const ratePerGram = useMemo(() => {
    if (material === 'silver') {
      return liveRates.silver || 180.85;
    }
    const base24K = liveRates.gold || 13990;
    return Math.round(base24K * selectedKaratInfo.factor);
  }, [material, liveRates, selectedKaratInfo]);

  // Calculated Fine Pure Metal Weight (grams)
  const fineWeight = useMemo(() => {
    return parseFloat(((computedNetWeight * selectedKaratInfo.purity) / 100).toFixed(3));
  }, [computedNetWeight, selectedKaratInfo]);

  // Metal Base Cost
  const metalCost = useMemo(() => {
    return Math.round(computedNetWeight * ratePerGram);
  }, [computedNetWeight, ratePerGram]);

  // Making Charges Amount
  const makingChargesAmount = useMemo(() => {
    const val = parseFloat(makingValue) || 0;
    if (makingMode === 'percent') {
      return Math.round((metalCost * val) / 100);
    } else if (makingMode === 'perGram') {
      return Math.round(computedNetWeight * val);
    } else {
      return Math.round(val);
    }
  }, [makingMode, makingValue, metalCost, computedNetWeight]);

  // Subtotal before GST
  const stoneCost = parseFloat(stoneValue) || 0;
  const subtotal = metalCost + makingChargesAmount + stoneCost;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const totalAmount = subtotal + gstAmount;

  const handlePhotoSaved = (dataUrl) => {
    setImage(dataUrl);
    setSuccessMessage('Ornament photograph attached with AI background enhancement.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateItem = async (shouldAddToBill = true) => {
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Item description / name is required.');
      return;
    }
    const gross = parseFloat(grossWeight) || 0;
    if (gross <= 0) {
      setErrorMessage('Gross weight must be greater than 0 grams.');
      return;
    }
    if (computedNetWeight <= 0) {
      setErrorMessage('Net weight must be greater than 0 grams (Gross weight cannot be less than stone weight).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || `${karat}K ${selectedKaratInfo.label} - ${category.toUpperCase()}`,
      category,
      material,
      karat: material === 'gold' ? Number(karat) : 0,
      purityPercentage: selectedKaratInfo.purity,
      grossWeight: gross,
      stoneWeight: parseFloat(stoneWeight) || 0,
      netWeight: computedNetWeight,
      makingChargePerGram: makingMode === 'perGram' ? parseFloat(makingValue) || 0 : Math.round(makingChargesAmount / (computedNetWeight || 1)),
      makingChargeType: makingMode,
      makingChargeValue: parseFloat(makingValue) || 0,
      stoneValue: stoneCost,
      huid: huid.trim().toUpperCase(),
      barcode: barcode.trim(),
      location,
      stock: parseInt(stockQty, 10) || 1,
      image: image || '',
      images: image ? [image] : []
    };

    let savedProduct = null;

    try {
      // Attempt backend persistence
      const res = await api.post('/billing/items', payload);
      if (res.data?.product) {
        savedProduct = res.data.product;
      }
    } catch (err) {
      console.warn('Backend item creation fallback to local client storage:', err.message);
      // Fallback local product object
      savedProduct = {
        _id: `local-item-${Date.now()}`,
        id: `local-item-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString()
      };
    }

    if (!savedProduct) {
      savedProduct = {
        _id: `local-item-${Date.now()}`,
        id: `local-item-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString()
      };
    }

    // Update local products cache for offline search
    try {
      const cachedStr = localStorage.getItem('glimmr_billing_products_cache');
      const cached = cachedStr ? JSON.parse(cachedStr) : [];
      const updated = [savedProduct, ...cached];
      localStorage.setItem('glimmr_billing_products_cache', JSON.stringify(updated));
    } catch {
      // ignore storage error
    }

    if (shouldAddToBill) {
      const billItem = {
        id: Date.now().toString(),
        productId: savedProduct._id || savedProduct.id,
        name: savedProduct.name,
        category: savedProduct.category,
        material: savedProduct.material,
        karat: savedProduct.karat,
        weight: savedProduct.grossWeight || computedNetWeight,
        netWeight: computedNetWeight,
        ratePerGram,
        purityPercent: selectedKaratInfo.purity,
        makingChargeType: makingMode,
        makingChargeValue: parseFloat(makingValue) || 0,
        makingCharges: makingChargesAmount,
        metalCost,
        gemstoneCost: stoneCost,
        subtotal,
        gstTax: gstAmount,
        totalPrice: totalAmount,
        quantity: 1,
        image: image || '',
        fineWeight,
        isCustomItem: true,
        huid: huid.trim().toUpperCase(),
        barcode: barcode.trim()
      };

      if (onItemCreatedAndAdded) {
        onItemCreatedAndAdded(billItem, savedProduct);
      }
    } else {
      if (onItemCreatedOnly) {
        onItemCreatedOnly(savedProduct);
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white border-2 border-[#B59A6C] rounded-none shadow-2xl w-full max-w-4xl my-auto overflow-hidden font-body text-slate-800"
        >
          {/* Header styled as BUSY 21 ERP Jewelry Master Form */}
          <div className="bg-[#07162C] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#B59A6C]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#B59A6C] rounded-none" />
              <h2 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-white">
                BUSY 21 • Add New Item Master (Jewellery Entry)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-none text-gray-300">
                F3 / Esc to Exit
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto space-y-5">
            {errorMessage && (
              <div className="p-2.5 bg-red-50 border-l-4 border-red-600 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-2.5 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Grid 1: Basic Information */}
            <div className="border border-gray-200 bg-[#FAF9F7] p-3.5 space-y-3">
              <div className="text-[11px] font-mono font-bold text-[#8C6D37] uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                1. Item Identification & Classification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Item Name / Description *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 22K Antique Polki Choker Necklace"
                    className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#B59A6C] focus:ring-1 focus:ring-[#B59A6C]"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Item Group / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Metal Type
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  >
                    <option value="gold">Gold (Sona)</option>
                    <option value="silver">Silver (Chandi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Purity / Karatage
                  </label>
                  {material === 'gold' ? (
                    <select
                      value={karat}
                      onChange={(e) => setKarat(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                    >
                      {KARAT_OPTIONS.map(opt => (
                        <option key={opt.karat} value={opt.karat}>{opt.karat}K ({opt.purity}%)</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-gray-100 border border-gray-300 px-2.5 py-2 text-xs font-mono text-gray-700">
                      Silver 99.9% / 92.5%
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    BIS Hallmark HUID
                  </label>
                  <input
                    type="text"
                    value={huid}
                    onChange={(e) => setHuid(e.target.value.toUpperCase().slice(0, 8))}
                    placeholder="e.g. MH916K"
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono font-bold tracking-wider text-[#8C6D37] focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Barcode / SKU Tag
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Auto generated"
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono text-gray-700 focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2: Precision Weights & Bullion Calculations */}
            <div className="border border-gray-200 bg-[#FAF9F7] p-3.5 space-y-3">
              <div className="text-[11px] font-mono font-bold text-[#8C6D37] uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  2. Weight Breakdown & Live Bullion Pricing
                </div>
                <span className="text-[9px] font-mono text-gray-500 font-normal">
                  Live Rate: Rs. {ratePerGram.toLocaleString()}/g ({material === 'gold' ? `${karat}K Gold` : 'Silver'})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Gross Weight (g) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Stone Wt Deduction (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={stoneWeight}
                    onChange={(e) => setStoneWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-emerald-700 font-bold mb-1">
                    Net Pure Metal Wt (g)
                  </label>
                  <div className="w-full bg-emerald-50 border border-emerald-300 px-2.5 py-2 text-xs font-mono font-bold text-emerald-800">
                    {computedNetWeight.toFixed(3)} g
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#8C6D37] font-bold mb-1">
                    Fine Metal Wt (g)
                  </label>
                  <div className="w-full bg-amber-50 border border-amber-300 px-2.5 py-2 text-xs font-mono font-bold text-[#8C6D37]">
                    {fineWeight.toFixed(3)} g
                  </div>
                </div>
              </div>

              {/* Making charges & Stone valuation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Making Charge Type
                  </label>
                  <select
                    value={makingMode}
                    onChange={(e) => setMakingMode(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  >
                    <option value="percent">Percentage (%) on Gold</option>
                    <option value="perGram">Per Gram Rate (Rs./g)</option>
                    <option value="flat">Flat Lumpsum (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Making Charge Value {makingMode === 'percent' ? '(%)' : '(Rs.)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={makingValue}
                    onChange={(e) => setMakingValue(e.target.value)}
                    placeholder={makingMode === 'percent' ? '12' : '450'}
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Stone / Gemstone Value (Rs.)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={stoneValue}
                    onChange={(e) => setStoneValue(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
              </div>
            </div>

            {/* Grid 3: Real Photo & Anti-Counterfeit Bill Proof */}
            <div className="border border-gray-200 bg-[#FAF9F7] p-3.5 space-y-3">
              <div className="text-[11px] font-mono font-bold text-[#8C6D37] uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  3. Real Ornament Photograph (Printed on Bill as Anti-Fraud Proof)
                </div>
                <span className="text-[9px] font-mono text-emerald-700 font-bold">
                  Anti-Counterfeit Protection
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-[#B59A6C] bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {image ? (
                    <img
                      src={image}
                      alt="Ornament Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-gray-400 block leading-tight">No Photo Attached</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Attach a live camera photo or high-resolution upload of this ornament. The photograph will be permanently printed on the official counter tax invoice to prevent customer return fraud and counter disputes.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#07162C] text-[#B59A6C] text-xs font-bold hover:bg-[#0b2447] transition-colors border border-[#B59A6C]/40 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {image ? 'Change Photo (Camera / Upload)' : 'Capture Live Photo / Upload'}
                    </button>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-800 transition-colors font-medium cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 4: Material Centre & Location */}
            <div className="border border-gray-200 bg-[#FAF9F7] p-3.5 space-y-3">
              <div className="text-[11px] font-mono font-bold text-[#8C6D37] uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                4. Showroom Inventory Control
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Material Centre / Godown Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  >
                    {MATERIAL_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 font-bold mb-1">
                    Initial Stock Quantity (Pieces)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2.5 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
              </div>
            </div>

            {/* Real-Time Bullion Billing Preview Box */}
            <div className="bg-[#07162C] text-white p-3.5 border-l-4 border-[#B59A6C]">
              <div className="text-[10px] font-mono text-[#B59A6C] uppercase font-bold tracking-wider mb-2">
                Live Calculation Preview (Ready for Bill Voucher)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Metal Cost</span>
                  <span className="font-bold text-white">Rs. {metalCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Making Charges</span>
                  <span className="font-bold text-white">Rs. {makingChargesAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Stones / Gems</span>
                  <span className="font-bold text-white">Rs. {stoneCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">3% GST (Tax)</span>
                  <span className="font-bold text-white">Rs. {gstAmount.toLocaleString()}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/20 pt-1 sm:pt-0 sm:pl-2">
                  <span className="text-[#B59A6C] block text-[9px] uppercase font-bold">Estimated Total</span>
                  <span className="font-extrabold text-sm text-[#B59A6C]">Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel (Esc)
            </button>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => handleCreateItem(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Save to Master Inventory Only
              </button>
              <button
                type="button"
                onClick={() => handleCreateItem(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2 bg-[#B59A6C] text-[#07162C] text-xs font-extrabold uppercase tracking-wider hover:bg-[#c4ab7e] transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Saving Master...' : 'Save & Add to Active Bill'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sub-modal: Live Camera & AI Studio Photo Enhancer */}
      {isPhotoModalOpen && (
        <PhotoCaptureModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          onPhotoCaptured={handlePhotoSaved}
          initialPhoto={image}
          title="Capture Real Ornament Photo for Item Master"
        />
      )}
    </>
  );
}
