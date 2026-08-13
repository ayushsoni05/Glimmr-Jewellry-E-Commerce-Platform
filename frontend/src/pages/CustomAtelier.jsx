import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import GlimmrLogo from '../components/GlimmrLogo';

const METALS = [
  { id: '24k-gold', name: '24K Pure Gold', purity: '99.9% Pure', color: '#E8DCC4', pricePerGram: 15064, bgGradient: 'from-[#FAF0DD] via-[#F7E7CE] to-[#B59A6C]', textAccent: '#B59A6C' },
  { id: '18k-rose', name: '18K Rose Gold', purity: '75.0% Gold + Copper', color: '#E8C3B9', pricePerGram: 11298, bgGradient: 'from-[#FFF0ED] via-[#FCE4EC] to-[#C88A75]', textAccent: '#C88A75' },
  { id: 'platinum', name: 'Platinum 950', purity: '95.0% Pure Platinum', color: '#E5E7EB', pricePerGram: 8500, bgGradient: 'from-[#F9FAFB] via-[#F3F4F6] to-[#9CA3AF]', textAccent: '#6B7280' },
  { id: '925-silver', name: '925 Sterling Silver', purity: '92.5% Pure Silver', color: '#D1D5DB', pricePerGram: 231, bgGradient: 'from-[#FFFFFF] via-[#F9FAFB] to-[#9CA3AF]', textAccent: '#4B5563' }
];

const GEMSTONES = [
  { id: 'vvs-diamond', name: 'VVS1 Solitaire Diamond', color: '#E0F2FE', pricePerCarat: 125000, desc: 'Flawless Brilliance & Fire', sparkColor: 'rgba(224,242,254,0.9)', aura: 'from-[#E0F2FE]/60 to-transparent' },
  { id: 'emerald', name: 'Royal Emerald', color: '#059669', pricePerCarat: 85000, desc: 'Deep Colombian Green', sparkColor: 'rgba(5,150,105,0.9)', aura: 'from-emerald-500/40 to-transparent' },
  { id: 'sapphire', name: 'Kashmir Blue Sapphire', color: '#1D4ED8', pricePerCarat: 95000, desc: 'Imperial Velvet Blue', sparkColor: 'rgba(29,78,216,0.9)', aura: 'from-blue-600/40 to-transparent' },
  { id: 'ruby', name: 'Burmese Pigeon Blood Ruby', color: '#DC2626', pricePerCarat: 110000, desc: 'Vibrant Crimson Radiance', sparkColor: 'rgba(220,38,38,0.9)', aura: 'from-red-600/40 to-transparent' }
];

const CUTS = [
  { id: 'round', name: 'Brilliant Round', shape: 'rounded-full' },
  { id: 'emerald-cut', name: 'Emerald Cut', shape: 'rounded-sm' },
  { id: 'princess', name: 'Princess Cut', shape: 'rotate-45 rounded-none' },
  { id: 'oval', name: 'Imperial Oval', shape: 'rounded-[50%]' }
];

