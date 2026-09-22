import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const OCCASIONS = [
  { id: 'wedding', label: 'Bridal & Wedding', code: 'BRD', desc: 'Heavy Kundan, Polki & VVS Solitaire sets' },
  { id: 'gala', label: 'Royal Gala & Evening', code: 'GLA', desc: 'High Jewelry statement drops & emeralds' },
  { id: 'daily', label: 'Everyday Minimalist', code: 'MIN', desc: 'Sleek 18K gold bands & dainty pendants' },
  { id: 'gifting', label: 'Anniversary & Gifting', code: 'GFT', desc: 'Timeless solitaire rings & hallmark gold' }
];

const OUTFIT_COLORS = [
  { id: 'ivory', name: 'Ivory & Cream', color: '#FAF9F7', recommend: '24K Kundan Gold or Rose Gold' },
  { id: 'emerald', name: 'Deep Emerald', color: '#064E3B', recommend: 'Colombian Emeralds & Solitaires' },
  { id: 'ruby', name: 'Royal Crimson', color: '#881337', recommend: 'Burmese Ruby & 22K Temple Gold' },
  { id: 'black', name: 'Midnight Black', color: '#111111', recommend: 'VVS Diamond & Platinum 950' }
];

const GlimmrConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [selectedColor, setSelectedColor] = useState(OUTFIT_COLORS[0]);

  return (
    <>
      {/* Floating Concierge Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        aria-label="Open VIP Atelier Concierge"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#111111] text-[#B59A6C] border-2 border-[#B59A6C] w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2.5 group"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#B59A6C] animate-ping flex-shrink-0" />
        <span className="hidden sm:inline font-mono text-xs font-bold uppercase tracking-widest text-white group-hover:text-[#B59A6C] transition-colors whitespace-nowrap">
          VIP ATELIER CONCIERGE
        </span>
        <svg className="w-4 h-4 sm:hidden text-[#B59A6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      </motion.button>

      {/* Concierge Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="w-full sm:w-[480px] bg-white border border-[#E5E2D9] rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col font-body"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <span className="font-mono text-[10px] text-[#B59A6C] font-bold uppercase tracking-widest block">
                    ● GLIMMR PERSONAL STYLIST
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[#111111] uppercase">
                    VIP Atelier Concierge
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto pr-1 flex-1">
                {/* 1. Occasion Finder */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-gray-500 mb-2">
                    1. Select Your Occasion:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {OCCASIONS.map(occ => (
                      <button
                        key={occ.id}
                        onClick={() => setSelectedOccasion(occ)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedOccasion.id === occ.id
                            ? 'border-[#B59A6C] bg-[#FAF9F7]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold text-[#B59A6C] px-1.5 py-0.5 bg-white border border-[#E5E2D9] rounded inline-block mb-1.5">{occ.code}</span>
                        <span className="font-bold text-xs text-[#111111] block">{occ.label}</span>
                        <span className="text-[10px] text-gray-500 block leading-tight">{occ.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Outfit Color Harmonizer */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-gray-500 mb-2">
                    2. Match With Outfit Color:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {OUTFIT_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(c)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          selectedColor.id === c.id
                            ? 'border-[#B59A6C] bg-[#FAF9F7]'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border shadow-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-xs text-[#111111]">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concierge Recommendation Result Box */}
                <div className="p-4 bg-[#FAF9F7] border border-[#E5E2D9] rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-widest block">
                    STYLIST ADVICE RECOMMENDATION
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed font-serif italic">
                    "For a <strong>{selectedOccasion.label}</strong> paired with <strong>{selectedColor.name}</strong>, we recommend <strong>{selectedColor.recommend}</strong>."
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                <Link
                  to="/custom-atelier"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 text-center bg-[#111111] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors"
                >
                  Custom Studio
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 text-center bg-[#B59A6C] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#9A7B4F] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlimmrConcierge;
