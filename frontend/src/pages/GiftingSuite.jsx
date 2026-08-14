import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

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

  const handlePurchaseGiftCard = (e) => {
    e.preventDefault();
    const amount = customAmount ? parseInt(customAmount) : giftCardAmount;
    if (!amount || amount < 1000) {
      toastError('Please select or enter a valid gift card amount (minimum ₹1,000).');
      return;
    }
    success(`Luxury E-Gift Card for ₹${amount.toLocaleString('en-IN')} dispatched to ${recipientEmail}!`);
    setRecipientEmail('');
    setRecipientName('');
    setSenderName('');
    setCustomAmount('');
    setDeliveryDate('');
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
              <div className="bg-[#FAF9F7] p-6 sm:p-8 relative overflow-hidden" style={{ minHeight: '420px' }}>
                {/* Parchment Card */}
                <div className="bg-[#FBF7F0] p-8 shadow-lg relative" style={{ border: '2px solid #E8DCC4', minHeight: '340px' }}>
                  {/* Gold Foil Border Inner */}
                  <div className="absolute inset-2 border border-[#B59A6C]/30 pointer-events-none" />

                  {/* Wax Seal Stamp */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white text-[10px] font-heading font-bold shadow-lg z-10" style={{ backgroundColor: selectedRibbon.color }}>
                    GLM
                  </div>

                  {/* Ribbon Stripe */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-5" style={{ backgroundColor: selectedRibbon.color }} />

                  <div className="pt-8 text-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#B59A6C] block mb-4">
                      PERSONAL GIFT MESSAGE
                    </span>
                    <p className="font-heading italic text-base text-[#444444] leading-relaxed min-h-[80px] px-4">
                      {giftNote || '"Your heartfelt message will appear here in luxury calligraphic print..."'}
                    </p>
                    <div className="mt-8 pt-4 border-t border-[#E8DCC4]/60 flex justify-between text-[10px] font-body text-[#808080]">
                      <span>With love, {senderName || 'Sender'}</span>
                      <span>For {recipientName || 'Recipient'}</span>
                    </div>
                  </div>
                </div>

                {/* Box Color Swatch */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#808080]">VELVET BOX:</span>
                  <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: selectedBox.color }} />
                  <span className="text-[10px] font-mono font-bold text-[#222222]">{selectedBox.name}</span>
                </div>
              </div>
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

              <motion.div
                whileHover={{ rotateY: 4, rotateX: 4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-[#222222] p-8 text-white relative overflow-hidden"
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                {/* Subtle Gold Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'repeating-linear-gradient(45deg, #B59A6C 0, #B59A6C 1px, transparent 0, transparent 8px)' }} />

                <div className="flex justify-between items-start mb-16 relative z-10">
                  <span className="font-heading text-xl font-bold tracking-[0.3em] text-[#B59A6C]">GLIMMR</span>
                  <span className="font-mono text-[9px] text-[#B59A6C] font-bold border border-[#B59A6C]/40 px-2 py-0.5">
                    E-GIFT CARD
                  </span>
                </div>

                <div className="space-y-1 mb-10 relative z-10">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">GIFT VALUE</span>
                  <span className="font-mono text-4xl font-bold text-white">
                    ₹{(customAmount ? parseInt(customAmount) || 0 : giftCardAmount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-end text-[10px] font-mono text-gray-500 pt-4 border-t border-white/10 relative z-10">
                  <span>FOR: {recipientName || 'VALUED PATRON'}</span>
                  <span>FROM: {senderName || 'GLIMMR PATRON'}</span>
                </div>
              </motion.div>
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

                {/* Custom Amount */}
                <div className="mt-3">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter custom amount (min ₹1,000)"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-sm font-mono text-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                  />
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
                  className="w-full py-4 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors cursor-pointer"
                >
                  Purchase & Dispatch E-Gift Card
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
    </div>
  );
};

export default GiftingSuite;
