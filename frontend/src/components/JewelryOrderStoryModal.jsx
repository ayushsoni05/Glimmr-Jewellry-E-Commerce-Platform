import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImages';

/*──────────────────────────────────────────────────────────────────────
 *  3D PIXAR-STYLE CARTOON CHARACTER DELIVERY ANIMATION MODAL
 *  — 60fps Vector Rigging, Squash & Stretch Physics & Live Narration —
 *──────────────────────────────────────────────────────────────────────*/

const SCRIPTS = [
  {
    badge: 'ACT 1 OF 5 · THE STRIDE',
    title: 'LEO THE CONCIERGE ARRIVES',
    subtitle: 'Our cheerful white-glove courier bobs up the villa steps with your bespoke vault',
  },
  {
    badge: 'ACT 2 OF 5 · THE CHIME',
    title: 'RINGING THE VILLA DOORBELL',
    subtitle: 'Leo presses the oversized brass bell — whimsical musical chimes ring out',
  },
  {
    badge: 'ACT 3 OF 5 · GRAND ENTRANCE',
    title: 'MAYA OPENS THE VILLA DOORS',
    subtitle: 'The double doors swing open with chandelier glow as Maya greets with a smile',
  },
  {
    badge: 'ACT 4 OF 5 · THE MAGIC UNVEIL',
    title: 'JOYFUL HANDOVER & SPARKLE BURST',
    subtitle: 'Maya receives the velvet box — sparkling diamond brilliance beams outward',
  },
  {
    badge: 'ACT 5 OF 5 · FAREWELL',
    title: 'COURIER WAVES & DEPARTS',
    subtitle: 'Leo tips his head, waves goodbye, and steps into the starry moonlit night',
  },
];

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [act, setAct] = useState(0);

  // Extract order details
  const orderId =
    orderData?._id ||
    orderData?.orderId ||
    orderData?.id ||
    `GLM-${Math.floor(100000 + Math.random() * 900000)}`;

  const firstItem = orderData?.items?.[0] || orderData?.orderItems?.[0] || {};
  const productObj = firstItem.product || firstItem;
  const productImage =
    firstItem.image ||
    productObj.image ||
    (productObj.category
      ? getProductImage(productObj)
      : 'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg');
  const productName =
    productObj.name || firstItem.name || 'Glimmr Bespoke Creation';

  // Act timeline progression
  useEffect(() => {
    if (!isOpen) {
      setAct(0);
      return;
    }

    const t1 = setTimeout(() => setAct(1), 2500); // Doorbell press
    const t2 = setTimeout(() => setAct(2), 4800); // Door opens & Lady appears
    const t3 = setTimeout(() => setAct(3), 7200); // Handover & Sparkle burst
    const t4 = setTimeout(() => setAct(4), 9500); // Courier departs
    const t5 = setTimeout(() => setAct(5), 11800); // Show Order Confirmation Card

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
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

  const isStoryPlaying = act < 5;
  const courierWalkIn = act === 0;
  const doorbellRing = act === 1;
  const doorOpened = act >= 2;
  const ladyVisible = act >= 2;
  const handoverHappening = act >= 3;
  const courierLeaving = act >= 4;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07070a]/96 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* Background Ambient Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#B59A6C]/20 via-[#B59A6C]/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-[#8B1A1A]/10 rounded-full blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#B59A6C 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        {/* ── MAIN MODAL CONTAINER ── */}
        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">

          {/* ── TOP LIVE SCRIPT HUD ── */}
          {isStoryPlaying && (
            <div className="w-full text-center mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={act}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35 }}
                  className="inline-flex flex-col items-center"
                >
                  <div className="flex items-center gap-2.5 px-4 py-1 bg-[#15151a]/90 border border-[#B59A6C]/35 rounded-full shadow-xl mb-2 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span className="text-[9px] font-mono tracking-[0.22em] text-[#E8D5B7] uppercase font-bold">
                      {SCRIPTS[act]?.badge}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider uppercase">
                    {SCRIPTS[act]?.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs font-body text-gray-400 max-w-md text-center mt-0.5 italic">
                    "{SCRIPTS[act]?.subtitle}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ═══════════ 3D PIXAR CARTOON THEATER STAGE ═══════════ */}
          {isStoryPlaying && (
            <div
              className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-[#B59A6C]/35 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#0B0E1E] via-[#141828] to-[#1F1712]"
              style={{ aspectRatio: '16/10', perspective: '1200px' }}
            >
              {/* ── 1. MOONLIT CARTOON NIGHT SKY ── */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Cute Glowing Crescent Moon */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 right-8 w-12 h-12 rounded-full bg-[#FFF3B0] shadow-[0_0_35px_#FFE57F] flex items-center justify-center"
                >
                  <div className="absolute top-0 right-0 w-9 h-9 rounded-full bg-[#0B0E1E]" />
                  <span className="relative z-10 text-[10px] text-[#B59A6C] -mt-1 ml-3">✦</span>
                </motion.div>

                {/* Twinkling Cartoon Stars */}
                {[...Array(18)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                    transition={{
                      duration: 1.5 + (i % 3) * 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="absolute text-yellow-200 text-xs font-bold"
                    style={{
                      top: `${6 + (i * 7) % 35}%`,
                      left: `${4 + (i * 11) % 92}%`,
                    }}
                  >
                    ✦
                  </motion.div>
                ))}
              </div>

              {/* ── 2. CARTOON VILLA WALL & MARBLE PORCH FLOOR ── */}
              <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none">
                {/* Stone Villa Wall */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#2B231D] to-[#1C1612] border-t-2 border-[#B59A6C]/30" />
                
                {/* Stone Texture Bricks */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(#FFE5B4 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Porch Stone Floor */}
                <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/80 via-[#261E19] to-transparent border-t border-[#B59A6C]/30" />
              </div>

              {/* ── 3. CARTOON WALL LANTERNS WITH FLAME GLOW ── */}
              {[-1, 1].map((dir, idx) => (
                <div
                  key={idx}
                  className="absolute top-[38%] pointer-events-none"
                  style={{ [dir === -1 ? 'left' : 'right']: dir === -1 ? '16%' : '14%' }}
                >
                  {/* Brass Lantern Bracket */}
                  <div className="w-5 h-8 bg-gradient-to-b from-[#E8D5B7] via-[#B59A6C] to-[#8C734B] rounded-md shadow-lg flex items-center justify-center p-1 border border-white/20">
                    <motion.div
                      animate={{
                        scale: [0.85, 1.15, 0.85],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-3 h-4 bg-gradient-to-t from-[#FF9800] via-[#FFD54F] to-white rounded-full shadow-[0_0_15px_#FFD54F]"
                    />
                  </div>
                  {/* Warm Light Bloom */}
                  <div className="w-20 h-20 -mt-8 -ml-8 bg-[#FFE082]/15 rounded-full blur-[20px]" />
                </div>
              ))}

              {/* ── 4. 3D CARTOON ARCHED VILLA DOORWAY ── */}
              <div
                className="absolute right-[22%] bottom-[12%] w-[32%] h-[68%] rounded-t-[70px] border-4 border-[#B59A6C] bg-[#1A1009] overflow-hidden shadow-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Warm Chandelier Light inside Villa */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFE082]/50 via-[#FFB74D]/30 to-[#4E342E]" />

                {/* Chandelier in Background */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-[2px] h-3 bg-[#B59A6C]" />
                  <div className="w-8 h-4 rounded-b-full border-b-2 border-[#D4AF37] bg-yellow-200/40 shadow-[0_0_12px_#FFD54F]" />
                </div>

                {/* 3D Double Doors (Swing open in Act 2+) */}
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: doorOpened ? -75 : 0 }}
                  transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute inset-0 origin-left border-r-2 border-[#B59A6C]"
                  style={{
                    background: 'linear-gradient(145deg, #4E2716, #2E150B)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Door Carvings */}
                  <div className="absolute inset-2 rounded-t-[60px] border-2 border-[#B59A6C]/30" />
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 w-3 h-3 rounded-full bg-[#FFD54F] border border-white shadow-md flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#5D4037]" />
                  </div>
                </motion.div>
              </div>

              {/* ── 5. CARTOON BRASS DOORBELL (Squash & Stretch) ── */}
              <div className="absolute right-[56%] top-[50%] flex flex-col items-center">
                <motion.div
                  animate={
                    doorbellRing
                      ? {
                          scale: [1, 0.7, 1.25, 0.9, 1],
                          rotate: [0, -10, 10, -5, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6, repeat: doorbellRing ? 2 : 0 }}
                  className="w-7 h-10 rounded-lg bg-gradient-to-b from-[#FFE082] via-[#B59A6C] to-[#8D6E63] border-2 border-white shadow-xl flex items-center justify-center cursor-pointer"
                >
                  {/* Button */}
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
                  </div>
                </motion.div>

                {/* Floating Musical Notes & Acoustic Chime Waves */}
                {doorbellRing && (
                  <>
                    {[0, 0.2, 0.4].map((delay, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 3.5, opacity: 0 }}
                        transition={{ duration: 1.2, repeat: Infinity, delay }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#FFE082] pointer-events-none"
                      />
                    ))}

                    <motion.span
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -30, scale: 1.2 }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="absolute -top-6 text-sm font-bold text-[#FFD54F] drop-shadow-md whitespace-nowrap"
                    >
                      🎵 DING-DONG! 🔔
                    </motion.span>
                  </>
                )}
              </div>

              {/* ══════════ 6. CARTOON COURIER "LEO" (PIXAR RIG) ══════════ */}
              <motion.div
                initial={{ x: -140 }}
                animate={{
                  x: courierLeaving ? -150 : courierWalkIn ? 0 : 25,
                  opacity: courierLeaving ? 0 : 1,
                }}
                transition={{
                  duration: courierLeaving ? 1.6 : 2.2,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="absolute left-[12%] bottom-[12%] flex flex-col items-center"
                style={{ width: '22%' }}
              >
                {/* Ground Contact Shadow */}
                <motion.div
                  animate={
                    courierWalkIn
                      ? { scale: [1, 0.85, 1], opacity: [0.6, 0.4, 0.6] }
                      : {}
                  }
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/60 rounded-[100%] blur-[4px]"
                />

                {/* Torso & Head Bobbing Animation */}
                <motion.div
                  animate={
                    courierWalkIn
                      ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
                      : doorbellRing
                      ? { x: [0, 15, 0] }
                      : { y: 0, rotate: 0 }
                  }
                  transition={{ duration: 0.6, repeat: courierWalkIn ? Infinity : 0 }}
                  className="flex flex-col items-center relative"
                >
                  {/* Leo's Head */}
                  <div className="w-14 h-14 rounded-full bg-[#FFD1A4] border-2 border-[#E0A96D] relative shadow-lg flex flex-col items-center justify-center">
                    {/* Cute Parted Hair */}
                    <div className="absolute -top-1.5 inset-x-0 h-6 bg-[#3E2723] rounded-t-full" />
                    <div className="absolute top-1 left-2 w-4 h-3 bg-[#3E2723] rounded-br-full" />

                    {/* Expressive Big Cartoon Eyes */}
                    <div className="flex gap-2 mt-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 flex items-center justify-center">
                        <motion.div
                          animate={{ scaleY: [1, 1, 0.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-[#1A237E]"
                        />
                      </div>
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 flex items-center justify-center">
                        <motion.div
                          animate={{ scaleY: [1, 1, 0.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-[#1A237E]"
                        />
                      </div>
                    </div>

                    {/* Rosy Cheeks & Cheerful Smile */}
                    <div className="flex justify-between w-9 mt-0.5">
                      <div className="w-2 h-1.5 rounded-full bg-[#FF8A80]/60" />
                      <div className="w-2 h-1.5 rounded-full bg-[#FF8A80]/60" />
                    </div>
                    <div className="w-3 h-1.5 border-b-2 border-[#D84315] rounded-full -mt-0.5" />
                  </div>

                  {/* Tuxedo Body */}
                  <div className="w-16 h-18 bg-[#1E1E24] rounded-t-2xl border border-gray-700 shadow-xl relative flex flex-col items-center pt-1 mt-[-4px]">
                    {/* Golden Bowtie */}
                    <div className="flex items-center mb-1">
                      <div className="w-2 h-2 bg-[#FFD54F] rotate-45 rounded-sm shadow-sm" />
                      <div className="w-2 h-2 bg-[#FFB300] rounded-full mx-[-2px] z-10" />
                      <div className="w-2 h-2 bg-[#FFD54F] rotate-45 rounded-sm shadow-sm" />
                    </div>
                    {/* White Shirt Strip */}
                    <div className="w-4 h-10 bg-white rounded-sm flex flex-col items-center justify-around py-1">
                      <div className="w-1 h-1 rounded-full bg-[#FFD54F]" />
                      <div className="w-1 h-1 rounded-full bg-[#FFD54F]" />
                    </div>
                  </div>

                  {/* ── 7. ROYAL VELVET JEWEL BOX (Held in Hands) ── */}
                  <motion.div
                    animate={
                      handoverHappening
                        ? { x: 55, y: -8, scale: 1.15 }
                        : { y: [0, -3, 0] }
                    }
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute top-14 -right-8 flex items-center"
                  >
                    {/* Left Cartoon White Glove */}
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-md" />

                    {/* Plush Burgundy Box */}
                    <div
                      className="w-16 h-12 rounded-xl relative overflow-hidden flex items-center justify-center mx-1 shadow-2xl"
                      style={{
                        background: 'radial-gradient(circle at 40% 30%, #880E4F, #4A148C)',
                        border: '2px solid #FFD54F',
                      }}
                    >
                      {/* Gold Ribbon Cross */}
                      <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-[#FFD54F] via-[#FFF59D] to-[#FFD54F]" />
                      <div className="absolute inset-y-0 w-2 bg-gradient-to-b from-[#FFD54F] via-[#FFF59D] to-[#FFD54F]" />
                      
                      {/* Animated Diamond Beam Flare */}
                      {handoverHappening && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0.8], scale: [0.5, 2.5, 1.8] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 bg-yellow-200/40 rounded-full blur-md"
                        />
                      )}

                      <span className="relative z-10 text-sm">💍</span>
                    </div>

                    {/* Right Cartoon White Glove */}
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-md" />
                  </motion.div>
                </motion.div>

                {/* Animated Stepping Legs */}
                <div className="flex gap-4 -mt-1">
                  <motion.div
                    animate={courierWalkIn ? { rotate: [-20, 20, -20] } : { rotate: 0 }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-3.5 h-7 bg-[#1E1E24] rounded-b-md flex items-end justify-center"
                  >
                    <div className="w-5 h-2.5 bg-black rounded-full mb-[-2px]" />
                  </motion.div>
                  <motion.div
                    animate={courierWalkIn ? { rotate: [20, -20, 20] } : { rotate: 0 }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-3.5 h-7 bg-[#1E1E24] rounded-b-md flex items-end justify-center"
                  >
                    <div className="w-5 h-2.5 bg-black rounded-full mb-[-2px]" />
                  </motion.div>
                </div>
              </motion.div>

              {/* ══════════ 8. CARTOON LADY "MAYA" (PIXAR RIG) ══════════ */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{
                  opacity: ladyVisible ? 1 : 0,
                  x: ladyVisible ? 0 : 40,
                }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute right-[24%] bottom-[12%] flex flex-col items-center pointer-events-none"
                style={{ width: '20%' }}
              >
                {/* Maya's Head */}
                <div className="w-13 h-13 rounded-full bg-[#FFD1A4] border-2 border-[#E0A96D] relative shadow-lg flex flex-col items-center justify-center">
                  {/* Beautiful Hair Bun & Golden Flower Pin */}
                  <div className="absolute -top-2 inset-x-[-2px] h-6 bg-[#3E2723] rounded-t-full" />
                  <div className="absolute -top-1 right-[-2px] w-3 h-3 rounded-full bg-[#FFD54F] shadow-sm flex items-center justify-center text-[7px]">
                    🌸
                  </div>

                  {/* Big Disney Eyes with Eyelashes */}
                  <div className="flex gap-2 mt-3">
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#4E342E]" />
                    </div>
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#4E342E]" />
                    </div>
                  </div>

                  {/* Bindi & Joyful Smile */}
                  <div className="w-1 h-1 rounded-full bg-[#D50000] -mt-3.5 mb-1" />
                  <div className="w-3.5 h-2 border-b-2 border-[#D84315] rounded-full mt-1" />
                </div>

                {/* Festive Burgundy & Gold Saree */}
                <div className="w-15 h-20 bg-gradient-to-b from-[#880E4F] to-[#4A148C] rounded-t-2xl border-2 border-[#FFD54F] shadow-xl relative flex flex-col items-center pt-2 mt-[-4px]">
                  {/* Gold Zari Border */}
                  <div className="w-full h-2 bg-[#FFD54F] mb-1" />
                  <div className="w-10 h-10 border border-[#FFD54F]/40 rounded-full opacity-60" />
                </div>

                {/* Hand Receiving Box & Golden Sparkle Rays */}
                {handoverHappening && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-12 -left-6 flex items-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-[#FFD1A4] border border-[#FFD54F]" />
                    <motion.div
                      animate={{
                        scale: [0.8, 1.4, 0.8],
                        rotate: [0, 180, 360],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-lg text-yellow-300 -ml-1 font-bold"
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

              {/* ── 9. MAGIC DIAMOND SPARKLE BURST (Act 3+) ── */}
              {handoverHappening && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`spark-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.4, 1.5, 0.4],
                        y: [0, -25 - i * 6],
                        x: (i % 2 === 0 ? 1 : -1) * (15 + i * 8),
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        delay: i * 0.12,
                      }}
                      className="absolute text-yellow-300 text-sm font-bold"
                      style={{
                        top: '52%',
                        left: '48%',
                      }}
                    >
                      {i % 3 === 0 ? '💎' : i % 2 === 0 ? '✦' : '✨'}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ── 10. SKIP ANIMATION LUXURY BUTTON ── */}
              <button
                onClick={() => setAct(5)}
                className="absolute bottom-3 right-4 bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg z-30"
              >
                Skip Animation ➔
              </button>
            </div>
          )}

          {/* ═══════════ ACT 5: LUXURY ORDER CONFIRMATION CARD ═══════════ */}
          {act >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top Shimmer Line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/70 to-transparent" />

              {/* Product Spotlight with Real Photography */}
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-20 h-20 rounded-2xl p-2 mb-3 relative"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 30%, #2D1420 0%, #1A0D08 100%)',
                    border: '1.5px solid #B59A6C',
                    boxShadow: '0 8px 24px rgba(181,154,108,0.35), 0 0 40px rgba(181,154,108,0.15)',
                  }}
                >
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 4px 8px rgba(181,154,108,0.6))' }}
                  />
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1.5 -right-1.5 text-sm text-[#D4AF37]"
                  >
                    ✦
                  </motion.div>
                </div>

                <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-0.5">
                  DELIVERY CONFIRMED
                </span>
                <h3 className="font-heading text-xl sm:text-2xl text-white mb-1 text-center">
                  Your Creation is Reserved
                </h3>
                <p className="text-xs font-body text-gray-300 text-center max-w-sm">
                  Master goldsmiths have initiated crafting and hallmark validation for{' '}
                  <strong className="text-white">{productName}</strong>
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="bg-black/65 border border-[#B59A6C]/35 rounded-xl p-3 mb-5 max-w-sm mx-auto shadow-inner">
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1 text-center">
                  ORDER REFERENCE NUMBER
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#E8D5B7] tracking-wider">
                    {orderId}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-2 py-0.5 bg-[#B59A6C]/25 hover:bg-[#B59A6C]/45 text-[#E8D5B7] text-[10px] font-mono rounded cursor-pointer transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 4-Stage Artisan Timeline */}
              <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto text-center">
                {[
                  { t: 'Confirmed', icon: '✓', on: true },
                  { t: 'Artisan Craft', icon: '⚒', on: true },
                  { t: 'Hallmark 916', icon: '🏛', on: false },
                  { t: 'Armored Transit', icon: '✈', on: false },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] mb-1 font-bold ${
                        s.on
                          ? 'bg-[#B59A6C] text-white shadow-lg'
                          : 'bg-white/8 text-gray-500 border border-white/10'
                      }`}
                    >
                      {s.icon}
                    </div>
                    <span className={`text-[8px] font-mono ${s.on ? 'text-[#E8D5B7] font-bold' : 'text-gray-500'}`}>
                      {s.t}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <button
                  onClick={handleGoToOrder}
                  className="flex-1 py-3.5 bg-[#B59A6C] hover:bg-[#A3885C] text-white font-body text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer shadow-xl hover:shadow-2xl"
                >
                  View Order Details
                </button>
                <button
                  onClick={() => {
                    onClose?.();
                    navigate('/');
                  }}
                  className="py-3.5 px-5 bg-white/8 hover:bg-white/15 text-gray-300 font-body text-xs font-bold uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JewelryOrderStoryModal;