const CustomAtelier = () => {
  const [step, setStep] = useState(1);
  const [selectedMetal, setSelectedMetal] = useState(METALS[0]);
  const [selectedGem, setSelectedGem] = useState(GEMSTONES[0]);
  const [selectedCut, setSelectedCut] = useState(CUTS[0]);
  const [caratWeight, setCaratWeight] = useState(1.5);
  const [metalWeightGram, setMetalWeightGram] = useState(8);
  const [engravingText, setEngravingText] = useState('');
  const [ringSize, setRingSize] = useState('7');
  const [lightingMode, setLightingMode] = useState('spotlight'); // 'spotlight' | 'ambient' | 'fire'

  const { addToCart } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  // Real-time IBJA Live Price Formula
  const pricing = useMemo(() => {
    const metalCost = Math.round(selectedMetal.pricePerGram * metalWeightGram);
    const gemCost = Math.round(selectedGem.pricePerCarat * caratWeight);
    const makingCharges = Math.round((metalCost + gemCost) * 0.12); // 12% making charges
    const subtotal = metalCost + gemCost + makingCharges;
    const gst = Math.round(subtotal * 0.03); // 3% GST on jewelry
    const total = subtotal + gst;
    return { metalCost, gemCost, makingCharges, gst, total };
  }, [selectedMetal, selectedGem, metalWeightGram, caratWeight]);

  const handleAddToCart = () => {
    const customProduct = {
      _id: `custom-${Date.now()}`,
      name: `Custom Atelier ${selectedGem.name} ${selectedMetal.name} Ring`,
      price: pricing.total,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
      category: 'Rings',
      material: selectedMetal.name,
      customDetails: {
        metal: selectedMetal.name,
        gemstone: `${selectedGem.name} (${caratWeight}ct)`,
        cut: selectedCut.name,
        engraving: engravingText || 'None',
        size: ringSize
      }
    };
    addToCart(customProduct, 1);
    success('Your bespoke masterpiece has been added to your Atelier Cart!');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] font-body py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-3">
            <GlimmrLogo size="md" variant="dark" autoLoop={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-wider text-[#111111] uppercase">
            Bespoke Custom Jewelry Studio
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-gray-500 max-w-xl mx-auto uppercase tracking-[0.25em]">
            Craft your one-of-a-kind creation with real-time IBJA metal valuation & 3D light stage
          </p>
        </motion.div>

        {/* Studio Main Grid: Left 3D Stage | Right Borderless Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Interactive 3D Render Stage (Borderless Glassmorphism Card) */}
          <div className="lg:col-span-5 sticky top-28 bg-white/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.06)] text-center relative overflow-hidden">
            
            {/* Ambient Background Aura Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${selectedGem.aura} opacity-30 transition-all duration-700 pointer-events-none`} />

            {/* Stage Mode Header Pill */}
            <div className="flex items-center justify-between relative z-10 mb-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FAF9F7] text-[#B59A6C] font-mono text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C] animate-ping" />
                3D ATELIER STAGE
              </span>

              {/* Lighting Mode Selector */}
              <div className="flex gap-1 bg-[#FAF9F7] p-1 rounded-full border border-gray-100">
                {[
                  { id: 'spotlight', icon: '💡' },
                  { id: 'ambient', icon: '☀️' },
                  { id: 'fire', icon: '🔥' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setLightingMode(mode.id)}
                    className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all ${
                      lightingMode === mode.id ? 'bg-[#111111] text-white shadow-xs' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {mode.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Ring Stage Canvas */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center my-4 z-10">
              
              {/* Rotating Gold Halo Particle Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-[#B59A6C]/30"
              />

              {/* Outer Metal Ring Band */}
              <motion.div 
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full border-[16px] shadow-2xl relative flex items-center justify-center bg-gradient-to-tr ${selectedMetal.bgGradient} transition-all duration-700`}
                style={{
                  boxShadow: lightingMode === 'spotlight' 
                    ? '0 20px 50px rgba(0,0,0,0.15)' 
                    : lightingMode === 'fire' 
                    ? '0 20px 50px rgba(220,38,38,0.15)' 
                    : '0 10px 30px rgba(0,0,0,0.08)'
                }}
              >
                {/* Inner Ring Band Hollow */}
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-[#FAF9F7] shadow-inner flex items-center justify-center relative overflow-hidden">
                  
                  {/* Laser Engraving Text Preview */}
                  {engravingText && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-serif italic text-[11px] sm:text-xs text-gray-700 tracking-[0.2em] max-w-[120px] truncate text-center select-none"
                    >
                      "{engravingText}"
                    </motion.span>
                  )}
                </div>

                {/* Crown Setting Gemstone */}
                <motion.div 
                  key={selectedGem.id + selectedCut.id + caratWeight}
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className={`absolute -top-6 z-20 w-14 h-14 sm:w-16 sm:h-16 ${selectedCut.shape} border-2 border-white/80 flex items-center justify-center transition-all duration-500`}
                  style={{ 
                    backgroundColor: selectedGem.color, 
                    boxShadow: `0 0 35px ${selectedGem.sparkColor}` 
                  }}
                >
                  {/* Gemstone Reflection Flare */}
                  <div className="w-5 h-5 bg-white/60 rounded-full blur-[1px] animate-pulse" />
                  
                  {/* Carat Indicator Badge */}
                  <span className="absolute -bottom-2 px-2 py-0.5 bg-[#111111] text-[#FAF9F7] text-[8px] font-mono font-bold rounded-full shadow-xs">
                    {caratWeight}ct
                  </span>
                </motion.div>
              </motion.div>
            </div>

            {/* Real-time Valuation Badge */}
            <div className="mt-8 p-5 bg-[#FAF9F7] rounded-2xl flex items-center justify-between relative z-10 shadow-xs">
              <div className="text-left">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">ESTIMATED VALUATION</span>
                <span className="font-mono text-2xl font-extrabold text-[#111111]">
                  ₹{pricing.total.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                IBJA CERTIFIED
              </span>
            </div>
          </div>

          {/* Right Column: Borderless Configurator Panel */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.06)] relative">
            
            {/* Fluid Webflow Step Navigation Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8 overflow-x-auto relative">
              {[
                { num: 1, label: '1. Metal' },
                { num: 2, label: '2. Gemstone' },
                { num: 3, label: '3. Cut & Carat' },
                { num: 4, label: '4. Engraving' }
              ].map(s => {
                const isActive = step === s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => setStep(s.num)}
                    className={`relative font-mono text-xs font-bold uppercase py-2 px-3 sm:px-4 transition-colors whitespace-nowrap cursor-pointer ${
                      isActive ? 'text-[#111111]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="atelierStepPill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-[#FAF9F7] rounded-xl z-0"
                      />
                    )}
                    <span className="relative z-10">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Configurator Steps Container */}
            <AnimatePresence mode="wait">
              
              {/* Step 1: Precious Metal Selection */}
              {step === 1 && (
                <motion.div 
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-heading text-xl font-bold text-[#111111] uppercase">Precious Metal Base</h3>
                    <span className="text-xs font-mono text-gray-400">SELECT 1 OF 4 METALS</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {METALS.map(m => {
                      const isSelected = selectedMetal.id === m.id;
                      return (
                        <motion.button
                          key={m.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMetal(m)}
                          className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF9F7] shadow-md'
                              : 'bg-white hover:bg-gray-50/60'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#B59A6C]" />
                          )}
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border shadow-inner flex-shrink-0" style={{ backgroundColor: m.color }} />
                            <div>
                              <div className="font-bold text-base text-[#111111]">{m.name}</div>
                              <div className="text-[11px] text-gray-500 font-mono">{m.purity}</div>
                              <div className="text-xs font-mono font-extrabold text-[#B59A6C] mt-1">
                                ₹{m.pricePerGram.toLocaleString('en-IN')}/gram
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Metal Weight Slider */}
                  <div className="p-6 bg-[#FAF9F7] rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold uppercase text-gray-600">Band Weight (Grams):</span>
                      <span className="font-extrabold text-base text-[#111111]">{metalWeightGram}g</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" 
                      max="20" 
                      step="0.5"
                      value={metalWeightGram}
                      onChange={e => setMetalWeightGram(parseFloat(e.target.value))}
                      className="w-full accent-[#B59A6C] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>4g (Dainty)</span>
                      <span>12g (Standard)</span>
                      <span>20g (Heavy Luxury)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Certified Gemstone Selection */}
              {step === 2 && (
                <motion.div 
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-heading text-xl font-bold text-[#111111] uppercase">Certified Gemstone</h3>
                    <span className="text-xs font-mono text-gray-400">SELECT 1 OF 4 STONES</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {GEMSTONES.map(g => {
                      const isSelected = selectedGem.id === g.id;
                      return (
                        <motion.button
                          key={g.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedGem(g)}
                          className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF9F7] shadow-md'
                              : 'bg-white hover:bg-gray-50/60'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#B59A6C]" />
                          )}
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border shadow-md flex-shrink-0" style={{ backgroundColor: g.color }} />
                            <div>
                              <div className="font-bold text-base text-[#111111]">{g.name}</div>
                              <div className="text-[11px] text-gray-500">{g.desc}</div>
                              <div className="text-xs font-mono font-extrabold text-[#B59A6C] mt-1">
                                ₹{g.pricePerCarat.toLocaleString('en-IN')}/carat
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Cut Style & Carat Weight */}
              {step === 3 && (
                <motion.div 
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-heading text-xl font-bold text-[#111111] uppercase">Gemstone Cut & Carat Size</h3>
                    <span className="text-xs font-mono text-gray-400">SELECT CUT PATTERN</span>
                  </div>

                  {/* Cut Shape Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CUTS.map(c => {
                      const isSelected = selectedCut.id === c.id;
                      return (
                        <motion.button
                          key={c.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCut(c)}
                          className={`p-4 rounded-2xl text-center flex flex-col items-center gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF9F7] shadow-sm'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 border-2 border-[#B59A6C] ${c.shape}`} />
                          <span className="text-xs font-bold text-[#111111]">{c.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Carat Range Slider */}
                  <div className="p-6 bg-[#FAF9F7] rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold uppercase text-gray-600">Gemstone Carat Weight:</span>
                      <span className="font-extrabold text-base text-[#111111]">{caratWeight} Carats</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="5.0" 
                      step="0.25"
                      value={caratWeight}
                      onChange={e => setCaratWeight(parseFloat(e.target.value))}
                      className="w-full accent-[#B59A6C] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>0.5ct (Delicate)</span>
                      <span>2.5ct (Statement)</span>
                      <span>5.0ct (Imperial Royal)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Engraving & Size Configurator */}
              {step === 4 && (
                <motion.div 
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <h3 className="font-heading text-xl font-bold text-[#111111] uppercase">Laser Engraving & Size</h3>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-gray-600 mb-2">
                      Custom Laser Inscription (Inside Ring Band):
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={engravingText}
                      onChange={e => setEngravingText(e.target.value)}
                      placeholder="e.g. Forever & Always"
                      className="w-full px-5 py-4 bg-[#FAF9F7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B59A6C]/50 font-serif italic text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-gray-600 mb-2">
                      US Standard Ring Size:
                    </label>
                    <select
                      value={ringSize}
                      onChange={e => setRingSize(e.target.value)}
                      className="w-full px-5 py-4 bg-[#FAF9F7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B59A6C]/50 font-mono text-sm"
                    >
                      {['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map(sz => (
                        <option key={sz} value={sz}>Size {sz} US</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Nav Stepper & Action Controls */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 bg-[#FAF9F7] text-[#111111] rounded-2xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  ← Previous
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3.5 bg-[#111111] text-white rounded-2xl text-xs font-mono font-bold uppercase tracking-widest hover:bg-[#B59A6C] transition-colors shadow-md cursor-pointer"
                >
                  Next Step ({step + 1}/4) →
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-[#B59A6C] text-white rounded-2xl text-xs font-mono font-bold uppercase tracking-widest shadow-xl hover:bg-[#9A7B4F] transition-all cursor-pointer"
                >
                  Add Custom Creation to Cart • ₹{pricing.total.toLocaleString('en-IN')}
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
