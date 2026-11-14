import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Scale, 
  MessageCircle, 
  MapPin, 
  ChevronRight, 
  X, 
  Phone, 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw, 
  Gem, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sliders, 
  Compass, 
  ExternalLink,
  Crown
} from 'lucide-react';
import { useMetalRates } from '../contexts/MetalRatesContext';
import { useToast } from '../contexts/ToastContext';
import { 
  DIDWANA_ZONE, 
  getShowroomLiveStatus, 
  checkDeliveryEligibility,
  formatConciergeStylistInquiry,
  formatConciergeAppointmentInquiry,
  formatConciergeBullionRateLock,
  formatConciergeBespokeInquiry
} from '../utils/deliveryZone';

// ─── STYLIST DATA CONSTANTS ────────────────────────────────────────────────────

const OCCASIONS = [
  { 
    id: 'bridal', 
    code: 'BRD', 
    label: 'Bridal & Trousseau', 
    desc: 'Heavy 22K Kundan, Polki chokers & VVS solitaire rings',
    category: 'necklaces',
    defaultBudget: '500000+'
  },
  { 
    id: 'gala', 
    code: 'GLA', 
    label: 'Royal Gala & Reception', 
    desc: 'High Jewelry statement drops, Colombian emeralds & diamonds',
    category: 'earrings',
    defaultBudget: '200000-500000'
  },
  { 
    id: 'rajwadi', 
    code: 'RAW', 
    label: 'Festive Rajwadi', 
    desc: 'Heritage Rajasthani Aad, Timaniya & 24K temple gold',
    category: 'necklaces',
    defaultBudget: '200000-500000'
  },
  { 
    id: 'minimalist', 
    code: 'MIN', 
    label: 'Everyday Minimalist', 
    desc: 'Sleek 18K gold chains, stacking bands & delicate pendants',
    category: 'rings',
    defaultBudget: 'under-50000'
  },
  { 
    id: 'anniversary', 
    code: 'ANV', 
    label: 'Anniversary & Gifting', 
    desc: 'Timeless solitaire bands, certified coins & diamond bangles',
    category: 'rings',
    defaultBudget: '50000-200000'
  }
];

const METALS = [
  { id: '24k-gold', name: '24K Pure Kundan Gold (999)', purityCode: '999', key: 'gold24k' },
  { id: '22k-gold', name: '22K Hallmark Gold (916)', purityCode: '916', key: 'gold22k' },
  { id: '18k-gold', name: '18K Luxury Rose/White Gold (750)', purityCode: '750', key: 'gold18k' },
  { id: 'vvs-diamond', name: 'VVS Natural Diamonds in 18K', purityCode: 'VVS-VS', key: 'diamond' },
  { id: 'fine-silver', name: 'Fine 999 Bullion Silver', purityCode: '999 AG', key: 'silver' }
];

const BUDGET_RANGES = [
  { id: 'under-50000', label: 'Under Rs. 50,000', min: 10000, max: 50000, labelShort: 'Tier I' },
  { id: '50000-200000', label: 'Rs. 50,000 - Rs. 2,00,000', min: 50000, max: 200000, labelShort: 'Tier II' },
  { id: '200000-500000', label: 'Rs. 2,00,000 - Rs. 5,00,000', min: 200000, max: 500000, labelShort: 'Tier III' },
  { id: '500000+', label: 'Rs. 5,00,000+ Imperial High Jewelry', min: 500000, max: 2500000, labelShort: 'Imperial' }
];

const APPOINTMENT_AGENDAS = [
  { id: 'bridal', label: 'Bridal Trousseau Consultation' },
  { id: 'sizing', label: 'Custom 3D CAD Ring Sizing' },
  { id: 'exchange', label: 'Old Gold Exchange & XRF Assay' },
  { id: 'bullion', label: 'High Bullion & Coin Acquisition' }
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Slot (11:00 AM - 1:00 PM)' },
  { id: 'afternoon', label: 'Afternoon Slot (2:30 PM - 4:30 PM)' },
  { id: 'evening', label: 'Evening Slot (5:30 PM - 7:00 PM)' },
  { id: 'twilight', label: 'Twilight Slot (7:00 PM - 8:30 PM)' }
];

const BESPOKE_CHIPS = [
  'Bridal Choker',
  'Solitaire Ring',
  'Polki Kada',
  'Heirloom Remake',
  'Rajasthani Aad',
  'Men Heritage Band'
];

const GlimmrConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stylist'); // 'stylist' | 'appointment' | 'rates' | 'bespoke'
  const navigate = useNavigate();
  const location = useLocation();

  // Hide floating concierge on POS billing screen to keep cashier controls unobstructed
  if (location.pathname === '/billing') return null;
  const { showToast } = useToast();
  const { 
    liveRates, 
    streamingActive, 
    priceDeltas, 
    isTickFlashing, 
    refreshRates,
    mosunBullion,
    spread,
    mosunPriceDeltas
  } = useMetalRates() || {};

  // Benchmark Hub Selection
  const [benchmarkHub, setBenchmarkHub] = useState('hb'); // 'hb' (HB Jodhpur) | 'mosun' (Mosun Sujangarh)

  // Stylist State
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [selectedMetal, setSelectedMetal] = useState(METALS[1]); // Default: 22K Hallmark
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_RANGES[1]);
  const [stylistNotes, setStylistNotes] = useState('');

  // Appointment State
  const [consultationType, setConsultationType] = useState('In-Person Showroom Visit');
  const [selectedAgenda, setSelectedAgenda] = useState(APPOINTMENT_AGENDAS[0]);
  const [appointmentDate, setAppointmentDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [patronName, setPatronName] = useState('');
  const [patronPhone, setPatronPhone] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Live Rates Valuation Calculator State
  const [calcMode, setCalcMode] = useState('gramsToRupees'); // 'gramsToRupees' | 'rupeesToGrams'
  const [calcPurity, setCalcPurity] = useState('22k'); // '24k' | '22k' | '18k' | 'silver'
  const [inputGrams, setInputGrams] = useState(10);
  const [inputRupees, setInputRupees] = useState(100000);

  // Bespoke State
  const [bespokeTitle, setBespokeTitle] = useState('');
  const [bespokeMetal, setBespokeMetal] = useState('22K Hallmark Gold (916)');
  const [bespokeWeight, setBespokeWeight] = useState('');
  const [bespokeBudget, setBespokeBudget] = useState('');
  const [bespokeNotes, setBespokeNotes] = useState('');

  // Delivery Eligibility Quick Check State
  const [pincodeCheck, setPincodeCheck] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);

  // Live Showroom Status (IST)
  const showroomStatus = useMemo(() => getShowroomLiveStatus(), []);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Benchmark Rates per 10g for computations
  const isMosun = benchmarkHub === 'mosun';
  const hbGold24k = Number(liveRates?.gold_10g_24k || liveRates?.himanshuBullion?.rates?.gold_995_ask || 75800);
  const mosunGold24k = Number(mosunBullion?.rates?.gold_24k || (hbGold24k - 45));
  const gold24kPer10g = isMosun ? mosunGold24k : hbGold24k;

  const hbGold22k = Number(liveRates?.gold_10g_22k || Math.round(hbGold24k * (22 / 24)));
  const mosunGold22k = Number(mosunBullion?.rates?.gold_22k || Math.round(mosunGold24k * (22 / 24)));
  const gold22kPer10g = isMosun ? mosunGold22k : hbGold22k;

  const hbGold18k = Number(liveRates?.gold_10g_18k || Math.round(hbGold24k * (18 / 24)));
  const mosunGold18k = Number(mosunBullion?.rates?.gold_18k || Math.round(mosunGold24k * (18 / 24)));
  const gold18kPer10g = isMosun ? mosunGold18k : hbGold18k;

  const hbSilver1kg = Number(liveRates?.silver_1kg || liveRates?.himanshuBullion?.rates?.silver_999_1kg || 92500);
  const mosunSilver1kg = Number(mosunBullion?.rates?.silver_peti || (hbSilver1kg - 110));
  const silver1kg = isMosun ? mosunSilver1kg : hbSilver1kg;
  const silverPer10g = Math.round(silver1kg / 100);

  const activeDeltas = isMosun ? mosunPriceDeltas : priceDeltas;

  // Rate per gram mapping
  const ratePerGram = useMemo(() => {
    return {
      '24k': gold24kPer10g / 10,
      '22k': gold22kPer10g / 10,
      '18k': gold18kPer10g / 10,
      silver: silver1kg / 1000
    };
  }, [gold24kPer10g, gold22kPer10g, gold18kPer10g, silver1kg]);

  // Dynamic calculation of gold equivalent in Stylist Tab
  const stylistGramEstimate = useMemo(() => {
    const rate = ratePerGram['22k'] || 6950;
    const avgBudget = (selectedBudget.min + selectedBudget.max) / 2;
    // Allow approx 85% for pure metal value after making charges
    const grams = (avgBudget * 0.85) / rate;
    return `${grams.toFixed(1)}g - ${(grams * 1.2).toFixed(1)}g in 22K`;
  }, [selectedBudget, ratePerGram]);

  // Valuation computations in Rates Tab
  const valuationResult = useMemo(() => {
    const currentRatePerGram = ratePerGram[calcPurity] || 6950;
    if (calcMode === 'gramsToRupees') {
      const g = Number(inputGrams) || 0;
      const metalVal = Math.round(g * currentRatePerGram);
      const gst = Math.round(metalVal * 0.03);
      const total = metalVal + gst;
      return {
        metalValue: metalVal,
        gst: gst,
        total: total,
        grams: g,
        ratePer10g: Math.round(currentRatePerGram * 10)
      };
    } else {
      const budget = Number(inputRupees) || 0;
      // Subtract estimated 3% GST
      const metalBudget = budget / 1.03;
      const g = currentRatePerGram > 0 ? (metalBudget / currentRatePerGram).toFixed(2) : 0;
      const metalVal = Math.round(metalBudget);
      const gst = Math.round(budget - metalBudget);
      return {
        metalValue: metalVal,
        gst: gst,
        total: budget,
        grams: g,
        ratePer10g: Math.round(currentRatePerGram * 10)
      };
    }
  }, [calcMode, calcPurity, inputGrams, inputRupees, ratePerGram]);

  // Delivery check handler
  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincodeCheck.trim()) return;
    const res = checkDeliveryEligibility({ pincode: pincodeCheck });
    setDeliveryResult(res);
  };

  // WhatsApp Stylist Handoff
  const handleConnectStylistWhatsApp = () => {
    const url = formatConciergeStylistInquiry({
      occasion: selectedOccasion.label,
      metal: selectedMetal.name,
      budget: selectedBudget.label,
      estimatedGrams: stylistGramEstimate,
      recommendation: `${selectedOccasion.desc} crafted in ${selectedMetal.name}`,
      patronName: patronName.trim(),
      patronPhone: patronPhone.trim(),
      userNote: stylistNotes.trim()
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Appointment Handoff
  const handleConfirmAppointmentWhatsApp = (e) => {
    e.preventDefault();
    const url = formatConciergeAppointmentInquiry({
      consultationType: consultationType,
      agenda: selectedAgenda.label,
      preferredDate: appointmentDate,
      preferredTime: selectedSlot.label,
      patronName: patronName.trim() || 'Valued Patron',
      patronPhone: patronPhone.trim(),
      userNote: appointmentNotes.trim()
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Bullion Rate Lock Handoff
  const handleLockBullionRateWhatsApp = () => {
    const purityName = {
      '24k': '24K Pure Kundan Gold (999)',
      '22k': '22K Hallmark Gold (916)',
      '18k': '18K Luxury Gold (750)',
      silver: 'Fine Bullion Silver (999)'
    }[calcPurity] || '22K Hallmark Gold';

    const hubLabel = benchmarkHub === 'mosun' 
      ? 'Mosun & Sons Bullion (Sujangarh)' 
      : 'Himanshu Bullion (Jodhpur)';

    const url = formatConciergeBullionRateLock({
      metalType: purityName,
      weightGrams: calcMode === 'gramsToRupees' ? valuationResult.grams : valuationResult.grams,
      targetBudget: calcMode === 'rupeesToGrams' ? inputRupees : valuationResult.total,
      ratePer10g: valuationResult.ratePer10g,
      estimatedTotal: valuationResult.total,
      patronName: patronName.trim(),
      patronPhone: patronPhone.trim(),
      referenceHub: hubLabel
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Bespoke Design Commission Handoff
  const handleBespokeInquiryWhatsApp = (e) => {
    e.preventDefault();
    const url = formatConciergeBespokeInquiry({
      designTitle: bespokeTitle.trim() || 'Custom Bespoke Jewelry Piece',
      metalPreference: bespokeMetal,
      targetWeight: bespokeWeight.trim(),
      targetBudget: bespokeBudget.trim(),
      notes: bespokeNotes.trim(),
      patronName: patronName.trim(),
      patronPhone: patronPhone.trim()
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* ─── FLOATING CONCIERGE LAUNCHER ─── */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(true)}
        aria-label="Open VIP Atelier Concierge"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#111111] text-[#FAF9F7] border border-[#B59A6C] rounded-full p-2.5 sm:px-4 sm:py-3 shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex items-center gap-2.5 group hover:border-[#D4AF37] transition-all"
      >
        {/* Pulsing Live Beacon */}
        <span className="relative flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B59A6C] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#B59A6C]" />
        </span>

        {/* Monogram Icon */}
        <div className="w-6 h-6 rounded-full bg-[#1F1F1F] border border-[#B59A6C]/40 flex items-center justify-center flex-shrink-0">
          <Crown className="w-3.5 h-3.5 text-[#B59A6C]" />
        </div>

        {/* Label (Desktop) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-[#B59A6C] uppercase leading-none">
            DIDWANA ATELIER
          </span>
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#B59A6C] transition-colors">
            VIP Atelier Concierge
          </span>
        </div>

        <ChevronRight className="w-4 h-4 text-[#B59A6C] hidden sm:inline group-hover:translate-x-0.5 transition-transform" />
      </motion.button>

      {/* ─── LUXURY CONCIERGE DOCK / DRAWER ─── */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full sm:w-[540px] md:w-[580px] h-[92vh] sm:h-[86vh] max-h-[840px] bg-[#141414] text-[#FAF9F7] border border-[#B59A6C]/40 rounded-t-3xl sm:rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden font-body"
            >
              {/* ─── BRAND HEADER & LIVE SHOWROOM STATUS ─── */}
              <div className="p-4 sm:p-5 border-b border-[#262626] bg-[#111111] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B59A6C]" />
                    <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase tracking-[0.25em]">
                      MONIKA JEWELLERS DIDWANA
                    </span>
                  </div>

                  {/* Showroom Status Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F1F1F] border border-[#333333]">
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        showroomStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`} 
                    />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-300">
                      {showroomStatus.badgeText}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Concierge"
                    className="w-7 h-7 rounded-full bg-[#1F1F1F] border border-[#333333] flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#B59A6C] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2">
                      VIP Atelier Concierge
                    </h3>
                    <p className="font-serif italic text-[11px] text-[#B59A6C]/90 leading-tight">
                      White-Glove Styling, Private Appointments, Live Bullion & Bespoke Craftsmanship
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── 4-TAB NAVIGATION BAR ─── */}
              <div className="grid grid-cols-4 border-b border-[#262626] bg-[#161616] flex-shrink-0 text-center">
                <button
                  onClick={() => setActiveTab('stylist')}
                  className={`py-3 px-1 transition-all flex flex-col items-center gap-1 border-b-2 ${
                    activeTab === 'stylist'
                      ? 'border-[#B59A6C] text-[#B59A6C] bg-[#1C1C1C]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Stylist</span>
                </button>

                <button
                  onClick={() => setActiveTab('appointment')}
                  className={`py-3 px-1 transition-all flex flex-col items-center gap-1 border-b-2 ${
                    activeTab === 'appointment'
                      ? 'border-[#B59A6C] text-[#B59A6C] bg-[#1C1C1C]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Appointment</span>
                </button>

                <button
                  onClick={() => setActiveTab('rates')}
                  className={`py-3 px-1 transition-all flex flex-col items-center gap-1 border-b-2 ${
                    activeTab === 'rates'
                      ? 'border-[#B59A6C] text-[#B59A6C] bg-[#1C1C1C]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Live Rates</span>
                </button>

                <button
                  onClick={() => setActiveTab('bespoke')}
                  className={`py-3 px-1 transition-all flex flex-col items-center gap-1 border-b-2 ${
                    activeTab === 'bespoke'
                      ? 'border-[#B59A6C] text-[#B59A6C] bg-[#1C1C1C]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Gem className="w-4 h-4" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Bespoke</span>
                </button>
              </div>

              {/* ─── TAB CONTENT BODY (SCROLLABLE) ─── */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-neutral-300">
                {/* ══════════ TAB 1: PERSONAL STYLIST & MATCHMAKER ══════════ */}
                {activeTab === 'stylist' && (
                  <div className="space-y-4">
                    {/* Occasion Grid */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] mb-2">
                        1. Select Occasion & Aesthetic:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {OCCASIONS.map((occ) => {
                          const isSelected = selectedOccasion.id === occ.id;
                          return (
                            <button
                              key={occ.id}
                              type="button"
                              onClick={() => setSelectedOccasion(occ)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-[#B59A6C] bg-[#1F1F1F] text-white shadow-sm'
                                  : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#111111] text-[#B59A6C] border border-[#B59A6C]/30">
                                  {occ.code}
                                </span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B59A6C]" />}
                              </div>
                              <span className="font-bold text-xs text-white block">{occ.label}</span>
                              <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">{occ.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metal Preference */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] mb-2">
                        2. Desired Metal & Karatage:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {METALS.map((m) => {
                          const isSelected = selectedMetal.id === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setSelectedMetal(m)}
                              className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'border-[#B59A6C] bg-[#1F1F1F] text-white'
                                  : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-xs text-white block">{m.name}</span>
                                <span className="font-mono text-[9px] text-[#B59A6C] block">Hallmark: {m.purityCode}</span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B59A6C]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Investment / Budget Tier */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] mb-2">
                        3. Investment & Budget Tier:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {BUDGET_RANGES.map((b) => {
                          const isSelected = selectedBudget.id === b.id;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBudget(b)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-[#B59A6C] bg-[#1F1F1F] text-white'
                                  : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                              }`}
                            >
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[#B59A6C] block font-bold">
                                {b.labelShort}
                              </span>
                              <span className="font-bold text-xs text-white block">{b.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stylist Recommendation Summary Card */}
                    <div className="p-4 rounded-xl bg-[#191919] border border-[#B59A6C]/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#B59A6C] uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#B59A6C]" />
                          ATELIER STYLIST APPRAISAL
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          Live IBJA Rate Basis
                        </span>
                      </div>

                      <p className="font-serif italic text-neutral-200 text-xs leading-relaxed">
                        For a <strong className="text-[#B59A6C] not-italic">{selectedOccasion.label}</strong> paired with{' '}
                        <strong className="text-[#B59A6C] not-italic">{selectedMetal.name}</strong>, our Didwana master karigars recommend focusing on {selectedOccasion.desc.toLowerCase()}.
                      </p>

                      <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">Estimated Grammage Equivalent:</span>
                        <span className="font-mono font-bold text-xs text-[#B59A6C]">
                          {stylistGramEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Optional Custom Note */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                        Additional Styling Notes or Ring/Bangle Size:
                      </label>
                      <input
                        type="text"
                        value={stylistNotes}
                        onChange={(e) => setStylistNotes(e.target.value)}
                        placeholder="e.g., Seeking peacock motif, ring size 14, bride reception wear"
                        className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleConnectStylistWhatsApp}
                        className="w-full py-3 px-4 rounded-xl bg-[#B59A6C] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Discuss Curation on WhatsApp (+91 9351214851)
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/products?category=${selectedOccasion.category}`}
                          onClick={() => setIsOpen(false)}
                          className="py-2.5 px-3 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] text-neutral-200 hover:text-white hover:border-[#B59A6C] text-center font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          Explore Designs
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to="/custom-atelier"
                          onClick={() => setIsOpen(false)}
                          className="py-2.5 px-3 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] text-[#B59A6C] hover:border-[#B59A6C] text-center font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          3D Ring Studio
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════ TAB 2: PRIVATE SHOWROOM & VIDEO APPOINTMENT ══════════ */}
                {activeTab === 'appointment' && (
                  <form onSubmit={handleConfirmAppointmentWhatsApp} className="space-y-4">
                    {/* Consultation Type Toggle */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] mb-2">
                        1. Select Consultation Modality:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setConsultationType('In-Person Showroom Visit')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            consultationType === 'In-Person Showroom Visit'
                              ? 'border-[#B59A6C] bg-[#1F1F1F] text-white'
                              : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[#B59A6C]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-mono text-[9px] uppercase font-bold tracking-wider">Showroom</span>
                          </div>
                          <span className="font-bold text-xs text-white block">Didwana Flagship</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">Station Road, PIN 341303</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConsultationType('Virtual HD Video Consultation')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            consultationType === 'Virtual HD Video Consultation'
                              ? 'border-[#B59A6C] bg-[#1F1F1F] text-white'
                              : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[#B59A6C]">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-mono text-[9px] uppercase font-bold tracking-wider">Virtual</span>
                          </div>
                          <span className="font-bold text-xs text-white block">Live Video Viewing</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">High-definition WhatsApp call</span>
                        </button>
                      </div>
                    </div>

                    {/* Consultation Purpose / Agenda */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] mb-2">
                        2. Consultation Purpose:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {APPOINTMENT_AGENDAS.map((ag) => (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => setSelectedAgenda(ag)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              selectedAgenda.id === ag.id
                                ? 'border-[#B59A6C] bg-[#1F1F1F] text-white'
                                : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                            }`}
                          >
                            <span className="font-bold text-xs block">{ag.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Date & Time Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                          Preferred Date:
                        </label>
                        <select
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        >
                          <option value="Today (Subject to hours)">Today (Immediate Slot)</option>
                          <option value="Tomorrow">Tomorrow</option>
                          <option value="This Saturday">This Saturday</option>
                          <option value="This Sunday">This Sunday</option>
                          <option value="Next Week">Next Week</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                          Time Slot (IST):
                        </label>
                        <select
                          value={selectedSlot.id}
                          onChange={(e) => {
                            const found = TIME_SLOTS.find((s) => s.id === e.target.value);
                            if (found) setSelectedSlot(found);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Patron Contact Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                          Patron Full Name:
                        </label>
                        <input
                          type="text"
                          required
                          value={patronName}
                          onChange={(e) => setPatronName(e.target.value)}
                          placeholder="e.g. Ayush Soni"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                          WhatsApp Contact Phone:
                        </label>
                        <input
                          type="tel"
                          value={patronPhone}
                          onChange={(e) => setPatronPhone(e.target.value)}
                          placeholder="e.g. +91 93512 14851"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        />
                      </div>
                    </div>

                    {/* Showroom Operating Schedule Card */}
                    <div className="p-3.5 rounded-xl bg-[#191919] border border-[#2D2D2D] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase tracking-wider">
                          DIDWANA FLAGSHIP SCHEDULE
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {showroomStatus.istTimeString ? `${showroomStatus.istTimeString} IST` : 'IST Zone'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        {showroomStatus.statusText}
                      </p>
                      <span className="font-mono text-[10px] text-neutral-400 block pt-1 border-t border-[#262626]">
                        Regular Hours: {showroomStatus.schedule}
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#B59A6C] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Calendar className="w-4 h-4" />
                      Confirm Private Appointment on WhatsApp
                    </button>
                  </form>
                )}

                {/* ══════════ TAB 3: LIVE RATES & VALUATION CALCULATOR ══════════ */}
                {activeTab === 'rates' && (
                  <div className="space-y-4">
                    {/* Live Ticker Header & Hub Selector */}
                    <div className="p-3 rounded-xl bg-[#191919] border border-[#2D2D2D] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              streamingActive ? 'bg-emerald-400 animate-pulse' : 'bg-[#B59A6C]'
                            }`}
                          />
                          <div>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white block">
                              {benchmarkHub === 'mosun' ? 'MOSUN & SONS · SUJANGARH FEED' : 'HIMANSHU BULLION · JODHPUR FEED'}
                            </span>
                            <span className="font-mono text-[9px] text-[#B59A6C]">
                              {streamingActive ? 'Dual-Stream SSE Active' : 'Live Benchmark Stream'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            to="/live-rates"
                            title="Open Comparative Board"
                            className="p-1.5 rounded-lg bg-[#242424] text-neutral-300 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={refreshRates}
                            title="Refresh Rates"
                            className="p-1.5 rounded-lg bg-[#242424] text-neutral-300 hover:text-white transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Regional Hub Selector Pills */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#262626]">
                        <button
                          type="button"
                          onClick={() => setBenchmarkHub('hb')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-between ${
                            benchmarkHub === 'hb'
                              ? 'bg-[#B59A6C] text-[#111111]'
                              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
                          }`}
                        >
                          <span>HB JODHPUR</span>
                          <span className="text-[8px] font-normal opacity-85">Wholesale</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBenchmarkHub('mosun')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-between ${
                            benchmarkHub === 'mosun'
                              ? 'bg-[#B59A6C] text-[#111111]'
                              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
                          }`}
                        >
                          <span>MOSUN SUJANGARH</span>
                          <span className="text-[8px] font-normal opacity-85">Regional</span>
                        </button>
                      </div>

                      {/* Live Regional Spread Callout */}
                      <div className="flex items-center justify-between px-2 py-1 rounded bg-[#131313] border border-[#242424] text-[9px] font-mono">
                        <span className="text-neutral-400">HB vs Mosun Spread:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">
                            Gold: {spread?.gold_995_diff != null ? `${spread.gold_995_diff >= 0 ? '+' : ''}₹${spread.gold_995_diff}` : '₹0'}/10g
                          </span>
                          <span className="text-neutral-600">|</span>
                          <span className="text-blue-400 font-bold">
                            Silver: {spread?.silver_peti_diff != null ? `${spread.silver_peti_diff >= 0 ? '+' : ''}₹${spread.silver_peti_diff}` : '₹0'}/kg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4 Metal Benchmark Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 24K Gold */}
                      <div className={`p-3 rounded-xl border bg-[#181818] transition-all ${
                        isTickFlashing ? 'border-[#B59A6C]' : 'border-[#262626]'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase">
                            24K GOLD (10G)
                          </span>
                          {activeDeltas?.gold24k === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          {activeDeltas?.gold24k === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                          {(!activeDeltas?.gold24k || activeDeltas?.gold24k === 'same') && (
                            <Minus className="w-3 h-3 text-neutral-500" />
                          )}
                        </div>
                        <span className="font-mono text-base font-bold text-white block">
                          Rs. {gold24kPer10g.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                          Rs. {Math.round(gold24kPer10g / 10).toLocaleString('en-IN')}/gram
                        </span>
                      </div>

                      {/* 22K Hallmark Gold */}
                      <div className={`p-3 rounded-xl border bg-[#181818] transition-all ${
                        isTickFlashing ? 'border-[#B59A6C]' : 'border-[#262626]'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase">
                            22K HALLMARK (10G)
                          </span>
                          {activeDeltas?.gold22k === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          {activeDeltas?.gold22k === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                          {(!activeDeltas?.gold22k || activeDeltas?.gold22k === 'same') && (
                            <Minus className="w-3 h-3 text-neutral-500" />
                          )}
                        </div>
                        <span className="font-mono text-base font-bold text-white block">
                          Rs. {gold22kPer10g.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                          Rs. {Math.round(gold22kPer10g / 10).toLocaleString('en-IN')}/gram
                        </span>
                      </div>

                      {/* 18K Luxury Gold */}
                      <div className="p-3 rounded-xl border border-[#262626] bg-[#181818]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase">
                            18K GOLD (10G)
                          </span>
                          <Minus className="w-3 h-3 text-neutral-500" />
                        </div>
                        <span className="font-mono text-base font-bold text-white block">
                          Rs. {gold18kPer10g.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                          Rs. {Math.round(gold18kPer10g / 10).toLocaleString('en-IN')}/gram
                        </span>
                      </div>

                      {/* Fine Silver 999 */}
                      <div className="p-3 rounded-xl border border-[#262626] bg-[#181818]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase">
                            FINE SILVER (1 KG)
                          </span>
                          {activeDeltas?.silverPeti === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          {activeDeltas?.silverPeti === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                          {(!activeDeltas?.silverPeti || activeDeltas?.silverPeti === 'same') && (
                            <Minus className="w-3 h-3 text-neutral-500" />
                          )}
                        </div>
                        <span className="font-mono text-base font-bold text-white block">
                          Rs. {silver1kg.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                          Rs. {Math.round(silver1kg / 1000).toLocaleString('en-IN')}/gram
                        </span>
                      </div>
                    </div>

                    {/* Interactive Gram-to-Rupee Calculator */}
                    <div className="p-4 rounded-xl bg-[#191919] border border-[#B59A6C]/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[#B59A6C] uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#B59A6C]" />
                          ATELIER METAL VALUATION CALCULATOR
                        </span>

                        {/* Calculation Mode Switcher */}
                        <div className="flex bg-[#111111] p-0.5 rounded-lg border border-[#333333]">
                          <button
                            type="button"
                            onClick={() => setCalcMode('gramsToRupees')}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                              calcMode === 'gramsToRupees'
                                ? 'bg-[#B59A6C] text-[#111111]'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            By Grams
                          </button>
                          <button
                            type="button"
                            onClick={() => setCalcMode('rupeesToGrams')}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                              calcMode === 'rupeesToGrams'
                                ? 'bg-[#B59A6C] text-[#111111]'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            By Budget
                          </button>
                        </div>
                      </div>

                      {/* Select Metal Purity for Calculator */}
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400 mb-1">
                          Metal Benchmark:
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: '24k', label: '24K (999)' },
                            { id: '22k', label: '22K (916)' },
                            { id: '18k', label: '18K (750)' },
                            { id: 'silver', label: 'Silver 999' }
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setCalcPurity(p.id)}
                              className={`py-1 px-1.5 rounded-lg border text-center font-mono text-[10px] font-bold transition-all ${
                                calcPurity === p.id
                                  ? 'border-[#B59A6C] bg-[#B59A6C]/20 text-[#B59A6C]'
                                  : 'border-[#2D2D2D] bg-[#141414] text-neutral-400 hover:text-white'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inputs */}
                      {calcMode === 'gramsToRupees' ? (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="font-mono text-[10px] uppercase text-neutral-400">
                              Weight in Grams:
                            </label>
                            <span className="font-mono font-bold text-xs text-[#B59A6C]">
                              {inputGrams} g
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="150"
                            step="0.5"
                            value={inputGrams}
                            onChange={(e) => setInputGrams(Number(e.target.value))}
                            className="w-full accent-[#B59A6C] cursor-pointer"
                          />
                          <div className="flex gap-1.5 mt-1.5">
                            {[5, 10, 20, 50, 100].map((quickG) => (
                              <button
                                key={quickG}
                                type="button"
                                onClick={() => setInputGrams(quickG)}
                                className="px-2 py-0.5 rounded bg-[#222222] text-[9px] font-mono text-neutral-300 hover:bg-[#333333]"
                              >
                                {quickG}g
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block font-mono text-[10px] uppercase text-neutral-400 mb-1">
                            Target Budget in Rupees:
                          </label>
                          <input
                            type="number"
                            min="5000"
                            step="5000"
                            value={inputRupees}
                            onChange={(e) => setInputRupees(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#2D2D2D] text-white font-mono text-xs focus:border-[#B59A6C] outline-none"
                          />
                          <div className="flex gap-1.5 mt-1.5">
                            {[25000, 50000, 100000, 250000, 500000].map((quickB) => (
                              <button
                                key={quickB}
                                type="button"
                                onClick={() => setInputRupees(quickB)}
                                className="px-2 py-0.5 rounded bg-[#222222] text-[9px] font-mono text-neutral-300 hover:bg-[#333333]"
                              >
                                Rs. {(quickB / 1000)}k
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Valuation Output Breakdown */}
                      <div className="p-3 rounded-lg bg-[#141414] border border-[#2D2D2D] space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-neutral-400 text-[11px]">
                          <span>Net Metal Grams:</span>
                          <span className="text-white font-bold">{valuationResult.grams} grams</span>
                        </div>
                        <div className="flex justify-between text-neutral-400 text-[11px]">
                          <span>Metal Value:</span>
                          <span className="text-white">Rs. {valuationResult.metalValue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400 text-[11px]">
                          <span>Applicable GST (3%):</span>
                          <span className="text-white">Rs. {valuationResult.gst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="pt-1.5 border-t border-[#262626] flex justify-between items-center">
                          <span className="font-bold text-neutral-200">Total Est. Metal Cost:</span>
                          <span className="font-bold text-sm text-[#B59A6C]">
                            Rs. {valuationResult.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <span className="font-mono text-[9px] text-neutral-500 block leading-tight">
                        Note: Live metal pricing excludes craftsmanship making charges and gemstone studded weights.
                      </span>

                      {/* Lock Rate Button */}
                      <button
                        type="button"
                        onClick={handleLockBullionRateWhatsApp}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#B59A6C] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Inquire & Lock Rate via WhatsApp
                      </button>
                    </div>
                  </div>
                )}

                {/* ══════════ TAB 4: BESPOKE VISION & HEIRLOOM REVIVAL ══════════ */}
                {activeTab === 'bespoke' && (
                  <form onSubmit={handleBespokeInquiryWhatsApp} className="space-y-4">
                    {/* Header Banner */}
                    <div className="p-3 rounded-xl bg-[#191919] border border-[#2D2D2D] space-y-1">
                      <span className="font-mono text-[9px] font-bold text-[#B59A6C] uppercase tracking-wider flex items-center gap-1.5">
                        <Gem className="w-3 h-3 text-[#B59A6C]" />
                        MASTER KARIGAR BESPOKE COMMISSIONS
                      </span>
                      <p className="font-serif italic text-xs text-neutral-300">
                        Commission an original jewelry design from scratch or revive an ancestral family heirloom with our master craftsmen in Didwana.
                      </p>
                    </div>

                    {/* Quick Category Chips */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B59A6C] mb-1.5">
                        Select Jewelry Silhouette:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {BESPOKE_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setBespokeTitle(chip)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                              bespokeTitle === chip
                                ? 'border-[#B59A6C] bg-[#B59A6C] text-[#111111]'
                                : 'border-[#2D2D2D] bg-[#181818] text-neutral-300 hover:border-[#3E3E3E]'
                            }`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Design Concept Title */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                        Design Concept / Heirloom Title:
                      </label>
                      <input
                        type="text"
                        required
                        value={bespokeTitle}
                        onChange={(e) => setBespokeTitle(e.target.value)}
                        placeholder="e.g. Traditional Kundan Jadau Choker with Emerald Drops"
                        className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                      />
                    </div>

                    {/* Metal Preference & Weight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                          Metal Karatage:
                        </label>
                        <select
                          value={bespokeMetal}
                          onChange={(e) => setBespokeMetal(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        >
                          <option value="24K Pure Kundan Gold (999)">24K Pure Kundan Gold (999)</option>
                          <option value="22K Hallmark Gold (916)">22K Hallmark Gold (916)</option>
                          <option value="18K Rose/White Gold (750)">18K Rose/White Gold (750)</option>
                          <option value="Platinum 950">Platinum 950</option>
                          <option value="Fine 999 Bullion Silver">Fine 999 Bullion Silver</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                          Target Weight / Budget:
                        </label>
                        <input
                          type="text"
                          value={bespokeWeight}
                          onChange={(e) => setBespokeWeight(e.target.value)}
                          placeholder="e.g. ~35 grams or Rs. 3 Lakhs"
                          className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        />
                      </div>
                    </div>

                    {/* Custom Notes / Photo Instructions */}
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                        Design Details & Ancestral Restoration Instructions:
                      </label>
                      <textarea
                        rows={3}
                        value={bespokeNotes}
                        onChange={(e) => setBespokeNotes(e.target.value)}
                        placeholder="Describe your vision, heirloom remounting requests, or reference sketches. You will be prompted to attach sketches/photos directly in the WhatsApp chat with our master karigar."
                        className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none resize-none"
                      />
                    </div>

                    {/* Patron Contact Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                          Patron Name:
                        </label>
                        <input
                          type="text"
                          value={patronName}
                          onChange={(e) => setPatronName(e.target.value)}
                          placeholder="e.g. Ayush Soni"
                          className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                          Phone Number:
                        </label>
                        <input
                          type="tel"
                          value={patronPhone}
                          onChange={(e) => setPatronPhone(e.target.value)}
                          placeholder="e.g. +91 93512 14851"
                          className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-white text-xs focus:border-[#B59A6C] outline-none"
                        />
                      </div>
                    </div>

                    {/* Submit and 3D Studio Links */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-[#B59A6C] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Submit Bespoke Brief to Master Karigar on WhatsApp
                      </button>

                      <Link
                        to="/custom-atelier"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] text-[#B59A6C] hover:border-[#B59A6C] text-center font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        Launch Interactive 3D Bespoke Ring Studio
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </form>
                )}
              </div>

              {/* ─── DRAWER FOOTER: DIDWANA DELIVERY & RAPID CONTACT ─── */}
              <div className="p-3.5 sm:p-4 border-t border-[#262626] bg-[#111111] flex-shrink-0 space-y-2.5">
                {/* Pincode Quick-Checker */}
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeCheck}
                      onChange={(e) => setPincodeCheck(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter Pincode (e.g. 341303)"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] text-white text-xs font-mono focus:border-[#B59A6C] outline-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-[#242424] hover:bg-[#2F2F2F] text-neutral-200 border border-[#333333] text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
                  >
                    Check Zone
                  </button>
                </form>

                {/* Delivery Result Announcement */}
                {deliveryResult && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] leading-tight flex items-start gap-2 ${
                      deliveryResult.isEligible
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                        : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-current" />
                    <div>
                      <span className="font-bold block">{deliveryResult.title}</span>
                      <span>{deliveryResult.message}</span>
                      {!deliveryResult.isEligible && (
                        <a
                          href={deliveryResult.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-1 font-bold text-[#B59A6C] hover:underline"
                        >
                          Coordinate Special Insured Delivery on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Direct Showroom Hotline Links */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-[#222222]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#B59A6C]" />
                    <span>Station Road, Didwana (PIN 341303)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href="tel:+919351214851"
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-[#B59A6C]" />
                      Call Showroom
                    </a>
                    <a
                      href={DIDWANA_ZONE.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white flex items-center gap-1 text-[#B59A6C] font-bold transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp Desk
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlimmrConcierge;
