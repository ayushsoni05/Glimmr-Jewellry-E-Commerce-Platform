import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DiamondIcon } from '../components/Icons';

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState('rings');
  const [measurement, setMeasurement] = useState('54.4');
  const [unit, setUnit] = useState('mm'); // 'mm' or 'cm'

  // Comprehensive Ring Conversion Data
  const ringSizes = [
    { indian: '9', us: '5', uk: 'J 1/2', diameter: '15.7 mm', circumference: '49.3 mm' },
    { indian: '11', us: '6', uk: 'L 1/2', diameter: '16.5 mm', circumference: '51.9 mm' },
    { indian: '14', us: '7', uk: 'N 1/2', diameter: '17.3 mm', circumference: '54.4 mm' },
    { indian: '16', us: '8', uk: 'P 1/2', diameter: '18.2 mm', circumference: '57.0 mm' },
    { indian: '19', us: '9', uk: 'R 1/2', diameter: '18.9 mm', circumference: '59.5 mm' },
    { indian: '21', us: '10', uk: 'T 1/2', diameter: '19.8 mm', circumference: '62.1 mm' },
    { indian: '24', us: '11', uk: 'V 1/2', diameter: '20.6 mm', circumference: '64.6 mm' },
    { indian: '25+', us: '12', uk: 'Y', diameter: '21.4 mm', circumference: '67.2 mm' },
  ];

  // Traditional Indian Bangle Sizes
  const bangleSizes = [
    { size: '2.2', diameterInch: '2.125 in', diameterMm: '54.0 mm', fit: 'Extra Small (XS)' },
    { size: '2.4', diameterInch: '2.250 in', diameterMm: '57.2 mm', fit: 'Small (S)' },
    { size: '2.6', diameterInch: '2.375 in', diameterMm: '60.3 mm', fit: 'Medium (M - Most Popular)' },
    { size: '2.8', diameterInch: '2.500 in', diameterMm: '63.5 mm', fit: 'Large (L)' },
    { size: '2.10', diameterInch: '2.625 in', diameterMm: '66.7 mm', fit: 'Extra Large (XL)' },
  ];

  // Necklace Length Visualizer
  const necklaceLengths = [
    { name: 'Choker', lengthInch: '14" - 16"', lengthCm: '35 - 40 cm', Placement: 'Sits gracefully around the base of the throat', recommendation: 'Ideal for open necklines, strapless gowns, and high-jewelry bridal collars.' },
    { name: 'Princess', lengthInch: '18"', lengthCm: '45 cm', Placement: 'Rests delicately over the collarbone', recommendation: 'The classic solitaire & pendant standard. Fits virtually any neckline.' },
    { name: 'Matinee', lengthInch: '20" - 24"', lengthCm: '50 - 60 cm', Placement: 'Falls gracefully above or at the center chest', recommendation: 'Perfect for business attire, layered polki strings, and plunge necklines.' },
    { name: 'Opera', lengthInch: '28" - 32"', lengthCm: '70 - 80 cm', Placement: 'Hangs elegantly below the bustline', recommendation: 'Exudes dramatic evening elegance. Can be wrapped into a double choker.' },
    { name: 'Rope / Sautoir', lengthInch: '36"+', lengthCm: '90+ cm', Placement: 'Lays at or below the waistline', recommendation: 'High-jewelry versatility. Can be worn as a multi-wrap necklace or bracelet.' },
  ];

  // Dynamic Ring Size Calculator Logic
  const getCalculatedSize = () => {
    const val = parseFloat(measurement) || 0;
    const circum = unit === 'cm' ? val * 10 : val;

    if (circum <= 0) return { indian: '—', us: '—', uk: '—', diameter: '15.0' };
    if (circum < 50.5) return { indian: '9', us: '5', uk: 'J 1/2', diameter: '15.7' };
    if (circum < 53.0) return { indian: '11', us: '6', uk: 'L 1/2', diameter: '16.5' };
    if (circum < 55.7) return { indian: '14', us: '7', uk: 'N 1/2', diameter: '17.3' };
    if (circum < 58.2) return { indian: '16', us: '8', uk: 'P 1/2', diameter: '18.2' };
    if (circum < 60.8) return { indian: '19', us: '9', uk: 'R 1/2', diameter: '18.9' };
    if (circum < 63.3) return { indian: '21', us: '10', uk: 'T 1/2', diameter: '19.8' };
    if (circum < 66.0) return { indian: '24', us: '11', uk: 'V 1/2', diameter: '20.6' };
    return { indian: '25+', us: '12', uk: 'Y', diameter: '21.4' };
  };

  const calculated = getCalculatedSize();

  // Numerical value in MM for track fill
  const valMM = unit === 'cm' ? (parseFloat(measurement) || 5.44) * 10 : parseFloat(measurement) || 54.4;
  const clampedMM = Math.min(Math.max(valMM, 48), 68);
  const trackPercentage = ((clampedMM - 48) / (68 - 48)) * 100;

  // Circle scaling size for visual preview (px)
  const previewSizePx = 60 + ((clampedMM - 48) / (68 - 48)) * 60;

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Webflow Atelier Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#E5E2D9] rounded-[28px] p-10 sm:p-14 shadow-[0_20px_50px_rgba(181,154,108,0.06)] relative overflow-hidden text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#B59A6C]/15 via-[#FDF2F0]/30 to-transparent rounded-full blur-3xl pointer-events-none"
          />

          <span className="inline-block px-4 py-1.5 bg-[#FDF2F0] border border-[#E8C8C1] text-[#B59A6C] font-mono text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-4 shadow-xs">
            ATELIER PROPORTION &amp; FIT GUIDE
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#111111] tracking-tight uppercase mb-4">
            Mastery of Scale &amp; Fit
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-body text-gray-600 leading-relaxed tracking-wider">
            Explore our comprehensive sizing scales for bespoke rings, solitaire bands, traditional Indian bangles, and high-jewelry necklace proportions.
          </p>
        </motion.div>

        {/* Webflow Segmented Tab Navigation Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white border border-[#E5E2D9] p-2 rounded-2xl md:rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          {[
            { id: 'rings', label: 'Rings & Solitaires' },
            { id: 'necklaces', label: 'Necklaces & Chokers' },
            { id: 'bangles', label: 'Bangles & Bracelets' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full py-3.5 px-4 font-body text-xs font-bold uppercase tracking-[0.18em] transition-colors rounded-xl md:rounded-full cursor-pointer z-10 text-center flex items-center justify-center ${
                  isActive ? 'text-[#FAF9F7]' : 'text-gray-500 hover:text-[#111111] hover:bg-[#FAF9F7]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSizePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-[#111111] border border-[#B59A6C]/60 rounded-xl md:rounded-full shadow-md z-0"
                  />
                )}
                <span className="relative z-10 truncate">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content Display Area */}
        <AnimatePresence mode="wait">
          
          {/* RINGS & SOLITAIRES TAB */}
          {activeTab === 'rings' && (
            <motion.div
              key="rings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Ultra-Luxury Atelier Fitting Gauge */}
              <div className="bg-white border border-[#E5E2D9] rounded-[28px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden">
                
                <div className="lg:col-span-7 space-y-8">
                  {/* Header Title with Pure Typography */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#111111] uppercase tracking-wider">
                      Interactive Ring Fitting Gauge
                    </h2>
                    <p className="text-xs text-gray-500 font-body mt-1">Adjust finger circumference to preview instant 1:1 solitaire fit</p>
                  </div>

                  {/* Input Box & Unit Segmented Switcher */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-widest">
                        Finger Circumference ({unit.toUpperCase()})
                      </label>
                      <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-widest">
                        PRECISION: 0.1 {unit.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Plus/Minus Precision Controls + Input */}
                      <div className="flex-1 flex items-center bg-[#FAF9F7] border border-[#E5E2D9] focus-within:border-[#B59A6C] rounded-2xl p-1.5 shadow-2xs transition-colors">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseFloat(measurement) || 54.4;
                            const next = Math.max(cur - 0.5, unit === 'cm' ? 4.8 : 48).toFixed(1);
                            setMeasurement(next.toString());
                          }}
                          className="w-10 h-10 rounded-xl bg-white border border-[#E5E2D9] text-[#111111] font-mono font-bold hover:bg-[#B59A6C] hover:text-black transition-colors cursor-pointer flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step="0.1"
                          value={measurement}
                          onChange={(e) => setMeasurement(e.target.value)}
                          placeholder="e.g. 54.4"
                          className="flex-1 bg-transparent text-center font-mono text-lg font-bold text-[#111111] focus:outline-none px-3"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseFloat(measurement) || 54.4;
                            const next = Math.min(cur + 0.5, unit === 'cm' ? 6.8 : 68).toFixed(1);
                            setMeasurement(next.toString());
                          }}
                          className="w-10 h-10 rounded-xl bg-white border border-[#E5E2D9] text-[#111111] font-mono font-bold hover:bg-[#B59A6C] hover:text-black transition-colors cursor-pointer flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      {/* MM / CM Unit Toggle */}
                      <div className="bg-[#FAF9F7] border border-[#E5E2D9] rounded-2xl p-1.5 flex gap-1 shadow-2xs">
                        {['mm', 'cm'].map((u) => {
                          const isSelected = unit === u;
                          return (
                            <button
                              key={u}
                              type="button"
                              onClick={() => {
                                if (unit !== u) {
                                  if (u === 'cm') {
                                    setMeasurement(((parseFloat(measurement) || 54.4) / 10).toFixed(2));
                                  } else {
                                    setMeasurement(((parseFloat(measurement) || 5.44) * 10).toFixed(1));
                                  }
                                  setUnit(u);
                                }
                              }}
                              className={`relative px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer z-10 ${
                                isSelected ? 'text-[#FAF9F7]' : 'text-gray-400 hover:text-[#111111]'
                              }`}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="unitTogglePill"
                                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                  className="absolute inset-0 bg-[#111111] rounded-xl z-0"
                                />
                              )}
                              <span className="relative z-10">{u}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CUSTOM LUXURY TRACK SLIDER BAR */}
                  <div className="space-y-3 pt-2">
                    <div className="relative w-full h-4 bg-[#E5E2D9]/60 rounded-full overflow-hidden p-0.5 border border-[#E5E2D9]">
                      {/* Gradient Active Gold Fill */}
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#111111] via-[#B59A6C] to-[#E8C8C1] rounded-full"
                        style={{ width: `${trackPercentage}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>

                    {/* Native Slider overlay with opacity-0 thumb for smooth drag */}
                    <input
                      type="range"
                      min="48"
                      max="68"
                      step="0.1"
                      value={unit === 'cm' ? (parseFloat(measurement) || 5.44) * 10 : parseFloat(measurement) || 54.4}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setMeasurement(unit === 'cm' ? (val / 10).toFixed(2) : val.toFixed(1));
                      }}
                      className="w-full h-3 -mt-7 relative z-20 accent-[#B59A6C] cursor-pointer opacity-95"
                    />

                    {/* Milestone Ticks */}
                    <div className="flex justify-between font-mono text-[10px] text-gray-400 pt-1">
                      <span>48mm (US 4)</span>
                      <span>51.9mm (US 6)</span>
                      <span>54.4mm (US 7)</span>
                      <span>59.5mm (US 9)</span>
                      <span>68mm (US 12)</span>
                    </div>
                  </div>
                </div>

                {/* REAL-TIME DYNAMIC PHYSICAL RING CIRCLE PREVIEW */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#FAF9F7] via-[#FDF2F0] to-[#FAF9F7] border border-[#E8C8C1] rounded-[24px] p-8 text-center space-y-6 shadow-sm flex flex-col items-center justify-center relative min-h-[340px]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#B59A6C] block">
                    PHYSICAL SCALE RING SILHOUETTE
                  </span>

                  {/* Interactive Dynamic Scaling Ring Circle */}
                  <div className="relative w-36 h-36 flex items-center justify-center my-2">
                    {/* Outer Glow Halo */}
                    <div className="absolute inset-0 bg-[#B59A6C]/10 rounded-full blur-xl" />
                    
                    {/* Ring Circle Silhouette */}
                    <motion.div
                      animate={{ width: previewSizePx, height: previewSizePx }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="rounded-full border-4 border-[#111111] shadow-[0_0_20px_rgba(181,154,108,0.3)] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-2 relative"
                    >
                      <span className="font-heading text-lg font-bold text-[#111111] leading-none">
                        {calculated.indian}
                      </span>
                      <span className="font-mono text-[9px] text-[#B59A6C] font-bold">
                        {calculated.diameter} mm
                      </span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    <div className="bg-white p-2.5 border border-[#E5E2D9] rounded-xl shadow-2xs">
                      <span className="block text-[9px] font-mono text-gray-400 uppercase">INDIAN</span>
                      <span className="font-heading text-xl font-bold text-[#111111]">{calculated.indian}</span>
                    </div>
                    <div className="bg-white p-2.5 border border-[#E5E2D9] rounded-xl shadow-2xs">
                      <span className="block text-[9px] font-mono text-gray-400 uppercase">US SIZE</span>
                      <span className="font-heading text-xl font-bold text-[#B59A6C]">{calculated.us}</span>
                    </div>
                    <div className="bg-white p-2.5 border border-[#E5E2D9] rounded-xl shadow-2xs">
                      <span className="block text-[9px] font-mono text-gray-400 uppercase">UK SIZE</span>
                      <span className="font-heading text-lg font-bold text-[#111111]">{calculated.uk}</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-body text-gray-500 italic">
                    Dynamic scale preview for solitaire bands &amp; bridal sets.
                  </p>
                </div>

              </div>

              {/* International Ring Conversion Table */}
              <div className="bg-white border border-[#E5E2D9] rounded-[24px] overflow-hidden shadow-xs">
                <div className="bg-[#FAF9F7] px-8 py-5 border-b border-[#E5E2D9] flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-[#111111] uppercase tracking-wider">
                    International Ring Scale Chart
                  </h3>
                  <span className="text-[10px] font-mono text-[#B59A6C] uppercase font-bold tracking-widest">
                    BIS CERTIFIED STANDARD
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#FAF9F7]/60 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Indian Size</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">US Size</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">UK Size</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Inside Diameter</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Inside Circumference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-body text-xs text-gray-600">
                      {ringSizes.map((r, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF9F7] transition-colors">
                          <td className="px-6 py-4 font-bold text-[#111111] font-mono">{r.indian}</td>
                          <td className="px-6 py-4 font-bold text-[#B59A6C] font-mono">{r.us}</td>
                          <td className="px-6 py-4 font-mono">{r.uk}</td>
                          <td className="px-6 py-4 font-mono">{r.diameter}</td>
                          <td className="px-6 py-4 font-mono">{r.circumference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* NECKLACES & CHOKERS TAB */}
          {activeTab === 'necklaces' && (
            <motion.div
              key="necklaces"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-white border border-[#E5E2D9] rounded-[24px] p-8 sm:p-10 shadow-xs">
                <div className="border-b border-[#E5E2D9] pb-6 mb-8">
                  <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-[0.25em] block mb-1">
                    NECKLACE PROPORTION REFERENCE
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-[#111111] uppercase tracking-wider">
                    High Jewelry Neck Placement Guide
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {necklaceLengths.map((n, idx) => (
                    <motion.div
                      key={n.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="bg-[#FAF9F7] border border-[#E5E2D9] p-6 rounded-[20px] hover:border-[#B59A6C]/60 transition-all space-y-3 group shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-heading font-bold text-lg text-[#111111] group-hover:text-[#B59A6C] transition-colors">
                          {n.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#B59A6C] bg-white px-3 py-1 border border-[#E5E2D9] rounded-full">
                          {n.lengthInch}
                        </span>
                      </div>

                      <p className="text-xs font-body font-bold text-gray-800">{n.Placement}</p>
                      <p className="text-[11px] font-body text-gray-500 leading-relaxed">{n.recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* BANGLES & BRACELETS TAB */}
          {activeTab === 'bangles' && (
            <motion.div
              key="bangles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-white border border-[#E5E2D9] rounded-[24px] overflow-hidden shadow-xs">
                <div className="bg-[#FAF9F7] px-8 py-5 border-b border-[#E5E2D9] flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#111111] uppercase tracking-wider">
                      Traditional Indian Bangle Size Guide
                    </h3>
                    <p className="text-xs text-gray-500 font-body">Standard diameter sizing for gold, kundan &amp; polki bangles</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#B59A6C] uppercase font-bold tracking-widest">
                    TRADITIONAL 2.2 - 2.10 SCALE
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#FAF9F7]/60 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Indian Bangle Size</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Inner Diameter (Inches)</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Inner Diameter (MM)</th>
                        <th className="px-6 py-4 text-xs font-mono font-bold text-[#111111] uppercase">Recommended Fit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-body text-xs text-gray-600">
                      {bangleSizes.map((b, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF9F7] transition-colors">
                          <td className="px-6 py-4 font-bold text-[#B59A6C] font-mono text-base">{b.size}</td>
                          <td className="px-6 py-4 font-mono">{b.diameterInch}</td>
                          <td className="px-6 py-4 font-mono">{b.diameterMm}</td>
                          <td className="px-6 py-4 font-bold text-[#111111]">{b.fit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Bottom Concierge Assistance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-[#E5E2D9] rounded-[24px] p-8 text-center space-y-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] font-mono text-xs font-bold mx-auto">
            VIP
          </div>
          <h3 className="text-xl font-heading font-bold text-[#111111] uppercase tracking-wider">
            Need Bespoke Sizing Assistance?
          </h3>
          <p className="text-xs font-body text-gray-500 max-w-lg mx-auto leading-relaxed">
            Our Atelier Concierge team can deliver a complimentary physical ring sizer directly to your home address or assist you with custom bridal bangle fittings.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] border border-[#B59A6C]/40 text-xs font-mono font-bold uppercase tracking-[0.25em] hover:bg-[#B59A6C] hover:text-black transition-colors rounded-full cursor-pointer shadow-md"
              >
                CONNECT WITH ATELIER CONCIERGE
              </motion.button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SizeGuide;
