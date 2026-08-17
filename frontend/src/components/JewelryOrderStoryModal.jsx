import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FastForward, CheckCircle2, Copy, Sparkles, ArrowRight } from 'lucide-react';

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Extract order details
  const orderId =
    orderData?._id ||
    orderData?.orderId ||
    orderData?.id ||
    `GLM-${Math.floor(100000 + Math.random() * 900000)}`;

  const firstItem = orderData?.items?.[0] || orderData?.orderItems?.[0] || {};
  const productObj = firstItem.product || firstItem;
  const productName = productObj.name || firstItem.name || 'Glimmr Royal Creation';

  // Video playback management
  useEffect(() => {
    if (isOpen) {
      setIsVideoPlaying(true);
      setProgress(0);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay fallback if blocked by browser policy
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }
    }
  }, [isOpen]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    triggerConfirmation();
  };

  const triggerConfirmation = () => {
    setIsVideoPlaying(false);
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#B59A6C', '#E8D5B7', '#D4AF37', '#FFFFFF'],
      });
    } catch (e) {}
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToOrder = () => {
    onClose?.();
    navigate('/thank-you', { state: { orderData } });
  };

  if (!isOpen || !orderData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07070a]/95 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* Background Atmospheric Studio Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-b from-[#B59A6C]/20 via-[#B59A6C]/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/4 w-[450px] h-[350px] bg-[#8B1A1A]/10 rounded-full blur-[110px]" />
        </div>

        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">

          {/* ═══════════ VIDEO ANIMATION STAGE ═══════════ */}
          {isVideoPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* Top Live Badge */}
              <div className="flex items-center gap-2.5 px-4 py-1 bg-[#15151a]/90 border border-[#B59A6C]/35 rounded-full shadow-xl mb-3 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                <span className="text-[9px] font-mono tracking-[0.22em] text-[#E8D5B7] uppercase font-bold">
                  GLIMMR ATELIER · ORDER IN TRANSIT
                </span>
              </div>

              {/* Video Player Container */}
              <div
                className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-[#B59A6C]/40 shadow-[0_25px_70px_rgba(0,0,0,0.85)] bg-black"
                style={{ aspectRatio: '16/10' }}
              >
                <video
                  ref={videoRef}
                  src="/assets/animation/Animation.mp4"
                  playsInline
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-cover"
                />

                {/* Video Playback Progress Bar */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
                  <div
                    className="h-full bg-gradient-to-r from-[#B59A6C] to-[#E8D5B7] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Top Control Bar (Skip Only - Mute Button Removed) */}
                <div className="absolute top-3 right-3 flex items-center pointer-events-auto">
                  <button
                    onClick={triggerConfirmation}
                    className="bg-black/65 hover:bg-black/85 border border-white/20 text-gray-200 hover:text-white px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all shadow-md"
                  >
                    <span>Skip</span>
                    <FastForward className="w-3.5 h-3.5 text-[#E8D5B7]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ ORDER CONFIRMATION CARD ═══════════ */}
          {!isVideoPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top Shimmer Line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/70 to-transparent" />

              <div className="flex flex-col items-center mb-5">
                {/* Success Icon Badge */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3 relative"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #B59A6C, #7A6237)',
                    boxShadow: '0 8px 24px rgba(181,154,108,0.4)',
                  }}
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 text-sm text-[#D4AF37]"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                </div>

                <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-0.5">
                  ORDER CONFIRMED & RESERVED
                </span>
                <h3 className="text-xl sm:text-2xl text-white mb-1 text-center font-bold">
                  Your Creation is in the Atelier
                </h3>
                <p className="text-xs text-gray-300 text-center max-w-sm">
                  Master goldsmiths have initiated creation and hallmark validation for{' '}
                  <strong className="text-white">{productName}</strong>.
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
                    className="px-2.5 py-1 bg-[#B59A6C]/25 hover:bg-[#B59A6C]/45 text-[#E8D5B7] text-[10px] font-mono rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 4-Stage Artisan Timeline */}
              <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto text-center">
                {[
                  { t: 'Confirmed', on: true },
                  { t: 'Crafting', on: true },
                  { t: 'Hallmarking', on: false },
                  { t: 'Delivery', on: false },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] mb-1 font-bold ${
                        s.on
                          ? 'bg-[#B59A6C] text-white shadow-lg'
                          : 'bg-white/8 text-gray-500 border border-white/10'
                      }`}
                    >
                      {i + 1}
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
                  className="flex-1 py-3.5 bg-[#B59A6C] hover:bg-[#A3885C] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  <span>View Order Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    onClose?.();
                    navigate('/');
                  }}
                  className="py-3.5 px-5 bg-white/8 hover:bg-white/15 text-gray-300 text-xs font-bold uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer"
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
