import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImages';

/**
 * 3D White-Glove Concierge Doorstep Delivery Story Modal
 * 
 * Scene 1: Concierge in Tuxedo & White Gloves arrives carrying the glowing Velvet Jewel Box
 * Scene 2: Concierge presses the brass doorbell — acoustic chime pulse & porch light bloom
 * Scene 3: 3D Arched Villa Door swings open, elegant lady steps forward and receives the box
 * Scene 4: Concierge politely bows and departs; the lady unveils the customer's ordered creation
 * Scene 5: Perfectly centered Luxury Order Confirmation Card with Live Order ID & Tracker
 */
const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);

  // Extract order details & ordered product
  const orderId = orderData?._id || orderData?.orderId || orderData?.id || `GLM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const displayTotal = orderData?.totalAmount || orderData?.totalPrice || orderData?.total || 0;
  
  const firstItem = orderData?.items?.[0] || orderData?.orderItems?.[0] || {};
  const productObj = firstItem.product || firstItem;
  const productImage = firstItem.image || productObj.image || (productObj.category ? getProductImage(productObj) : 'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg');
  const productName = productObj.name || firstItem.name || 'Glimmr Bespoke Creation';

  // Story Narration Script matching timing
  const SCENE_SCRIPTS = [
    {
      badge: '01 / 04 · CONCIERGE ARRIVAL',
      title: 'WHITE-GLOVE COURIER ARRIVAL',
      subtitle: 'Luxury courier arrives at your doorstep with your handcrafted Glimmr creation',
    },
    {
      badge: '02 / 04 · DOORBELL CHIME',
      title: 'DOORBELL CHIME & PORCH ILLUMINATION',
      subtitle: 'Courier rings the chime, announcing the arrival of your sealed jewelry vault',
    },
    {
      badge: '03 / 04 · PRIVATE HANDOVER',
      title: 'VILLA DOOR OPENS & HANDOVER',
      subtitle: 'Door opens gracefully as the velvet vault box is presented with white gloves',
    },
    {
      badge: '04 / 04 · COURIER DEPARTS & UNVEIL',
      title: 'COURIER DEPARTS & CREATION UNVEILED',
      subtitle: 'Courier bows and departs while your hallmarked masterpiece is unveiled',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentScene(0);
      return;
    }

    const t1 = setTimeout(() => setCurrentScene(1), 1600);
    const t2 = setTimeout(() => setCurrentScene(2), 3200);
    const t3 = setTimeout(() => setCurrentScene(3), 4800);
    const t4 = setTimeout(() => setCurrentScene(4), 6400);

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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070709]/95 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* Atmospheric Warm Architectural & Gold Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#B59A6C]/20 via-[#B59A6C]/5 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-[#8B1A1A]/10 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'radial-gradient(#B59A6C 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        {/* ── MAIN MODAL CONTAINER (Centered & Balanced) ── */}
        <div className="relative w-full max-w-xl my-auto flex flex-col items-center justify-center z-10">

          {/* ── TOP LIVE SCRIPT HUD (Visible during story) ── */}
          {currentScene < 4 && (
            <div className="w-full text-center mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35 }}
                  className="inline-flex flex-col items-center"
                >
                  <div className="flex items-center gap-2 px-3.5 py-1 bg-[#18181b]/90 border border-[#B59A6C]/35 rounded-full shadow-xl mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#B59A6C] animate-ping" />
                    <span className="text-[9px] font-mono tracking-[0.25em] text-[#E8D5B7] uppercase font-bold">
                      {SCENE_SCRIPTS[currentScene]?.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-heading font-bold text-white tracking-wide uppercase">
                    {SCENE_SCRIPTS[currentScene]?.title}
                  </h4>
                  <p className="text-xs font-body text-gray-400 max-w-md text-center mt-0.5 italic">
                    "{SCENE_SCRIPTS[currentScene]?.subtitle}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ── 3D ISOMETRIC VILLA DOORSTEP STAGE (Scenes 0 - 3) ── */}
          {currentScene < 4 && (
            <div
              className="relative w-full max-w-lg h-[340px] sm:h-[380px] bg-gradient-to-b from-[#141417] to-[#0c0c0e] border border-[#B59A6C]/30 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-6"
              style={{ perspective: '1200px' }}
            >
              {/* Architectural Porch Sconce Light */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FFE5B4]/15 rounded-full blur-[60px] pointer-events-none" />

              {/* Porch Stone Floor & Base Shadow */}
              <div
                className="absolute bottom-4 inset-x-6 h-12 bg-gradient-to-t from-black/60 to-transparent border-t border-white/5 rounded-b-xl"
              />

              {/* ── 3D ARCHED VILLA DOORWAY ── */}
              <div
                className="absolute right-8 sm:right-14 top-10 bottom-6 w-[140px] sm:w-[160px] rounded-t-[80px] border-2 border-[#B59A6C]/40 bg-[#120D08] overflow-hidden shadow-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Warm Chandelier Glow from inside house */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4B5]/40 via-[#B59A6C]/20 to-transparent" />

                {/* 3D Moving Door Panel (Swings Open in Scene 2 & 3) */}
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: currentScene >= 2 ? -75 : 0,
                  }}
                  transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute inset-0 rounded-t-[80px] origin-left border-r border-[#B59A6C]/60"
                  style={{
                    background: 'linear-gradient(135deg, #2D1810 0%, #1A0D08 50%, #24140D 100%)',
                    transformStyle: 'preserve-3d',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
                  }}
                >
                  {/* Mahogany Wood Paneling Lines */}
                  <div className="absolute inset-3 border border-[#B59A6C]/20 rounded-t-[70px]" />
                  <div className="absolute inset-x-3 top-1/2 h-[1px] bg-[#B59A6C]/20" />
                  
                  {/* Polished Brass Door Handle */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-7 rounded-full bg-gradient-to-b from-[#E8D5B7] via-[#B59A6C] to-[#8C734B] shadow-lg border border-white/40" />
                </motion.div>

                {/* The Elegant Lady (Revealed when door opens in Scene 2 & 3) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{
                    opacity: currentScene >= 2 ? 1 : 0,
                    scale: currentScene >= 2 ? 1 : 0.9,
                    x: currentScene >= 2 ? 0 : 20,
                  }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                >
                  {/* Stylized Silhouette & Gown */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FAF0E6] to-[#E6D2B5] border-2 border-[#B59A6C] shadow-lg relative flex items-center justify-center">
                    <span className="text-xl">👩‍💼</span>
                  </div>
                  <div className="w-16 h-24 mt-1 bg-gradient-to-b from-[#3A1E28] to-[#1F0E15] rounded-t-2xl border border-[#B59A6C]/30 shadow-md" />
                </motion.div>
              </div>

              {/* ── BRASS DOORBELL FIXTURE (Wall Left of Door) ── */}
              <div className="absolute right-[160px] sm:right-[190px] top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div
                  className={`w-7 h-12 rounded-md bg-gradient-to-b from-[#E8D5B7] via-[#B59A6C] to-[#8C734B] p-1 border border-white/40 shadow-lg flex flex-col items-center justify-center ${
                    currentScene === 1 ? 'ring-4 ring-[#B59A6C]/50' : ''
                  }`}
                >
                  {/* Doorbell Button */}
                  <motion.div
                    animate={currentScene === 1 ? { scale: [1, 0.7, 1] } : {}}
                    transition={{ duration: 0.6, repeat: 2 }}
                    className="w-3.5 h-3.5 rounded-full bg-white shadow-inner flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
                  </motion.div>
                </div>

                {/* Doorbell Acoustic Chime Waves (Scene 1) */}
                {currentScene === 1 && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute w-10 h-10 rounded-full border-2 border-[#FFE5B4] pointer-events-none"
                    />
                    <span className="text-[10px] font-mono font-bold text-[#E8D5B7] mt-2 animate-bounce">
                      🔔 CHIME...
                    </span>
                  </>
                )}
              </div>

              {/* ── 3D WHITE-GLOVE COURIER CHARACTER ── */}
              <motion.div
                initial={{ x: -160, opacity: 0 }}
                animate={{
                  x: currentScene === 0 ? 0 : currentScene >= 3 ? -140 : 15,
                  opacity: currentScene >= 3 ? 0 : 1,
                  scale: currentScene >= 3 ? 0.85 : 1,
                }}
                transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
                className="absolute left-10 sm:left-16 bottom-10 flex flex-col items-center"
              >
                {/* Courier Head & Tuxedo */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8D5B7] to-[#D4C3A3] border-2 border-[#B59A6C] shadow-lg flex items-center justify-center relative">
                  <span className="text-xl">🤵‍♂️</span>
                </div>
                {/* Bespoke Tuxedo & Bowtie */}
                <div className="w-16 h-20 bg-gradient-to-b from-[#18181B] to-[#09090B] rounded-t-xl border border-gray-700 shadow-xl relative flex flex-col items-center pt-1">
                  <div className="w-4 h-2 bg-[#B59A6C] rounded-sm mb-1" />
                  <div className="w-3 h-10 bg-white" />
                </div>

                {/* White-Glove Hands Carrying the 3D Velvet Jewel Box */}
                <motion.div
                  animate={{
                    x: currentScene === 2 ? 65 : 0,
                    y: currentScene === 2 ? -15 : 0,
                    scale: currentScene === 2 ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  className="absolute top-14 -right-10 flex items-center"
                >
                  {/* Left White Glove */}
                  <div className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-md" />

                  {/* ── 3D ROYAL VELVET JEWEL BOX (In Hand) ── */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 10px 25px rgba(181,154,108,0.4)',
                        '0 14px 35px rgba(181,154,108,0.8)',
                        '0 10px 25px rgba(181,154,108,0.4)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-12 rounded-lg relative overflow-hidden flex items-center justify-center mx-1"
                    style={{
                      background: 'radial-gradient(circle at 50% 30%, #5E111E, #3D0A13)',
                      border: '1.5px solid #E8D5B7',
                    }}
                  >
                    {/* Gold Ribbon Cross */}
                    <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-[#9E8357] via-[#E8D5B7] to-[#9E8357]" />
                    <div className="absolute inset-y-0 w-2 bg-gradient-to-b from-[#9E8357] via-[#E8D5B7] to-[#9E8357]" />
                    <span className="relative z-10 text-xs text-white">💍</span>
                  </motion.div>

                  {/* Right White Glove */}
                  <div className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-md" />
                </motion.div>
              </motion.div>

              {/* ── UNVEILED PRODUCT SPOTLIGHT (Scene 3) ── */}
              {currentScene === 3 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                  className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center"
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1F0E15] to-[#3D0A13] border-2 border-[#B59A6C] p-2.5 shadow-2xl mb-3 relative">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(181,154,108,0.6)]"
                    />
                    <motion.div
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-2 -right-2 text-sm text-[#B59A6C] font-bold"
                    >
                      ✦
                    </motion.div>
                  </div>
                  <span className="text-[9px] font-mono tracking-[0.3em] text-[#E8D5B7] uppercase font-bold block">
                    DELIVERY COMPLETE & VERIFIED
                  </span>
                  <h4 className="text-sm font-heading font-bold text-white mt-1">
                    {productName}
                  </h4>
                </motion.div>
              )}
            </div>
          )}

          {/* ── SCENE 5: GRAND ORDER CONFIRMATION & LIVE TRACKER (Scene 4+) ── */}
          {currentScene >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full bg-[#141417]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-2xl shadow-2xl text-center backdrop-blur-xl relative"
            >
              {/* Crown Seal Icon */}
              <div className="w-14 h-14 rounded-full bg-[#B59A6C]/15 border border-[#B59A6C]/50 mx-auto flex items-center justify-center mb-3.5 shadow-xl">
                <span className="text-[#B59A6C] text-2xl font-bold">💎</span>
              </div>

              <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-1">
                ROYAL ATELIER ORDER CONFIRMED
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl text-white mb-2">
                Your Creation is Reserved
              </h3>
              <p className="text-xs font-body text-gray-300 mb-5 leading-relaxed max-w-md mx-auto">
                Our master goldsmiths have initiated creation and hallmark validation for{' '}
                <strong className="text-white">{productName}</strong>.
              </p>

              {/* Order Reference Box */}
              <div className="bg-black/75 border border-[#B59A6C]/35 rounded-xl p-3.5 mb-5 shadow-inner max-w-sm mx-auto">
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
                  ORDER REFERENCE NUMBER
                </span>
                <div className="flex items-center justify-center gap-2.5">
                  <span className="font-mono text-base sm:text-lg font-bold text-[#E8D5B7] tracking-widest">
                    {orderId}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-[#B59A6C]/25 hover:bg-[#B59A6C]/45 text-[#E8D5B7] text-[10px] font-mono rounded cursor-pointer transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 4-Stage Artisan Timeline */}
              <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto text-center">
                {[
                  { title: 'Confirmed', icon: '✓', active: true },
                  { title: 'Artisan Craft', icon: '⚒', active: true },
                  { title: 'Hallmarking', icon: '🏛', active: false },
                  { title: 'Armored Delivery', icon: '✈', active: false },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1.5 font-bold ${
                        step.active
                          ? 'bg-[#B59A6C] text-white shadow-lg'
                          : 'bg-white/10 text-gray-400 border border-white/10'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-mono leading-tight ${step.active ? 'text-[#E8D5B7] font-bold' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <button
                  onClick={handleGoToOrder}
                  className="flex-1 py-3.5 bg-[#B59A6C] hover:bg-[#A3885C] text-white font-body text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-colors cursor-pointer shadow-xl"
                >
                  View Order Details
                </button>
                <button
                  onClick={() => {
                    onClose?.();
                    navigate('/');
                  }}
                  className="py-3.5 px-6 bg-white/10 hover:bg-white/20 text-gray-200 font-body text-xs font-bold uppercase tracking-[0.15em] rounded-lg transition-colors cursor-pointer"
                >
                  Explore More
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
