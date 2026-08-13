import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import GlimmrLogo from '../components/GlimmrLogo';

const METALS = [
  { id: '24k-gold', name: '24K Pure Gold', purity: '99.9% Pure', color: '#E8DCC4', pricePerGram: 15064, bgGradient: 'from-[#F7E7CE] to-[#B59A6C]' },
  { id: '18k-rose', name: '18K Rose Gold', purity: '75.0% Gold + Copper', color: '#E8C3B9', pricePerGram: 11298, bgGradient: 'from-[#FCE4EC] to-[#C88A75]' },
  { id: 'platinum', name: 'Platinum 950', purity: '95.0% Pure Platinum', color: '#E5E7EB', pricePerGram: 8500, bgGradient: 'from-[#F3F4F6] to-[#9CA3AF]' },
  { id: '925-silver', name: '925 Sterling Silver', purity: '92.5% Pure Silver', color: '#D1D5DB', pricePerGram: 231, bgGradient: 'from-[#F9FAFB] to-[#9CA3AF]' }
];

const GEMSTONES = [
  { id: 'vvs-diamond', name: 'VVS1 Solitaire Diamond', color: '#E0F2FE', pricePerCarat: 125000, desc: 'Flawless Brilliance & Fire', sparkColor: 'rgba(224,242,254,0.8)' },
  { id: 'emerald', name: 'Royal Emerald', color: '#059669', pricePerCarat: 85000, desc: 'Deep Colombian Green', sparkColor: 'rgba(16,185,129,0.8)' },
  { id: 'sapphire', name: 'Kashmir Blue Sapphire', color: '#1D4ED8', pricePerCarat: 95000, desc: 'Imperial Velvet Blue', sparkColor: 'rgba(59,130,246,0.8)' },
  { id: 'ruby', name: 'Burmese Pigeon Blood Ruby', color: '#DC2626', pricePerCarat: 110000, desc: 'Vibrant Crimson Radiance', sparkColor: 'rgba(239,68,68,0.8)' }
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

  const { addToCart } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  // Price Calculation Formula
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
    success('Your bespoke creation has been added to your Atelier Cart!');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title Banner */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <GlimmrLogo size="md" variant="dark" showSubtext={false} autoLoop={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#111111] uppercase tracking-wider">
            Bespoke Custom Jewelry Studio
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-body text-gray-500 max-w-2xl mx-auto uppercase tracking-widest">
            Design your unique masterpiece with real-time IBJA live metal & gemstone valuation
          </p>
        </div>

        {/* Studio Grid: Left Live Interactive Previewer | Right Step Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Canvas: Interactive 3D/Visual Preview Card */}
          <div className="lg:col-span-5 sticky top-28 bg-white border border-[#E5E2D9] rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] text-center">
            <span className="inline-block px-3.5 py-1 bg-[#FAF9F7] border border-[#E5E2D9] text-[#B59A6C] font-mono text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
              ● LIVE ATELIER RENDER
            </span>

            {/* Interactive Render Stage */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-6">
              {/* Metal Outer Ring */}
              <motion.div 
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-52 h-52 rounded-full border-[14px] shadow-2xl relative flex items-center justify-center bg-gradient-to-tr ${selectedMetal.bgGradient}`}
                style={{ borderColor: selectedMetal.color }}
              >
                {/* Inner Band Hollow */}
                <div className="w-36 h-36 rounded-full bg-[#FAF9F7] shadow-inner flex items-center justify-center relative">
                  {/* Engraving Text Display inside ring band */}
                  {engravingText && (
                    <span className="text-[10px] font-serif italic text-gray-600 tracking-widest max-w-[100px] truncate text-center">
                      "{engravingText}"
                    </span>
                  )}
                </div>

                {/* Crown Setting Gemstone */}
                <motion.div 
                  key={selectedGem.id + selectedCut.id}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`absolute -top-5 z-20 w-12 h-12 ${selectedCut.shape} border-2 border-white flex items-center justify-center`}
                  style={{ backgroundColor: selectedGem.color, boxShadow: `0 0 25px ${selectedGem.sparkColor}` }}
                >
                  <div className="w-4 h-4 bg-white/40 rounded-full blur-[1px] animate-pulse" />
                </motion.div>
              </motion.div>
            </div>

            {/* Summary Specification Badges */}
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 uppercase font-mono">Selected Metal:</span>
                <span className="font-bold text-[#111111]">{selectedMetal.name} ({metalWeightGram}g)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 uppercase font-mono">Gemstone:</span>
                <span className="font-bold text-[#111111]">{selectedGem.name} ({caratWeight}ct)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 uppercase font-mono">Cut Style:</span>
                <span className="font-bold text-[#111111]">{selectedCut.name}</span>
              </div>
              {engravingText && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 uppercase font-mono">Laser Engraving:</span>
                  <span className="font-bold text-[#B59A6C]">"{engravingText}"</span>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="mt-6 p-4 bg-[#FAF9F7] border border-[#E5E2D9] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">ESTIMATED VALUATION</span>
                <span className="font-mono text-xl font-bold text-[#111111]">₹{pricing.total.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded">
                IBJA CERTIFIED
              </span>
            </div>
          </div>

          {/* Right Configurator Steps */}
          <div className="lg:col-span-7 bg-white border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* Step Stepper Tabs */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8 overflow-x-auto">
              {[
                { num: 1, label: '1. Metal Base' },
                { num: 2, label: '2. Gemstone' },
                { num: 3, label: '3. Cut & Carat' },
                { num: 4, label: '4. Personalize' }
              ].map(s => (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`font-mono text-xs font-bold uppercase pb-2 transition-colors whitespace-nowrap px-2 ${
                    step === s.num
                      ? 'text-[#B59A6C] border-b-2 border-[#B59A6C]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step 1: Metal Selection */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-heading text-lg font-bold text-[#111111] uppercase">Select Precious Metal Base</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {METALS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMetal(m)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                        selectedMetal.id === m.id
                          ? 'border-[#B59A6C] bg-[#FAF9F7] shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border shadow-inner" style={{ backgroundColor: m.color }} />
                      <div>
                        <div className="font-bold text-sm text-[#111111]">{m.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{m.purity}</div>
                        <div className="text-xs font-mono font-bold text-[#B59A6C] mt-1">₹{m.pricePerGram.toLocaleString('en-IN')}/g</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Metal Weight Slider */}
                <div className="mt-6 p-4 bg-[#FAF9F7] rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-mono font-bold uppercase text-gray-600">Metal Weight (Grams):</label>
                    <span className="font-mono text-sm font-bold text-[#111111]">{metalWeightGram}g</span>
                  </div>
                  <input 
                    type="range" 
                    min="4" 
                    max="20" 
                    step="0.5"
                    value={metalWeightGram}
                    onChange={e => setMetalWeightGram(parseFloat(e.target.value))}
                    className="w-full accent-[#B59A6C]"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Gemstone Selection */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-heading text-lg font-bold text-[#111111] uppercase">Select Certified Gemstone</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GEMSTONES.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGem(g)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                        selectedGem.id === g.id
                          ? 'border-[#B59A6C] bg-[#FAF9F7] shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border shadow-md" style={{ backgroundColor: g.color }} />
                      <div>
                        <div className="font-bold text-sm text-[#111111]">{g.name}</div>
                        <div className="text-[11px] text-gray-500">{g.desc}</div>
                        <div className="text-xs font-mono font-bold text-[#B59A6C] mt-1">₹{g.pricePerCarat.toLocaleString('en-IN')}/ct</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Cut & Carat Weight */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-heading text-lg font-bold text-[#111111] uppercase">Gemstone Cut & Carat Size</h3>
                
                {/* Cut Styles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CUTS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCut(c)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                        selectedCut.id === c.id
                          ? 'border-[#B59A6C] bg-[#FAF9F7]'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-6 h-6 border-2 border-[#B59A6C] ${c.shape}`} />
                      <span className="text-xs font-bold text-[#111111]">{c.name}</span>
                    </button>
                  ))}
                </div>

                {/* Carat Slider */}
                <div className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-100 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-mono font-bold uppercase text-gray-600">Carat Weight:</label>
                    <span className="font-mono text-sm font-bold text-[#111111]">{caratWeight} Carats</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="5.0" 
                    step="0.25"
                    value={caratWeight}
                    onChange={e => setCaratWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#B59A6C]"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Personal Engraving & Final Order */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-heading text-lg font-bold text-[#111111] uppercase">Personal Engraving & Sizing</h3>
                
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-gray-600 mb-2">
                    Laser Engraving Message (Max 16 characters):
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={engravingText}
                    onChange={e => setEngravingText(e.target.value)}
                    placeholder="e.g. Forever & Always"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] font-serif italic text-sm"
                  />
                </div>

                {/* Ring Size */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-gray-600 mb-2">
                    Ring Size (US Standards):
                  </label>
                  <select
                    value={ringSize}
                    onChange={e => setRingSize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] font-mono text-sm bg-white"
                  >
                    {['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map(sz => (
                      <option key={sz} value={sz}>Size {sz} US</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Bottom Stepper Nav buttons & Add To Cart */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold uppercase hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 bg-[#111111] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors"
                >
                  Continue to Step {step + 1}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="px-8 py-3.5 bg-[#B59A6C] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#9A7B4F] transition-all transform hover:-translate-y-0.5"
                >
                  Add Custom Creation to Cart • ₹{pricing.total.toLocaleString('en-IN')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAtelier;
