import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImages';

/*──────────────────────────────────────────────────────────────────────
 *  HIGH-RESOLUTION 1080p 60FPS CINEMATIC DELIVERY FILM MODAL
 *  — Ultra-Realistic Luxury Film with Live Synchronized Narration HUD —
 *──────────────────────────────────────────────────────────────────────*/

const FILM_VIDEO_SRC = '/assets/animation/delivery_story.mp4';

const SCENE_SCRIPTS = [
  {
    badge: 'SCENE 1 OF 4 · ARRIVAL',
    title: 'CONCIERGE ARRIVAL AT VILLA',
    subtitle: 'Luxury courier strides up the grand marble steps carrying the illuminated Glimmr vault',
  },
  {
    badge: 'SCENE 2 OF 4 · DOORBELL CHIME',
    title: 'BRASS DOORBELL CHIME',
    subtitle: 'Courier presses the glowing brass doorbell, sending acoustic soundwave ripples outward',
  },
  {
    badge: 'SCENE 3 OF 4 · GRAND ENTRANCE',
    title: 'VILLA DOUBLE DOORS OPEN',
    subtitle: 'Arched mahogany doors swing open as the elegant lady appears in warm chandelier glow',
  },
  {
    badge: 'SCENE 4 OF 4 · PRIVATE HANDOVER',
    title: 'PRIVATE VAULT HANDOVER',
    subtitle: 'The bespoke velvet jewelry box is presented and received with ceremonial elegance',
  },
];

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);

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

  // Synchronize subtitles with 1080p 60FPS video playback
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    if (time < 2.5) setCurrentSceneIdx(0);
    else if (time < 5.0) setCurrentSceneIdx(1);
    else if (time < 7.5) setCurrentSceneIdx(2);
    else setCurrentSceneIdx(3);
  };

  useEffect(() => {
    if (!isOpen) {
      setVideoEnded(false);
      setCurrentSceneIdx(0);
      return;
    }
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

  const handleSkip = () => {
    setVideoEnded(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060608]/96 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* Background Ambient Luxury Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#B59A6C]/15 via-[#B59A6C]/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-[#8B1A1A]/10 rounded-full blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'radial-gradient(#B59A6C 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        {/* ── MAIN MODAL CONTAINER ── */}
        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">

          {/* ═══════ 1080P CINEMATIC VIDEO FILM STAGE (Active while playing) ═══════ */}
          {!videoEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              {/* Top Synchronized Narrative HUD */}
              <div className="w-full text-center mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSceneIdx}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.35 }}
                    className="inline-flex flex-col items-center"
                  >
                    <div className="flex items-center gap-2.5 px-4 py-1 bg-[#15151a]/90 border border-[#B59A6C]/35 rounded-full shadow-xl mb-2 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                      <span className="text-[9px] font-mono tracking-[0.22em] text-[#E8D5B7] uppercase font-bold">
                        {SCENE_SCRIPTS[currentSceneIdx]?.badge}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider uppercase">
                      {SCENE_SCRIPTS[currentSceneIdx]?.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs font-body text-gray-400 max-w-md text-center mt-0.5 italic">
                      "{SCENE_SCRIPTS[currentSceneIdx]?.subtitle}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 16:9 High-Resolution Video Player Container */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#B59A6C]/35 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={FILM_VIDEO_SRC}
                  autoPlay
                  muted
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setVideoEnded(true)}
                  className="w-full h-full object-cover"
                />

                {/* Soft Gold Vignette Gradient Overlay */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]" />

                {/* Top Corner Branding Badge */}
                <div className="absolute top-3 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-[#B59A6C]/30 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
                  <span className="text-[8px] font-mono tracking-[0.25em] text-[#E8D5B7] uppercase font-bold">
                    GLIMMR CONCIERGE CINEMA
                  </span>
                </div>

                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="absolute bottom-3 right-4 bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Skip Animation ➔
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════ FINAL HIGH-GRAPHIC ORDER CONFIRMATION CARD ═══════ */}
          {videoEnded && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top Shimmer Line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/70 to-transparent" />

              {/* Product Spotlight with Real Photography & Sparkle Flare */}
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

              {/* Order Reference Box with 1-Click Copy */}
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

              {/* 4-Stage Artisan Status Timeline */}
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
