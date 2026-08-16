import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImages';

/*──────────────────────────────────────────────────────────────────────
 *  CINEMATIC  WHITE-GLOVE  DOORSTEP  DELIVERY  STORY  MODAL
 *  —  with realistic illustrated character assets  —
 *──────────────────────────────────────────────────────────────────────
 *
 *  Scene 0  ·  Courier walks up to the moonlit villa entrance
 *  Scene 1  ·  Courier presses the brass doorbell — golden chime ripples
 *  Scene 2  ·  Grand door opens; warm chandelier light floods the porch
 *  Scene 3  ·  Elegant lady steps forward; courier presents the velvet box
 *  Scene 4  ·  Courier bows & departs; lady steps back inside with box
 *  Scene 5  ·  Product unveil + order confirmation card
 *──────────────────────────────────────────────────────────────────────*/

/* Pre-generated illustration assets */
const ASSETS = {
  courier: '/assets/animation/courier.jpg',
  lady: '/assets/animation/lady.jpg',
  villaDoor: '/assets/animation/villa_door.jpg',
};

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [scene, setScene] = useState(-1);

  /* ── Extract order data ── */
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

  /* ── Narration ── */
  const SCRIPTS = useMemo(
    () => [
      {
        badge: 'SCENE 1 OF 5',
        title: 'Concierge Arrival',
        line: 'Your white-glove courier approaches the residence with a sealed Glimmr vault',
      },
      {
        badge: 'SCENE 2 OF 5',
        title: 'Doorbell Chime',
        line: 'The courier announces the delivery with a signature brass doorbell press',
      },
      {
        badge: 'SCENE 3 OF 5',
        title: 'The Grand Door Opens',
        line: 'Warm interior light floods through as the villa door swings open',
      },
      {
        badge: 'SCENE 4 OF 5',
        title: 'Private Handover',
        line: 'The velvet vault is presented and received with ceremony',
      },
      {
        badge: 'SCENE 5 OF 5',
        title: 'Courier Departs',
        line: 'With a bow, the courier steps into the night — your creation awaits',
      },
    ],
    []
  );

  /* ── Scene timeline ── */
  useEffect(() => {
    if (!isOpen) {
      setScene(-1);
      return;
    }
    const timers = [
      setTimeout(() => setScene(0), 500),
      setTimeout(() => setScene(1), 2800),
      setTimeout(() => setScene(2), 5000),
      setTimeout(() => setScene(3), 7200),
      setTimeout(() => setScene(4), 9400),
      setTimeout(() => setScene(5), 11600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  /* ── Handlers ── */
  const handleCopy = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToOrder = () => {
    onClose?.();
    navigate('/thank-you', { state: { orderData } });
  };

  /* ── Derived states ── */
  const storyPlaying = scene >= 0 && scene <= 4;
  const showConfirmation = scene >= 5;
  const courierArrived = scene >= 0;
  const bellPress = scene === 1;
  const doorOpen = scene >= 2;
  const ladyVisible = scene >= 3;
  const handover = scene >= 3;
  const courierLeaving = scene >= 4;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060608]/96 backdrop-blur-2xl p-3 sm:p-5 overflow-y-auto select-none"
      >
        {/* ═══════  ATMOSPHERIC LIGHTING  ═══════ */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#B59A6C]/15 via-[#B59A6C]/5 to-transparent rounded-full blur-[110px]" />
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#C5D3E8]/6 rounded-full blur-[100px]" />
          <motion.div
            animate={{ opacity: doorOpen ? 0.3 : 0.05 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/4 right-1/3 w-[350px] h-[350px] bg-[#FFE4B5]/18 rounded-full blur-[90px]"
          />
        </div>

        {/* ═══════  MAIN CONTAINER  ═══════ */}
        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">

          {/* ── NARRATION HUD ── */}
          {storyPlaying && (
            <div className="w-full text-center mb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene}
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex flex-col items-center"
                >
                  <div className="flex items-center gap-2.5 px-4 py-1.5 bg-[#15151a]/90 border border-[#B59A6C]/30 rounded-full shadow-xl mb-2 backdrop-blur-lg">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-[#D4AF37]"
                    />
                    <span className="text-[9px] font-mono tracking-[0.22em] text-[#E8D5B7] uppercase font-bold">
                      {SCRIPTS[scene]?.badge}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider uppercase">
                    {SCRIPTS[scene]?.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs font-body text-gray-400 max-w-sm text-center mt-1 italic">
                    "{SCRIPTS[scene]?.line}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ═══════  CINEMATIC STAGE  ═══════ */}
          {storyPlaying && (
            <div
              className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-[#B59A6C]/20 shadow-2xl"
              style={{ aspectRatio: '16/10' }}
            >
              {/* ── VILLA DOOR BACKGROUND ── */}
              <div className="absolute inset-0">
                <img
                  src={ASSETS.villaDoor}
                  alt="Grand Villa Entrance"
                  className="w-full h-full object-cover"
                  style={{
                    filter: doorOpen
                      ? 'brightness(1.05)'
                      : 'brightness(0.75)',
                    transition: 'filter 1.2s ease',
                  }}
                />
                {/* Dark overlay for depth — lifts when door opens */}
                <motion.div
                  animate={{ opacity: doorOpen ? 0.15 : 0.45 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 bg-black"
                />
              </div>

              {/* ── PORCH WARM LIGHT BLOOM (intensifies on bell ring & door open) ── */}
              <motion.div
                animate={{
                  opacity: bellPress ? 0.5 : doorOpen ? 0.35 : 0.1,
                }}
                transition={{ duration: 0.8 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-gradient-to-t from-[#FFE5B4]/40 to-transparent rounded-t-full blur-[40px] pointer-events-none"
              />

              {/* ── DOORBELL CHIME WAVES (Scene 1) ── */}
              {bellPress && (
                <div className="absolute top-[38%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  {[0, 0.25, 0.5].map((delay) => (
                    <motion.div
                      key={delay}
                      initial={{ scale: 0.3, opacity: 0.9 }}
                      animate={{ scale: 5, opacity: 0 }}
                      transition={{ duration: 1.4, repeat: Infinity, delay }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-[#FFE5B4]/60"
                    />
                  ))}
                  <motion.span
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -25 }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-heading font-bold text-[#FFE5B4] whitespace-nowrap drop-shadow-lg"
                  >
                    ✦ ding ✦
                  </motion.span>
                </div>
              )}

              {/* ══════  COURIER CHARACTER (Illustrated)  ══════ */}
              <motion.div
                initial={{ x: '-110%' }}
                animate={{
                  x: courierLeaving
                    ? '-110%'
                    : courierArrived
                    ? '0%'
                    : '-110%',
                }}
                transition={{
                  duration: courierLeaving ? 1.8 : 2.2,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="absolute bottom-0 left-[2%] sm:left-[5%]"
                style={{ width: '35%', height: '80%' }}
              >
                {/* Ground contact shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-3 bg-black/60 rounded-[100%] blur-[6px]" />

                <motion.img
                  src={ASSETS.courier}
                  alt="White-Glove Courier"
                  className="w-full h-full object-contain object-bottom drop-shadow-2xl pointer-events-none"
                  animate={{
                    y: courierArrived && !courierLeaving ? [0, -3, 0] : 0,
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Glowing aura around the box in courier's hand */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-[42%] left-[25%] w-14 h-10 bg-[#B59A6C]/30 rounded-lg blur-[12px] pointer-events-none"
                />
              </motion.div>

              {/* ══════  LADY CHARACTER (Illustrated)  ══════ */}
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{
                  opacity: ladyVisible ? 1 : 0,
                  x: ladyVisible ? 0 : 30,
                  scale: ladyVisible ? 1 : 0.95,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.25, 1, 0.5, 1],
                  delay: ladyVisible ? 0.3 : 0,
                }}
                className="absolute bottom-0 right-[5%] sm:right-[10%]"
                style={{ width: '35%', height: '82%' }}
              >
                {/* Ground shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-3 bg-black/50 rounded-[100%] blur-[5px]" />

                <img
                  src={ASSETS.lady}
                  alt="Elegant Lady Receiving"
                  className="w-full h-full object-contain object-bottom drop-shadow-2xl pointer-events-none"
                />

                {/* Warm interior backlight glow behind lady */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#FFE5B4]/20 to-transparent rounded-full blur-[30px] pointer-events-none" />
              </motion.div>

              {/* ── HANDOVER SPARKLE EFFECTS (Scene 3) ── */}
              {handover && !courierLeaving && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`sparkle-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.3, 1.2, 0.3],
                        y: [0, -15 - i * 8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="absolute text-[#D4AF37] text-sm font-bold"
                      style={{
                        top: `${40 + Math.sin(i) * 15}%`,
                        left: `${40 + i * 4}%`,
                      }}
                    >
                      ✦
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ── "DELIVERED" FLASH OVERLAY (Scene 4) ── */}
              {courierLeaving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8, type: 'spring', stiffness: 200 }}
                    className="bg-[#0A0A0C]/80 backdrop-blur-sm border border-[#B59A6C]/40 rounded-2xl px-8 py-5 text-center shadow-2xl"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-3xl mb-2"
                    >
                      💎
                    </motion.div>
                    <span className="text-[10px] font-mono tracking-[0.3em] text-[#B59A6C] uppercase font-bold block">
                      DELIVERY COMPLETE
                    </span>
                    <h4 className="text-lg font-heading font-bold text-white mt-1">
                      {productName}
                    </h4>
                  </motion.div>
                </motion.div>
              )}
            </div>
          )}

          {/* ═══════  ORDER CONFIRMATION CARD  ═══════ */}
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/35 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/60 to-transparent" />

              {/* Product Spotlight */}
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-20 h-20 rounded-2xl p-2 mb-3 relative"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 30%, #2D1420 0%, #1A0D08 100%)',
                    border: '1.5px solid #B59A6C',
                    boxShadow:
                      '0 8px 24px rgba(181,154,108,0.3), 0 0 40px rgba(181,154,108,0.1)',
                  }}
                >
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-contain"
                    style={{
                      filter:
                        'drop-shadow(0 4px 8px rgba(181,154,108,0.5))',
                    }}
                  />
                  <motion.div
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                    }}
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
                <p className="text-xs font-body text-gray-400 text-center max-w-sm">
                  Master goldsmiths have initiated crafting and hallmark
                  validation for{' '}
                  <strong className="text-white">{productName}</strong>
                </p>
              </div>

              {/* Order ID */}
              <div className="bg-black/60 border border-[#B59A6C]/30 rounded-xl p-3 mb-5 max-w-sm mx-auto">
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1 text-center">
                  ORDER REFERENCE
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

              {/* 4-Stage Timeline */}
              <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto text-center">
                {[
                  { t: 'Confirmed', icon: '✓', on: true },
                  { t: 'Crafting', icon: '⚒', on: true },
                  { t: 'Hallmark', icon: '🏛', on: false },
                  { t: 'Delivery', icon: '✈', on: false },
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
                    <span
                      className={`text-[8px] font-mono ${
                        s.on
                          ? 'text-[#E8D5B7] font-bold'
                          : 'text-gray-600'
                      }`}
                    >
                      {s.t}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <button
                  onClick={handleGoToOrder}
                  className="flex-1 py-3 bg-[#B59A6C] hover:bg-[#A3885C] text-white font-body text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-xl"
                >
                  View Order Details
                </button>
                <button
                  onClick={() => {
                    onClose?.();
                    navigate('/');
                  }}
                  className="py-3 px-5 bg-white/8 hover:bg-white/15 text-gray-300 font-body text-xs font-bold uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer"
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
