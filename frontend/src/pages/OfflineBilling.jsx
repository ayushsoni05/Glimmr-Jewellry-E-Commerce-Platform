import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { getProductImage } from '../utils/productImages';
import { calculateProductLivePrice, KARAT_PURITY, DIAMOND_CUT_MULTIPLIERS, DIAMOND_COLOR_MULTIPLIERS, DIAMOND_CLARITY_MULTIPLIERS } from '../utils/productPricing';
import { AVAILABLE_VOUCHERS, validateVoucher } from '../utils/voucherConfig';
import { getNextBillNumber, saveBillLocally, getSavedBills, getCachedRates, setCachedRates } from '../utils/billingStorage';
import BillingInvoice from '../components/BillingInvoice';
import { ShieldCheckIcon, TrashIcon, CheckCircleIcon, TagIcon } from '../components/Icons';

const CATEGORIES = ['all', 'rings', 'necklaces', 'bracelet', 'earring', 'watches'];

const MATERIALS = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'platinum', label: 'Platinum' }
];

const KARATS_GOLD = [
  { value: 24, label: '24K (99.9%)' },
  { value: 22, label: '22K (91.6%)' },
  { value: 18, label: '18K (75.0%)' },
  { value: 14, label: '14K (58.3%)' }
];

const KARATS_SILVER = [
  { value: 999, label: '999 (99.9%)' },
  { value: 925, label: '925 (92.5%)' }
];

