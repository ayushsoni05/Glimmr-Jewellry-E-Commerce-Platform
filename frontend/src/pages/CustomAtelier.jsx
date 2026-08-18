import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import ThreeRingCanvas from '../components/ThreeRingCanvas';
import RealisticRing from '../components/RealisticRing';
import { Upload, X, Check, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import axios from 'axios';

// ─── DATA CONSTANTS ────────────────────────────────────────────

const METALS = [
  { id: '24k-gold', name: '24K Pure Gold', purity: '99.9% Pure', color: '#E8DCC4', pricePerGram: 7580, badge: '24K GOLD' },
  { id: '22k-gold', name: '22K Hallmark Gold', purity: '91.6% Gold', color: '#D4AF37', pricePerGram: 6948, badge: '22K GOLD' },
  { id: '18k-rose', name: '18K Rose Gold', purity: '75.0% Gold + Copper', color: '#E8C3B9', pricePerGram: 5685, badge: '18K ROSE' },
  { id: 'platinum', name: 'Platinum 950', purity: '95.0% Pure Platinum', color: '#E5E7EB', pricePerGram: 3200, badge: 'PT 950' },
  { id: '925-silver', name: '925 Sterling Silver', purity: '92.5% Pure Silver', color: '#D1D5DB', pricePerGram: 95, badge: '925 SILVER' }
];

const BAND_PROFILES = [
  { id: 'comfort-fit', name: 'Comfort Fit', desc: 'Rounded interior for all-day wear' },
  { id: 'flat', name: 'Flat Band', desc: 'Modern minimal squared profile' },
  { id: 'd-shape', name: 'D-Shape', desc: 'Classic domed exterior, flat interior' },
  { id: 'knife-edge', name: 'Knife Edge', desc: 'Peaked center ridge, angular form' },
  { id: 'half-round', name: 'Half Round', desc: 'Gently domed, traditional silhouette' },
  { id: 'beveled', name: 'Beveled Edge', desc: 'Angular chamfered edges, contemporary' }
];

const BAND_WIDTHS = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 10];

const BAND_PATTERNS = [
  { id: 'plain', name: 'Plain Polished', desc: 'Clean smooth surface', price: 0 },
  { id: 'hammered', name: 'Hammered', desc: 'Artisan hand-hammered dimples', price: 3500 },
  { id: 'milgrain', name: 'Milgrain Border', desc: 'Tiny bead detailing on edges', price: 4000 },
  { id: 'rope-twist', name: 'Rope Twist', desc: 'Braided rope texture around band', price: 5500 },
  { id: 'celtic-knot', name: 'Celtic Knot', desc: 'Interwoven endless knot relief', price: 6500 },
  { id: 'brushed', name: 'Linear Brushed', desc: 'Directional satin brushstrokes', price: 2000 },
  { id: 'wood-grain', name: 'Mokume Gane', desc: 'Japanese wood-grain metal art', price: 8000 },
  { id: 'channel', name: 'Channel Groove', desc: 'Single or double milled grooves', price: 3000 }
];

const FINISHES = [
  { id: 'high-polish', name: 'High Polish', desc: 'Mirror-reflective surface' },
  { id: 'matte', name: 'Matte / Brushed', desc: 'Soft diffused non-reflective' },
  { id: 'satin', name: 'Satin Finish', desc: 'Subtle directional sheen' },
  { id: 'sandblast', name: 'Sandblast Texture', desc: 'Frosted granular surface' },
  { id: 'two-tone', name: 'Two-Tone Contrast', desc: 'Polish + matte alternating sections' }
];

const GEMSTONES = [
  { id: 'no-stone', name: 'No Stone (Plain Band)', color: 'transparent', pricePerCarat: 0, desc: 'Minimal elegance' },
  { id: 'vvs-diamond', name: 'VVS1 Solitaire Diamond', color: '#E0F2FE', pricePerCarat: 125000, desc: 'Flawless Brilliance and Fire' },
  { id: 'emerald', name: 'Royal Colombian Emerald', color: '#059669', pricePerCarat: 85000, desc: 'Deep Vivid Green' },
  { id: 'sapphire', name: 'Kashmir Blue Sapphire', color: '#1D4ED8', pricePerCarat: 95000, desc: 'Imperial Velvet Blue' },
  { id: 'ruby', name: 'Burmese Pigeon Blood Ruby', color: '#DC2626', pricePerCarat: 110000, desc: 'Vibrant Crimson Radiance' }
];

const DIAMOND_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const DIAMOND_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'];
const DIAMOND_CUT_GRADES = [
  { id: 'excellent', name: 'Excellent', multiplier: 1.0 },
  { id: 'very-good', name: 'Very Good', multiplier: 0.92 },
  { id: 'good', name: 'Good', multiplier: 0.85 },
  { id: 'fair', name: 'Fair', multiplier: 0.75 }
];

const CUTS = [
  { id: 'round', name: 'Brilliant Round', shape: 'rounded-full', desc: 'Maximum Light Return' },
  { id: 'emerald-cut', name: 'Emerald Cut', shape: 'rounded-sm', desc: 'Hall-of-Mirrors Step Cut' },
  { id: 'princess', name: 'Princess Cut', shape: 'rotate-45 rounded-none', desc: 'Modern Geometric Sparkle' },
  { id: 'oval', name: 'Imperial Oval', shape: 'rounded-[50%]', desc: 'Elongated Finger Profile' },
  { id: 'cushion', name: 'Cushion Cut', shape: 'rounded-lg', desc: 'Soft Rounded Pillars' },
  { id: 'pear', name: 'Pear Drop', shape: 'rounded-t-full rounded-b-sm', desc: 'Teardrop Elegance' }
];

