import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * 5-Act Cinematic Jewelry Order Story Modal
 * Act 1: Master Artisan's Velvet Box & Spotlight
 * Act 2: BIS Hallmark Stamp & Authenticity Certificate
 * Act 3: Magnetic Velvet Lid Closure & Silk Ribbon Knot
 * Act 4: Armored Vault Courier Launch & Stardust Flight
 * Act 5: Live Order ID & 4-Stage Craftsmanship Progress Tracker
 */
const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderData) return null;

  const orderId = orderData._id || orderData.orderId || orderData.id || `GLM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const displayTotal = orderData.totalAmount || orderData.totalPrice || orderData.total || 0;
  const itemsCount = orderData.items?.length || orderData.orderItems?.length || 1;

  const handleCopy = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToOrder = () => {
    onClose?.();
    navigate('/thank-you', { state: { orderData } });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl px-4"
      >
        <div className="relative w-full max-w-lg h-[620px] flex flex-col items-center justify-center overflow-hidden">

          {/* ── 3D JEWELRY BOX & ATELIER STORY SCENERY ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              scale: [0.8, 1, 1, 1, 0.35],
              y: [30, 0, 0, 0, -820],
              x: [0, 0, 0, 0, 160],
              rotate: [0, 0, 0, -4, -15],
            }}
            transition={{
              duration: 5.6,
              times: [0, 0.15, 0.72, 0.84, 1],
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative w-[320px] sm:w-[360px] h-[260px]"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            {/* Act 1 & 3: Royal Velvet Jewel Box Base */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden p-6 flex flex-col items-center justify-between"
              style={{
                background: 'radial-gradient(circle at 50% 30%, #5c111e 0%, #3b0a13 70%, #200409 100%)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 2px 6px rgba(255,255,255,0.15), inset 0 -4px 10px rgba(0,0,0,0.5)',
                border: '2px solid rgba(181, 154, 108, 0.5)',
                zIndex: 1,
              }}
            >
              {/* Inner White Satin Cushion */}
              <div
                className="w-full h-[140px] rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, #FAF8F5 0%, #E8E2D8 100%)',
                  border: '1px solid rgba(181, 154, 108, 0.3)',
                }}
              >
                {/* Diamond/Jewelry Piece in Spotlight */}
                <motion.div
                  animate={{
                    scale: [0.9, 1.05, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="relative flex flex-col items-center"
                >
                  <span className="text-4xl filter drop-shadow-[0_8px_16px_rgba(181,154,108,0.6)]">💍</span>
                  <div className="w-10 h-1.5 rounded-full bg-black/15 blur-[2px] mt-1" />
                </motion.div>

                {/* Sparkle Stars */}
                <motion.span
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                  className="absolute top-3 left-6 text-xs text-[#B59A6C]"
                >
                  ✦
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2.1, repeat: Infinity, delay: 0.7 }}
                  className="absolute bottom-4 right-8 text-xs text-[#E8D5B7]"
                >
                  ✧
                </motion.span>
              </div>

              {/* Box Base Gold Inscription */}
              <div className="text-center">
                <span className="font-heading text-[10px] font-bold tracking-[0.35em] text-[#E8D5B7] uppercase block">
                  GLIMMR LUXURY VAULT
                </span>
                <span className="text-[8px] font-mono text-[#B59A6C] tracking-widest block mt-0.5">
                  HANDCRAFTED BESPOKE ATELIER
                </span>
              </div>
            </div>

            {/* Act 2: BIS Hallmark Certificate Scroll (Slides in) */}
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.8 }}
              animate={{
                y: [80, 80, -35, -35, -35],
                opacity: [0, 0, 1, 1, 0],
                scale: [0.8, 0.8, 1, 1, 0.9],
              }}
              transition={{
                duration: 5.6,
                times: [0, 0.2, 0.38, 0.54, 0.62],
                ease: 'easeInOut',
              }}
              className="absolute left-1/2 -translate-x-1/2 w-[220px] bg-[#FAF8F5] border border-[#B59A6C] rounded px-3 py-1.5 shadow-2xl flex items-center gap-2"
              style={{ zIndex: 10 }}
            >
              <div className="w-6 h-6 rounded-full bg-[#B59A6C] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div>
                <span className="font-mono text-[8px] font-bold text-[#222222] block tracking-wider">
                  BIS HALLMARK 916 CERTIFIED
                </span>
                <span className="text-[7px] font-mono text-[#808080] block">
                  100% ETHICAL & LAB TESTED
                </span>
              </div>
            </motion.div>

            {/* Act 3: Box Velvet Lid (Folds down with magnetic closure) */}
            <motion.div
              initial={{ rotateX: 180 }}
              animate={{
                rotateX: [180, 180, 180, 0, 0],
              }}
              transition={{
                duration: 5.6,
                times: [0, 0.45, 0.55, 0.68, 1],
                ease: [0.4, 0, 0.2, 1],
              }}
              className="absolute top-0 left-0 w-full h-[140px] origin-top rounded-t-2xl overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 50% 30%, #5c111e 0%, #3b0a13 70%, #200409 100%)',
                border: '2px solid rgba(181, 154, 108, 0.6)',
                transformStyle: 'preserve-3d',
                zIndex: 20,
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
              }}
            >
              {/* Gold Ribbon Crossing */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r from-[#9E8357] via-[#E8D5B7] to-[#9E8357] opacity-80" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-b from-[#9E8357] via-[#E8D5B7] to-[#9E8357] opacity-80" />

              {/* Gold Clasp Latch */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-sm bg-gradient-to-br from-[#E8D5B7] to-[#B59A6C] border border-white/40 shadow-md" />
            </motion.div>

            {/* Act 3: Royal Crimson Wax Seal Stamp */}
            <motion.div
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{
                scale: [0, 0, 0, 1.4, 1, 1],
                rotate: [-90, -90, -90, 12, 0, 0],
                opacity: [0, 0, 0, 1, 1, 1],
              }}
              transition={{
                duration: 5.6,
                times: [0, 0.6, 0.68, 0.76, 0.82, 1],
                ease: 'easeOut',
              }}
              className="absolute top-[110px] left-1/2 -translate-x-1/2"
              style={{ zIndex: 30 }}
            >
              {/* Compression Shockwave */}
              <motion.div
                animate={{
                  scale: [0.8, 0.8, 0.8, 2.3, 0],
                  opacity: [0, 0, 0, 0.9, 0],
                }}
                transition={{ duration: 5.6, times: [0, 0.68, 0.72, 0.82, 0.9] }}
                className="absolute inset-0 rounded-full border-2 border-[#E8D5B7] pointer-events-none"
              />

              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #9E1B1B, #5E0B0B)',
                  boxShadow: '0 6px 22px rgba(94, 11, 11, 0.8), inset 0 2px 4px rgba(255,255,255,0.4)',
                }}
              >
                <div className="absolute inset-1.5 rounded-full border border-white/25" />
                <span className="font-heading text-[10px] font-bold text-white tracking-[0.2em]">GLM</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── ACT 4: GOLD STARDUST PARTICLES (Courier Flight) ── */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`stardust-particle-${i}`}
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{
                opacity: [0, 0, 0, 0.9, 0],
                y: [0, 0, 0, -300 - i * 35, -650 - i * 40],
                x: (i % 2 === 0 ? 1 : -1) * (20 + i * 14) + (i * 10),
                scale: [0.4, 0.4, 0.4, 1.5, 0.1],
              }}
              transition={{
                duration: 5.6,
                times: [0, 0.72, 0.8, 0.9, 1],
                ease: 'easeOut',
              }}
              className="absolute bottom-[180px] pointer-events-none"
              style={{ left: `calc(50% + ${(i - 8) * 18}px)` }}
            >
              <div
                className="w-2 h-2 rounded-full bg-[#B59A6C]"
                style={{ boxShadow: '0 0 12px #E8D5B7, 0 0 24px #B59A6C' }}
              />
            </motion.div>
          ))}

          {/* ── ACT 5: ORDER CONFIRMATION & ARTISAN TRACKER (Smooth Fade-In) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{
              opacity: [0, 0, 0, 0, 1],
              scale: [0.92, 0.92, 0.92, 0.92, 1],
              y: [30, 30, 30, 30, 0],
            }}
            transition={{
              duration: 5.6,
              times: [0, 0.78, 0.86, 0.94, 1],
              ease: 'easeOut',
            }}
            className="absolute inset-x-4 max-w-md mx-auto bg-[#181818]/95 border border-[#B59A6C]/45 p-6 sm:p-7 rounded-2xl shadow-2xl text-center backdrop-blur-xl"
          >
            {/* Top Crown Emblem */}
            <div className="w-12 h-12 rounded-full bg-[#B59A6C]/15 border border-[#B59A6C]/50 mx-auto flex items-center justify-center mb-3 shadow-lg">
              <span className="text-[#B59A6C] text-lg font-bold">💎</span>
            </div>

            <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-1">
              ROYAL ATELIER ORDER CONFIRMED
            </span>
            <h3 className="font-heading text-2xl text-white mb-1">
              Your Creation is Reserved
            </h3>
            <p className="text-xs font-body text-gray-300 mb-4 leading-relaxed">
              Our master goldsmiths have initiated creation and hallmark validation for your piece.
            </p>

            {/* Order Reference Box */}
            <div className="bg-black/70 border border-[#B59A6C]/35 rounded-lg p-3 mb-4 shadow-inner">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">
                ORDER REFERENCE NUMBER
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-sm font-bold text-[#E8D5B7] tracking-widest">
                  {orderId}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2 py-0.5 bg-[#B59A6C]/25 hover:bg-[#B59A6C]/40 text-[#E8D5B7] text-[10px] font-mono rounded cursor-pointer transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* 4-Stage Artisan Timeline */}
            <div className="grid grid-cols-4 gap-1.5 mb-5 text-center">
              {[
                { title: 'Confirmed', icon: '✓', active: true },
                { title: 'Artisan Craft', icon: '⚒', active: true },
                { title: 'Hallmarking', icon: '🏛', active: false },
                { title: 'Armored Delivery', icon: '✈', active: false },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] mb-1 font-bold ${
                      step.active
                        ? 'bg-[#B59A6C] text-white shadow-md'
                        : 'bg-white/10 text-gray-400 border border-white/10'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-[8px] font-mono leading-tight ${step.active ? 'text-[#E8D5B7] font-bold' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleGoToOrder}
                className="flex-1 py-3 bg-[#B59A6C] hover:bg-[#A3885C] text-white font-body text-xs font-bold uppercase tracking-[0.18em] rounded transition-colors cursor-pointer shadow-lg"
              >
                View Order Details
              </button>
              <button
                onClick={() => {
                  onClose?.();
                  navigate('/');
                }}
                className="py-3 px-4 bg-white/10 hover:bg-white/20 text-gray-200 font-body text-xs font-bold uppercase tracking-[0.15em] rounded transition-colors cursor-pointer"
              >
                Explore More
              </button>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JewelryOrderStoryModal;
