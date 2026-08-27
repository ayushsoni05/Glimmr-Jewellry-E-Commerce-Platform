import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FastForward, Check, Copy, ArrowRight, MapPin, Package, Truck } from 'lucide-react';
import { getProductImage } from '../utils/productImages';
import { useMetalRates } from '../contexts/MetalRatesContext';

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { getLiveProductPrice } = useMetalRates();

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Extract order details
  const orderId =
    orderData?._id ||
    orderData?.orderId ||
    orderData?.id ||
    `GLM-${Math.floor(100000 + Math.random() * 900000)}`;

  const shortId = orderId ? orderId.slice(-8).toUpperCase() : 'N/A';

  const items = orderData?.items || orderData?.orderItems || [];
  const firstItem = items[0] || {};
  const productObj = firstItem.product || firstItem;
  const productName = productObj.name || firstItem.name || 'Glimmr Fine Jewelry Creation';
  const shippingAddress = orderData?.shippingAddress || {};

  // Calculate live price breakdown for every item
  const getItemLiveBreakdown = (p) => {
    if (!p) return { totalLivePrice: 0, rawMetalCost: 0, makingCharges: 0, gemstoneCost: 0, gstTax: 0, subtotal: 0, weight: 0, karat: 0, material: '' };
    if (typeof getLiveProductPrice === 'function') {
      const res = getLiveProductPrice(p);
      if (res && res.totalLivePrice > 0) return res;
    }
    const price = Number(p.price) || 0;
    return { totalLivePrice: price, rawMetalCost: price, makingCharges: 0, gemstoneCost: 0, gstTax: Math.round(price * 0.03), subtotal: price, weight: 0, karat: 0, material: '' };
  };

  let totalMetal = 0, totalMaking = 0, totalDiamond = 0, totalGst = 0, totalSubtotal = 0, computedGrandTotal = 0;
  items.forEach(item => {
    const p = item.product || item;
    const bd = getItemLiveBreakdown(p);
    const qty = item.quantity || 1;
    totalMetal += bd.rawMetalCost * qty;
    totalMaking += bd.makingCharges * qty;
    totalDiamond += bd.gemstoneCost * qty;
    totalGst += bd.gstTax * qty;
    totalSubtotal += bd.subtotal * qty;
    computedGrandTotal += bd.totalLivePrice * qty;
  });

  const displayTotal = orderData?.totalAmount > 0 ? orderData.totalAmount : computedGrandTotal;

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

  // Timeline stages
  const stages = [
    { label: 'Confirmed', active: true },
    { label: 'Crafting', active: true },
    { label: 'Hallmarking', active: false },
    { label: 'Dispatch', active: false },
  ];

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
                  GLIMMR ATELIER &bull; ORDER REGISTERED
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

                {/* Top Control Bar (Skip Button) */}
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
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/30 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top Shimmer Line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/70 to-transparent" />

              <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">

                {/* Success Header */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #B59A6C, #7A6237)',
                      boxShadow: '0 8px 24px rgba(181,154,108,0.4)',
                    }}
                  >
                    <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>

                  <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-1">
                    ORDER CONFIRMED
                  </span>
                  <h3 className="text-xl sm:text-2xl text-white mb-1 text-center font-heading font-bold tracking-tight">
                    Thank You for Your Acquisition
                  </h3>
                  <p className="text-xs text-gray-400 text-center max-w-sm leading-relaxed">
                    Your order has been confirmed and our master jewelers have begun handcrafting{' '}
                    <strong className="text-[#E8D5B7]">{productName}</strong>.
                  </p>
                </div>

                {/* Order Reference Box */}
                <div className="bg-[#1A1A1E] border border-[#B59A6C]/20 rounded-xl p-3.5 mb-5 max-w-md mx-auto">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em] block mb-1.5 text-center">
                    ORDER REFERENCE
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="font-mono text-sm sm:text-base font-bold text-[#E8D5B7] tracking-wider">
                      #{shortId}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-[#B59A6C]/15 hover:bg-[#B59A6C]/30 text-[#E8D5B7] text-[10px] font-mono rounded flex items-center gap-1 cursor-pointer transition-colors border border-[#B59A6C]/10"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                {items.length > 0 && (
                  <div className="bg-[#1A1A1E] border border-[#B59A6C]/20 rounded-xl p-4 mb-5 max-w-md mx-auto space-y-3">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em] block">
                      ORDERED {items.length > 1 ? `ITEMS (${items.length})` : 'ITEM'}
                    </span>
                    <div className="space-y-3 divide-y divide-white/5">
                      {items.map((item, idx) => {
                        const p = item.product || item;
                        const img = getProductImage ? getProductImage(p) : null;
                        const bd = getItemLiveBreakdown(p);
                        const qty = item.quantity || 1;
                        const itemLiveTotal = bd.totalLivePrice * qty;

                        return (
                          <div key={idx} className="pt-2 first:pt-0 space-y-1.5">
                            <div className="flex items-center gap-3">
                              {img && (
                                <img
                                  src={img}
                                  alt={p.name || 'Item'}
                                  className="w-12 h-12 rounded-lg object-cover border border-[#B59A6C]/25 bg-[#0f0f12] shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-white truncate">
                                  {p.name || 'Fine Jewelry Piece'}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  Qty: {qty} {p.material && `• ${p.material}`} {p.karat && `• ${p.karat}K`} {bd.weight > 0 && `• ${bd.weight}g`}
                                </p>
                              </div>
                              <span className="font-mono text-xs font-bold text-[#E8D5B7] shrink-0">
                                {'\u20B9'}{itemLiveTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Per-Item Detailed Specs */}
                            {bd.weight > 0 && (
                              <div className="pl-15 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-mono text-gray-400">
                                <div>Metal: <span className="text-gray-200">{'\u20B9'}{(bd.rawMetalCost * qty).toLocaleString('en-IN')}</span></div>
                                <div>Making: <span className="text-gray-200">{'\u20B9'}{(bd.makingCharges * qty).toLocaleString('en-IN')}</span></div>
                                {bd.gemstoneCost > 0 && (
                                  <div>Diamond: <span className="text-gray-200">{'\u20B9'}{(bd.gemstoneCost * qty).toLocaleString('en-IN')}</span></div>
                                )}
                                <div>GST (3%): <span className="text-gray-200">{'\u20B9'}{(bd.gstTax * qty).toLocaleString('en-IN')}</span></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Breakdown Card */}
                <div className="bg-[#1A1A1E] border border-[#B59A6C]/20 rounded-xl p-4 mb-5 max-w-md mx-auto space-y-2 text-xs font-body">
                  <span className="text-[8px] font-mono text-[#B59A6C] uppercase tracking-[0.2em] block mb-2 font-bold">
                    VALUATION BREAKDOWN
                  </span>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Metal Value</span>
                    <span className="font-mono text-gray-200 font-bold">{'\u20B9'}{totalMetal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Artisan Making Charges</span>
                    <span className="font-mono text-gray-200 font-bold">{'\u20B9'}{totalMaking.toLocaleString('en-IN')}</span>
                  </div>
                  {totalDiamond > 0 && (
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Diamond / Gemstone</span>
                      <span className="font-mono text-gray-200 font-bold">{'\u20B9'}{totalDiamond.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400 text-[11px] pt-1 border-t border-white/5">
                    <span>Subtotal (Before Tax)</span>
                    <span className="font-mono text-gray-200 font-bold">{'\u20B9'}{totalSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>GST (3%)</span>
                    <span className="font-mono text-gray-200 font-bold">{'\u20B9'}{totalGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#B59A6C]" /> Insured Transit
                    </span>
                    <span className="font-bold text-emerald-400 text-[9px] uppercase tracking-wider">COMPLIMENTARY</span>
                  </div>
                  <div className="pt-2 border-t border-[#B59A6C]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-[#B59A6C] uppercase tracking-widest block font-bold">TOTAL PAYABLE</span>
                      <span className="text-sm font-heading font-extrabold text-white">Grand Total</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-[#E8D5B7]">
                      {'\u20B9'}{displayTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Order Progress Timeline */}
                <div className="mb-5 max-w-md mx-auto">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em] block mb-3 text-center">
                    ORDER PROGRESS
                  </span>
                  <div className="flex items-start justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-[14px] left-[20px] right-[20px] h-[2px] bg-[#2A2A2E]">
                      <div
                        className="h-full bg-[#B59A6C] transition-all duration-500"
                        style={{ width: `${((stages.filter(s => s.active).length - 1) / (stages.length - 1)) * 100}%` }}
                      />
                    </div>
                    {stages.map((stage, i) => (
                      <div key={i} className="flex flex-col items-center relative z-10" style={{ width: `${100 / stages.length}%` }}>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 ${
                            stage.active
                              ? 'bg-[#B59A6C] text-white shadow-[0_3px_12px_rgba(181,154,108,0.35)]'
                              : 'bg-[#1A1A1E] border-2 border-[#2A2A2E] text-gray-600'
                          }`}
                        >
                          {stage.active ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          ) : (
                            <span className="text-[9px] font-mono font-bold">{i + 1}</span>
                          )}
                        </div>
                        <span className={`text-[8px] font-mono text-center leading-tight ${
                          stage.active ? 'text-[#E8D5B7] font-bold' : 'text-gray-600'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address Preview */}
                {shippingAddress.name && (
                  <div className="bg-[#1A1A1E] border border-[#B59A6C]/20 rounded-xl p-4 mb-6 max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B59A6C]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#B59A6C]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em] block mb-1">
                          DELIVERY ADDRESS
                        </span>
                        <p className="text-xs text-white font-bold">{shippingAddress.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                          {shippingAddress.line1}
                          {shippingAddress.line2 && `, ${shippingAddress.line2}`}
                          <br />
                          {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                        </p>
                        {shippingAddress.phone && (
                          <p className="text-[10px] text-gray-500 mt-1 font-mono">
                            Phone: {shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                      navigate('/profile?tab=orders');
                    }}
                    className="py-3.5 px-5 bg-white/8 hover:bg-white/15 text-gray-300 text-xs font-bold uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Track Order</span>
                  </button>
                </div>

                {/* Continue Shopping link */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      onClose?.();
                      navigate('/');
                    }}
                    className="text-[10px] font-mono text-gray-500 hover:text-gray-300 uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JewelryOrderStoryModal;
