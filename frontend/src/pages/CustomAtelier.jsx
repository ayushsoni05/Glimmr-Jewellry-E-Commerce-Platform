import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

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
  { id: 'round', name: 'Brilliant Round', shape: 'rounded-full' },
  { id: 'emerald-cut', name: 'Emerald Cut', shape: 'rounded-sm' },
  { id: 'princess', name: 'Princess Cut', shape: 'rotate-45 rounded-none' },
  { id: 'oval', name: 'Imperial Oval', shape: 'rounded-[50%]' },
  { id: 'cushion', name: 'Cushion Cut', shape: 'rounded-lg' },
  { id: 'pear', name: 'Pear Drop', shape: 'rounded-t-full rounded-b-sm' }
];

const RING_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

/* Shared animation presets matching the website's established Framer Motion patterns */
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
  const [selectedGem, setSelectedGem] = useState(GEMSTONES[0]);
  const [selectedCut, setSelectedCut] = useState(CUTS[0]);
  const [caratWeight, setCaratWeight] = useState(1.0);
  const [metalWeightGram, setMetalWeightGram] = useState(8);
  const [engravingText, setEngravingText] = useState('');
  const [ringSize, setRingSize] = useState('7');

  const { addToCart } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  const pricing = useMemo(() => {
    const metalCost = Math.round(selectedMetal.pricePerGram * metalWeightGram);
    const gemCost = selectedGem.id === 'no-stone' ? 0 : Math.round(selectedGem.pricePerCarat * caratWeight);
    const makingCharges = Math.round((metalCost + gemCost) * 0.12);
    const subtotal = metalCost + gemCost + makingCharges;
    const gst = Math.round(subtotal * 0.03);
    const total = subtotal + gst;
    return { metalCost, gemCost, makingCharges, gst, total };
  }, [selectedMetal, selectedGem, metalWeightGram, caratWeight]);

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
        engraving: engravingText || 'None',
        size: ringSize
      }
    };
    addToCart(customProduct, 1);
    success('Your bespoke creation has been added to your cart.');
    navigate('/cart');
  };

  const TOTAL_STEPS = 4;
  const stepLabels = ['Metal', 'Gemstone', 'Cut & Carat', 'Personalize'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Hero Section — matching website's editorial section structure */}
        <motion.div {...fadeUp} className="text-center mb-16 lg:mb-20">
          <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] mb-4">
            GLIMMR ATELIER · BESPOKE CREATION
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#222222] leading-[1.15] tracking-tight mb-4">
            Custom Jewelry Studio
          </h1>
          <p className="font-body text-sm text-[#808080] max-w-lg mx-auto leading-relaxed">
            Design your one-of-a-kind masterpiece. Select your precious metal, certified gemstone, and personal engraving — with live IBJA valuation.
          </p>
        </motion.div>

        {/* Progress Stepper Bar — Webflow style minimal */}
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
                    <div className={`hidden sm:block w-12 lg:w-20 h-[1px] ml-1 transition-colors duration-300 ${
                      isCompleted ? 'bg-[#B59A6C]' : 'bg-gray-200'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Grid — 2 column split matching website layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Interactive Ring Preview Stage */}
          <motion.div 
            {...fadeUp}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            {/* Ring Preview Card — website's off-white canvas style */}
            <div className="bg-[#FAF9F7] rounded-[20px] p-8 sm:p-10 aspect-square flex flex-col items-center justify-center relative overflow-hidden group">
              
              {/* Ring Visual Render */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Metal Ring Band */}
                <motion.div
                  key={selectedMetal.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="w-52 h-52 sm:w-60 sm:h-60 rounded-full flex items-center justify-center relative"
                  style={{
                    border: `16px solid ${selectedMetal.color}`,
                    boxShadow: `inset 0 4px 20px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.06)`
                  }}
                >
                  {/* Inner Hollow */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white flex items-center justify-center">
                    {engravingText && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-heading italic text-[11px] text-[#808080] tracking-[0.15em] max-w-[110px] truncate text-center"
                      >
                        {engravingText}
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Crown Gemstone */}
                {selectedGem.id !== 'no-stone' && (
                  <motion.div
                    key={selectedGem.id + selectedCut.id + caratWeight}
                    initial={{ scale: 0, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                    className={`absolute -top-4 w-14 h-14 ${selectedCut.shape} flex items-center justify-center`}
                    style={{
                      backgroundColor: selectedGem.color,
                      boxShadow: `0 0 30px ${selectedGem.color}40, 0 4px 12px rgba(0,0,0,0.15)`
                    }}
                  >
                    <div className="w-4 h-4 bg-white/50 rounded-full blur-[2px]" />
                  </motion.div>
                )}
              </div>

              {/* Metal Badge */}
              <span className="absolute top-5 left-5 text-[10px] font-mono font-bold text-[#B59A6C] px-2.5 py-1 bg-white border border-[#B59A6C]/20 rounded-full">
                {selectedMetal.badge}
              </span>
            </div>

            {/* Live Price Breakdown Card */}
            <div className="mt-4 bg-[#FAF9F7] rounded-[20px] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C]">
                  LIVE PRICE BREAKDOWN
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  IBJA LIVE
                </span>
              </div>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between text-[#808080]">
                  <span>{selectedMetal.name} ({metalWeightGram}g)</span>
                  <span className="font-mono text-[#222222]">₹{pricing.metalCost.toLocaleString('en-IN')}</span>
                </div>
                {selectedGem.id !== 'no-stone' && (
                  <div className="flex justify-between text-[#808080]">
                    <span>{selectedGem.name} ({caratWeight}ct)</span>
                    <span className="font-mono text-[#222222]">₹{pricing.gemCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#808080]">
                  <span>Making Charges (12%)</span>
                  <span className="font-mono text-[#222222]">₹{pricing.makingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#808080]">
                  <span>GST (3%)</span>
                  <span className="font-mono text-[#222222]">₹{pricing.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-200/60 flex justify-between items-baseline">
                  <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">
                    Estimated Total
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#222222]">
                    ₹{pricing.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Configurator Steps Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">

              {/* Step 1: Metal Selection */}
              {step === 1 && (
                <motion.div key="step1" {...slideIn()}>
                  <div className="mb-8">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 1 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Select Precious Metal</h2>
                    <p className="font-body text-sm text-[#808080] mt-2 leading-relaxed">
                      Choose your base metal. Rates sourced live from IBJA spot market.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {METALS.map((m, idx) => {
                      const isSelected = selectedMetal.id === m.id;
                      return (
                        <motion.button
                          key={m.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.06 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedMetal(m)}
                          className={`w-full p-5 rounded-[16px] text-left flex items-center gap-5 transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF9F7]'
                              : 'bg-white hover:bg-[#FAFAFA]'
                          }`}
                        >
                          {/* Active Indicator */}
                          {isSelected && (
                            <motion.div layoutId="metalIndicator" className="w-1 self-stretch bg-[#222222] rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                          )}
                          <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ backgroundColor: m.color, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-body font-bold text-[#222222]">{m.name}</span>
                              <span className="text-[10px] font-mono font-bold text-[#B59A6C] px-2 py-0.5 bg-[#FAF9F7] border border-[#B59A6C]/30 rounded-full">{m.badge}</span>
                            </div>
                            <span className="text-xs text-[#808080] font-body">{m.purity}</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-[#222222]">₹{m.pricePerGram.toLocaleString('en-IN')}/g</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Weight Slider */}
                  <div className="mt-8 bg-[#FAF9F7] rounded-[16px] p-6">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">Band Weight</span>
                      <span className="font-mono text-lg font-bold text-[#222222]">{metalWeightGram}g</span>
                    </div>
                    <input
                      type="range" min="3" max="25" step="0.5" value={metalWeightGram}
                      onChange={e => setMetalWeightGram(parseFloat(e.target.value))}
                      className="w-full accent-[#222222] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-body text-[#808080] mt-2">
                      <span>3g · Dainty</span><span>14g · Classic</span><span>25g · Statement</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Gemstone Selection */}
              {step === 2 && (
                <motion.div key="step2" {...slideIn()}>
                  <div className="mb-8">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 2 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Choose Gemstone</h2>
                    <p className="font-body text-sm text-[#808080] mt-2 leading-relaxed">
                      Select a certified natural gemstone or opt for a minimal plain band.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {GEMSTONES.map((g, idx) => {
                      const isSelected = selectedGem.id === g.id;
                      return (
                        <motion.button
                          key={g.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.06 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedGem(g)}
                          className={`w-full p-5 rounded-[16px] text-left flex items-center gap-5 transition-all duration-300 cursor-pointer ${
                            isSelected ? 'bg-[#FAF9F7]' : 'bg-white hover:bg-[#FAFAFA]'
                          }`}
                        >
                          {isSelected && (
                            <motion.div layoutId="gemIndicator" className="w-1 self-stretch bg-[#222222] rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                          )}
                          {g.id !== 'no-stone' ? (
                            <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ backgroundColor: g.color, boxShadow: `0 0 12px ${g.color}30` }} />
                          ) : (
                            <div className="w-11 h-11 rounded-full flex-shrink-0 bg-[#FAF9F7] border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-lg">—</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-body font-bold text-[#222222] block">{g.name}</span>
                            <span className="text-xs text-[#808080] font-body">{g.desc}</span>
                          </div>
                          {g.pricePerCarat > 0 && (
                            <span className="text-sm font-mono font-bold text-[#222222]">₹{g.pricePerCarat.toLocaleString('en-IN')}/ct</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Cut & Carat */}
              {step === 3 && (
                <motion.div key="step3" {...slideIn()}>
                  <div className="mb-8">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 3 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Cut & Carat Weight</h2>
                    <p className="font-body text-sm text-[#808080] mt-2 leading-relaxed">
                      {selectedGem.id === 'no-stone' ? 'You selected a plain band — skip this step or go back to add a gemstone.' : 'Select the cut pattern and carat size for your gemstone.'}
                    </p>
                  </div>

                  {selectedGem.id !== 'no-stone' && (
                    <>
                      {/* Cut Selection Grid — matching website's 3-col grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                        {CUTS.map((c, idx) => {
                          const isSelected = selectedCut.id === c.id;
                          return (
                            <motion.button
                              key={c.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: idx * 0.06 }}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => setSelectedCut(c)}
                              className={`p-5 rounded-[16px] flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
                                isSelected ? 'bg-[#FAF9F7]' : 'bg-white hover:bg-[#FAFAFA]'
                              }`}
                            >
                              <div className={`w-8 h-8 border-2 transition-colors duration-300 ${isSelected ? 'border-[#222222]' : 'border-gray-300'} ${c.shape}`} />
                              <span className={`text-xs font-body font-bold transition-colors duration-300 ${isSelected ? 'text-[#222222]' : 'text-[#808080]'}`}>{c.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Carat Slider */}
                      <div className="bg-[#FAF9F7] rounded-[16px] p-6">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222]">Carat Weight</span>
                          <span className="font-mono text-lg font-bold text-[#222222]">{caratWeight} ct</span>
                        </div>
                        <input
                          type="range" min="0.25" max="5.0" step="0.25" value={caratWeight}
                          onChange={e => setCaratWeight(parseFloat(e.target.value))}
                          className="w-full accent-[#222222] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-body text-[#808080] mt-2">
                          <span>0.25ct · Subtle</span><span>2ct · Statement</span><span>5ct · Royal</span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 4: Personalization */}
              {step === 4 && (
                <motion.div key="step4" {...slideIn()}>
                  <div className="mb-8">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-2 block">
                      STEP 4 OF {TOTAL_STEPS}
                    </span>
                    <h2 className="text-3xl font-heading text-[#222222]">Personalize & Finalize</h2>
                    <p className="font-body text-sm text-[#808080] mt-2 leading-relaxed">
                      Add a laser-engraved message inside the band and select your ring size.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                        Laser Inscription
                      </label>
                      <input
                        type="text" maxLength={20} value={engravingText}
                        onChange={e => setEngravingText(e.target.value)}
                        placeholder="e.g. Forever Yours"
                        className="w-full px-5 py-4 bg-[#FAF9F7] rounded-[16px] font-heading italic text-base text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#222222]/20 transition-shadow"
                      />
                      <span className="text-[10px] font-body text-[#808080] mt-1.5 block">{engravingText.length}/20 characters</span>
                    </div>

                    <div>
                      <label className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#222222] mb-3 block">
                        Ring Size (US Standard)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {RING_SIZES.map(sz => (
                          <button
                            key={sz}
                            onClick={() => setRingSize(sz)}
                            className={`w-12 h-12 rounded-full font-mono text-sm font-bold flex items-center justify-center transition-all duration-300 cursor-pointer ${
                              ringSize === sz
                                ? 'bg-[#222222] text-white'
                                : 'bg-[#FAF9F7] text-[#808080] hover:bg-gray-100 hover:text-[#222222]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Final Summary */}
                    <div className="bg-[#FAF9F7] rounded-[16px] p-6 mt-4">
                      <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] mb-4 block">
                        YOUR CREATION SUMMARY
                      </span>
                      <div className="space-y-2 text-sm font-body text-[#808080]">
                        <div className="flex justify-between"><span>Metal</span><span className="text-[#222222] font-bold">{selectedMetal.name} · {metalWeightGram}g</span></div>
                        <div className="flex justify-between"><span>Gemstone</span><span className="text-[#222222] font-bold">{selectedGem.id !== 'no-stone' ? `${selectedGem.name} · ${caratWeight}ct` : 'Plain Band'}</span></div>
                        {selectedGem.id !== 'no-stone' && <div className="flex justify-between"><span>Cut</span><span className="text-[#222222] font-bold">{selectedCut.name}</span></div>}
                        <div className="flex justify-between"><span>Size</span><span className="text-[#222222] font-bold">US {ringSize}</span></div>
                        {engravingText && <div className="flex justify-between"><span>Engraving</span><span className="text-[#222222] font-bold font-heading italic">"{engravingText}"</span></div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Controls — matching website's CTA button pattern */}
            <div className="mt-10 flex items-center justify-between gap-4">
              {step > 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-4 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors cursor-pointer rounded-none"
                >
                  ← Back
                </motion.button>
              ) : <div />}

              {step < TOTAL_STEPS ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  onClick={() => setStep(step + 1)}
                  className="px-10 py-4 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-colors shadow-md cursor-pointer rounded-none flex items-center gap-2"
                >
                  <span>Continue</span>
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>→</motion.span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-none px-10 py-4 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors shadow-md cursor-pointer rounded-none"
                >
                  Add to Cart · ₹{pricing.total.toLocaleString('en-IN')}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAtelier;
