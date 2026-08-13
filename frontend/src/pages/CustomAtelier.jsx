import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import ThreeRingCanvas from '../components/ThreeRingCanvas';
import RealisticRing from '../components/RealisticRing';
import axios from 'axios';

const METALS = [
  { id: '24k-gold', name: '24K Pure Gold', purity: '99.9% Pure', color: '#E8DCC4', pricePerGram: 7580, badge: '24K GOLD' },
  { id: '22k-gold', name: '22K Hallmark Gold', purity: '91.6% Gold', color: '#D4AF37', pricePerGram: 6948, badge: '22K GOLD' },
  { id: '18k-rose', name: '18K Rose Gold', purity: '75.0% Gold + Copper', color: '#E8C3B9', pricePerGram: 5685, badge: '18K ROSE' },
  { id: 'platinum', name: 'Platinum 950', purity: '95.0% Pure Platinum', color: '#E5E7EB', pricePerGram: 3200, badge: 'PT 950' },
  { id: '925-silver', name: '925 Sterling Silver', purity: '92.5% Pure Silver', color: '#D1D5DB', pricePerGram: 95, badge: '925 SILVER' }
];

const GEMSTONES = [
  { id: 'no-stone', name: 'No Stone (Plain Band)', color: 'transparent', pricePerCarat: 0, desc: 'Minimal elegance' },
  { id: 'vvs-diamond', name: 'VVS1 Solitaire Diamond', color: '#E0F2FE', pricePerCarat: 125000, desc: 'Flawless Brilliance & Fire' },
  { id: 'emerald', name: 'Royal Colombian Emerald', color: '#059669', pricePerCarat: 85000, desc: 'Deep Vivid Green' },
  { id: 'sapphire', name: 'Kashmir Blue Sapphire', color: '#1D4ED8', pricePerCarat: 95000, desc: 'Imperial Velvet Blue' },
  { id: 'ruby', name: 'Burmese Pigeon Blood Ruby', color: '#DC2626', pricePerCarat: 110000, desc: 'Vibrant Crimson Radiance' }
];

const CUTS = [
  { id: 'round', name: 'Brilliant Round', shape: 'rounded-full', desc: 'Maximum Light Return' },
  { id: 'emerald-cut', name: 'Emerald Cut', shape: 'rounded-sm', desc: 'Hall-of-Mirrors Step Cut' },
  { id: 'princess', name: 'Princess Cut', shape: 'rotate-45 rounded-none', desc: 'Modern Geometric Sparkle' },
  { id: 'oval', name: 'Imperial Oval', shape: 'rounded-[50%]', desc: 'Elongated Finger Profile' },
  { id: 'cushion', name: 'Cushion Cut', shape: 'rounded-lg', desc: 'Soft Rounded Pillars' },
  { id: 'pear', name: 'Pear Drop', shape: 'rounded-t-full rounded-b-sm', desc: 'Teardrop Elegance' }
];

const ART_EMBLEMS = [
  { id: 'none', name: 'None (Clean Polish)', desc: 'Smooth metallic band finish' },
  { id: 'lotus', name: 'Royal Lotus Motif', desc: 'Intricate 3D lotus bloom on shoulder' },
  { id: 'infinity', name: 'Infinity Loop', desc: 'Endless love symbol sculpted in gold' },
  { id: 'heart', name: 'Imperial Heart', desc: 'Subtle heart relief motif' },
  { id: 'monogram', name: 'Custom Monogram', desc: 'Hand-carved initials emblem' },
];

const RING_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

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