const IMAGE_PRESETS = [
  { id: 'ring', label: 'Ring', url: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png' },
  { id: 'necklace', label: 'Necklace', url: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png' },
  { id: 'bracelet', label: 'Bracelet', url: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png' },
  { id: 'earring', label: 'Earring', url: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png' },
  { id: 'watch', label: 'Watch', url: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png' },
  { id: 'bangle', label: 'Bangle', url: 'https://framerusercontent.com/images/oXkONPSRmFprwc033T5YO7KhozQ.png' },
  { id: 'coin', label: 'Gold Coin', url: 'https://framerusercontent.com/images/5i3Ogk0kW9go0xeNU7Vxv5OMMQ.png' },
  { id: 'heart', label: 'Pendant', url: 'https://framerusercontent.com/images/ObqkR0R5JsxlwfTh6qRzuVS0Kc.png' }
];

const GST_PRESETS = [
  { label: '0% (Exempt)', value: 0 },
  { label: '1.5%', value: 1.5 },
  { label: '3% (Standard)', value: 3 },
  { label: '5%', value: 5 }
];

const OfflineBilling = () => {
  // Products & Search
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [productsLoading, setProductsLoading] = useState(true);

  // Metal Rates (Owner Editable)
  const [liveRates, setLiveRates] = useState(() => {
    const cached = getCachedRates();
    return cached || { gold: 15600, silver: 235 };
  });
  const [marketRates, setMarketRates] = useState({ gold: 15600, silver: 235 });
  const [rateStatus, setRateStatus] = useState('cached'); // 'live' | 'cached' | 'custom'
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [customGoldRate, setCustomGoldRate] = useState('15600');
  const [customSilverRate, setCustomSilverRate] = useState('235');

  // Dynamic GST Controls (Owner Configurable)
  const [gstRate, setGstRate] = useState(3); // Default 3% for fine jewelry (1.5% CGST + 1.5% SGST)
  const [isCustomGst, setIsCustomGst] = useState(false);
  const [customGstInput, setCustomGstInput] = useState('3');
  const [taxSplitMode, setTaxSplitMode] = useState('split'); // 'split' = CGST+SGST, 'single' = Unified GST / IGST

  // Dynamic Making Charges Controls (Owner Configurable)
  const [defaultMakingRate, setDefaultMakingRate] = useState(450);
  const [bulkMakingRateInput, setBulkMakingRateInput] = useState('450');
  const [makingConcessionPercent, setMakingConcessionPercent] = useState(0); // 0, 25, 50, 100
  const [showMakingTools, setShowMakingTools] = useState(false);

  // Bill Line Items
  const [billItems, setBillItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemForm, setEditItemForm] = useState({});

  // Owner & Customer Info (Filled by Owner)
  const [operatorName, setOperatorName] = useState('Owner');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(''); // Strict 10-digit limit
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState(''); // Strict 15-char limit
  const [billNotes, setBillNotes] = useState('');

  // Payment Method & Tracking
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card' | 'upi' | 'mixed'
  const [cashReceived, setCashReceived] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Old Gold Exchange / Scrap Buyback (Owner Filled)
  const [hasOldGold, setHasOldGold] = useState(false);
  const [oldGoldWeight, setOldGoldWeight] = useState('');
  const [oldGoldKarat, setOldGoldKarat] = useState('22');
  const [oldGoldRate, setOldGoldRate] = useState('');

  // Discounts & Vouchers
  const [cashDiscountInput, setCashDiscountInput] = useState('');
  const [appliedCashDiscount, setAppliedCashDiscount] = useState(0);
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // Custom Item Drawer (Owner Filled)
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: '',
    material: 'gold',
    karat: 22,
    weight: '',
    stoneWeight: '',
    makingChargeRate: 450,
    hasDiamond: false,
    diamondCarat: '',
    diamondCut: 'excellent',
    diamondColor: 'G',
    diamondClarity: 'VS1',
    diamondPrice: '',
    image: IMAGE_PRESETS[0].url
  });

  // Modals & History
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceBillData, setInvoiceBillData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [billHistory, setBillHistory] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch catalog products
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await api.get('/products');
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
          ? res.data.products
          : [];
        setProducts(list);
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch live market rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/prices/latest');
        if (res.data) {
          const rates = {
            gold: res.data.gold?.price || 15600,
            silver: res.data.silver?.price || 235
          };
          setMarketRates(rates);
          setCachedRates(rates);
          if (rateStatus !== 'custom') {
            setLiveRates(rates);
            setCustomGoldRate(String(rates.gold));
            setCustomSilverRate(String(rates.silver));
            setRateStatus('live');
          }
        }
      } catch {
        const cached = getCachedRates();
        if (cached) {
          setMarketRates(cached);
          if (rateStatus !== 'custom') {
            setLiveRates(cached);
            setCustomGoldRate(String(cached.gold));
            setCustomSilverRate(String(cached.silver));
            setRateStatus('cached');
          }
        }
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [rateStatus]);

  // Load saved bills history
  useEffect(() => {
    if (showHistory) {
      const saved = getSavedBills();
      setBillHistory(Array.isArray(saved) ? saved : []);
    }
  }, [showHistory]);

  // Filter products safely
  const filteredProducts = useMemo(() => {
    const rawList = Array.isArray(products)
      ? products
      : Array.isArray(products?.products)
      ? products.products
      : [];
    let list = rawList;
    if (activeCategory !== 'all') {
      list = list.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    return Array.isArray(list) ? list : [];
  }, [products, activeCategory, searchQuery]);

  // Rate override handler
  const handleApplyCustomRates = () => {
    const gRate = parseFloat(customGoldRate) || liveRates.gold;
    const sRate = parseFloat(customSilverRate) || liveRates.silver;
    const newRates = { gold: gRate, silver: sRate };
    setLiveRates(newRates);
    setRateStatus('custom');
    setIsEditingRates(false);

    // Recalculate existing items with new rates and current GST rate
    setBillItems(prevItems => prevItems.map(item => {
      const rate = item.material === 'silver' ? sRate : gRate;
      const purityMult = KARAT_PURITY[item.karat] || (item.karat / 24);
      const rawMetalCost = Math.round(item.weight * rate * purityMult);
      const makingCharges = Math.round(item.weight * (item.makingChargeRate || defaultMakingRate));
      const subtotal = rawMetalCost + makingCharges + (item.gemstoneCost || 0);
      const gstTax = Math.round(subtotal * (gstRate / 100));
      return {
        ...item,
        metalCost: rawMetalCost,
        makingCharges,
        subtotal,
        gstTax,
        totalPrice: subtotal + gstTax
      };
    }));
  };

  const handleResetToMarketRates = () => {
    setLiveRates(marketRates);
    setCustomGoldRate(String(marketRates.gold));
    setCustomSilverRate(String(marketRates.silver));
    setRateStatus('live');
    setIsEditingRates(false);
  };

  // GST Rate Change Handler
  const handleSelectGstRate = (newRate) => {
    const r = Math.max(0, parseFloat(newRate) || 0);
    setGstRate(r);
    setIsCustomGst(false);
    setCustomGstInput(String(r));

    // Recalculate taxes for all line items
    setBillItems(prevItems => prevItems.map(item => {
      const gstTax = Math.round(item.subtotal * (r / 100));
      return {
        ...item,
        gstTax,
        totalPrice: item.subtotal + gstTax
      };
    }));
  };

  const handleApplyCustomGst = (val) => {
    const target = val !== undefined ? val : customGstInput;
    const r = Math.max(0, parseFloat(target) || 0);
    setGstRate(r);
    setBillItems(prevItems => prevItems.map(item => {
      const gstTax = Math.round(item.subtotal * (r / 100));
      return {
        ...item,
        gstTax,
        totalPrice: item.subtotal + gstTax
      };
    }));
  };

  // Making Charges Handlers
  const handleUpdateItemMakingRate = (itemId, newRate) => {
    const rateNum = Math.max(0, parseFloat(newRate) || 0);
    setBillItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const baseMetalRate = item.material === 'silver' ? liveRates.silver : liveRates.gold;
      const purityMult = KARAT_PURITY[item.karat] || (item.karat / 24);
      const metalCost = Math.round((item.netWeight || item.weight) * baseMetalRate * purityMult);
      const makingCharges = Math.round(item.weight * rateNum);
      const subtotal = metalCost + makingCharges + (item.gemstoneCost || 0);
      const gstTax = Math.round(subtotal * (gstRate / 100));
      return {
        ...item,
        makingChargeRate: rateNum,
        metalCost,
        makingCharges,
        subtotal,
        gstTax,
        totalPrice: subtotal + gstTax
      };
    }));
  };

  const handleApplyGlobalMakingRate = () => {
    const rateNum = Math.max(0, parseFloat(bulkMakingRateInput) || 0);
    setDefaultMakingRate(rateNum);
    setBillItems(prev => prev.map(item => {
      const baseMetalRate = item.material === 'silver' ? liveRates.silver : liveRates.gold;
      const purityMult = KARAT_PURITY[item.karat] || (item.karat / 24);
      const metalCost = Math.round((item.netWeight || item.weight) * baseMetalRate * purityMult);
      const makingCharges = Math.round(item.weight * rateNum);
      const subtotal = metalCost + makingCharges + (item.gemstoneCost || 0);
      const gstTax = Math.round(subtotal * (gstRate / 100));
      return {
        ...item,
        makingChargeRate: rateNum,
        metalCost,
        makingCharges,
        subtotal,
        gstTax,
        totalPrice: subtotal + gstTax
      };
    }));
    setShowMakingTools(false);
  };

  // Calculate live price for catalog product
  const getLivePrice = useCallback((product) => {
    const rates = {
      gold: { price: liveRates.gold },
      silver: { price: liveRates.silver }
    };
    const res = calculateProductLivePrice(product, rates);
    // Adjust for current gstRate
    const subtotal = res.rawMetalCost + res.makingCharges + (res.gemstoneCost || 0);
    const gstTax = Math.round(subtotal * (gstRate / 100));
    return {
      ...res,
      subtotal,
      gstTax,
      totalLivePrice: subtotal + gstTax
    };
  }, [liveRates, gstRate]);

  // Calculate custom item price
  const calculateCustomItemPrice = useCallback((item) => {
    const grossWeight = parseFloat(item.weight) || 0;
    const stoneWeight = parseFloat(item.stoneWeight) || 0;
    const netWeight = Math.max(0, grossWeight - stoneWeight);
    const makingRate = parseFloat(item.makingChargeRate) || defaultMakingRate;
    const material = item.material;
    const karat = Number(item.karat);

    const baseRate = material === 'silver' ? liveRates.silver : liveRates.gold;
    const purityMult = KARAT_PURITY[karat] || (karat / 24);
    const rawMetalCost = Math.round(netWeight * baseRate * purityMult);
    const makingCharges = Math.round(grossWeight * makingRate);

    let gemstoneCost = 0;
    if (item.diamondPrice && parseFloat(item.diamondPrice) > 0) {
      gemstoneCost = parseFloat(item.diamondPrice);
    } else if (item.hasDiamond && parseFloat(item.diamondCarat) > 0) {
      const caratWeight = parseFloat(item.diamondCarat);
      const cutMult = DIAMOND_CUT_MULTIPLIERS[item.diamondCut] || 1;
      const colorMult = DIAMOND_COLOR_MULTIPLIERS[item.diamondColor] || 1;
      const clarityMult = DIAMOND_CLARITY_MULTIPLIERS[item.diamondClarity] || 1;
      const ratePerCarat = Math.round(65000 * cutMult * colorMult * clarityMult);
      gemstoneCost = Math.round(caratWeight * ratePerCarat);
    }

    const subtotal = rawMetalCost + makingCharges + gemstoneCost;
    const gstTax = Math.round(subtotal * (gstRate / 100));
    const totalLivePrice = subtotal + gstTax;

    return {
      rawMetalCost,
      makingCharges,
      gemstoneCost,
      subtotal,
      gstTax,
      totalLivePrice,
      weight: grossWeight,
      netWeight,
      karat,
      material
    };
  }, [liveRates, defaultMakingRate, gstRate]);

  // Add catalog product to bill
  const addProductToBill = useCallback((product) => {
    const existing = billItems.find(bi => bi.productId === (product._id || product.id));
    if (existing) {
      setBillItems(prev => prev.map(bi =>
        bi.productId === (product._id || product.id)
          ? { ...bi, quantity: bi.quantity + 1 }
          : bi
      ));
      return;
    }

    const bd = getLivePrice(product);
    const imgSrc = getProductImage(product);

    setBillItems(prev => [...prev, {
      id: Date.now().toString(),
      productId: product._id || product.id,
      name: product.name,
      material: product.material || 'gold',
      karat: Number(product.karat) || 22,
      weight: Number(product.metalWeight || product.weight) || 0,
      netWeight: Number(product.metalWeight || product.weight) || 0,
      makingChargeRate: defaultMakingRate,
      metalCost: bd.rawMetalCost,
      makingCharges: bd.makingCharges,
      gemstoneCost: bd.gemstoneCost || 0,
      subtotal: bd.subtotal,
      gstTax: bd.gstTax,
      totalPrice: bd.totalLivePrice,
      quantity: 1,
      image: imgSrc,
      isCustomItem: false
    }]);
  }, [billItems, getLivePrice, defaultMakingRate]);

  // Add bespoke custom item
  const addCustomItemToBill = useCallback(() => {
    if (!customItem.weight || parseFloat(customItem.weight) <= 0) return;

    const bd = calculateCustomItemPrice(customItem);
    const defaultName = `Custom ${customItem.material.charAt(0).toUpperCase() + customItem.material.slice(1)} ${customItem.karat}K`;

    setBillItems(prev => [...prev, {
      id: Date.now().toString(),
      productId: null,
      name: customItem.name.trim() || defaultName,
      material: customItem.material,
      karat: Number(customItem.karat),
      weight: parseFloat(customItem.weight),
      netWeight: bd.netWeight,
      makingChargeRate: parseFloat(customItem.makingChargeRate) || defaultMakingRate,
      metalCost: bd.rawMetalCost,
      makingCharges: bd.makingCharges,
      gemstoneCost: bd.gemstoneCost,
      subtotal: bd.subtotal,
      gstTax: bd.gstTax,
      totalPrice: bd.totalLivePrice,
      quantity: 1,
      image: customItem.image || IMAGE_PRESETS[0].url,
      isCustomItem: true
    }]);

    setCustomItem({
      name: '',
      material: 'gold',
      karat: 22,
      weight: '',
      stoneWeight: '',
      makingChargeRate: defaultMakingRate,
      hasDiamond: false,
      diamondCarat: '',
      diamondCut: 'excellent',
      diamondColor: 'G',
      diamondClarity: 'VS1',
      diamondPrice: '',
      image: IMAGE_PRESETS[0].url
    });
    setShowCustomForm(false);
  }, [customItem, calculateCustomItemPrice, defaultMakingRate]);

  // Edit line item modal/drawer
  const handleStartEditItem = (item) => {
    setEditingItemId(item.id);
    setEditItemForm({
      name: item.name,
      weight: item.weight,
      karat: item.karat,
      material: item.material,
      makingChargeRate: item.makingChargeRate || defaultMakingRate,
      gemstoneCost: item.gemstoneCost || 0,
      image: item.image
    });
  };

  const handleSaveEditItem = (itemId) => {
    setBillItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      const weight = parseFloat(editItemForm.weight) || item.weight;
      const makingRate = parseFloat(editItemForm.makingChargeRate) || defaultMakingRate;
      const karat = Number(editItemForm.karat) || item.karat;
      const material = editItemForm.material || item.material;
      const gemstoneCost = parseFloat(editItemForm.gemstoneCost) || 0;

      const baseRate = material === 'silver' ? liveRates.silver : liveRates.gold;
      const purityMult = KARAT_PURITY[karat] || (karat / 24);
      const rawMetalCost = Math.round(weight * baseRate * purityMult);
      const makingCharges = Math.round(weight * makingRate);
      const subtotal = rawMetalCost + makingCharges + gemstoneCost;
      const gstTax = Math.round(subtotal * (gstRate / 100));

      return {
        ...item,
        name: editItemForm.name || item.name,
        weight,
        netWeight: weight,
        karat,
        material,
        makingChargeRate: makingRate,
        gemstoneCost,
        metalCost: rawMetalCost,
        makingCharges,
        subtotal,
        gstTax,
        totalPrice: subtotal + gstTax,
        image: editItemForm.image || item.image
      };
    }));
    setEditingItemId(null);
  };

  // Quantity controls
  const updateQuantity = useCallback((itemId, delta) => {
    setBillItems(prev => prev.map(bi => {
      if (bi.id === itemId) {
        const newQty = Math.max(1, bi.quantity + delta);
        return { ...bi, quantity: newQty };
      }
      return bi;
    }));
  }, []);

  const removeItem = useCallback((itemId) => {
    setBillItems(prev => prev.filter(bi => bi.id !== itemId));
  }, []);

  // Customer Phone Input Handler (Strict 10 Digits)
  const handleCustomerPhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(digitsOnly);
  };

  // Customer GSTIN Input Handler (Strict 15 Chars, Uppercase Alphanumeric)
  const handleCustomerGstinChange = (e) => {
    const alphanumeric = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    setCustomerGstin(alphanumeric);
  };

  // Old Gold Exchange Deduction
  const oldGoldDeduction = useMemo(() => {
    if (!hasOldGold) return 0;
    const wt = parseFloat(oldGoldWeight) || 0;
    if (wt <= 0) return 0;
    const rate = parseFloat(oldGoldRate) || (liveRates.gold * 0.95);
    const karat = Number(oldGoldKarat) || 22;
    const purity = KARAT_PURITY[karat] || (karat / 24);
    return Math.round(wt * rate * purity);
  }, [hasOldGold, oldGoldWeight, oldGoldRate, oldGoldKarat, liveRates]);

  // Grand Totals Calculation
  const billTotals = useMemo(() => {
    let totalMetal = 0, rawTotalMaking = 0, totalDiamond = 0, baseSubtotal = 0;
    billItems.forEach(bi => {
      totalMetal += bi.metalCost * bi.quantity;
      rawTotalMaking += bi.makingCharges * bi.quantity;
      totalDiamond += bi.gemstoneCost * bi.quantity;
      baseSubtotal += bi.subtotal * bi.quantity;
    });

    // Making charge concession discount
    const makingConcessionDiscount = makingConcessionPercent > 0
      ? Math.round((rawTotalMaking * makingConcessionPercent) / 100)
      : 0;
    const totalMaking = Math.max(0, rawTotalMaking - makingConcessionDiscount);

    const subtotal = totalMetal + totalMaking + totalDiamond;
    const totalGst = Math.round(subtotal * (gstRate / 100));
    const cgst = taxSplitMode === 'single' ? 0 : Math.round(totalGst / 2);
    const sgst = taxSplitMode === 'single' ? 0 : (totalGst - cgst);
    const igst = taxSplitMode === 'single' ? totalGst : 0;
    const totalGrand = subtotal + totalGst;

    let voucherDiscount = 0;
    if (appliedVoucher) {
      voucherDiscount = appliedVoucher.calculatedDiscount || 0;
    }

    const directDiscount = appliedCashDiscount || 0;
    const totalDiscount = voucherDiscount + directDiscount;
    const totalPayable = Math.max(0, totalGrand - totalDiscount - oldGoldDeduction);

    return {
      totalMetal,
      rawTotalMaking,
      makingConcessionDiscount,
      totalMaking,
      totalDiamond,
      subtotal,
      cgst,
      sgst,
      igst,
      totalGst,
      taxSplitMode,
      voucherDiscount,
      directDiscount,
      totalDiscount,
      totalPayable,
      totalGrand,
      oldGoldDeduction
    };
  }, [billItems, appliedVoucher, appliedCashDiscount, oldGoldDeduction, gstRate, taxSplitMode, makingConcessionPercent]);

  // Cash change calculation
  const changeToReturn = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    if (received <= 0 || received < billTotals.totalPayable) return 0;
    return received - billTotals.totalPayable;
  }, [cashReceived, billTotals.totalPayable]);

  // Cash Discount Handlers
  const handleApplyCashDiscount = () => {
    const val = parseFloat(cashDiscountInput) || 0;
    if (val > 0) {
      setAppliedCashDiscount(val);
      setVoucherSuccess(`Cash Discount of Rs.${val.toLocaleString('en-IN')} applied.`);
      setTimeout(() => setVoucherSuccess(''), 4000);
    }
  };

  const handleRemoveCashDiscount = () => {
    setAppliedCashDiscount(0);
    setCashDiscountInput('');
  };

  // Round-off helper
  const handleQuickRoundOff = () => {
    const remainder = billTotals.totalPayable % 100;
    if (remainder > 0) {
      const newTotal = appliedCashDiscount + remainder;
      setAppliedCashDiscount(newTotal);
      setCashDiscountInput(String(newTotal));
    }
  };

  // Voucher apply & remove (Supports standard vouchers AND percentage codes like 10%)
  const handleApplyVoucher = useCallback((codeToUse) => {
    const rawCode = (codeToUse || voucherInput || '').trim();
    if (!rawCode) return;
    setVoucherError('');
    setVoucherSuccess('');

    // Check if code is a percentage discount (e.g. "10%" or "5%" or "20%")
    const percentMatch = rawCode.match(/^(\d{1,2})%?$/);
    if (percentMatch && rawCode.includes('%')) {
      const pct = parseInt(percentMatch[1], 10);
      if (pct > 0 && pct <= 90) {
        const discountVal = Math.round((billTotals.subtotal * pct) / 100);
        setAppliedVoucher({
          code: `${pct}% OFF`,
          discountPercent: pct,
          calculatedDiscount: discountVal,
          name: `${pct}% Concession Privilege`
        });
        setVoucherInput('');
        setVoucherSuccess(`${pct}% Concession applied (-Rs.${discountVal.toLocaleString('en-IN')})`);
        setTimeout(() => setVoucherSuccess(''), 4000);
        return;
      }
    }

    const result = validateVoucher(rawCode, billTotals.subtotal);
    if (result.valid) {
      setAppliedVoucher(result.voucher);
      setVoucherInput('');
      setVoucherSuccess(`Voucher ${result.voucher.code} applied (-Rs.${result.voucher.calculatedDiscount.toLocaleString('en-IN')})`);
      setTimeout(() => setVoucherSuccess(''), 4000);
    } else {
      setVoucherError(result.message || 'Invalid or expired voucher code');
    }
  }, [voucherInput, billTotals.subtotal]);

  const handleRemoveVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherError('');
    setVoucherSuccess('');
  }, []);

  // Generate and save invoice
  const handleGenerateInvoice = useCallback(() => {
    if (billItems.length === 0) return;

    const billNumber = getNextBillNumber();
    const now = new Date().toISOString();

    const billData = {
      id: billNumber,
      billNumber,
      date: now,
      customer: {
        name: customerName || 'Walk-in Customer',
        phone: customerPhone,
        address: customerAddress,
        gstin: customerGstin
      },
      items: billItems.map(bi => ({ ...bi })),
      totalMetal: billTotals.totalMetal,
      totalMaking: billTotals.totalMaking,
      totalDiamond: billTotals.totalDiamond,
      subtotal: billTotals.subtotal,
      gstRate,
      taxSplitMode,
      totalGst: billTotals.totalGst,
      cgst: billTotals.cgst,
      sgst: billTotals.sgst,
      igst: billTotals.igst,
      discountAmount: billTotals.totalDiscount,
      couponCode: appliedVoucher?.code || (billTotals.directDiscount > 0 ? 'STORE_DISCOUNT' : ''),
      oldGoldDeduction: billTotals.oldGoldDeduction,
      oldGoldDetails: hasOldGold ? {
        weight: parseFloat(oldGoldWeight) || 0,
        purity: `${oldGoldKarat}K`,
        rate: parseFloat(oldGoldRate) || liveRates.gold
      } : {},
      totalPayable: billTotals.totalPayable,
      paymentMethod,
      paymentReference,
      cashReceived: paymentMethod === 'cash' ? (parseFloat(cashReceived) || 0) : 0,
      changeReturned: paymentMethod === 'cash' ? changeToReturn : 0,
      goldRateUsed: liveRates.gold,
      silverRateUsed: liveRates.silver,
      operator: operatorName || 'Owner',
      notes: billNotes,
      synced: false
    };

    saveBillLocally(billData);

    try {
      api.post('/billing', billData).catch(() => {});
    } catch { /* offline fallback: saved locally */ }

    setInvoiceBillData(billData);
    setShowInvoice(true);
  }, [
    billItems, billTotals, customerName, customerPhone, customerAddress, customerGstin,
    operatorName, billNotes, paymentMethod, paymentReference, cashReceived, changeToReturn,
    liveRates, appliedVoucher, hasOldGold, oldGoldWeight, oldGoldKarat, oldGoldRate, gstRate, taxSplitMode
  ]);

  const handleClearBill = useCallback(() => {
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerGstin('');
    setCashReceived('');
    setPaymentReference('');
    setCashDiscountInput('');
    setAppliedCashDiscount(0);
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
    setVoucherSuccess('');
    setHasOldGold(false);
    setOldGoldWeight('');
    setBillNotes('');
    setMakingConcessionPercent(0);
    setShowClearConfirm(false);
  }, []);

  const handleSaveAndNew = useCallback(() => {
    if (billItems.length > 0) {
      handleGenerateInvoice();
    }
    setTimeout(() => {
      handleClearBill();
      setShowInvoice(false);
    }, 200);
  }, [billItems, handleGenerateInvoice, handleClearBill]);

  const currentDateTime = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  }) + ' | ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const karatOptions = customItem.material === 'silver' ? KARATS_SILVER : KARATS_GOLD;

  return (
    <div className="min-h-screen bg-[#FAF9F7]">

      {/* TOP ATELIER BAR */}
      <div className="bg-[#222222] text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-[#B59A6C]/30">
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-[0.15em] uppercase">Glimmr Atelier Billing</h1>
            <span className="text-[10px] font-mono font-bold text-[#B59A6C] bg-[#B59A6C]/20 border border-[#B59A6C]/40 px-2 py-0.5 uppercase tracking-wider">
              Offline POS
            </span>
          </div>

          {/* Metal Rates & Making Toolbar */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-body">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5">
              <span className={`w-2 h-2 rounded-full ${rateStatus === 'live' ? 'bg-emerald-400' : rateStatus === 'custom' ? 'bg-[#B59A6C]' : 'bg-amber-400'}`} />
              <span className="text-white/60">Gold 24K:</span>
              <span className="font-mono text-[#B59A6C] font-bold">Rs.{liveRates.gold.toLocaleString('en-IN')}/g</span>
              <span className="text-white/30">|</span>
              <span className="text-white/60">Silver 925:</span>
              <span className="font-mono text-[#B59A6C] font-bold">Rs.{liveRates.silver.toLocaleString('en-IN')}/g</span>
              {rateStatus === 'custom' && (
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase bg-emerald-950/60 px-1 py-0.5 ml-1">Owner Custom</span>
              )}
            </div>

            <button
              onClick={() => setIsEditingRates(!isEditingRates)}
              className="px-2.5 py-1.5 bg-[#B59A6C] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#A38B5F] transition-colors cursor-pointer"
            >
              {isEditingRates ? 'Close Rates' : 'Edit Metal Rates'}
            </button>

            <button
              onClick={() => setShowMakingTools(!showMakingTools)}
              className="px-2.5 py-1.5 bg-white/10 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-colors cursor-pointer"
            >
              {showMakingTools ? 'Close Making' : 'Making Charges'}
            </button>

            <span className="text-white/40 hidden xl:inline">{currentDateTime}</span>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 border border-white/20 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
            >
              {showHistory ? 'Return to POS' : 'Bill History'}
            </button>
          </div>
        </div>

        {/* Owner Custom Rate Editor Drawer */}
        <AnimatePresence>
          {isEditingRates && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 mt-3 pt-3"
            >
              <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center gap-4 py-2">
                <span className="text-xs text-[#B59A6C] font-bold uppercase tracking-widest whitespace-nowrap">
                  Custom Rates for this Billing Session:
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-white/60 uppercase">Gold (Rs./g):</label>
                  <input
                    type="number"
                    value={customGoldRate}
                    onChange={(e) => setCustomGoldRate(e.target.value)}
                    className="w-28 px-2 py-1 bg-black/60 border border-white/20 font-mono text-xs text-white focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-white/60 uppercase">Silver (Rs./g):</label>
                  <input
                    type="number"
                    value={customSilverRate}
                    onChange={(e) => setCustomSilverRate(e.target.value)}
                    className="w-28 px-2 py-1 bg-black/60 border border-white/20 font-mono text-xs text-white focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyCustomRates}
                    className="px-4 py-1.5 bg-[#B59A6C] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                  >
                    Apply to Bill
                  </button>
                  <button
                    onClick={handleResetToMarketRates}
                    className="px-3 py-1.5 border border-white/20 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer text-white/70"
                  >
                    Reset to Market
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Making Charges Tool Drawer */}
        <AnimatePresence>
          {showMakingTools && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 mt-3 pt-3"
            >
              <div className="max-w-[1520px] mx-auto flex flex-wrap items-center justify-between gap-4 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[#B59A6C] font-bold uppercase tracking-wider text-[10px]">
                    Store-wide Making Charge:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/60 text-[10px]">Rs.</span>
                    <input
                      type="number"
                      value={bulkMakingRateInput}
                      onChange={(e) => setBulkMakingRateInput(e.target.value)}
                      className="w-20 px-2 py-1 bg-black/60 border border-white/20 font-mono text-xs text-white focus:outline-none focus:border-[#B59A6C]"
                    />
                    <span className="text-white/60 text-[10px]">/g</span>
                    <button
                      onClick={handleApplyGlobalMakingRate}
                      className="px-3 py-1 bg-[#B59A6C] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors ml-1 cursor-pointer"
                    >
                      Update All Items
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-[10px] uppercase">Quick Making Discount:</span>
                  {[
                    { label: 'Standard (0%)', val: 0 },
                    { label: '25% Off', val: 25 },
                    { label: '50% Off', val: 50 },
                    { label: 'Free Making', val: 100 }
                  ].map((m) => (
                    <button
                      key={m.val}
                      onClick={() => setMakingConcessionPercent(m.val)}
                      className={`px-2 py-1 text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                        makingConcessionPercent === m.val
                          ? 'bg-[#B59A6C] text-black border-[#B59A6C]'
                          : 'bg-black/40 text-white/80 border-white/20 hover:border-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showHistory ? (
        /* BILL HISTORY VIEW */
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#111111]">Store Bill History</h2>
              <p className="text-xs font-body text-gray-500 mt-1">Audit log of all offline transactions and invoices created by store staff.</p>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 bg-[#222222] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors cursor-pointer"
            >
              + Create New Bill
            </button>
          </div>

          {billHistory.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 text-gray-400 font-body">
              No bills recorded yet. Create and generate your first invoice to view it here.
            </div>
          ) : (
            <div className="space-y-3">
              {billHistory.map((bill) => (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#B59A6C] transition-all shadow-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#FAF9F7] border border-gray-200 flex items-center justify-center font-mono font-bold text-[#B59A6C] text-sm shrink-0">
                      INV
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-[#111111]">{bill.billNumber || bill.id}</span>
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-700">
                          {bill.operator || 'Owner'}
                        </span>
                      </div>
                      <span className="text-[10px] font-body text-gray-500 block mt-0.5">
                        {new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs font-body text-gray-700 font-medium block mt-1">
                        Client: {bill.customer?.name || 'Walk-in'} {bill.customer?.phone ? `(${bill.customer.phone})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-body text-gray-400 uppercase block">Total Payable</span>
                      <span className="font-mono text-xl font-extrabold text-[#111111]">
                        Rs.{Number(bill.totalPayable).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 border ${
                      bill.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      bill.paymentMethod === 'card' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      bill.paymentMethod === 'upi' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {bill.paymentMethod}
                    </span>

                    <button
                      onClick={() => { setInvoiceBillData(bill); setShowInvoice(true); }}
                      className="px-4 py-2 border border-[#222222] text-[#222222] text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                    >
                      View Invoice
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MAIN SPLIT-PANEL BILLING INTERFACE */
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-7">

            {/* ==================================================== */}
            {/* LEFT PANEL (58%): Catalog, Search & Custom Item Entry */}
            {/* ==================================================== */}
            <div className="w-full lg:w-[58%] space-y-4">

              {/* Search & Custom Item Action Bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jewelry catalog by name, code, material..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 text-sm font-body text-[#222222] placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-all shadow-sm"
                  />
                </div>

                <button
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className={`px-5 py-3 text-xs font-body font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                    showCustomForm
                      ? 'bg-[#B59A6C] text-black'
                      : 'bg-[#222222] text-white hover:bg-[#B59A6C] hover:text-black'
                  }`}
                >
                  {showCustomForm ? 'Close Custom Item' : '+ Custom Jewelry Entry'}
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-[10px] font-body font-bold uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all ${
                      activeCategory === cat
                        ? 'bg-[#222222] text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-[#222222] hover:border-[#222222]'
                    }`}
                  >
                    {cat === 'all' ? 'All Pieces' : cat}
                  </button>
                ))}
              </div>

              {/* OWNER CUSTOM ITEM CREATION DRAWER */}
              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white border-2 border-[#B59A6C] p-5 sm:p-6 space-y-4 shadow-card">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">Owner Jewelry Entry</span>
                          <h3 className="font-heading text-lg font-bold text-[#111111]">Add Bespoke / Loose / Store Item</h3>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">All fields fully customizable</span>
                      </div>

                      {/* Select Preset Image or Enter URL */}
                      <div>
                        <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                          Select Product Visual Thumbnail (Required for Invoice)
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2">
                          {IMAGE_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setCustomItem(prev => ({ ...prev, image: preset.url }))}
                              className={`aspect-square p-1 border flex flex-col items-center justify-center transition-all bg-[#FAF9F7] cursor-pointer ${
                                customItem.image === preset.url
                                  ? 'border-[#B59A6C] ring-2 ring-[#B59A6C]/40 bg-white'
                                  : 'border-gray-200 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={preset.url} alt={preset.label} className="w-8 h-8 object-contain" />
                              <span className="text-[8px] font-body mt-1 text-gray-600 leading-none">{preset.label}</span>
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={customItem.image}
                          onChange={(e) => setCustomItem(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="Or paste custom image URL"
                          className="w-full px-3 py-1.5 bg-[#FAF9F7] border border-gray-200 text-xs font-mono text-gray-700 focus:outline-none focus:border-[#222222]"
                        />
                      </div>

                      {/* Main Item Spec Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Item Title</label>
                          <input
                            type="text"
                            value={customItem.name}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. 22K Traditional Kada / Ring"
                            className="w-full px-3 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Metal</label>
                          <select
                            value={customItem.material}
                            onChange={(e) => {
                              const mat = e.target.value;
                              setCustomItem(prev => ({
                                ...prev,
                                material: mat,
                                karat: mat === 'silver' ? 925 : 22
                              }));
                            }}
                            className="w-full px-2.5 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                          >
                            {MATERIALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Purity</label>
                          <select
                            value={customItem.karat}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, karat: Number(e.target.value) }))}
                            className="w-full px-2.5 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                          >
                            {karatOptions.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Gross Wt (g)</label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={customItem.weight}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, weight: e.target.value }))}
                            placeholder="e.g. 12.450"
                            className="w-full px-2.5 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Stone Wt (g)</label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={customItem.stoneWeight}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, stoneWeight: e.target.value }))}
                            placeholder="0.000"
                            className="w-full px-2.5 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                      </div>

                      {/* Making Charges & Diamond */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Making Charge (Rs./g)</label>
                          <input
                            type="number"
                            min="0"
                            value={customItem.makingChargeRate}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, makingChargeRate: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-body font-bold uppercase tracking-wider text-gray-600 mb-1">Fixed Stone Cost (Rs.)</label>
                          <input
                            type="number"
                            min="0"
                            value={customItem.diamondPrice}
                            onChange={(e) => setCustomItem(prev => ({ ...prev, diamondPrice: e.target.value }))}
                            placeholder="Optional lump sum"
                            className="w-full px-3 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                        </div>

                        <div className="col-span-2 flex items-center pt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customItem.hasDiamond}
                              onChange={(e) => setCustomItem(prev => ({ ...prev, hasDiamond: e.target.checked }))}
                              className="w-4 h-4 accent-[#B59A6C]"
                            />
                            <span className="text-xs font-body font-bold text-gray-700">Calculate Diamond using 4Cs Matrix</span>
                          </label>
                        </div>
                      </div>

                      {/* 4Cs Calculator */}
                      {customItem.hasDiamond && !customItem.diamondPrice && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F7] p-3 border border-gray-200">
                          <div>
                            <label className="block text-[8px] font-mono text-gray-500 uppercase">Diamond Carats</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={customItem.diamondCarat}
                              onChange={(e) => setCustomItem(prev => ({ ...prev, diamondCarat: e.target.value }))}
                              placeholder="0.75"
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono text-gray-500 uppercase">Cut</label>
                            <select
                              value={customItem.diamondCut}
                              onChange={(e) => setCustomItem(prev => ({ ...prev, diamondCut: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 font-mono text-xs"
                            >
                              {Object.keys(DIAMOND_CUT_MULTIPLIERS).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono text-gray-500 uppercase">Color</label>
                            <select
                              value={customItem.diamondColor}
                              onChange={(e) => setCustomItem(prev => ({ ...prev, diamondColor: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 font-mono text-xs"
                            >
                              {Object.keys(DIAMOND_COLOR_MULTIPLIERS).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono text-gray-500 uppercase">Clarity</label>
                            <select
                              value={customItem.diamondClarity}
                              onChange={(e) => setCustomItem(prev => ({ ...prev, diamondClarity: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 font-mono text-xs"
                            >
                              {Object.keys(DIAMOND_CLARITY_MULTIPLIERS).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Live Calculation Preview & Add Button */}
                      {parseFloat(customItem.weight) > 0 && (
                        <div className="flex items-center justify-between bg-[#FAF9F7] border border-gray-200 p-3 pt-4">
                          <div>
                            <span className="text-[10px] font-body uppercase tracking-wider text-gray-500 block">Calculated Item Total (incl. {gstRate}% GST):</span>
                            <span className="font-mono text-lg font-extrabold text-[#111111]">
                              Rs.{calculateCustomItemPrice(customItem).totalLivePrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <button
                            onClick={addCustomItemToBill}
                            className="px-6 py-2.5 bg-[#B59A6C] text-black text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer shadow-sm"
                          >
                            + Add to Bill
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CATALOG PRODUCT GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {productsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-3 animate-pulse">
                      <div className="aspect-square bg-gray-100 mb-3" />
                      <div className="h-3 bg-gray-100 mb-2 w-3/4" />
                      <div className="h-3 bg-gray-100 w-1/2" />
                    </div>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-400 font-body text-sm bg-white border border-dashed border-gray-200">
                    No catalog items found matching "{searchQuery}". You can use the "+ Custom Jewelry Entry" button above to add any custom piece.
                  </div>
                ) : (
                  filteredProducts.map((product, idx) => {
                    const liveCalc = getLivePrice(product);
                    const imgSrc = getProductImage(product);
                    const mat = (product.material || 'gold').toUpperCase();
                    const karat = product.karat || 22;
                    const weight = Number(product.metalWeight || product.weight) || 0;

                    return (
                      <motion.div
                        key={product._id || product.id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx % 8) * 0.02 }}
                        className="bg-white border border-gray-100 hover:border-[#B59A6C] transition-all group cursor-pointer shadow-sm flex flex-col justify-between"
                        onClick={() => addProductToBill(product)}
                      >
                        <div className="aspect-square bg-[#FAF9F7] p-4 flex items-center justify-center overflow-hidden relative">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-[#222222] text-white text-center py-1.5 text-[9px] font-body font-bold uppercase tracking-wider">
                              + Add to Bill
                            </div>
                          </div>
                        </div>

                        <div className="p-3 space-y-1">
                          <h3 className="font-heading font-bold text-xs text-[#111111] leading-snug line-clamp-2">{product.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono font-bold text-[#B59A6C] px-1.5 py-0.5 bg-[#FAF9F7] border border-[#B59A6C]/30">
                              {karat}K {mat}
                            </span>
                            {weight > 0 && (
                              <span className="text-[9px] font-mono text-gray-400">{weight}g</span>
                            )}
                          </div>
                          <p className="font-mono font-extrabold text-sm text-[#111111] pt-1">
                            Rs.{liveCalc.totalLivePrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT PANEL (42%): Current Bill, Owner Controls & Totals */}
            {/* ==================================================== */}
            <div className="w-full lg:w-[42%]">
              <div className="bg-white border border-gray-200 sticky top-24 shadow-card">

                {/* Console Top Header */}
                <div className="bg-[#111111] text-white p-4 flex justify-between items-center border-b border-[#B59A6C]/30">
                  <div>
                    <span className="text-[9px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">Point of Sale Terminal</span>
                    <span className="font-heading text-lg font-bold tracking-wider">Active Customer Bill</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#B59A6C] font-bold block">{billItems.length} Piece{billItems.length !== 1 ? 's' : ''}</span>
                    <span className="text-[9px] font-mono text-white/50">GST {gstRate}% Included</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">

                  {/* Operator & Customer Details (Owner Filled with Strict Limits) */}
                  <div className="bg-[#FAF9F7] border border-gray-200 p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                      <span className="text-[9px] font-body font-bold uppercase tracking-widest text-[#B59A6C]">Customer & Staff Metadata</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 font-mono">Billed by:</span>
                        <input
                          type="text"
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          placeholder="Owner / Cashier"
                          className="px-1.5 py-0.5 bg-white border border-gray-200 font-body text-[10px] text-[#111111] w-24 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[8px] font-body font-bold uppercase tracking-wider text-gray-500 mb-0.5">Customer Name</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Walk-in Customer"
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:outline-none focus:border-[#222222]"
                        />
                      </div>

                      {/* STRICT 10-DIGIT MOBILE NUMBER */}
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[8px] font-body font-bold uppercase tracking-wider text-gray-500">Mobile Number</label>
                          <span className={`text-[8px] font-mono font-bold ${customerPhone.length === 10 ? 'text-emerald-700' : 'text-gray-400'}`}>
                            [{customerPhone.length}/10]
                          </span>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={customerPhone}
                          onChange={handleCustomerPhoneChange}
                          placeholder="10-digit mobile"
                          className={`w-full px-2.5 py-1.5 bg-white border text-xs font-mono font-bold text-[#222222] focus:outline-none transition-all ${
                            customerPhone.length === 10
                              ? 'border-emerald-500 ring-1 ring-emerald-400/40'
                              : 'border-gray-200 focus:border-[#222222]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[8px] font-body font-bold uppercase tracking-wider text-gray-500 mb-0.5">Address / City (Optional)</label>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Mumbai, MH"
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-body text-[#222222] focus:outline-none focus:border-[#222222]"
                        />
                      </div>

                      {/* STRICT 15-CHAR GSTIN */}
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[8px] font-body font-bold uppercase tracking-wider text-gray-500">Customer GSTIN (B2B)</label>
                          <span className={`text-[8px] font-mono font-bold ${customerGstin.length === 15 ? 'text-emerald-700' : 'text-gray-400'}`}>
                            [{customerGstin.length}/15]
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={15}
                          value={customerGstin}
                          onChange={handleCustomerGstinChange}
                          placeholder="15-char GSTIN"
                          className={`w-full px-2.5 py-1.5 bg-white border text-xs font-mono text-[#222222] focus:outline-none transition-all ${
                            customerGstin.length === 15
                              ? 'border-emerald-500 ring-1 ring-emerald-400/40 font-bold'
                              : 'border-gray-200 focus:border-[#222222]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* LINE ITEMS LIST WITH INLINE EDITABLE MAKING CHARGES */}
                  {billItems.length === 0 ? (
                    <div className="py-12 text-center text-gray-300 font-body text-xs border border-dashed border-gray-200 bg-[#FAF9F7]/50">
                      Select items from the catalog or add a custom item above.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {billItems.map((bi) => {
                        const mat = bi.material.charAt(0).toUpperCase() + bi.material.slice(1);
                        const isEditing = editingItemId === bi.id;

                        return (
                          <motion.div
                            key={bi.id}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#FAF9F7] border border-gray-200 p-3"
                          >
                            <div className="flex gap-3">
                              {bi.image && (
                                <img
                                  src={bi.image}
                                  alt={bi.name}
                                  className="w-12 h-12 object-cover border border-gray-200 shrink-0 bg-white"
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-heading font-bold text-xs text-[#111111] leading-snug break-words pr-2">
                                    {bi.name}
                                  </h4>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => isEditing ? setEditingItemId(null) : handleStartEditItem(bi)}
                                      className="text-[9px] font-mono font-bold text-[#B59A6C] hover:underline uppercase cursor-pointer"
                                    >
                                      {isEditing ? 'Cancel' : 'Full Edit'}
                                    </button>
                                    <button
                                      onClick={() => removeItem(bi.id)}
                                      className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Remove from bill"
                                    >
                                      <TrashIcon size={13} />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] font-mono font-bold text-[#B59A6C] px-1.5 py-0.5 bg-white border border-[#B59A6C]/30">
                                    {bi.karat}K {mat}
                                  </span>
                                  {bi.weight > 0 && (
                                    <span className="text-[9px] font-mono text-gray-500 font-bold">{bi.weight}g</span>
                                  )}
                                  {bi.isCustomItem && (
                                    <span className="text-[8px] font-mono text-amber-700 bg-amber-50 px-1 border border-amber-200">
                                      Custom Piece
                                    </span>
                                  )}
                                </div>

                                {/* FULL INLINE ITEM OVERRIDE MODAL */}
                                {isEditing && (
                                  <div className="mt-2.5 p-2.5 bg-white border border-[#B59A6C]/40 space-y-2 text-xs">
                                    <span className="text-[8px] font-mono text-[#B59A6C] font-bold uppercase block">Owner Precision Override</span>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <label className="text-[8px] font-mono text-gray-400 uppercase">Exact Weight (g)</label>
                                        <input
                                          type="number"
                                          step="0.001"
                                          value={editItemForm.weight}
                                          onChange={(e) => setEditItemForm(prev => ({ ...prev, weight: e.target.value }))}
                                          className="w-full px-1.5 py-1 border border-gray-200 font-mono text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-mono text-gray-400 uppercase">Making (Rs./g)</label>
                                        <input
                                          type="number"
                                          value={editItemForm.makingChargeRate}
                                          onChange={(e) => setEditItemForm(prev => ({ ...prev, makingChargeRate: e.target.value }))}
                                          className="w-full px-1.5 py-1 border border-gray-200 font-mono text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-mono text-gray-400 uppercase">Diamond Cost (Rs.)</label>
                                        <input
                                          type="number"
                                          value={editItemForm.gemstoneCost}
                                          onChange={(e) => setEditItemForm(prev => ({ ...prev, gemstoneCost: e.target.value }))}
                                          className="w-full px-1.5 py-1 border border-gray-200 font-mono text-xs"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleSaveEditItem(bi.id)}
                                      className="w-full py-1 bg-[#222222] text-white text-[9px] font-bold uppercase tracking-wider hover:bg-[#B59A6C] hover:text-black transition-colors cursor-pointer"
                                    >
                                      Save & Recalculate
                                    </button>
                                  </div>
                                )}

                                {/* Mathematical Breakdown with Direct Making Charge Adjuster */}
                                {!isEditing && (
                                  <div className="mt-1.5 space-y-1 text-[9px] text-gray-500">
                                    <div className="flex justify-between">
                                      <span>Metal Value ({bi.weight}g)</span>
                                      <span className="font-mono text-gray-700">Rs.{(bi.metalCost * bi.quantity).toLocaleString('en-IN')}</span>
                                    </div>

                                    {/* INLINE EDITABLE MAKING CHARGE FIELD */}
                                    <div className="flex items-center justify-between bg-white/70 p-1 border border-gray-200/60">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-gray-600">Making:</span>
                                        <div className="flex items-center border border-gray-300 px-1 py-0.5 bg-white">
                                          <span className="text-[8px] font-mono text-gray-400 mr-0.5">Rs.</span>
                                          <input
                                            type="number"
                                            min="0"
                                            value={bi.makingChargeRate ?? defaultMakingRate}
                                            onChange={(e) => handleUpdateItemMakingRate(bi.id, e.target.value)}
                                            className="w-12 text-[9px] font-mono font-bold text-[#111111] focus:outline-none"
                                          />
                                          <span className="text-[8px] font-mono text-gray-400">/g</span>
                                        </div>
                                      </div>
                                      <span className="font-mono font-bold text-gray-800">
                                        Rs.{(bi.makingCharges * bi.quantity).toLocaleString('en-IN')}
                                      </span>
                                    </div>

                                    {bi.gemstoneCost > 0 && (
                                      <div className="flex justify-between">
                                        <span>Diamond / Gemstones</span>
                                        <span className="font-mono text-gray-700">Rs.{(bi.gemstoneCost * bi.quantity).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}

                                    <div className="flex justify-between font-medium">
                                      <span>GST ({gstRate}%)</span>
                                      <span className="font-mono text-gray-700">Rs.{(bi.gstTax * bi.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Quantity and Total */}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200/60">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(bi.id, -1)}
                                      className="w-6 h-6 border border-gray-300 flex items-center justify-center text-[#222222] hover:bg-[#222222] hover:text-white transition-all cursor-pointer text-sm font-bold bg-white"
                                    >
                                      -
                                    </button>
                                    <span className="font-mono font-bold text-xs text-[#111111] w-6 text-center">
                                      {bi.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(bi.id, 1)}
                                      className="w-6 h-6 border border-gray-300 flex items-center justify-center text-[#222222] hover:bg-[#222222] hover:text-white transition-all cursor-pointer text-sm font-bold bg-white"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <span className="font-mono font-extrabold text-sm text-[#111111]">
                                    Rs.{(bi.totalPrice * bi.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* FINANCIAL TOTALS, DEDUCTIONS & OWNER CONTROLS */}
                  {billItems.length > 0 && (
                    <div className="space-y-3 pt-2">

                      {/* OLD GOLD / SCRAP BUYBACK ACCORDION */}
                      <div className="border border-gray-200 bg-[#FAF9F7] p-3">
                        <div className="flex justify-between items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasOldGold}
                              onChange={(e) => setHasOldGold(e.target.checked)}
                              className="w-4 h-4 accent-[#B59A6C]"
                            />
                            <span className="text-xs font-body font-bold text-gray-800">
                              Customer Old Gold / Silver Exchange
                            </span>
                          </label>
                          {hasOldGold && oldGoldDeduction > 0 && (
                            <span className="font-mono text-xs font-bold text-amber-800">
                              -Rs.{oldGoldDeduction.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {hasOldGold && (
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-200/60">
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block">Weight (g)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={oldGoldWeight}
                                onChange={(e) => setOldGoldWeight(e.target.value)}
                                placeholder="e.g. 5.2"
                                className="w-full px-2 py-1 bg-white border border-gray-200 text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block">Purity</label>
                              <select
                                value={oldGoldKarat}
                                onChange={(e) => setOldGoldKarat(e.target.value)}
                                className="w-full px-1 py-1 bg-white border border-gray-200 text-xs font-mono"
                              >
                                <option value="22">22K Gold</option>
                                <option value="24">24K Gold</option>
                                <option value="18">18K Gold</option>
                                <option value="14">14K Gold</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-gray-500 uppercase block">Rate (Rs./g)</label>
                              <input
                                type="number"
                                value={oldGoldRate}
                                onChange={(e) => setOldGoldRate(e.target.value)}
                                placeholder={`Rs.${Math.round(liveRates.gold * 0.95)}`}
                                className="w-full px-2 py-1 bg-white border border-gray-200 text-xs font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SUMMARY FINANCIAL TOTALS */}
                      <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs font-body text-gray-600">
                        <div className="flex justify-between">
                          <span>Total Metal Value</span>
                          <span className="font-mono font-bold text-[#111111]">Rs.{billTotals.totalMetal.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Making Charges with Concession */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span>Making Charges</span>
                            {makingConcessionPercent > 0 && (
                              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 border border-emerald-200">
                                {makingConcessionPercent}% OFF
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-[#111111]">Rs.{billTotals.totalMaking.toLocaleString('en-IN')}</span>
                        </div>

                        {billTotals.totalDiamond > 0 && (
                          <div className="flex justify-between">
                            <span>Total Diamond / Gemstones</span>
                            <span className="font-mono font-bold text-[#111111]">Rs.{billTotals.totalDiamond.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        <div className="flex justify-between border-t border-gray-100 pt-1 font-semibold text-gray-800">
                          <span>Subtotal (Taxable Amount)</span>
                          <span className="font-mono font-bold text-[#111111]">Rs.{billTotals.subtotal.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Explicit Total GST line */}
                        <div className="flex justify-between items-center text-xs font-bold text-[#111111]">
                          <span>Total GST ({gstRate}%)</span>
                          <span className="font-mono font-bold text-[#111111]">Rs.{billTotals.totalGst.toLocaleString('en-IN')}</span>
                        </div>

                        {/* DYNAMIC GST SELECTOR & CGST / SGST BREAKDOWN */}
                        <div className="bg-white p-2.5 border border-gray-200 space-y-2 mt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-body font-bold uppercase tracking-wider text-gray-600">
                              GST Tax Rate (Applied: {gstRate}%)
                            </span>
                            <div className="flex items-center gap-1">
                              {GST_PRESETS.map((p) => (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() => handleSelectGstRate(p.value)}
                                  className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase border cursor-pointer transition-all ${
                                    gstRate === p.value && !isCustomGst
                                      ? 'bg-[#222222] text-white border-[#222222]'
                                      : 'bg-[#FAF9F7] text-gray-600 border-gray-200 hover:border-gray-400'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomGst(!isCustomGst);
                                  if (!isCustomGst) setCustomGstInput(String(gstRate));
                                }}
                                className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase border cursor-pointer ${
                                  isCustomGst ? 'bg-[#B59A6C] text-black border-[#B59A6C]' : 'bg-[#FAF9F7] text-gray-600 border-gray-200'
                                }`}
                              >
                                Custom %
                              </button>
                            </div>
                          </div>

                          {isCustomGst && (
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-100 flex-wrap">
                              <span className="text-[9px] text-gray-500 font-mono">Custom Tax Rate (%):</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={customGstInput}
                                onChange={(e) => {
                                  setCustomGstInput(e.target.value);
                                  handleApplyCustomGst(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleApplyCustomGst(customGstInput);
                                  }
                                }}
                                onBlur={() => handleApplyCustomGst(customGstInput)}
                                className="w-16 px-2 py-0.5 border border-gray-300 font-mono text-xs font-bold text-center"
                              />
                              <button
                                type="button"
                                onClick={() => handleApplyCustomGst(customGstInput)}
                                className="px-2.5 py-0.5 bg-[#222222] text-white text-[9px] font-bold uppercase hover:bg-[#B59A6C] hover:text-black cursor-pointer"
                              >
                                Apply {customGstInput || 0}%
                              </button>
                              {gstRate === (parseFloat(customGstInput) || 0) && (
                                <span className="text-[8px] text-emerald-700 font-mono font-bold">Active: {gstRate}%</span>
                              )}
                            </div>
                          )}

                          {/* Tax Split Mode Selector: Intra-State vs Single GST / IGST */}
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[8px]">
                            <span className="text-gray-500 uppercase tracking-wider font-mono">Tax Mode:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setTaxSplitMode('split')}
                                className={`px-1.5 py-0.5 border cursor-pointer uppercase font-mono ${
                                  taxSplitMode === 'split'
                                    ? 'bg-[#222222] text-white border-[#222222]'
                                    : 'bg-[#FAF9F7] text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                Intra-State (CGST + SGST)
                              </button>
                              <button
                                type="button"
                                onClick={() => setTaxSplitMode('single')}
                                className={`px-1.5 py-0.5 border cursor-pointer uppercase font-mono ${
                                  taxSplitMode === 'single'
                                    ? 'bg-[#222222] text-white border-[#222222]'
                                    : 'bg-[#FAF9F7] text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                Single GST / IGST
                              </button>
                            </div>
                          </div>

                          {taxSplitMode === 'split' ? (
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 pt-1 border-t border-gray-100">
                              <div className="flex justify-between">
                                <span>CGST ({(gstRate / 2).toFixed(2)}%):</span>
                                <span className="font-mono text-gray-800 font-medium">Rs.{billTotals.cgst.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>SGST ({(gstRate / 2).toFixed(2)}%):</span>
                                <span className="font-mono text-gray-800 font-medium">Rs.{billTotals.sgst.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between text-[10px] text-gray-600 pt-1 border-t border-gray-100">
                              <span>Unified GST ({gstRate}%):</span>
                              <span className="font-mono text-gray-800 font-medium">Rs.{billTotals.totalGst.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>

                        {/* Deductions: Vouchers & Owner Discounts */}
                        {billTotals.voucherDiscount > 0 && (
                          <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2.5 py-1.5 border border-emerald-200 mt-2">
                            <span className="font-bold uppercase text-[10px]">Voucher Concession ({appliedVoucher?.code})</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">-Rs.{billTotals.voucherDiscount.toLocaleString('en-IN')}</span>
                              <button onClick={handleRemoveVoucher} className="text-[9px] text-rose-600 underline font-bold cursor-pointer">Remove</button>
                            </div>
                          </div>
                        )}

                        {billTotals.directDiscount > 0 && (
                          <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2.5 py-1.5 border border-emerald-200">
                            <span className="font-bold uppercase text-[10px]">Owner Cash Discount</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">-Rs.{billTotals.directDiscount.toLocaleString('en-IN')}</span>
                              <button onClick={handleRemoveCashDiscount} className="text-[9px] text-rose-600 underline font-bold cursor-pointer">Remove</button>
                            </div>
                          </div>
                        )}

                        {billTotals.oldGoldDeduction > 0 && (
                          <div className="flex justify-between items-center text-amber-900 bg-amber-50 px-2.5 py-1.5 border border-amber-200">
                            <span className="font-bold uppercase text-[10px]">Old Gold Exchange Credit</span>
                            <span className="font-mono font-bold">-Rs.{billTotals.oldGoldDeduction.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        {/* Grand Total */}
                        <div className="flex justify-between items-end border-t-2 border-gray-300 pt-3">
                          <div>
                            <span className="text-[9px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block">Net Payable</span>
                            <span className="font-heading text-xl font-extrabold text-[#111111]">Grand Total</span>
                          </div>
                          <span className="font-mono text-2xl font-extrabold text-[#111111]">
                            Rs.{billTotals.totalPayable.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* DISCOUNTS & VOUCHER CONTROLS (SEPARATED & FIXED APPLY BUTTONS) */}
                      <div className="bg-[#FAF9F7] p-3 border border-gray-200 space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5">
                          <span className="text-[9px] font-body font-bold uppercase tracking-widest text-gray-700">
                            Owner Concessions & Privilege Codes
                          </span>
                          <button
                            type="button"
                            onClick={handleQuickRoundOff}
                            className="text-[9px] font-mono font-bold text-[#B59A6C] hover:underline uppercase cursor-pointer"
                          >
                            Round Off Total
                          </button>
                        </div>

                        {/* ROW 1: Cash Discount with Direct Apply */}
                        <div>
                          <label className="block text-[8px] font-mono text-gray-500 uppercase mb-1">
                            Direct Cash Concession (Rs.)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              value={cashDiscountInput}
                              onChange={(e) => setCashDiscountInput(e.target.value)}
                              placeholder="e.g. 500 or 1000"
                              className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCashDiscount}
                              className="px-4 py-1.5 bg-[#222222] text-white text-[10px] font-bold uppercase hover:bg-[#B59A6C] hover:text-black transition-colors cursor-pointer shrink-0"
                            >
                              Apply Discount
                            </button>
                          </div>
                        </div>

                        {/* ROW 2: Voucher Code with Dedicated Apply */}
                        <div>
                          <label className="block text-[8px] font-mono text-gray-500 uppercase mb-1">
                            Voucher Code or Percentage (e.g. WELCOME10 or 10%)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={voucherInput}
                              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                              placeholder="VOUCHER CODE OR %"
                              className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-mono font-bold uppercase text-[#222222] focus:outline-none focus:border-[#222222]"
                            />
                            <button
                              type="button"
                              onClick={() => handleApplyVoucher()}
                              className="px-4 py-1.5 bg-[#B59A6C] text-black text-[10px] font-bold uppercase hover:bg-[#222222] hover:text-white transition-colors cursor-pointer shrink-0"
                            >
                              Apply Code
                            </button>
                          </div>
                        </div>

                        {/* Status Feedback */}
                        {voucherError && (
                          <div className="text-[10px] text-rose-700 bg-rose-50 p-2 border border-rose-200 font-medium">
                            {voucherError}
                          </div>
                        )}
                        {voucherSuccess && (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 border border-emerald-200 font-bold flex items-center gap-1.5">
                            <CheckCircleIcon size={12} className="text-emerald-700 shrink-0" />
                            <span>{voucherSuccess}</span>
                          </div>
                        )}

                        {/* Quick-Apply Chips */}
                        <div className="pt-1">
                          <span className="text-[8px] font-mono text-gray-400 uppercase block mb-1">Quick Select Codes:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_VOUCHERS.map(v => (
                              <button
                                key={v.code}
                                type="button"
                                onClick={() => handleApplyVoucher(v.code)}
                                className={`px-2 py-0.5 border text-[8px] font-mono font-bold uppercase cursor-pointer transition-all ${
                                  appliedVoucher?.code === v.code
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#222222]'
                                }`}
                              >
                                {v.code} ({v.discountPercent ? `${v.discountPercent}%` : `Rs.${v.discountAmount}`})
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleApplyVoucher('5%')}
                              className="px-2 py-0.5 border text-[8px] font-mono font-bold uppercase bg-white border-gray-200 text-[#B59A6C] hover:border-[#B59A6C] cursor-pointer"
                            >
                              5% OFF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyVoucher('10%')}
                              className="px-2 py-0.5 border text-[8px] font-mono font-bold uppercase bg-white border-gray-200 text-[#B59A6C] hover:border-[#B59A6C] cursor-pointer"
                            >
                              10% OFF
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* PAYMENT METHOD SELECTOR */}
                      <div>
                        <label className="block text-[9px] font-body font-bold uppercase tracking-widest text-gray-500 mb-1.5">Payment Method</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {['cash', 'card', 'upi', 'mixed'].map(method => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              className={`py-2 text-[10px] font-body font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                paymentMethod === method
                                  ? 'bg-[#FAF9F7] border-2 border-[#B59A6C] text-[#111111] shadow-sm'
                                  : 'bg-white border border-gray-200 text-gray-500 hover:border-[#222222]'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CASH CALCULATOR OR REFERENCE INPUT */}
                      {paymentMethod === 'cash' ? (
                        <div className="grid grid-cols-2 gap-3 bg-[#FAF9F7] p-3 border border-gray-200">
                          <div>
                            <label className="block text-[8px] font-body font-bold uppercase tracking-widest text-gray-500 mb-1">Cash Received (Rs.)</label>
                            <input
                              type="number"
                              min="0"
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              placeholder="Enter cash given"
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-body font-bold uppercase tracking-widest text-gray-500 mb-1">Change to Return</label>
                            <div className="w-full px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-xs font-mono font-extrabold text-emerald-800">
                              Rs.{changeToReturn.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#FAF9F7] p-3 border border-gray-200">
                          <label className="block text-[8px] font-body font-bold uppercase tracking-widest text-gray-500 mb-1">
                            {paymentMethod === 'card' ? 'Card Auth / Slip Ref' : paymentMethod === 'upi' ? 'UPI UTR / Trans ID' : 'Payment Split Details'}
                          </label>
                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder={paymentMethod === 'card' ? 'e.g. Card ending 4821 / Slip #104' : paymentMethod === 'upi' ? 'e.g. UPI Ref #948201849' : 'e.g. 50k Cash + 100k UPI'}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-mono text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                        </div>
                      )}

                      {/* INVOICE REMARKS / NOTES */}
                      <div>
                        <input
                          type="text"
                          value={billNotes}
                          onChange={(e) => setBillNotes(e.target.value)}
                          placeholder="Special notes / instructions (printed on invoice)"
                          className="w-full px-3 py-1.5 bg-[#FAF9F7] border border-gray-200 text-xs font-body text-gray-700 focus:outline-none focus:border-[#222222]"
                        />
                      </div>

                      {/* MAIN CONSOLE ACTION BUTTONS */}
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={handleGenerateInvoice}
                          className="w-full py-3.5 bg-[#222222] text-white text-xs font-body font-bold uppercase tracking-widest hover:bg-[#B59A6C] hover:text-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                          <ShieldCheckIcon size={16} />
                          Generate Certified Tax Invoice
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleSaveAndNew}
                            className="py-2.5 border border-[#222222] text-[#222222] text-[10px] font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                          >
                            Save & Start Next
                          </button>
                          <button
                            onClick={() => setShowClearConfirm(true)}
                            className="py-2.5 border border-rose-300 text-rose-600 text-[10px] font-body font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          >
                            Reset Console
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CLEAR BILL CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 p-6 max-w-sm w-full shadow-soft-xl space-y-4"
            >
              <h3 className="font-heading text-lg font-bold text-[#111111]">Reset Current Bill?</h3>
              <p className="text-sm font-body text-gray-600">
                This will clear all items, customer entries, and deductions. Any unsaved changes on this bill will be discarded.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClearBill}
                  className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-[#222222] text-xs font-body font-bold uppercase tracking-wider hover:bg-[#FAF9F7] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAX INVOICE MODAL (jsPDF + Print) */}
      <BillingInvoice
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        billData={invoiceBillData}
      />

    </div>
  );
};

export default OfflineBilling;