const SETTING_STYLES = [
  { id: 'prong', name: 'Classic Prong', desc: '4 or 6 prongs holding the stone', price: 0 },
  { id: 'bezel', name: 'Full Bezel', desc: 'Metal rim encircling the stone', price: 3000 },
  { id: 'tension', name: 'Tension Set', desc: 'Stone suspended by band pressure', price: 5000 },
  { id: 'channel', name: 'Channel Set', desc: 'Stone seated between two rails', price: 4000 },
  { id: 'pave', name: 'Pave Surround', desc: 'Micro-set diamonds around center', price: 12000 },
  { id: 'flush', name: 'Flush / Gypsy', desc: 'Stone sits level with band surface', price: 3500 },
  { id: 'cathedral', name: 'Cathedral Arches', desc: 'Arched metal sweeps to the crown', price: 6000 },
  { id: 'halo', name: 'Diamond Halo', desc: 'Ring of micro-diamonds framing center', price: 18000 }
];

const SIDE_STONES = [
  { id: 'none', name: 'No Side Stones', desc: 'Clean solitaire focus', price: 0 },
  { id: 'pave-band', name: 'Pave Diamond Band', desc: 'Micro-set diamonds along the band', price: 25000 },
  { id: 'channel-baguette', name: 'Channel Baguettes', desc: 'Step-cut baguette diamonds in channel', price: 22000 },
  { id: 'three-stone', name: 'Three-Stone Trilogy', desc: 'Two accent rounds flanking center', price: 35000 },
  { id: 'side-rounds', name: 'Accent Side Rounds', desc: 'Two small round brilliants beside center', price: 15000 }
];

const ART_EMBLEMS = [
  { id: 'none', name: 'None (Clean Polish)', desc: 'Smooth metallic band finish' },
  { id: 'lotus', name: 'Royal Lotus Motif', desc: 'Intricate 3D lotus bloom on shoulder' },
  { id: 'infinity', name: 'Infinity Loop', desc: 'Endless love symbol sculpted in gold' },
  { id: 'heart', name: 'Imperial Heart', desc: 'Subtle heart relief motif' },
  { id: 'monogram', name: 'Custom Monogram', desc: 'Hand-carved initials emblem' },
];

const RING_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

const TOTAL_STEPS = 7;
const stepLabels = [
  'Band Foundation',
  'Band Aesthetics',
  'Center Stone',
  'Cut & Carat',
  'Setting & Accents',
  'Art & Inscription',
  'Review & Submit'
];

// ─── ANIMATION VARIANTS ────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 35, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
};

const slideIn = (delay = 0) => ({
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0], delay }
});

// ─── REUSABLE UI COMPONENTS ────────────────────────────────────

function SectionHeader({ stepNum, title, subtitle }) {
  return (
    <div className="mb-6">
      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
        STEP {stepNum} OF {TOTAL_STEPS}
      </span>
      <h2 className="text-3xl font-heading text-[#222222]">{title}</h2>
      <p className="font-body text-sm text-[#808080] mt-1">{subtitle}</p>
    </div>
  );
}

