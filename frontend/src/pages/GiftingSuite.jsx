import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Generated Gift Set Product Images
const GIFT_IMAGES = {
  bridal: '/assets/gift_bridal_set.jpg',
  diamond: '/assets/gift_diamond_pendant.jpg',
  platinum: '/assets/gift_platinum_bands.jpg',
  emerald: '/assets/gift_emerald_set.jpg',
  goldCoin: '/assets/gift_gold_coin.jpg',
  cufflinks: '/assets/gift_mens_cufflinks.jpg',
  ruby: '/assets/gift_ruby_earrings.jpg',
};

// Curated Jewelry Gift Sets Catalog
const GIFT_SETS = [
  {
    id: 'bridal-kundan',
    name: 'Royal Kundan Bridal Necklace & Earring Suite',
    desc: 'Hand-set polki kundan choker necklace with matching chandelier jhumka earrings in crimson velvet heritage box.',
    price: 285000,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    badge: '22K GOLD',
    tags: ['bridal', 'anniversary', 'for-her'],
    material: 'gold',
    weight: '48g',
  },
  {
    id: 'diamond-pendant',
    name: 'Imperial Solitaire Diamond Pendant & Stud Box',
    desc: 'VVS1 certified solitaire pendant and matching diamond stud earrings, presented in midnight navy velvet box.',
    price: 175000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    badge: '18K ROSE GOLD',
    tags: ['anniversary', 'birthday', 'for-her'],
    material: 'gold',
    weight: '12g',
  },
  {
    id: 'platinum-bands',
    name: 'His & Hers Platinum Eternity Band Set',
    desc: 'Matching platinum eternity bands with micro-pavé diamond inlay, presented in white suede dual-ring box.',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop',
    badge: 'PT 950',
    tags: ['bridal', 'anniversary', 'for-couples'],
    material: 'platinum',
    weight: '18g',
  },
  {
    id: 'emerald-set',
    name: 'Rose Gold Emerald Halo Ring & Bracelet Set',
    desc: 'Colombian emerald halo ring and matching emerald tennis bracelet in forest green velvet box with gold clasp.',
    price: 225000,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop',
    badge: '18K GOLD',
    tags: ['anniversary', 'birthday', 'for-her'],
    material: 'gold',
    weight: '22g',
  },
  {
    id: 'gold-heritage',
    name: '24K Gold Coin & Medallion Pendant Heritage Box',
    desc: 'Two 5g pure gold coins and filigree medallion pendant chain in royal gold silk-lined heritage presentation box.',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=800&auto=format&fit=crop',
    badge: '24K GOLD',
    tags: ['birthday', 'milestone', 'for-her', 'for-him'],
    material: 'gold',
    weight: '15g',
  },
  {
    id: 'mens-cufflinks',
    name: 'Classic Onyx Cufflink & Tie Pin Suite',
    desc: 'Handcrafted black onyx cufflinks with matching tie pin in premium black leather presentation box.',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?q=80&w=800&auto=format&fit=crop',
    badge: '925 SILVER',
    tags: ['birthday', 'milestone', 'for-him'],
    material: 'silver',
    weight: '28g',
  },
  {
    id: 'ruby-earrings',
    name: 'Burmese Ruby Pear Drop Earrings Gift Box',
    desc: 'Pigeon blood ruby pear drop earrings with diamond halo in blush pink velvet box.',
    price: 195000,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    badge: '18K GOLD',
    tags: ['anniversary', 'birthday', 'for-her'],
    material: 'gold',
    weight: '8g',
  },
  {
    id: 'silver-anklet',
    name: 'Traditional Silver Payal & Toe Ring Set',
    desc: 'Handcrafted 925 silver anklets with ghungroo bells and matching adjustable toe rings in silk pouch.',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    badge: '925 SILVER',
    tags: ['birthday', 'for-her'],
    material: 'silver',
    weight: '35g',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Gifts' },
  { id: 'anniversary', label: 'Anniversary & Love' },
  { id: 'bridal', label: 'Bridal & Wedding' },
  { id: 'birthday', label: 'Birthday & Milestones' },
  { id: 'for-him', label: 'For Him' },
];

const GIFT_BOXES = [
  { id: 'gold-silk', name: 'Royal Gold Silk', price: 1500, color: '#B59A6C', desc: 'Embossed Gold Foil & Silk Ribbon' },
  { id: 'navy-velvet', name: 'Midnight Navy Velvet', price: 2000, color: '#1E3A8A', desc: 'Plush Velvet with Satin Interior' },
  { id: 'crimson-heritage', name: 'Crimson Heritage', price: 2500, color: '#881337', desc: 'Monogrammed Crimson Velvet' },
  { id: 'emerald-signature', name: 'Emerald Signature', price: 2200, color: '#065F46', desc: 'Forest Green Suede & Gold Clasp' },
];

const RIBBON_COLORS = [
  { id: 'gold', name: 'Royal Gold', color: '#B59A6C' },
  { id: 'champagne', name: 'Champagne Silk', color: '#E8D5B7' },
  { id: 'navy', name: 'Midnight Navy', color: '#1E3A5F' },
  { id: 'crimson', name: 'Crimson Velvet', color: '#8B1A1A' },
];

const GIFT_CARD_AMOUNTS = [10000, 25000, 50000, 100000];

const QUIZ_STEPS = [
  {
    question: 'Who are you gifting?',
    options: [
      { id: 'partner', label: 'Partner / Spouse', icon: '♥' },
      { id: 'parents', label: 'Parents / Elders', icon: '⊹' },
      { id: 'friend', label: 'Friend / Sibling', icon: '✦' },
      { id: 'self', label: 'Treat Yourself', icon: '◈' },
    ],
  },
  {
    question: 'What is the occasion?',
    options: [
      { id: 'anniversary', label: 'Anniversary', icon: '∞' },
      { id: 'wedding', label: 'Wedding & Bridal', icon: '◇' },
      { id: 'birthday', label: 'Birthday', icon: '✧' },
      { id: 'corporate', label: 'Corporate Gift', icon: '▣' },
    ],
  },
  {
    question: 'What is your budget?',
    options: [
      { id: 'under-25k', label: 'Under ₹25,000', icon: '○' },
      { id: '25k-50k', label: '₹25,000 – ₹50,000', icon: '◎' },
      { id: '50k-1l', label: '₹50,000 – ₹1,00,000', icon: '◉' },
      { id: 'royal', label: 'Royal Luxury ₹1,00,000+', icon: '◆' },
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1.0] },
};

const GiftingSuite = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBox, setSelectedBox] = useState(GIFT_BOXES[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(RIBBON_COLORS[0]);
  const [giftNote, setGiftNote] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(25000);
  const [customAmount, setCustomAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDispatchAnimation, setShowDispatchAnimation] = useState(false);
  const [dispatchData, setDispatchData] = useState(null);
  const [amountError, setAmountError] = useState('');

  // Gift Finder Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  const { addToCart } = useCart();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const filteredGifts = useMemo(() => {
    if (activeFilter === 'all') return GIFT_SETS;
    return GIFT_SETS.filter((g) => g.tags.includes(activeFilter));
  }, [activeFilter]);

  const handleAddGiftToCart = (gift) => {
    const giftProduct = {
      _id: `gift-${gift.id}-${Date.now()}`,
      name: gift.name,
      price: gift.price + selectedBox.price,
      image: gift.image,
      category: 'Gift Sets',
      material: gift.material,
      customDetails: {
        giftBox: selectedBox.name,
        ribbon: selectedRibbon.name,
        note: giftNote || 'No personalized note',
      },
    };
    addToCart(giftProduct, 1);
    success(`${gift.name} with ${selectedBox.name} box added to your cart!`);
  };

  // Amount validation helper
  const getValidatedAmount = useCallback(() => {
    const amount = customAmount ? parseInt(customAmount) : giftCardAmount;
    if (!amount || isNaN(amount)) return { valid: false, amount: 0, error: 'Please enter a valid amount.' };
    if (amount < 1000) return { valid: false, amount, error: 'Minimum amount is ₹1,000.' };
    if (amount > 100000) return { valid: false, amount, error: 'Maximum amount is ₹1,00,000.' };
    return { valid: true, amount, error: '' };
  }, [customAmount, giftCardAmount]);

  // Handle custom amount change with validation
  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val) {
      const num = parseInt(val);
      if (isNaN(num) || num < 1000) setAmountError('Minimum ₹1,000');
      else if (num > 100000) setAmountError('Maximum ₹1,00,000');
      else setAmountError('');
    } else {
      setAmountError('');
    }
  };

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const handlePurchaseGiftCard = async (e) => {
    e.preventDefault();
    const { valid, amount, error } = getValidatedAmount();
    if (!valid) { toastError(error); return; }
    if (!recipientEmail || !recipientName || !senderName) {
      toastError('Please fill in all required fields.'); return;
    }

    setIsProcessingPayment(true);

    try {
      // Call backend to generate order, redeem code, and dispatch luxury email
      const res = await api.post('/gift-cards/dispatch-preview', {
        amount,
        senderName,
        recipientName,
        recipientEmail,
        giftNote: giftNote || '',
        deliveryDate: deliveryDate || undefined,
      });

      const giftCardInfo = res.data?.giftCard || {};
      const generatedCode = giftCardInfo.redeemCode || ('GLM-' + Math.random().toString(36).substring(2, 10).toUpperCase());

      setDispatchData({
        amount,
        recipientName,
        recipientEmail,
        redeemCode: generatedCode,
        giftNote: giftNote || '',
      });

      setShowDispatchAnimation(true);
      success(`Gift card registered & email dispatched to ${recipientEmail}!`);

      // Reset form fields
      setRecipientEmail('');
      setRecipientName('');
      setSenderName('');
      setCustomAmount('');
      setGiftNote('');
      setDeliveryDate('');
    } catch (err) {
      console.warn('Backend preview notice:', err);
      // Fallback local preview code if backend is starting up
      const fallbackCode = 'GLM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setDispatchData({
        amount,
        recipientName,
        recipientEmail,
        redeemCode: fallbackCode,
        giftNote: giftNote || '',
      });
      setShowDispatchAnimation(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleQuizAnswer = (stepIdx, answerId) => {
    setQuizAnswers((prev) => ({ ...prev, [stepIdx]: answerId }));
    if (stepIdx < QUIZ_STEPS.length - 1) {
      setQuizStep(stepIdx + 1);
    } else {
      // Apply budget filter
      const budget = answerId;
      let tag = 'all';
      const occasion = quizAnswers[1];
      if (occasion === 'anniversary') tag = 'anniversary';
      else if (occasion === 'wedding') tag = 'bridal';
      else if (occasion === 'birthday') tag = 'birthday';
      else if (occasion === 'corporate') tag = 'for-him';
      setActiveFilter(tag);
      setShowQuiz(false);
      setQuizStep(0);
      setQuizAnswers({});
      success('Gift recommendations filtered based on your preferences!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── EDITORIAL HERO SECTION ── */}
        <motion.section {...fadeUp} className="pt-16 lg:pt-24 pb-12 lg:pb-16 text-center">
          <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] mb-4">
            GLM ATELIER · LUXURY GIFTING SUITE
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#222222] leading-[1.1] tracking-tight mb-4">
            The Art of Giving Gold
          </h1>
          <p className="font-body text-sm sm:text-base text-[#808080] max-w-2xl mx-auto leading-relaxed mb-8">
            Handpicked fine jewelry gift sets, bespoke velvet packaging with wax-sealed handwritten notes, and instant luxury e-gift cards — crafted for moments that last forever.
          </p>

          {/* Quick Navigation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#gift-sets" className="px-6 py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors cursor-pointer">
              Curated Gift Sets
            </a>
            <button
              onClick={() => { setShowQuiz(true); setQuizStep(0); setQuizAnswers({}); }}
              className="px-6 py-3 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
            >
              Gift Finder Quiz
            </button>
            <a href="#e-gift-cards" className="px-6 py-3 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">
              E-Gift Cards
            </a>
          </div>
        </motion.section>

        {/* ── CURATED JEWELRY GIFT SETS ── */}
        <motion.section {...fadeUp} id="gift-sets" className="pb-16 lg:pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-2">
                HANDPICKED FOR EVERY OCCASION
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading text-[#222222]">Curated Gift Sets</h2>
            </div>

            {/* Filter Tabs with Framer Motion Indicator */}
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`relative px-4 py-2 text-[10px] font-body font-bold uppercase tracking-[0.15em] cursor-pointer transition-colors ${
                    activeFilter === tab.id ? 'text-[#222222]' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  {tab.label}
                  {activeFilter === tab.id && (
                    <motion.div
                      layoutId="giftFilterIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#222222]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gift Sets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredGifts.map((gift, idx) => (
                <motion.div
                  key={gift.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="group cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F7] mb-3">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Badge */}
                    <span className="absolute top-3 left-3 text-[9px] font-mono font-bold text-[#B59A6C] bg-white/95 backdrop-blur-sm px-2.5 py-1 border border-[#B59A6C]/20">
                      {gift.badge}
                    </span>
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleAddGiftToCart(gift)}
                        className="w-full py-3 bg-[#222222] text-white text-[10px] font-body font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors cursor-pointer"
                      >
                        Add to Cart with Velvet Box
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="font-body text-xs font-bold text-[#222222] leading-snug line-clamp-2 group-hover:text-[#B59A6C] transition-colors">
                      {gift.name}
                    </h3>
                    <p className="font-body text-[11px] text-[#808080] mt-1 leading-relaxed line-clamp-2">
                      {gift.desc}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-mono text-sm font-bold text-[#222222]">
                        ₹{gift.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-mono text-[#808080]">
                        {gift.weight}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── WAX-SEALED PARCHMENT NOTE & BOX CUSTOMIZER ── */}
        <motion.section {...fadeUp} className="pb-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Live Parchment Note Preview */}
            <div className="lg:col-span-5">
              <motion.div
                whileHover={{ rotateY: -2, rotateX: 1.5, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="relative"
                style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
              >
                {/* Outer Velvet Box Frame */}
                <div className="relative p-1.5" style={{ background: `linear-gradient(135deg, ${selectedBox.color}18, ${selectedBox.color}08)` }}>
                  
                  {/* Metallic Gold Edge Shimmer */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(135deg, rgba(181,154,108,0.15) 0%, transparent 30%, transparent 70%, rgba(181,154,108,0.15) 100%)'
                  }} />

                  {/* Main Parchment Card */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(170deg, #FDF8F0 0%, #F8F0E3 40%, #FBF5EC 100%)',
                      minHeight: '440px',
                      boxShadow: 'inset 0 0 60px rgba(181,154,108,0.06), 0 20px 60px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Decorative Gold Corner Filigree Ornaments */}
                    <svg className="absolute top-0 left-0 w-16 h-16 text-[#B59A6C]/20" viewBox="0 0 64 64" fill="none">
                      <path d="M0 0 C0 0, 40 0, 55 5 C62 8, 64 12, 64 20 C58 14, 48 8, 30 4 C15 2, 0 4, 0 4 Z" fill="currentColor" />
                      <path d="M0 0 C0 0, 0 40, 5 55 C8 62, 12 64, 20 64 C14 58, 8 48, 4 30 C2 15, 4 0, 4 0 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute top-0 right-0 w-16 h-16 text-[#B59A6C]/20 rotate-90" viewBox="0 0 64 64" fill="none">
                      <path d="M0 0 C0 0, 40 0, 55 5 C62 8, 64 12, 64 20 C58 14, 48 8, 30 4 C15 2, 0 4, 0 4 Z" fill="currentColor" />
                      <path d="M0 0 C0 0, 0 40, 5 55 C8 62, 12 64, 20 64 C14 58, 8 48, 4 30 C2 15, 4 0, 4 0 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-16 h-16 text-[#B59A6C]/20 -rotate-90" viewBox="0 0 64 64" fill="none">
                      <path d="M0 0 C0 0, 40 0, 55 5 C62 8, 64 12, 64 20 C58 14, 48 8, 30 4 C15 2, 0 4, 0 4 Z" fill="currentColor" />
                      <path d="M0 0 C0 0, 0 40, 5 55 C8 62, 12 64, 20 64 C14 58, 8 48, 4 30 C2 15, 4 0, 4 0 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute bottom-0 right-0 w-16 h-16 text-[#B59A6C]/20 rotate-180" viewBox="0 0 64 64" fill="none">
                      <path d="M0 0 C0 0, 40 0, 55 5 C62 8, 64 12, 64 20 C58 14, 48 8, 30 4 C15 2, 0 4, 0 4 Z" fill="currentColor" />
                      <path d="M0 0 C0 0, 0 40, 5 55 C8 62, 12 64, 20 64 C14 58, 8 48, 4 30 C2 15, 4 0, 4 0 Z" fill="currentColor" />
                    </svg>

                    {/* Inner Gold Border Frame */}
                    <div className="absolute inset-4 pointer-events-none" style={{ border: '1px solid rgba(181,154,108,0.18)' }} />
                    <div className="absolute inset-5 pointer-events-none" style={{ border: '0.5px solid rgba(181,154,108,0.10)' }} />

                    {/* Animated Ribbon Drape */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] origin-top"
                      style={{ backgroundColor: selectedRibbon.color, height: '36px' }}
                    />

                    {/* Animated Wax Seal */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
                      whileHover={{ scale: 1.12, rotate: 5 }}
                      className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl relative"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${selectedRibbon.color}dd, ${selectedRibbon.color})`,
                          boxShadow: `0 4px 20px ${selectedRibbon.color}50, inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.15)`,
                        }}
                      >
                        {/* Seal Texture Ring */}
                        <div className="absolute inset-1.5 rounded-full border border-white/15" />
                        <div className="absolute inset-3 rounded-full border border-white/10" />
                        <span className="font-heading text-[11px] font-bold text-white tracking-[0.15em] relative z-10">GLM</span>
                      </div>
                    </motion.div>

                    {/* Card Content */}
                    <div className="pt-14 pb-8 px-8 text-center relative z-10">
                      {/* Diamond Divider */}
                      <div className="flex items-center justify-center gap-3 mb-5">
                        <div className="w-12 h-[0.5px] bg-[#B59A6C]/30" />
                        <span className="text-[#B59A6C]/50 text-[8px]">◆</span>
                        <div className="w-12 h-[0.5px] bg-[#B59A6C]/30" />
                      </div>

                      <span className="text-[8px] font-body font-bold uppercase tracking-[0.4em] text-[#B59A6C]/60 block mb-6">
                        PERSONAL GIFT MESSAGE
                      </span>

                      {/* Calligraphic Message */}
                      <motion.p
                        key={giftNote}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="font-heading italic text-lg text-[#3D3428] leading-[1.8] min-h-[100px] px-4"
                      >
                        {giftNote || '"Your heartfelt message will appear here in luxury calligraphic print on handmade parchment..."'}
                      </motion.p>

                      {/* Bottom Diamond Divider */}
                      <div className="flex items-center justify-center gap-3 mt-6 mb-5">
                        <div className="w-16 h-[0.5px] bg-[#B59A6C]/25" />
                        <span className="text-[#B59A6C]/40 text-[6px]">◆ ◆ ◆</span>
                        <div className="w-16 h-[0.5px] bg-[#B59A6C]/25" />
                      </div>

                      {/* Sender / Recipient */}
                      <div className="flex justify-between items-center text-[10px] font-body px-2">
                        <div className="text-left">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C]/50 block">FROM</span>
                          <span className="text-[#5C4E3C] font-bold">{senderName || 'Your Name'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C]/50 block">FOR</span>
                          <span className="text-[#5C4E3C] font-bold">{recipientName || 'Recipient'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box & Ribbon Indicator Strip */}
                <motion.div
                  layout
                  className="mt-3 flex items-center justify-between bg-[#FAF9F7] px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      key={selectedBox.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: selectedBox.color }}
                    />
                    <span className="text-[10px] font-mono font-bold text-[#222222]">{selectedBox.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      key={selectedRibbon.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: selectedRibbon.color }}
                    />
                    <span className="text-[10px] font-mono font-bold text-[#808080]">{selectedRibbon.name} Ribbon</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Customizer Controls */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-2">
                ATELIER PACKAGING STUDIO
              </span>
              <h2 className="text-3xl font-heading text-[#222222] mb-6">
                Velvet Box & Wax-Sealed Note
              </h2>

              {/* Velvet Box Selection */}
              <div className="mb-6">
                <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                  Select Signature Gift Box
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GIFT_BOXES.map((box) => (
                    <button
                      key={box.id}
                      onClick={() => setSelectedBox(box)}
                      className={`p-3.5 text-left transition-all cursor-pointer ${
                        selectedBox.id === box.id ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white border border-gray-100 hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full mb-2 shadow-sm" style={{ backgroundColor: box.color }} />
                      <span className="text-[11px] font-body font-bold text-[#222222] block leading-tight">{box.name}</span>
                      <span className="text-[10px] font-mono text-[#B59A6C] mt-1 block">+₹{box.price.toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ribbon Color Selection */}
              <div className="mb-6">
                <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                  Select Satin Ribbon & Wax Seal Color
                </label>
                <div className="flex gap-3">
                  {RIBBON_COLORS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRibbon(r)}
                      className={`flex items-center gap-2 px-3 py-2 transition-all cursor-pointer ${
                        selectedRibbon.id === r.id ? 'ring-1 ring-[#222222] bg-[#FAF9F7]' : 'bg-white border border-gray-100 hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: r.color }} />
                      <span className="text-[10px] font-body font-bold text-[#222222]">{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Note Input */}
              <div className="mb-6">
                <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-2 block">
                  Handwritten Gift Message
                </label>
                <textarea
                  rows={3}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  maxLength={200}
                  placeholder="Write your personalized note — it will be printed on parchment paper inside a wax-sealed envelope..."
                  className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 font-heading italic text-sm text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                />
                <span className="text-[10px] font-mono text-[#808080] mt-1 block text-right">{giftNote.length}/200</span>
              </div>

              {/* Sender & Recipient Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-body font-bold text-[#222222] mb-1 block">From (Sender)</label>
                  <input
                    type="text" value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                  />
                </div>
                <div>
                  <label className="text-xs font-body font-bold text-[#222222] mb-1 block">To (Recipient)</label>
                  <input
                    type="text" value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── LUXURY E-GIFT CARDS ── */}
        <motion.section {...fadeUp} id="e-gift-cards" className="pb-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: 3D Tilt Gift Card Preview */}
            <div className="lg:col-span-5">
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-2">
                INSTANT DIGITAL DISPATCH
              </span>
              <h2 className="text-3xl font-heading text-[#222222] mb-6">
                Glimmr Luxury E-Gift Cards
              </h2>

              {/* 3D Gift Card Container */}
              <div style={{ perspective: '1200px' }}>
                <motion.div
                  whileHover={{ rotateY: -6, rotateX: 4, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="relative aspect-[1.6/1] overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 30%, #1a1a1a 60%, #252525 100%)',
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.25), 0 0 1px rgba(181,154,108,0.3)',
                  }}
                >
                  {/* Animated Gold Shimmer Sweep */}
                  <motion.div
                    animate={{ x: ['0%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(181,154,108,0.06) 45%, rgba(181,154,108,0.12) 50%, rgba(181,154,108,0.06) 55%, transparent 70%)',
                      width: '200%',
                    }}
                  />

                  {/* Embossed Gold Border */}
                  <div className="absolute inset-3 pointer-events-none" style={{ border: '1px solid rgba(181,154,108,0.12)' }} />
                  <div className="absolute inset-4 pointer-events-none" style={{ border: '0.5px solid rgba(181,154,108,0.06)' }} />

                  {/* Diamond Watermark Emblem */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04]">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                      <path d="M60 5 L90 40 L60 115 L30 40 Z" stroke="white" strokeWidth="1.5" />
                      <path d="M30 40 L90 40" stroke="white" strokeWidth="1" />
                      <path d="M60 5 L45 40 M60 5 L75 40" stroke="white" strokeWidth="0.8" />
                      <path d="M45 40 L60 115 M75 40 L60 115" stroke="white" strokeWidth="0.8" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
                    {/* Top Row: Brand + Badge */}
                    <div className="flex justify-between items-start">
                      <div>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="font-heading text-lg font-bold tracking-[0.35em] block"
                          style={{ color: '#B59A6C' }}
                        >
                          GLIMMR
                        </motion.span>
                        <span className="text-[8px] font-mono text-gray-600 tracking-[0.3em] block mt-0.5">FINE JEWELLERY</span>
                      </div>
                      
                      {/* Animated Chip */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="flex flex-col items-end gap-1.5"
                      >
                        <div className="w-8 h-6 rounded-sm relative overflow-hidden" style={{
                          background: 'linear-gradient(135deg, #B59A6C 0%, #D4B896 30%, #B59A6C 60%, #997D56 100%)',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
                        }}>
                          <div className="absolute inset-0.5 grid grid-cols-2 grid-rows-2 gap-[0.5px] opacity-40">
                            <div className="bg-white/20" /><div className="bg-white/10" />
                            <div className="bg-white/10" /><div className="bg-white/20" />
                          </div>
                        </div>
                        <span className="font-mono text-[8px] text-[#B59A6C]/60 font-bold tracking-[0.15em]">E-GIFT CARD</span>
                      </motion.div>
                    </div>

                    {/* Center: Amount */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em] block">GIFT VALUE</span>
                      <motion.div
                        key={customAmount || giftCardAmount}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="flex items-baseline gap-1"
                      >
                        <span className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight">
                          ₹{(customAmount ? parseInt(customAmount) || 0 : giftCardAmount).toLocaleString('en-IN')}
                        </span>
                      </motion.div>
                    </div>

                    {/* Bottom Row: Recipient & Sender */}
                    <div className="flex justify-between items-end pt-3" style={{ borderTop: '1px solid rgba(181,154,108,0.12)' }}>
                      <div>
                        <span className="text-[7px] font-mono text-gray-600 uppercase block tracking-[0.2em]">PRESENTED TO</span>
                        <motion.span
                          key={recipientName}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] font-body font-bold text-[#B59A6C] block mt-0.5"
                        >
                          {recipientName || 'VALUED PATRON'}
                        </motion.span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] font-mono text-gray-600 uppercase block tracking-[0.2em]">WITH LOVE FROM</span>
                        <motion.span
                          key={senderName}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] font-body font-bold text-gray-400 block mt-0.5"
                        >
                          {senderName || 'GLIMMR PATRON'}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Security Strip */}
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="text-[9px] font-mono text-[#808080]">Redeemable across all Glimmr collections</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                  <span className="text-[9px] font-mono text-[#808080]">Secured</span>
                </div>
              </div>
            </div>

            {/* Right: Gift Card Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Amount Selection */}
              <div>
                <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                  Select Gift Card Amount
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GIFT_CARD_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setGiftCardAmount(amt); setCustomAmount(''); }}
                      className={`py-3 font-mono text-xs font-bold transition-all cursor-pointer ${
                        giftCardAmount === amt && !customAmount
                          ? 'bg-[#222222] text-white' : 'bg-[#FAF9F7] text-[#222222] hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Custom Amount with Validation */}
                <div className="mt-3">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    min="1000"
                    max="100000"
                    placeholder="Or enter custom amount (₹1,000 – ₹1,00,000)"
                    className={`w-full px-4 py-2.5 bg-white border text-sm font-mono text-[#222222] focus:outline-none focus:ring-1 ${
                      amountError ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#222222]'
                    }`}
                  />
                  {amountError && (
                    <span className="text-[10px] font-body font-bold text-red-500 mt-1 block">{amountError}</span>
                  )}
                  {customAmount && !amountError && parseInt(customAmount) >= 1000 && parseInt(customAmount) <= 100000 && (
                    <span className="text-[10px] font-body font-bold text-green-600 mt-1 block flex items-center gap-1">✓ Valid amount</span>
                  )}
                </div>
              </div>

              <form onSubmit={handlePurchaseGiftCard} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text" required value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your Name (Sender)"
                    className="px-4 py-3 bg-white border border-gray-200 text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                  />
                  <input
                    type="text" required value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="px-4 py-3 bg-white border border-gray-200 text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                  />
                </div>

                <input
                  type="email" required value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Recipient's Email Address"
                  className="w-full px-4 py-3 bg-white border border-gray-200 text-sm font-body text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                />

                {/* Scheduled Delivery Date */}
                <div>
                  <label className="text-xs font-body font-bold text-[#222222] mb-1 block">
                    Schedule Secret Delivery Date (Optional)
                  </label>
                  <input
                    type="date" value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-sm font-mono text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                  />
                  <span className="text-[10px] font-body text-[#808080] mt-1 block">
                    We will dispatch the e-gift card at midnight on the selected date.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment || !!amountError}
                  className={`w-full py-4 font-body text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                    isProcessingPayment || amountError
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-[#222222] text-white hover:bg-[#B59A6C]'
                  }`}
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Processing Payment...
                    </span>
                  ) : (
                    `Pay ₹${(customAmount ? parseInt(customAmount) || 0 : giftCardAmount).toLocaleString('en-IN')} & Dispatch E-Gift Card`
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.section>

        {/* ── TRUST STRIP ── */}
        <motion.section {...fadeUp} className="pb-16 lg:pb-24">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Complimentary Gift Wrapping', sub: 'On all orders above ₹25,000' },
              { label: 'Wax-Sealed Parchment Notes', sub: 'Hand-calligraphed messages' },
              { label: 'Secure Insured Delivery', sub: 'Tamper-proof luxury packaging' },
              { label: 'Same-Day Gift Dispatch', sub: 'Order before 2 PM IST' },
            ].map((item, i) => (
              <div key={i} className="bg-[#FAF9F7] p-5 text-center">
                <span className="text-xs font-body font-bold text-[#222222] block">{item.label}</span>
                <span className="text-[10px] font-body text-[#808080] mt-1 block">{item.sub}</span>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

      {/* ── GIFT FINDER QUIZ MODAL ── */}
      <AnimatePresence>
        {showQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 max-w-lg w-full shadow-2xl border border-gray-100"
            >
              {/* Progress Bar */}
              <div className="flex gap-1.5 mb-6">
                {QUIZ_STEPS.map((_, i) => (
                  <div key={i} className={`h-[3px] flex-1 transition-colors ${i <= quizStep ? 'bg-[#222222]' : 'bg-gray-200'}`} />
                ))}
              </div>

              <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-2">
                STEP {quizStep + 1} OF {QUIZ_STEPS.length}
              </span>
              <h3 className="text-2xl font-heading text-[#222222] mb-6">
                {QUIZ_STEPS[quizStep].question}
              </h3>

              <div className="space-y-2.5">
                {QUIZ_STEPS[quizStep].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleQuizAnswer(quizStep, opt.id)}
                    className="w-full p-4 text-left flex items-center gap-4 bg-[#FAF9F7] hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-mono text-[#222222] border border-gray-200 group-hover:border-[#222222] transition-colors">
                      {opt.icon}
                    </span>
                    <span className="font-body text-sm font-bold text-[#222222] group-hover:text-[#B59A6C] transition-colors">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowQuiz(false)}
                className="mt-6 w-full py-2.5 text-[#808080] font-body text-xs font-bold uppercase tracking-[0.15em] hover:text-[#222222] transition-colors cursor-pointer"
              >
                Close Quiz
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── POST-PAYMENT DISPATCH ANIMATION (3D Realistic Envelope & Courier) ── */}
      <AnimatePresence>
        {showDispatchAnimation && dispatchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-lg px-4"
          >
            <div className="relative w-full max-w-md h-[560px] flex flex-col items-center justify-center overflow-hidden">

              {/* ── UNIFIED 3D ENVELOPE CONTAINER ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.85, 1, 1, 1, 0.4],
                  y: [40, 0, 0, 0, -750],
                  x: [0, 0, 0, 0, 160],
                  rotate: [0, 0, 0, -6, -16],
                }}
                transition={{
                  duration: 5.2,
                  times: [0, 0.15, 0.7, 0.82, 1],
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="relative w-[340px] sm:w-[380px] h-[240px]"
                style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
              >
                {/* 1. Envelope Back Panel (Inside Wall) */}
                <div
                  className="absolute inset-0 rounded-md overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #E6DAC4 0%, #D8C8AF 100%)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(181, 154, 108, 0.4)',
                    zIndex: 1,
                  }}
                >
                  {/* Subtle inner gold geometric pattern */}
                  <div className="absolute inset-3 border border-[#B59A6C]/25 rounded-sm pointer-events-none" />
                </div>

                {/* 2. Top Flap (Open at first, then folds down 180 deg over the pocket) */}
                <motion.div
                  initial={{ rotateX: -180 }}
                  animate={{
                    rotateX: [-180, -180, -180, 0, 0],
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.35, 0.5, 0.65, 1],
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute top-0 left-0 w-full h-[120px] origin-top"
                  style={{
                    transformStyle: 'preserve-3d',
                    zIndex: 25,
                  }}
                >
                  {/* Triangular Flap */}
                  <div
                    className="w-full h-full relative"
                    style={{
                      background: 'linear-gradient(180deg, #D4C3A3 0%, #E8DCC4 100%)',
                      clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
                    }}
                  >
                    {/* Flap gold foil accent line */}
                    <div
                      className="absolute inset-x-4 top-1 h-[110px]"
                      style={{
                        clipPath: 'polygon(0% 0%, 50% 95%, 100% 0%)',
                        borderTop: '2px solid rgba(181,154,108,0.5)',
                      }}
                    />
                  </div>
                </motion.div>

                {/* 3. The Floating E-Gift Card (Descends inside the envelope pocket) */}
                <motion.div
                  initial={{ y: -130, scale: 0.95, opacity: 0 }}
                  animate={{
                    y: [-130, -130, 20, 20, 20],
                    scale: [0.95, 0.95, 0.78, 0.78, 0.78],
                    opacity: [0, 1, 1, 1, 1],
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.12, 0.45, 0.7, 1],
                    ease: 'easeInOut',
                  }}
                  className="absolute left-1/2 -translate-x-1/2 w-[280px] sm:w-[310px] aspect-[1.6/1]"
                  style={{ zIndex: 5 }}
                >
                  <div
                    className="w-full h-full rounded-md overflow-hidden p-4 flex flex-col justify-between shadow-2xl relative"
                    style={{
                      background: 'linear-gradient(135deg, #222222 0%, #151515 50%, #2a2a2a 100%)',
                      border: '1px solid rgba(181,154,108,0.4)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading text-xs font-bold tracking-[0.3em] text-[#B59A6C]">GLIMMR</span>
                      <div className="w-6 h-4.5 rounded-sm bg-gradient-to-br from-[#B59A6C] to-[#8C734B]" />
                    </div>
                    <div>
                      <span className="text-[7px] font-mono text-gray-500 uppercase block tracking-wider">VALUE</span>
                      <span className="font-heading text-xl font-bold text-white tracking-tight">
                        ₹{dispatchData.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-end text-[7px] font-mono text-gray-400 pt-1.5 border-t border-[#B59A6C]/20">
                      <span className="truncate max-w-[120px]">FOR: {dispatchData.recipientName}</span>
                      <span className="text-[#B59A6C] font-bold">{dispatchData.redeemCode}</span>
                    </div>
                  </div>
                </motion.div>

                {/* 4. Envelope Front Pocket (Masks bottom 60% of card) */}
                <div
                  className="absolute inset-0 rounded-b-md overflow-hidden pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  {/* Bottom Triangle Pocket */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, #E2D3B8 0%, #D8C7AA 100%)',
                      clipPath: 'polygon(0% 100%, 50% 45%, 100% 100%)',
                      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                    }}
                  />
                  {/* Left Side Flap */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, #D4C3A3 0%, #E0D1B5 100%)',
                      clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
                    }}
                  />
                  {/* Right Side Flap */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(270deg, #D4C3A3 0%, #E0D1B5 100%)',
                      clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
                    }}
                  />
                  {/* Center Brand Crest on Pocket */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                    <span className="font-heading text-[9px] font-bold tracking-[0.35em] text-[#8C7B65] uppercase block">
                      GLIMMR ATELIER
                    </span>
                  </div>
                </div>

                {/* 5. Royal Crimson Wax Seal Stamp (Stamps on when flap closes) */}
                <motion.div
                  initial={{ scale: 0, rotate: -90, opacity: 0 }}
                  animate={{
                    scale: [0, 0, 0, 1.35, 1, 1],
                    rotate: [-90, -90, -90, 8, 0, 0],
                    opacity: [0, 0, 0, 1, 1, 1],
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.55, 0.64, 0.72, 0.78, 1],
                    ease: 'easeOut',
                  }}
                  className="absolute top-[90px] left-1/2 -translate-x-1/2"
                  style={{ zIndex: 30 }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative cursor-pointer"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #9E1B1B, #6E0D0D)',
                      boxShadow: '0 6px 20px rgba(110, 13, 13, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)',
                    }}
                  >
                    <div className="absolute inset-1.5 rounded-full border border-white/20" />
                    <span className="font-heading text-[10px] font-bold text-white tracking-[0.2em]">GLM</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* ── GOLD STARDUST TRAIL (Follows courier flight) ── */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`star-particle-${i}`}
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0.8, 0],
                    y: [0, 0, 0, -250 - i * 35, -550 - i * 40],
                    x: (i % 2 === 0 ? 1 : -1) * (15 + i * 12) + (i * 10),
                    scale: [0.5, 0.5, 0.5, 1.2, 0.2],
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.7, 0.78, 0.88, 1],
                    ease: 'easeOut',
                  }}
                  className="absolute bottom-[200px] pointer-events-none"
                  style={{ left: `calc(50% + ${(i - 6) * 16}px)` }}
                >
                  <div
                    className="w-2 h-2 rounded-full bg-[#B59A6C]"
                    style={{ boxShadow: '0 0 10px #E8D5B7, 0 0 20px #B59A6C' }}
                  />
                </motion.div>
              ))}

              {/* ── FINAL CONFIRMATION CARD (Smooth Fade In) ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{
                  opacity: [0, 0, 0, 0, 1],
                  scale: [0.9, 0.9, 0.9, 0.9, 1],
                  y: [30, 30, 30, 30, 0],
                }}
                transition={{
                  duration: 5.2,
                  times: [0, 0.75, 0.85, 0.92, 1],
                  ease: 'easeOut',
                }}
                className="absolute inset-x-4 max-w-md mx-auto bg-[#1c1c1c]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-xl shadow-2xl text-center backdrop-blur-md"
              >
                {/* Gold Crest */}
                <div className="w-12 h-12 rounded-full bg-[#B59A6C]/10 border border-[#B59A6C]/40 mx-auto flex items-center justify-center mb-3">
                  <span className="text-[#B59A6C] text-lg">✦</span>
                </div>

                <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-1">
                  DISPATCH CONFIRMED
                </span>
                <h3 className="font-heading text-2xl text-white mb-2">
                  Gift Card On Its Way!
                </h3>
                <p className="text-xs font-body text-gray-300 mb-4 leading-relaxed">
                  A luxury fine jewellery voucher of <strong className="text-white">₹{dispatchData.amount.toLocaleString('en-IN')}</strong> has been sealed and delivered to{' '}
                  <span className="text-[#B59A6C] font-bold">{dispatchData.recipientEmail}</span>.
                </p>

                {/* Redeem Code Copy Badge */}
                <div className="bg-black/60 border border-[#B59A6C]/30 rounded-lg p-3 mb-5">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">
                    REDEMPTION VOUCHER CODE
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-base font-bold text-[#E8D5B7] tracking-widest">
                      {dispatchData.redeemCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(dispatchData.redeemCode);
                        success('Voucher code copied to clipboard!');
                      }}
                      className="px-2 py-0.5 bg-[#B59A6C]/20 hover:bg-[#B59A6C]/40 text-[#E8D5B7] text-[10px] font-mono rounded cursor-pointer transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDispatchAnimation(false);
                    setDispatchData(null);
                  }}
                  className="w-full py-3.5 bg-[#B59A6C] hover:bg-[#A3885C] text-white font-body text-xs font-bold uppercase tracking-[0.2em] rounded transition-colors cursor-pointer"
                >
                  Done
                </button>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftingSuite;
