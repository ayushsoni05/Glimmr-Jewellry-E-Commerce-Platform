import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImages';

/**
 * Hyper-Realistic 3D Webflow-Grade Jewelry Order Story Modal
 * 
 * Act 1: Master Jeweler's Bench · Real Product Resting on Plush Ivory Cushion inside 3D Velvet Vault
 * Act 2: Government BIS Hallmark Hologram & Laser Micro-Inscription Scroll
 * Act 3: 3D Velvet Lid Smooth Closure, Champagne Silk Ribbon Wrap & Molten Wax Seal
 * Act 4: Armored Dispatch Trunk Launch with 3D Parallax & Stardust Trail
 * Act 5: Live Order ID & 4-Stage Artisan Timeline
 */
const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [currentAct, setCurrentAct] = useState(0);

  // Extract order details & ordered product image
  const orderId = orderData?._id || orderData?.orderId || orderData?.id || `GLM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const displayTotal = orderData?.totalAmount || orderData?.totalPrice || orderData?.total || 0;
  
  // Find first product image or fallback
  const firstItem = orderData?.items?.[0] || orderData?.orderItems?.[0] || {};
  const productObj = firstItem.product || firstItem;
  const productImage = firstItem.image || productObj.image || (productObj.category ? getProductImage(productObj) : 'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg');
  const productName = productObj.name || firstItem.name || 'Glimmr Royal Bespoke Creation';

  // Story subtitle script matching time phases
  const STORY_SCRIPTS = [
    { phase: '01 / 05', title: 'MASTER GOLDSMITH BENCH', sub: 'Final inspection, prong tension check & gemstone micro-seating' },
    { phase: '02 / 05', title: 'BIS 916 HALLMARK & IGI LAB', sub: 'Laser micro-inscription of authenticity & purity certification' },
    { phase: '03 / 05', title: 'ROYAL VELVET VAULT & SILK TIE', sub: 'Encased in hand-sewn Italian velvet & sealed with 24K wax crest' },
    { phase: '04 / 05', title: 'INSURED ARMORED DISPATCH', sub: 'Secured inside tamper-evident armored concierge vault' },
    { phase: '05 / 05', title: 'ATELIER RESERVATION CONFIRMED', sub: 'Live concierge timeline & dispatch tracking initiated' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentAct(0);
      return;
    }

    const t1 = setTimeout(() => setCurrentAct(1), 1500);
    const t2 = setTimeout(() => setCurrentAct(2), 2900);
    const t3 = setTimeout(() => setCurrentAct(3), 4200);
    const t4 = setTimeout(() => setCurrentAct(4), 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b]/92 backdrop-blur-2xl px-4 select-none overflow-hidden"
      >
        {/* Background Atmospheric Studio Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B59A6C]/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-[#8B1A1A]/10 rounded-full blur-[120px]" />
          {/* Subtle Grid overlay for Webflow aesthetic */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#B59A6C 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>

        <div className="relative w-full max-w-lg h-[640px] flex flex-col items-center justify-between py-6">

          {/* ── TOP SCRIPT NARRATIVE HUD ── */}
          <div className="w-full text-center relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAct}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="inline-flex flex-col items-center"
              >
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1c1c1f]/80 border border-[#B59A6C]/30 rounded-full shadow-lg mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C] animate-pulse" />
                  <span className="text-[9px] font-mono tracking-[0.25em] text-[#E8D5B7] uppercase font-bold">
                    {STORY_SCRIPTS[currentAct]?.phase}
                  </span>
                  <span className="text-gray-500 text-[10px]">|</span>
                  <span className="text-[9px] font-body tracking-[0.2em] text-[#B59A6C] uppercase font-bold">
                    {STORY_SCRIPTS[currentAct]?.title}
                  </span>
                </div>
                <p className="text-[11px] font-body text-gray-400 tracking-wide max-w-xs sm:max-w-sm text-center italic">
                  "{STORY_SCRIPTS[currentAct]?.sub}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── 3D PHYSICAL JEWELRY VAULT BOX STAGING ── */}
          <div
            className="relative w-[340px] sm:w-[380px] h-[300px] flex items-center justify-center"
            style={{ perspective: '1400px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.82, rotateX: 20, y: 30 }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                scale: [0.82, 1, 1, 1, 0.35],
                rotateX: [20, 12, 12, 12, -25],
                rotateY: [0, -6, 6, 0, 15],
                rotateZ: [0, 0, 0, -4, -12],
                y: [30, 0, 0, 0, -850],
                x: [0, 0, 0, 0, 180],
              }}
              transition={{
                duration: 5.6,
                times: [0, 0.14, 0.72, 0.84, 1],
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="relative w-[310px] sm:w-[350px] h-[260px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Box Ambient Occlusion Contact Shadow */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[30px] rounded-[100%] bg-black/70 blur-[18px] pointer-events-none"
                style={{ transform: 'rotateX(90deg) translateZ(-40px)' }}
              />

              {/* 1. Velvet Box Lower Shell (Base) */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden p-5 flex flex-col items-center justify-between"
                style={{
                  background: 'radial-gradient(ellipse at 50% 30%, #5E111E 0%, #3D0A13 60%, #200408 100%)',
                  boxShadow: '0 30px 70px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -4px 12px rgba(0,0,0,0.7)',
                  border: '1.5px solid rgba(181, 154, 108, 0.55)',
                  zIndex: 1,
                }}
              >
                {/* Micro-velvet texture sheen */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.6) 0%, transparent 70%)',
                  }}
                />

                {/* 2. Plush Tufted Ivory Satin Ring/Jewel Cushion */}
                <div
                  className="w-full h-[155px] rounded-xl relative overflow-hidden flex items-center justify-center p-3"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 50%, #FAF8F5 0%, #E6DEC8 70%, #D4C9B0 100%)',
                    boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(181, 154, 108, 0.35)',
                  }}
                >
                  {/* Cushion Slot Crease */}
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[3px] bg-black/20 rounded-full blur-[1px]" />

                  {/* Real Product Image (High-Resolution Jewelry Visual) */}
                  <motion.div
                    animate={{
                      scale: [0.94, 1.03, 0.94],
                      filter: [
                        'drop-shadow(0 10px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 10px rgba(181,154,108,0.3))',
                        'drop-shadow(0 14px 28px rgba(0,0,0,0.5)) drop-shadow(0 0 22px rgba(181,154,108,0.7))',
                        'drop-shadow(0 10px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 10px rgba(181,154,108,0.3))',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 w-[120px] h-[120px] flex items-center justify-center"
                  >
                    <img
                      src={productImage}
                      alt={productName}
                      className="max-w-full max-h-full object-contain rounded-lg pointer-events-none"
                    />

                    {/* Specular Light Flare Reflection Sweep across piece */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)',
                      }}
                    />
                  </motion.div>

                  {/* Prismatic Diamond Star Refractions */}
                  <motion.span
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
                    className="absolute top-2 left-6 text-sm text-[#B59A6C] font-bold"
                  >
                    ✦
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
                    transition={{ duration: 1.9, repeat: Infinity, delay: 0.8 }}
                    className="absolute bottom-3 right-7 text-xs text-[#E8D5B7] font-bold"
                  >
                    ✧
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 1.1 }}
                    className="absolute top-4 right-10 text-[10px] text-[#B59A6C]"
                  >
                    ✦
                  </motion.span>
                </div>

                {/* Box Lower Lip & Metal Emblem */}
                <div className="w-full flex justify-between items-center px-1 pt-2 border-t border-[#B59A6C]/25">
                  <span className="font-heading text-[8px] font-bold tracking-[0.35em] text-[#E8D5B7] uppercase">
                    GLIMMR ATELIER
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#B59A6C]" />
                    <span className="text-[7px] font-mono text-[#B59A6C] tracking-widest uppercase">
                      VAULT N° {orderId.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. BIS Hallmark 916 & Laboratory Authenticity Certificate Scroll */}
              <motion.div
                initial={{ y: 90, opacity: 0, scale: 0.8 }}
                animate={{
                  y: [90, 90, -42, -42, -42],
                  opacity: [0, 0, 1, 1, 0],
                  scale: [0.8, 0.8, 1, 1, 0.88],
                }}
                transition={{
                  duration: 5.6,
                  times: [0, 0.2, 0.36, 0.52, 0.6],
                  ease: 'easeInOut',
                }}
                className="absolute left-1/2 -translate-x-1/2 w-[240px] bg-[#FAF8F5] border border-[#B59A6C] rounded-lg p-2.5 shadow-2xl flex items-center gap-2.5"
                style={{ zIndex: 15 }}
              >
                {/* Shifting Hologram Badge */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow"
                  style={{
                    background: 'linear-gradient(135deg, #B59A6C 0%, #E8D5B7 35%, #9E8357 70%, #D4AF37 100%)',
                  }}
                >
                  <span className="text-[11px] text-[#222222] font-extrabold">✓</span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] font-bold text-[#111111] uppercase tracking-wider block">
                      BIS HALLMARK 916
                    </span>
                    <span className="text-[7px] font-mono bg-[#B59A6C]/20 text-[#8C734B] px-1 rounded">LAB CERT</span>
                  </div>
                  <span className="text-[7px] font-mono text-gray-500 block truncate mt-0.5">
                    100% Certified Purity · IGI Laser Verified
                  </span>
                </div>
              </motion.div>

              {/* 4. Velvet Box Lid (Folds down with authentic 3D perspective & magnetic snap) */}
              <motion.div
                initial={{ rotateX: 180 }}
                animate={{
                  rotateX: [180, 180, 180, 0, 0],
                }}
                transition={{
                  duration: 5.6,
                  times: [0, 0.44, 0.54, 0.68, 1],
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="absolute top-0 left-0 w-full h-[145px] origin-top rounded-t-2xl overflow-hidden"
                style={{
                  background: 'radial-gradient(ellipse at 50% 20%, #5E111E 0%, #3D0A13 60%, #200408 100%)',
                  border: '1.5px solid rgba(181, 154, 108, 0.65)',
                  transformStyle: 'preserve-3d',
                  zIndex: 25,
                  filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.6))',
                }}
              >
                {/* Champagne Silk Ribbon Wrap (Cross Pattern) */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-7 bg-gradient-to-r from-[#9E8357] via-[#E8D5B7] to-[#9E8357] shadow-inner opacity-90" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-7 bg-gradient-to-b from-[#9E8357] via-[#E8D5B7] to-[#9E8357] shadow-inner opacity-90" />

                {/* Gold Beveled Magnetic Latch */}
                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-4.5 rounded bg-gradient-to-b from-[#E8D5B7] via-[#B59A6C] to-[#8C734B] border border-white/50 shadow-md flex items-center justify-center"
                >
                  <div className="w-2 h-1 rounded-full bg-[#3D0A13]" />
                </div>
              </motion.div>

              {/* 5. Royal Crimson Molten Wax Seal Stamp */}
              <motion.div
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{
                  scale: [0, 0, 0, 1.45, 1, 1],
                  rotate: [-90, -90, -90, 10, 0, 0],
                  opacity: [0, 0, 0, 1, 1, 1],
                }}
                transition={{
                  duration: 5.6,
                  times: [0, 0.58, 0.66, 0.75, 0.82, 1],
                  ease: 'easeOut',
                }}
                className="absolute top-[114px] left-1/2 -translate-x-1/2"
                style={{ zIndex: 35 }}
              >
                {/* Shockwave Glow Ring */}
                <motion.div
                  animate={{
                    scale: [0.8, 0.8, 0.8, 2.4, 0],
                    opacity: [0, 0, 0, 0.9, 0],
                  }}
                  transition={{ duration: 5.6, times: [0, 0.66, 0.7, 0.8, 0.9] }}
                  className="absolute inset-0 rounded-full border-2 border-[#E8D5B7] pointer-events-none"
                />

                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #9E1B1B, #5E0B0B)',
                    boxShadow: '0 8px 24px rgba(94, 11, 11, 0.85), inset 0 2px 4px rgba(255,255,255,0.4)',
                  }}
                >
                  <div className="absolute inset-1.5 rounded-full border border-white/25" />
                  <span className="font-heading text-[10px] font-bold text-white tracking-[0.2em]">GLM</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ── 3D GOLD STARDUST TRAIL (Follows Flight) ── */}
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={`stardust-particle-${i}`}
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{
                opacity: [0, 0, 0, 0.95, 0],
                y: [0, 0, 0, -320 - i * 35, -700 - i * 40],
                x: (i % 2 === 0 ? 1 : -1) * (22 + i * 15) + (i * 12),
                scale: [0.4, 0.4, 0.4, 1.6, 0.1],
              }}
              transition={{
                duration: 5.6,
                times: [0, 0.72, 0.8, 0.9, 1],
                ease: 'easeOut',
              }}
              className="absolute bottom-[200px] pointer-events-none"
              style={{ left: `calc(50% + ${(i - 9) * 18}px)` }}
            >
              <div
                className="w-2 h-2 rounded-full bg-[#B59A6C]"
                style={{ boxShadow: '0 0 14px #E8D5B7, 0 0 28px #B59A6C' }}
              />
            </motion.div>
          ))}

          {/* ── ACT 5: FINAL ORDER CONFIRMATION & LIVE ARTISAN TRACKER ── */}
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
            className="w-full max-w-md bg-[#161618]/95 border border-[#B59A6C]/45 p-6 sm:p-7 rounded-2xl shadow-2xl text-center backdrop-blur-xl relative z-30"
          >
            {/* Top Crown Seal */}
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
              Our master goldsmiths have initiated creation and hallmark validation for <strong className="text-white">{productName}</strong>.
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