function OptionCard({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-[16px] text-left flex items-center gap-4 transition-all cursor-pointer ${
        selected ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white hover:bg-[#FAFAFA] border border-gray-100'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function CompactOptionCard({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-[14px] flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
        selected ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white border border-gray-100 hover:bg-[#FAFAFA]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function PillSelector({ options, selected, onSelect, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map(opt => (
        <button
          type="button"
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-3.5 py-2 rounded-full font-mono text-xs font-bold transition-all ${
            selected === opt ? 'bg-[#222222] text-white' : 'bg-[#FAF9F7] text-[#808080] hover:bg-gray-100'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SubLabel({ children }) {
  return (
    <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
      {children}
    </label>
  );
}

// ─── BAND PROFILE SVG CROSS-SECTIONS ───────────────────────────

function BandProfileIcon({ profileId, size = 40 }) {
  const s = size;
  const paths = {
    'comfort-fit': `M${s*0.15},${s*0.75} Q${s*0.5},${s*0.15} ${s*0.85},${s*0.75} Q${s*0.5},${s*0.55} ${s*0.15},${s*0.75}`,
    'flat': `M${s*0.15},${s*0.65} L${s*0.85},${s*0.65} L${s*0.85},${s*0.45} L${s*0.15},${s*0.45} Z`,
    'd-shape': `M${s*0.15},${s*0.7} Q${s*0.5},${s*0.2} ${s*0.85},${s*0.7} L${s*0.85},${s*0.55} L${s*0.15},${s*0.55} Z`,
    'knife-edge': `M${s*0.15},${s*0.75} L${s*0.5},${s*0.25} L${s*0.85},${s*0.75} Q${s*0.5},${s*0.55} ${s*0.15},${s*0.75}`,
    'half-round': `M${s*0.15},${s*0.7} Q${s*0.5},${s*0.3} ${s*0.85},${s*0.7} L${s*0.85},${s*0.6} L${s*0.15},${s*0.6} Z`,
    'beveled': `M${s*0.2},${s*0.7} L${s*0.3},${s*0.4} L${s*0.7},${s*0.4} L${s*0.8},${s*0.7} L${s*0.8},${s*0.55} L${s*0.2},${s*0.55} Z`,
  };
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="flex-shrink-0">
      <path d={paths[profileId] || paths['comfort-fit']} fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────

const CustomAtelier = () => {
  const [step, setStep] = useState(1);

  // Step 1: Band Foundation
  const [selectedMetal, setSelectedMetal] = useState(METALS[0]);
  const [bandProfile, setBandProfile] = useState(BAND_PROFILES[0]);
  const [bandWidthMm, setBandWidthMm] = useState(4);
  const [metalWeightGram, setMetalWeightGram] = useState(8);

  // Step 2: Band Aesthetics
  const [bandPattern, setBandPattern] = useState(BAND_PATTERNS[0]);
  const [bandFinish, setBandFinish] = useState(FINISHES[0]);
  const [twoToneEnabled, setTwoToneEnabled] = useState(false);
  const [twoToneMetal, setTwoToneMetal] = useState(METALS[3]); // Platinum default for two-tone inner

  // Step 3: Center Stone
  const [selectedGem, setSelectedGem] = useState(GEMSTONES[1]);
  const [diamondColor, setDiamondColor] = useState('F');
  const [diamondClarity, setDiamondClarity] = useState('VVS1');
  const [diamondCutGrade, setDiamondCutGrade] = useState(DIAMOND_CUT_GRADES[0]);

  // Step 4: Cut & Carat
  const [selectedCut, setSelectedCut] = useState(CUTS[0]);
  const [caratWeight, setCaratWeight] = useState(1.0);

  // Step 5: Setting & Accents
  const [settingStyle, setSettingStyle] = useState(SETTING_STYLES[0]);
  const [sideStones, setSideStones] = useState(SIDE_STONES[0]);

  // Step 6: Art & Inscription
  const [selectedArt, setSelectedArt] = useState(ART_EMBLEMS[0]);
  const [engravingText, setEngravingText] = useState('');
  const [ringSize, setRingSize] = useState('7');

  // Step 7: Review & Submit
  const [referenceImages, setReferenceImages] = useState([]);
  const [referencePreviewUrls, setReferencePreviewUrls] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // View toggle
  const [viewMode3D, setViewMode3D] = useState(true);

  const fileInputRef = useRef(null);
  const { addToCart } = useCart();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // ─── PRICING ───────────────────────────────────────────────

  const pricing = useMemo(() => {
    const metalCost = Math.round(selectedMetal.pricePerGram * metalWeightGram);
    const twoToneSurcharge = twoToneEnabled ? Math.round(twoToneMetal.pricePerGram * (metalWeightGram * 0.3)) : 0;
    const cutMultiplier = selectedGem.id === 'vvs-diamond' ? diamondCutGrade.multiplier : 1.0;
    const gemCost = selectedGem.id === 'no-stone' ? 0 : Math.round(selectedGem.pricePerCarat * caratWeight * cutMultiplier);
    const patternCost = bandPattern.price || 0;
    const settingCost = settingStyle.price || 0;
    const sideStoneCost = sideStones.price || 0;
    const artCost = selectedArt.id !== 'none' ? 4500 : 0;
    const subtotalBeforeMaking = metalCost + twoToneSurcharge + gemCost + patternCost + settingCost + sideStoneCost + artCost;
    const makingCharges = Math.round(subtotalBeforeMaking * 0.12);
    const subtotal = subtotalBeforeMaking + makingCharges;
    const gst = Math.round(subtotal * 0.03);
    const total = subtotal + gst;
    return { metalCost, twoToneSurcharge, gemCost, patternCost, settingCost, sideStoneCost, artCost, makingCharges, gst, total };
  }, [selectedMetal, selectedGem, metalWeightGram, caratWeight, bandPattern, settingStyle, sideStones, selectedArt, twoToneEnabled, twoToneMetal, diamondCutGrade]);

  // ─── HANDLERS ──────────────────────────────────────────────

  const handleReferenceImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (referenceImages.length + files.length > 3) {
      toastError('Maximum 3 reference images allowed.');
      return;
    }
    const newFiles = [...referenceImages, ...files].slice(0, 3);
    setReferenceImages(newFiles);
    const urls = newFiles.map(f => URL.createObjectURL(f));
    setReferencePreviewUrls(urls);
  };

  const handleRemoveReferenceImage = (index) => {
    const newFiles = referenceImages.filter((_, i) => i !== index);
    setReferenceImages(newFiles);
    const urls = newFiles.map(f => URL.createObjectURL(f));
    setReferencePreviewUrls(urls);
  };

  const handleAddToCart = () => {
    const customProduct = {
      _id: `custom-${Date.now()}`,
      name: `Bespoke ${selectedGem.id !== 'no-stone' ? selectedGem.name + ' ' : ''}${selectedMetal.name} Ring`,
      price: pricing.total,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
      category: 'Rings',
      material: selectedMetal.name,
      customDetails: {
        metal: selectedMetal.name,
        bandProfile: bandProfile.name,
        bandWidthMm: `${bandWidthMm}mm`,
        bandPattern: bandPattern.name,
        bandFinish: bandFinish.name,
        twoTone: twoToneEnabled ? twoToneMetal.name : 'No',
        gemstone: selectedGem.id !== 'no-stone' ? `${selectedGem.name} (${caratWeight}ct ${selectedCut.name})` : 'Plain Band',
        diamondGrading: selectedGem.id === 'vvs-diamond' ? `${diamondColor} / ${diamondClarity} / ${diamondCutGrade.name}` : 'N/A',
        settingStyle: settingStyle.name,
        sideStones: sideStones.name,
        artMotif: selectedArt.name,
        engraving: engravingText || 'None',
        size: ringSize
      }
    };
    addToCart(customProduct, 1);
    success('Your bespoke creation has been added to your cart.');
    navigate('/cart');
  };

  const handleSubmitBespokeRequest = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      toastError('Please fill in your name, email address, and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload reference images first if any
      let uploadedRefUrls = [];
      if (referenceImages.length > 0) {
        const formData = new FormData();
        referenceImages.forEach(f => formData.append('referenceImages', f));
        try {
          const uploadRes = await axios.post('/api/custom-orders/upload-references', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
            uploadedRefUrls = uploadRes.data.urls;
          }
        } catch (uploadErr) {
          console.error('Reference image upload failed (non-critical):', uploadErr);
        }
      }

      const response = await axios.post('/api/custom-orders', {
        customerName,
        customerEmail,
        customerPhone,
        preferredContactMethod: preferredContact,
        notes: customerNotes,
        metal: {
          id: selectedMetal.id,
          name: selectedMetal.name,
          purity: selectedMetal.purity,
          color: selectedMetal.color,
          pricePerGram: selectedMetal.pricePerGram,
          weightGrams: metalWeightGram,
        },
        bandProfile: { id: bandProfile.id, name: bandProfile.name },
        bandWidthMm,
        bandPattern: { id: bandPattern.id, name: bandPattern.name, price: bandPattern.price },
        bandFinish: { id: bandFinish.id, name: bandFinish.name },
        twoToneMetal: twoToneEnabled ? {
          id: twoToneMetal.id,
          name: twoToneMetal.name,
          color: twoToneMetal.color,
          pricePerGram: twoToneMetal.pricePerGram,
        } : null,
        gemstone: {
          id: selectedGem.id,
          name: selectedGem.name,
          color: selectedGem.color,
          pricePerCarat: selectedGem.pricePerCarat,
        },
        diamondGrading: selectedGem.id === 'vvs-diamond' ? {
          color: diamondColor,
          clarity: diamondClarity,
          cutGrade: diamondCutGrade.id,
        } : null,
        cut: {
          id: selectedCut.id,
          name: selectedCut.name,
        },
        caratWeight,
        settingStyle: { id: settingStyle.id, name: settingStyle.name, price: settingStyle.price },
        sideStones: { id: sideStones.id, name: sideStones.name, price: sideStones.price },
        personalization: {
          engravingText,
          artEmblem: selectedArt.id,
          artEmblemName: selectedArt.name,
          ringSize,
        },
        referenceImages: uploadedRefUrls,
        pricing,
      });

      if (response.data.success) {
        setSubmittedOrder(response.data.order);
        success('Bespoke request sent to master goldsmiths. Admin email alert dispatched.');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      toastError(err.response?.data?.message || 'Failed submitting custom order request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── DESIGN SUMMARY (for Step 7) ─────────────────────────

  const designSummary = [
    { label: 'Metal', value: `${selectedMetal.name} (${metalWeightGram}g)` },
    { label: 'Band Profile', value: bandProfile.name },
    { label: 'Band Width', value: `${bandWidthMm}mm` },
    { label: 'Pattern', value: bandPattern.name },
    { label: 'Finish', value: bandFinish.name },
    { label: 'Two-Tone', value: twoToneEnabled ? `Inner: ${twoToneMetal.name}` : 'No' },
    { label: 'Center Stone', value: selectedGem.id !== 'no-stone' ? `${selectedGem.name} (${caratWeight}ct)` : 'Plain Band' },
    ...(selectedGem.id === 'vvs-diamond' ? [{ label: 'Diamond Grade', value: `${diamondColor} / ${diamondClarity} / ${diamondCutGrade.name}` }] : []),
    ...(selectedGem.id !== 'no-stone' ? [{ label: 'Cut', value: selectedCut.name }] : []),
    { label: 'Setting', value: settingStyle.name },
    { label: 'Side Stones', value: sideStones.name },
    { label: 'Art Motif', value: selectedArt.name },
    { label: 'Engraving', value: engravingText || 'None' },
    { label: 'Ring Size', value: `US ${ringSize}` },
  ];

  // ─── RENDER ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Header Hero */}
        <motion.div {...fadeUp} className="text-center mb-12 lg:mb-16">
          <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] mb-4">
            GLIMMR ATELIER -- COMPLETE RING DESIGN STUDIO
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#222222] leading-[1.15] tracking-tight mb-4">
            Design Your Ring, Every Detail
          </h1>
          <p className="font-body text-sm text-[#808080] max-w-xl mx-auto leading-relaxed">
            Craft your perfect ring from scratch. Choose the metal, profile, pattern, stone, setting, and inscription. Preview in real-time 3D WebGL, then submit directly to our master goldsmiths.
          </p>
        </motion.div>

        {/* Progress Stepper Bar */}
        <motion.div {...fadeUp} className="mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <button
                  key={label}
                  onClick={() => setStep(stepNum)}
                  className="relative flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold transition-all duration-300 ${
                    isActive ? 'bg-[#222222] text-white' : isCompleted ? 'bg-[#B59A6C] text-white' : 'bg-[#FAF9F7] text-[#808080] group-hover:bg-gray-100'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </div>
                  <span className={`hidden lg:block text-[10px] font-body font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                    isActive ? 'text-[#222222]' : 'text-[#808080] group-hover:text-[#222222]'
                  }`}>
                    {label}
                  </span>
                  {i < TOTAL_STEPS - 1 && (
                    <div className={`hidden sm:block w-4 lg:w-8 h-[1px] ml-0.5 transition-colors duration-300 ${
                      isCompleted ? 'bg-[#B59A6C]' : 'bg-gray-200'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Configurator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: 3D Ring Preview + Price Breakdown */}
          <motion.div {...fadeUp} className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="bg-[#FAF9F7] rounded-[20px] p-4 sm:p-6 aspect-square flex flex-col items-center justify-center relative overflow-hidden group border border-gray-100">
              
              {/* 3D / 2D Toggle */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-gray-200/60">
                <button
                  onClick={() => setViewMode3D(true)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-full transition-colors ${
                    viewMode3D ? 'bg-[#222222] text-white' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  3D WEBGL
                </button>
                <button
                  onClick={() => setViewMode3D(false)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-full transition-colors ${
                    !viewMode3D ? 'bg-[#222222] text-white' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  2D STUDIO
                </button>
              </div>

              {/* Metal Badge */}
              <span className="absolute top-4 left-4 z-10 text-[10px] font-mono font-bold text-[#B59A6C] px-3 py-1 bg-white/90 backdrop-blur-md border border-[#B59A6C]/20 rounded-full">
                {selectedMetal.badge}
              </span>

              {/* Render Canvas */}
              {viewMode3D ? (
                <ThreeRingCanvas
                  metal={selectedMetal}
                  gemstone={selectedGem}
                  cut={selectedCut}
                  caratWeight={caratWeight}
                  bandWeight={metalWeightGram}
                  artEmblem={selectedArt.id}
                  autoRotate={true}
                  bandProfile={bandProfile.id}
                  bandPattern={bandPattern.id}
                  bandFinish={bandFinish.id}
                  bandWidthMm={bandWidthMm}
                  settingStyle={settingStyle.id}
                  sideStones={sideStones.id}
                  twoToneMetal={twoToneEnabled ? twoToneMetal : null}
                />
              ) : (
                <RealisticRing
                  metal={selectedMetal}
                  gemstone={selectedGem}
                  cut={selectedCut}
                  caratWeight={caratWeight}
                  bandWeight={metalWeightGram}
                  engravingText={engravingText}
                  bandProfile={bandProfile.id}
                  bandPattern={bandPattern.id}
                  bandFinish={bandFinish.id}
                  bandWidthMm={bandWidthMm}
                  settingStyle={settingStyle.id}
                  sideStones={sideStones.id}
                  twoToneMetal={twoToneEnabled ? twoToneMetal : null}
                />
              )}
            </div>

            {/* Price Breakdown Card */}
            <div className="mt-4 bg-[#FAF9F7] rounded-[20px] p-6 sm:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C]">
                  REAL-TIME PRICE BREAKDOWN
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  IBJA LIVE
                </span>
              </div>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between text-[#808080]">
                  <span>{selectedMetal.name} ({metalWeightGram}g)</span>
                  <span className="font-mono text-[#222222]">Rs.{pricing.metalCost.toLocaleString('en-IN')}</span>
                </div>
                {pricing.twoToneSurcharge > 0 && (
                  <div className="flex justify-between text-[#808080]">
                    <span>Two-Tone Inner ({twoToneMetal.name})</span>
                    <span className="font-mono text-[#222222]">Rs.{pricing.twoToneSurcharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.gemCost > 0 && (
                  <div className="flex justify-between text-[#808080]">
                    <span>{selectedGem.name} ({caratWeight}ct {selectedCut.name})</span>
                    <span className="font-mono text-[#222222]">Rs.{pricing.gemCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.patternCost > 0 && (
                  <div className="flex justify-between text-[#808080]">
                    <span>Band Pattern ({bandPattern.name})</span>
                    <span className="font-mono text-[#222222]">Rs.{pricing.patternCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.settingCost > 0 && (
                  <div className="flex justify-between text-[#808080]">
                    <span>Setting ({settingStyle.name})</span>
                    <span className="font-mono text-[#222222]">Rs.{pricing.settingCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.sideStoneCost > 0 && (
                  <div className="flex justify-between text-[#808080]">
                    <span>Side Stones ({sideStones.name})</span>
                    <span className="font-mono text-[#222222]">Rs.{pricing.sideStoneCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.artCost > 0 && (
                  <div className="flex justify-between text-[#808080]">
                    <span>3D Art Motif ({selectedArt.name})</span>
                    <span className="font-mono text-[#222222]">Rs.{pricing.artCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#808080]">
                  <span>Making and Goldsmithing Charges (12%)</span>
                  <span className="font-mono text-[#222222]">Rs.{pricing.makingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#808080]">
                  <span>GST (3%)</span>
                  <span className="font-mono text-[#222222]">Rs.{pricing.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">
                    Total Bespoke Valuation
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#222222]">
                    Rs.{pricing.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Step Forms */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">

              {/* ═══ STEP 1: Band Foundation ═══ */}
              {step === 1 && (
                <motion.div key="step1" {...slideIn()}>
                  <SectionHeader stepNum={1} title="Band Foundation" subtitle="Choose your precious base metal, band profile shape, width, and weight." />

                  {/* Metal Selection */}
                  <SubLabel>Select Metal</SubLabel>
                  <div className="space-y-3 mb-6">
                    {METALS.map((m) => (
                      <OptionCard key={m.id} selected={selectedMetal.id === m.id} onClick={() => setSelectedMetal(m)}>
                        <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: m.color, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-body font-bold text-[#222222]">{m.name}</span>
                            <span className="text-[10px] font-mono font-bold text-[#B59A6C] px-2 py-0.5 bg-white border border-[#B59A6C]/30 rounded-full">{m.badge}</span>
                          </div>
                          <span className="text-xs text-[#808080] font-body">{m.purity}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-[#222222]">Rs.{m.pricePerGram.toLocaleString('en-IN')}/g</span>
                      </OptionCard>
                    ))}
                  </div>

                  {/* Band Profile */}
                  <SubLabel>Band Profile Shape</SubLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                    {BAND_PROFILES.map((bp) => (
                      <CompactOptionCard key={bp.id} selected={bandProfile.id === bp.id} onClick={() => setBandProfile(bp)}>
                        <BandProfileIcon profileId={bp.id} />
                        <span className="text-xs font-body font-bold text-[#222222]">{bp.name}</span>
                        <span className="text-[10px] text-[#808080] leading-tight">{bp.desc}</span>
                      </CompactOptionCard>
                    ))}
                  </div>

                  {/* Band Width */}
                  <SubLabel>Band Width (mm)</SubLabel>
                  <div className="mb-6">
                    <PillSelector
                      options={BAND_WIDTHS.map(String)}
                      selected={String(bandWidthMm)}
                      onSelect={(v) => setBandWidthMm(parseFloat(v))}
                    />
                    <div className="flex justify-between text-[10px] font-body text-[#808080] mt-2 px-1">
                      <span>2mm -- Delicate</span><span>5mm -- Classic</span><span>10mm -- Statement</span>
                    </div>
                  </div>

                  {/* Band Weight Slider */}
                  <div className="bg-[#FAF9F7] rounded-[16px] p-6 border border-gray-100">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">Band Weight</span>
                      <span className="font-mono text-base font-bold text-[#222222]">{metalWeightGram} grams</span>
                    </div>
                    <input
                      type="range" min="3" max="25" step="0.5" value={metalWeightGram}
                      onChange={e => setMetalWeightGram(parseFloat(e.target.value))}
                      className="w-full accent-[#222222] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-body text-[#808080] mt-2">
                      <span>3g -- Dainty</span><span>12g -- Classic</span><span>25g -- Heavy Statement</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 2: Band Aesthetics ═══ */}
              {step === 2 && (
                <motion.div key="step2" {...slideIn()}>
                  <SectionHeader stepNum={2} title="Band Aesthetics" subtitle="Choose the texture pattern, surface finish, and optional two-tone metal for your band." />

                  {/* Band Pattern */}
                  <SubLabel>Band Pattern / Texture</SubLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                    {BAND_PATTERNS.map((bp) => (
                      <OptionCard key={bp.id} selected={bandPattern.id === bp.id} onClick={() => setBandPattern(bp)} className="!p-3.5">
                        <div className="flex-1 min-w-0">
                          <span className="font-body font-bold text-xs text-[#222222] block">{bp.name}</span>
                          <span className="text-[11px] text-[#808080] font-body">{bp.desc}</span>
                        </div>
                        <span className="text-xs font-mono text-[#B59A6C] whitespace-nowrap">
                          {bp.price === 0 ? 'FREE' : `+Rs.${bp.price.toLocaleString('en-IN')}`}
                        </span>
                      </OptionCard>
                    ))}
                  </div>

                  {/* Surface Finish */}
                  <SubLabel>Surface Finish</SubLabel>
                  <div className="space-y-2 mb-6">
                    {FINISHES.map((f) => (
                      <OptionCard key={f.id} selected={bandFinish.id === f.id} onClick={() => setBandFinish(f)} className="!p-3.5">
                        <div className="flex-1 min-w-0">
                          <span className="font-body font-bold text-xs text-[#222222] block">{f.name}</span>
                          <span className="text-[11px] text-[#808080] font-body">{f.desc}</span>
                        </div>
                      </OptionCard>
                    ))}
                  </div>

                  {/* Two-Tone Toggle */}
                  <div className="bg-[#FAF9F7] rounded-[16px] p-5 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <SubLabel>Two-Tone Metal</SubLabel>
                        <p className="text-[11px] text-[#808080] font-body -mt-2">Use a different metal for the inner band surface.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTwoToneEnabled(!twoToneEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${twoToneEnabled ? 'bg-[#222222]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${twoToneEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    {twoToneEnabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mt-3">
                        <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block mb-2">
                          Select Inner Band Metal
                        </span>
                        {METALS.filter(m => m.id !== selectedMetal.id).map((m) => (
                          <OptionCard key={m.id} selected={twoToneMetal.id === m.id} onClick={() => setTwoToneMetal(m)} className="!p-3">
                            <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: m.color, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} />
                            <div className="flex-1 min-w-0">
                              <span className="font-body font-bold text-xs text-[#222222]">{m.name}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#B59A6C]">{m.badge}</span>
                          </OptionCard>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: Center Stone ═══ */}
              {step === 3 && (
                <motion.div key="step3" {...slideIn()}>
                  <SectionHeader stepNum={3} title="Center Stone" subtitle="Select your certified gemstone. Diamond selections include full 4C quality grading." />

                  <div className="space-y-3 mb-6">
                    {GEMSTONES.map((g) => (
                      <OptionCard key={g.id} selected={selectedGem.id === g.id} onClick={() => setSelectedGem(g)}>
                        {g.id !== 'no-stone' ? (
                          <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}40` }} />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#FAF9F7] border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[9px] font-mono">PLAIN</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-body font-bold text-[#222222] block">{g.name}</span>
                          <span className="text-xs text-[#808080] font-body">{g.desc}</span>
                        </div>
                        {g.pricePerCarat > 0 && (
                          <span className="text-sm font-mono font-bold text-[#222222]">Rs.{g.pricePerCarat.toLocaleString('en-IN')}/ct</span>
                        )}
                      </OptionCard>
                    ))}
                  </div>

                  {/* Diamond 4C Grading Panel */}
                  {selectedGem.id === 'vvs-diamond' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#FAF9F7] rounded-[16px] p-5 border border-gray-100 space-y-5"
                    >
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block">
                        DIAMOND 4C QUALITY GRADING
                      </span>

                      {/* Color */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <SubLabel>Color Grade</SubLabel>
                          <span className="font-mono text-sm font-bold text-[#222222]">{diamondColor}</span>
                        </div>
                        <PillSelector
                          options={DIAMOND_COLORS}
                          selected={diamondColor}
                          onSelect={setDiamondColor}
                        />
                        <div className="flex justify-between text-[10px] font-body text-[#808080] mt-1.5 px-1">
                          <span>D -- Colorless</span><span>M -- Faint Yellow</span>
                        </div>
                      </div>

                      {/* Clarity */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <SubLabel>Clarity Grade</SubLabel>
                          <span className="font-mono text-sm font-bold text-[#222222]">{diamondClarity}</span>
                        </div>
                        <PillSelector
                          options={DIAMOND_CLARITIES}
                          selected={diamondClarity}
                          onSelect={setDiamondClarity}
                        />
                        <div className="flex justify-between text-[10px] font-body text-[#808080] mt-1.5 px-1">
                          <span>FL -- Flawless</span><span>I1 -- Included</span>
                        </div>
                      </div>

                      {/* Cut Grade */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <SubLabel>Cut Grade</SubLabel>
                          <span className="font-mono text-sm font-bold text-[#222222]">{diamondCutGrade.name}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {DIAMOND_CUT_GRADES.map((cg) => (
                            <button
                              type="button"
                              key={cg.id}
                              onClick={() => setDiamondCutGrade(cg)}
                              className={`py-2.5 rounded-[12px] text-[10px] font-body font-bold uppercase tracking-wider transition-all ${
                                diamondCutGrade.id === cg.id ? 'bg-[#222222] text-white' : 'bg-white text-[#808080] hover:bg-gray-50 border border-gray-100'
                              }`}
                            >
                              {cg.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ═══ STEP 4: Cut & Carat ═══ */}
              {step === 4 && (
                <motion.div key="step4" {...slideIn()}>
                  <SectionHeader stepNum={4} title="Cut and Carat" subtitle="Choose facet cut geometry and carat weight for your gemstone." />

                  {selectedGem.id !== 'no-stone' ? (
                    <>
                      <SubLabel>Select Cut Geometry</SubLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                        {CUTS.map((c) => (
                          <CompactOptionCard key={c.id} selected={selectedCut.id === c.id} onClick={() => setSelectedCut(c)}>
                            <div className={`w-6 h-6 border-2 ${selectedCut.id === c.id ? 'border-[#222222]' : 'border-gray-300'} ${c.shape}`} />
                            <span className="text-xs font-body font-bold text-[#222222]">{c.name}</span>
                            <span className="text-[10px] text-[#808080]">{c.desc}</span>
                          </CompactOptionCard>
                        ))}
                      </div>

                      {/* Carat Slider */}
                      <div className="bg-[#FAF9F7] rounded-[16px] p-5 border border-gray-100">
                        <div className="flex justify-between items-baseline mb-2">
                          <SubLabel>Carat Weight</SubLabel>
                          <span className="font-mono text-base font-bold text-[#222222]">{caratWeight} Carat</span>
                        </div>
                        <input
                          type="range" min="0.25" max="5.0" step="0.25" value={caratWeight}
                          onChange={e => setCaratWeight(parseFloat(e.target.value))}
                          className="w-full accent-[#222222] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-body text-[#808080] mt-1">
                          <span>0.25ct Solitaire</span><span>2.0ct Statement</span><span>5.0ct Royal</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-[#FAF9F7] rounded-[16px] p-8 border border-gray-100 text-center">
                      <p className="font-body text-sm text-[#808080]">
                        You selected a plain band with no center stone. Cut and carat options are not applicable.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(5)}
                        className="mt-4 px-6 py-2.5 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-colors"
                      >
                        Skip to Setting
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ STEP 5: Setting & Accents ═══ */}
              {step === 5 && (
                <motion.div key="step5" {...slideIn()}>
                  <SectionHeader stepNum={5} title="Setting and Accents" subtitle="Choose how the stone is mounted and add optional side stones for extra brilliance." />

                  {/* Setting Style */}
                  {selectedGem.id !== 'no-stone' && (
                    <div className="mb-6">
                      <SubLabel>Setting Style</SubLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {SETTING_STYLES.map((ss) => (
                          <OptionCard key={ss.id} selected={settingStyle.id === ss.id} onClick={() => setSettingStyle(ss)} className="!p-3.5">
                            <div className="flex-1 min-w-0">
                              <span className="font-body font-bold text-xs text-[#222222] block">{ss.name}</span>
                              <span className="text-[11px] text-[#808080] font-body">{ss.desc}</span>
                            </div>
                            <span className="text-xs font-mono text-[#B59A6C] whitespace-nowrap">
                              {ss.price === 0 ? 'INCLUDED' : `+Rs.${ss.price.toLocaleString('en-IN')}`}
                            </span>
                          </OptionCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Side Stones */}
                  <SubLabel>Side / Accent Stones</SubLabel>
                  <div className="space-y-2">
                    {SIDE_STONES.map((ss) => (
                      <OptionCard key={ss.id} selected={sideStones.id === ss.id} onClick={() => setSideStones(ss)} className="!p-3.5">
                        <div className="flex-1 min-w-0">
                          <span className="font-body font-bold text-xs text-[#222222] block">{ss.name}</span>
                          <span className="text-[11px] text-[#808080] font-body">{ss.desc}</span>
                        </div>
                        <span className="text-xs font-mono text-[#B59A6C] whitespace-nowrap">
                          {ss.price === 0 ? 'FREE' : `+Rs.${ss.price.toLocaleString('en-IN')}`}
                        </span>
                      </OptionCard>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 6: Art & Inscription ═══ */}
              {step === 6 && (
                <motion.div key="step6" {...slideIn()}>
                  <SectionHeader stepNum={6} title="Art and Inscription" subtitle="Add 3D relief art motifs, laser band inscription, and select your ring size." />

                  {/* 3D Art Emblem Motifs */}
                  <SubLabel>Select 3D Art and Relief Motif</SubLabel>
                  <div className="space-y-2 mb-6">
                    {ART_EMBLEMS.map((art) => (
                      <OptionCard key={art.id} selected={selectedArt.id === art.id} onClick={() => setSelectedArt(art)} className="!p-3.5">
                        <div className="flex-1 min-w-0">
                          <span className="font-body font-bold text-xs text-[#222222] block">{art.name}</span>
                          <span className="text-[11px] text-[#808080] font-body">{art.desc}</span>
                        </div>
                        <span className="text-xs font-mono text-[#B59A6C]">
                          {art.id === 'none' ? 'FREE' : '+Rs.4,500'}
                        </span>
                      </OptionCard>
                    ))}
                  </div>

                  {/* Laser Engraving */}
                  <SubLabel>Laser Inscription (Inner Band)</SubLabel>
                  <input
                    type="text" maxLength={25} value={engravingText}
                    onChange={e => setEngravingText(e.target.value)}
                    placeholder="e.g. Forever Yours 13.08"
                    className="w-full px-4 py-3 bg-[#FAF9F7] rounded-[14px] font-heading italic text-sm text-[#222222] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#222222] mb-6"
                  />

                  {/* Ring Size */}
                  <SubLabel>US Standard Ring Size</SubLabel>
                  <div className="flex flex-wrap gap-2">
                    {RING_SIZES.map(sz => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => setRingSize(sz)}
                        className={`w-10 h-10 rounded-full font-mono text-xs font-bold transition-all ${
                          ringSize === sz ? 'bg-[#222222] text-white' : 'bg-[#FAF9F7] text-[#808080] hover:bg-gray-100'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 7: Review & Submit ═══ */}
              {step === 7 && (
                <motion.div key="step7" {...slideIn()}>
                  <SectionHeader stepNum={7} title="Review and Submit" subtitle="Review your complete ring design, upload reference images, and submit to our master goldsmiths." />

                  {/* Design Summary Card */}
                  <div className="bg-[#FAF9F7] rounded-[16px] p-5 border border-gray-100 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-4 h-4 text-[#B59A6C]" />
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C]">
                        COMPLETE DESIGN SPECIFICATION
                      </span>
                    </div>
                    <div className="space-y-2">
                      {designSummary.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-baseline py-1.5 border-b border-gray-200/60 last:border-0">
                          <span className="text-xs font-body text-[#808080] uppercase tracking-wider">{item.label}</span>
                          <span className="text-xs font-body font-bold text-[#222222] text-right max-w-[55%]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload */}
                  <div className="mb-6">
                    <SubLabel>Reference / Inspiration Images (Optional)</SubLabel>
                    <p className="text-[11px] text-[#808080] font-body -mt-2 mb-3">Upload up to 3 images from Pinterest, other jewelers, or sketches.</p>
                    
                    <div className="flex gap-3 flex-wrap">
                      {referencePreviewUrls.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-[12px] overflow-hidden border border-gray-200">
                          <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReferenceImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-[#222222] rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {referenceImages.length < 3 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-[12px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-[#808080] hover:border-[#B59A6C] hover:text-[#B59A6C] transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-[9px] font-mono font-bold">UPLOAD</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceImageAdd}
                      className="hidden"
                    />
                  </div>

                  {/* Contact Details Form */}
                  <form onSubmit={handleSubmitBespokeRequest} className="space-y-5">
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block">
                        CUSTOMER CONTACT DETAILS FOR ADMIN REVIEW
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-body font-bold text-[#222222] mb-1 block">Full Name *</label>
                          <input
                            type="text" required value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-body font-bold text-[#222222] mb-1 block">Email Address *</label>
                          <input
                            type="email" required value={customerEmail}
                            onChange={e => setCustomerEmail(e.target.value)}
                            placeholder="jane@example.com"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-body font-bold text-[#222222] mb-1 block">Phone Number *</label>
                          <input
                            type="tel" required value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-body font-bold text-[#222222] mb-1 block">Preferred Contact</label>
                          <select
                            value={preferredContact}
                            onChange={e => setPreferredContact(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                          >
                            <option value="phone">Phone Call</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-body font-bold text-[#222222] mb-1 block">Special Customization Notes</label>
                        <textarea
                          rows={2} value={customerNotes}
                          onChange={e => setCustomerNotes(e.target.value)}
                          placeholder="Specify any custom requests or urgency..."
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                        />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-8 py-4 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors rounded-none cursor-pointer text-center disabled:opacity-60"
                      >
                        {isSubmitting ? 'Sending Request...' : 'Submit Request to Admin'}
                      </button>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="px-6 py-4 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors rounded-none border border-gray-200 cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors cursor-pointer rounded-none flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : <div />}

              {step < TOTAL_STEPS && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-colors shadow-md cursor-pointer rounded-none flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Submission Success Confirmation Modal */}
      <AnimatePresence>
        {submittedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] block mb-1">
                REQUEST RECEIVED
              </span>
              <h3 className="text-2xl font-heading text-[#222222] mb-2">Bespoke Order Submitted</h3>
              <p className="font-body text-xs text-[#808080] mb-4 leading-relaxed">
                Your request ID is <strong className="font-mono text-[#222222]">{submittedOrder.customOrderId}</strong>. An email notification has been dispatched to our admin team and master goldsmiths.
              </p>

              <div className="bg-[#FAF9F7] p-4 rounded-[16px] text-left text-xs font-body text-[#808080] space-y-1.5 mb-6">
                <div><strong>Customer:</strong> {submittedOrder.customerName} ({submittedOrder.customerPhone})</div>
                <div><strong>Metal:</strong> {submittedOrder.metal?.name}</div>
                <div><strong>Band:</strong> {submittedOrder.bandProfile?.name || 'Comfort Fit'} / {submittedOrder.bandWidthMm || 4}mm</div>
                <div><strong>Gemstone:</strong> {submittedOrder.gemstone?.name} ({submittedOrder.caratWeight}ct)</div>
                <div><strong>Setting:</strong> {submittedOrder.settingStyle?.name || 'Classic Prong'}</div>
                <div><strong>Status:</strong> <span className="font-bold text-amber-600 uppercase">Pending Admin Approval</span></div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubmittedOrder(null)}
                  className="flex-1 py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors rounded-none"
                >
                  Close and Continue
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="py-3 px-4 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.15em] border border-gray-200 hover:bg-gray-100 transition-colors rounded-none"
                >
                  Track in Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomAtelier;