const CustomAtelier = () => {
  const [step, setStep] = useState(1);
  const [selectedMetal, setSelectedMetal] = useState(METALS[0]);
  const [selectedGem, setSelectedGem] = useState(GEMSTONES[1]);
  const [selectedCut, setSelectedCut] = useState(CUTS[0]);
  const [selectedArt, setSelectedArt] = useState(ART_EMBLEMS[0]);
  const [caratWeight, setCaratWeight] = useState(1.0);
  const [metalWeightGram, setMetalWeightGram] = useState(8);
  const [engravingText, setEngravingText] = useState('');
  const [ringSize, setRingSize] = useState('7');
  const [viewMode3D, setViewMode3D] = useState(true);

  // Customer Contact Details Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const { addToCart } = useCart();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const pricing = useMemo(() => {
    const metalCost = Math.round(selectedMetal.pricePerGram * metalWeightGram);
    const gemCost = selectedGem.id === 'no-stone' ? 0 : Math.round(selectedGem.pricePerCarat * caratWeight);
    const artCost = selectedArt.id !== 'none' ? 4500 : 0;
    const makingCharges = Math.round((metalCost + gemCost + artCost) * 0.12);
    const subtotal = metalCost + gemCost + artCost + makingCharges;
    const gst = Math.round(subtotal * 0.03);
    const total = subtotal + gst;
    return { metalCost, gemCost, artCost, makingCharges, gst, total };
  }, [selectedMetal, selectedGem, metalWeightGram, caratWeight, selectedArt]);

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
        gemstone: selectedGem.id !== 'no-stone' ? `${selectedGem.name} (${caratWeight}ct ${selectedCut.name})` : 'Plain Band',
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
        gemstone: {
          id: selectedGem.id,
          name: selectedGem.name,
          color: selectedGem.color,
          pricePerCarat: selectedGem.pricePerCarat,
        },
        cut: {
          id: selectedCut.id,
          name: selectedCut.name,
        },
        caratWeight,
        personalization: {
          engravingText,
          artEmblem: selectedArt.id,
          artEmblemName: selectedArt.name,
          ringSize,
        },
        pricing,
      });

      if (response.data.success) {
        setSubmittedOrder(response.data.order);
        success('Bespoke request sent to master goldsmiths & admin email alert dispatched!');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      toastError(err.response?.data?.message || 'Failed submitting custom order request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TOTAL_STEPS = 4;
  const stepLabels = ['Metal & Weight', 'Gemstone', 'Cut & Art Motif', 'Personalize & Request'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Header Hero Section */}
        <motion.div {...fadeUp} className="text-center mb-12 lg:mb-16">
          <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] mb-4">
            GLIMMR ATELIER · 3D REAL-TIME CUSTOM STUDIO
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#222222] leading-[1.15] tracking-tight mb-4">
            Real-Time 3D Bespoke Ring Studio
          </h1>
          <p className="font-body text-sm text-[#808080] max-w-xl mx-auto leading-relaxed">
            Design your custom ring in 3D WebGL. Choose your precious metal, certified gemstone, cut, 3D art motif, and laser inscription. Submit directly to our admin team for master goldsmith approval.
          </p>
        </motion.div>

        {/* Progress Stepper Bar */}
        <motion.div {...fadeUp} className="mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <button
                  key={label}
                  onClick={() => setStep(stepNum)}
                  className="relative flex items-center gap-2 sm:gap-3 cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                    isActive ? 'bg-[#222222] text-white' : isCompleted ? 'bg-[#B59A6C] text-white' : 'bg-[#FAF9F7] text-[#808080] group-hover:bg-gray-100'
                  }`}>
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span className={`hidden sm:block text-xs font-body font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isActive ? 'text-[#222222]' : 'text-[#808080] group-hover:text-[#222222]'
                  }`}>
                    {label}
                  </span>
                  {i < TOTAL_STEPS - 1 && (
                    <div className={`hidden sm:block w-8 lg:w-16 h-[1px] ml-1 transition-colors duration-300 ${
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
          
          {/* Left Column: 3D Interactive Ring Visualizer */}
          <motion.div {...fadeUp} className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="bg-[#FAF9F7] rounded-[20px] p-4 sm:p-6 aspect-square flex flex-col items-center justify-center relative overflow-hidden group border border-gray-100">
              
              {/* 3D / 2D Render Canvas Toggle */}
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

              {/* Render 3D Canvas or 2D Studio based on toggle */}
              {viewMode3D ? (
                <ThreeRingCanvas
                  metal={selectedMetal}
                  gemstone={selectedGem}
                  cut={selectedCut}
                  caratWeight={caratWeight}
                  bandWeight={metalWeightGram}
                  artEmblem={selectedArt.id}
                  autoRotate={true}
                />
              ) : (
                <RealisticRing
                  metal={selectedMetal}
                  gemstone={selectedGem}
                  cut={selectedCut}
                  caratWeight={caratWeight}
                  bandWeight={metalWeightGram}
                  engravingText={engravingText}
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
              <div className="space-y-2.5 text-sm font-body">
                <div className="flex justify-between text-[#808080]">
                  <span>{selectedMetal.name} ({metalWeightGram}g)</span>
                  <span className="font-mono text-[#222222]">₹{pricing.metalCost.toLocaleString('en-IN')}</span>
                </div>
                {selectedGem.id !== 'no-stone' && (
                  <div className="flex justify-between text-[#808080]">
                    <span>{selectedGem.name} ({caratWeight}ct {selectedCut.name})</span>
                    <span className="font-mono text-[#222222]">₹{pricing.gemCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedArt.id !== 'none' && (
                  <div className="flex justify-between text-[#808080]">
                    <span>3D Art Motif ({selectedArt.name})</span>
                    <span className="font-mono text-[#222222]">₹{pricing.artCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#808080]">
                  <span>Making & Goldsmithing Charges (12%)</span>
                  <span className="font-mono text-[#222222]">₹{pricing.makingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#808080]">
                  <span>GST (3%)</span>
                  <span className="font-mono text-[#222222]">₹{pricing.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">
                    Total Bespoke Valuation
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#222222]">
                    ₹{pricing.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Configurator Form Steps */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">

              {/* Step 1: Metal & Band Weight */}
              {step === 1 && (
                <motion.div key="step1" {...slideIn()}>
                  <div className="mb-6">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 1 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Select Metal & Weight</h2>
                    <p className="font-body text-sm text-[#808080] mt-1">
                      Choose your precious base metal. Real-time rates calculated per gram.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {METALS.map((m) => {
                      const isSelected = selectedMetal.id === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMetal(m)}
                          className={`w-full p-4 rounded-[16px] text-left flex items-center gap-4 transition-all cursor-pointer ${
                            isSelected ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white hover:bg-[#FAFAFA] border border-gray-100'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: m.color, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-body font-bold text-[#222222]">{m.name}</span>
                              <span className="text-[10px] font-mono font-bold text-[#B59A6C] px-2 py-0.5 bg-white border border-[#B59A6C]/30 rounded-full">{m.badge}</span>
                            </div>
                            <span className="text-xs text-[#808080] font-body">{m.purity}</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-[#222222]">₹{m.pricePerGram.toLocaleString('en-IN')}/g</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Band Weight Slider */}
                  <div className="mt-8 bg-[#FAF9F7] rounded-[16px] p-6 border border-gray-100">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">Band Thickness & Weight</span>
                      <span className="font-mono text-base font-bold text-[#222222]">{metalWeightGram} grams</span>
                    </div>
                    <input
                      type="range" min="3" max="25" step="0.5" value={metalWeightGram}
                      onChange={e => setMetalWeightGram(parseFloat(e.target.value))}
                      className="w-full accent-[#222222] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-body text-[#808080] mt-2">
                      <span>3g · Dainty</span><span>12g · Classic</span><span>25g · Heavy Statement</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Gemstone Selection */}
              {step === 2 && (
                <motion.div key="step2" {...slideIn()}>
                  <div className="mb-6">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 2 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Choose Gemstone</h2>
                    <p className="font-body text-sm text-[#808080] mt-1">
                      Select certified natural diamonds, emeralds, rubies, sapphires, or a plain band.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {GEMSTONES.map((g) => {
                      const isSelected = selectedGem.id === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGem(g)}
                          className={`w-full p-4 rounded-[16px] text-left flex items-center gap-4 transition-all cursor-pointer ${
                            isSelected ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white hover:bg-[#FAFAFA] border border-gray-100'
                          }`}
                        >
                          {g.id !== 'no-stone' ? (
                            <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}40` }} />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-[#FAF9F7] border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">PLAIN</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-body font-bold text-[#222222] block">{g.name}</span>
                            <span className="text-xs text-[#808080] font-body">{g.desc}</span>
                          </div>
                          {g.pricePerCarat > 0 && (
                            <span className="text-sm font-mono font-bold text-[#222222]">₹{g.pricePerCarat.toLocaleString('en-IN')}/ct</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Cut & Art Personalization */}
              {step === 3 && (
                <motion.div key="step3" {...slideIn()}>
                  <div className="mb-6">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 3 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Gemstone Cut & Art Motif</h2>
                    <p className="font-body text-sm text-[#808080] mt-1">
                      Choose facet cut geometry, carat weight, and 3D sculpted shoulder art motif.
                    </p>
                  </div>

                  {/* Cut Options */}
                  {selectedGem.id !== 'no-stone' && (
                    <div className="mb-6">
                      <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                        Select Cut Geometry
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {CUTS.map((c) => {
                          const isSelected = selectedCut.id === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCut(c)}
                              className={`p-3.5 rounded-[14px] flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                                isSelected ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white border border-gray-100 hover:bg-[#FAFAFA]'
                              }`}
                            >
                              <div className={`w-6 h-6 border-2 ${isSelected ? 'border-[#222222]' : 'border-gray-300'} ${c.shape}`} />
                              <span className="text-xs font-body font-bold text-[#222222]">{c.name}</span>
                              <span className="text-[10px] text-[#808080]">{c.desc}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Carat Slider */}
                      <div className="mt-6 bg-[#FAF9F7] rounded-[16px] p-5 border border-gray-100">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">Carat Weight</span>
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
                    </div>
                  )}

                  {/* 3D Art Emblem Motifs */}
                  <div>
                    <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                      Select 3D Art & Relief Motif
                    </label>
                    <div className="space-y-2">
                      {ART_EMBLEMS.map((art) => {
                        const isSelected = selectedArt.id === art.id;
                        return (
                          <button
                            key={art.id}
                            onClick={() => setSelectedArt(art)}
                            className={`w-full p-3.5 rounded-[14px] text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected ? 'bg-[#FAF9F7] ring-1 ring-[#222222]' : 'bg-white border border-gray-100 hover:bg-[#FAFAFA]'
                            }`}
                          >
                            <div>
                              <span className="font-body font-bold text-xs text-[#222222] block">{art.name}</span>
                              <span className="text-[11px] text-[#808080] font-body">{art.desc}</span>
                            </div>
                            <span className="text-xs font-mono text-[#B59A6C]">
                              {art.id === 'none' ? 'FREE' : '+₹4,500'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Personalization & Request Submission Form */}
              {step === 4 && (
                <motion.div key="step4" {...slideIn()}>
                  <div className="mb-6">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 4 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Personalize & Request Approval</h2>
                    <p className="font-body text-sm text-[#808080] mt-1">
                      Add laser inscription, choose ring size, and enter contact details for admin approval.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitBespokeRequest} className="space-y-5">
                    {/* Laser Engraving */}
                    <div>
                      <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-2 block">
                        Laser Inscription (Inner Band)
                      </label>
                      <input
                        type="text" maxLength={25} value={engravingText}
                        onChange={e => setEngravingText(e.target.value)}
                        placeholder="e.g. Forever Yours 13.08"
                        className="w-full px-4 py-3 bg-[#FAF9F7] rounded-[14px] font-heading italic text-sm text-[#222222] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#222222]"
                      />
                    </div>

                    {/* Ring Size */}
                    <div>
                      <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-2 block">
                        US Standard Ring Size
                      </label>
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
                    </div>

                    {/* Contact Details Form */}
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
                        className="flex-1 px-8 py-4 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors rounded-none cursor-pointer text-center"
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
                  className="px-6 py-3 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors cursor-pointer rounded-none"
                >
                  ← Back
                </button>
              ) : <div />}

              {step < TOTAL_STEPS && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-colors shadow-md cursor-pointer rounded-none flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span>→</span>
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
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-2xl mx-auto mb-4 font-mono font-bold">
                ✓
              </div>
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] block mb-1">
                REQUEST RECEIVED
              </span>
              <h3 className="text-2xl font-heading text-[#222222] mb-2">Bespoke Order Submitted</h3>
              <p className="font-body text-xs text-[#808080] mb-4 leading-relaxed">
                Your request ID is <strong className="font-mono text-[#222222]">{submittedOrder.customOrderId}</strong>. An email notification has been dispatched to our admin team & master goldsmiths.
              </p>

              <div className="bg-[#FAF9F7] p-4 rounded-[16px] text-left text-xs font-body text-[#808080] space-y-1.5 mb-6">
                <div><strong>Customer:</strong> {submittedOrder.customerName} ({submittedOrder.customerPhone})</div>
                <div><strong>Metal:</strong> {submittedOrder.metal.name}</div>
                <div><strong>Gemstone:</strong> {submittedOrder.gemstone.name} ({submittedOrder.caratWeight}ct)</div>
                <div><strong>Status:</strong> <span className="font-bold text-amber-600 uppercase">Pending Admin Approval</span></div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubmittedOrder(null)}
                  className="flex-1 py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors rounded-none"
                >
                  Close & Continue
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
