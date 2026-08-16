import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/productImages';

/*──────────────────────────────────────────────────────────────────────
 *  3-D  WHITE-GLOVE  DOORSTEP  DELIVERY  —  CINEMATIC  STORY  MODAL
 *──────────────────────────────────────────────────────────────────────
 *
 *  Scene 0  ·  Establishing Shot  — moonlit villa façade, porch lights bloom
 *  Scene 1  ·  Courier Walks Up   — tuxedo concierge strides in carrying the
 *                                    glowing velvet jewel-box
 *  Scene 2  ·  Doorbell Ring      — courier extends hand, presses brass bell;
 *                                    golden acoustic chime ripples outward
 *  Scene 3  ·  Door Opens         — grand arched door swings open (rotateY);
 *                                    warm interior light floods the porch
 *  Scene 4  ·  Lady Receives      — elegant lady steps forward;
 *                                    box transfers from courier → lady
 *  Scene 5  ·  Courier Departs    — courier bows, walks away;
 *                                    lady steps back inside with box
 *  Scene 6  ·  Unveil & Confirm   — product spotlight → order confirmation
 *──────────────────────────────────────────────────────────────────────*/

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [scene, setScene] = useState(-1);

  // ── Extract order data ──
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

  // ── Scene timeline ──
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

  useEffect(() => {
    if (!isOpen) {
      setScene(-1);
      return;
    }
    /* stagger: fade-in → scene flow */
    const timers = [
      setTimeout(() => setScene(0), 400),   // courier walks in
      setTimeout(() => setScene(1), 2400),  // doorbell
      setTimeout(() => setScene(2), 4200),  // door opens
      setTimeout(() => setScene(3), 6000),  // handover
      setTimeout(() => setScene(4), 7800),  // courier departs
      setTimeout(() => setScene(5), 9600),  // unveil + confirmation
    ];
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Helper: is the story still playing? ── */
  const storyPlaying = scene >= 0 && scene <= 4;
  const showConfirmation = scene >= 5;

  /* ── Derived animation states ── */
  const doorOpen = scene >= 2;
  const courierArrived = scene >= 0;
  const bellPress = scene === 1;
  const ladyVisible = scene >= 2;
  const handover = scene >= 3;
  const courierLeaving = scene >= 4;
  const ladyHasBox = scene >= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060608]/96 backdrop-blur-2xl p-3 sm:p-5 overflow-y-auto select-none"
      >
        {/* ═══════════  ATMOSPHERIC LIGHTING  ═══════════ */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Warm top-down porch flood */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-gradient-to-b from-[#B59A6C]/18 via-[#B59A6C]/6 to-transparent rounded-full blur-[110px]" />
          {/* Cool moonlight from upper-left */}
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#C5D3E8]/8 rounded-full blur-[100px]" />
          {/* Warm glow behind door area */}
          <motion.div
            animate={{ opacity: doorOpen ? 0.25 : 0.05 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/4 right-1/3 w-[350px] h-[350px] bg-[#FFE4B5]/20 rounded-full blur-[90px]"
          />
        </div>

        {/* ═══════════  MAIN CONTAINER  ═══════════ */}
        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">
          {/* ── NARRATION HUD ── */}
          {storyPlaying && (
            <div className="w-full text-center mb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35 }}
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
                  <p className="text-[11px] sm:text-xs font-body text-gray-400 max-w-sm text-center mt-0.5 italic">
                    "{SCRIPTS[scene]?.line}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ═══════════  3-D  VILLA  DOORSTEP  STAGE  ═══════════ */}
          {storyPlaying && (
            <div
              className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ perspective: '1400px', aspectRatio: '16/10' }}
            >
              {/* ── BACKGROUND: Night sky + villa wall ── */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, #0B0E1A 0%, #141828 35%, #1F1A14 60%, #18150F 100%)',
                }}
              >
                {/* Stars */}
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    animate={{ opacity: [0.15, 0.7, 0.15] }}
                    transition={{
                      duration: 2 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: Math.random() > 0.7 ? 2.5 : 1.5,
                      height: Math.random() > 0.7 ? 2.5 : 1.5,
                      top: `${5 + Math.random() * 28}%`,
                      left: `${5 + Math.random() * 90}%`,
                    }}
                  />
                ))}
                {/* Moon */}
                <div
                  className="absolute top-6 right-10 w-10 h-10 rounded-full bg-gradient-to-br from-[#FAFAD2] to-[#EEE8AA] shadow-[0_0_30px_12px_rgba(250,250,210,0.25)]"
                />
              </div>

              {/* ── VILLA STONE WALL ── */}
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{ height: '60%' }}
              >
                {/* Stone texture overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(165deg, #2A2520 0%, #1E1B17 40%, #171410 100%)',
                  }}
                />
                {/* Subtle mortar lines */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(181,154,108,0.5) 28px, rgba(181,154,108,0.5) 29px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(181,154,108,0.3) 60px, rgba(181,154,108,0.3) 61px)',
                  }}
                />

                {/* ── PORCH SCONCE LIGHTS (flanking door) ── */}
                {[-1, 1].map((side) => (
                  <div
                    key={side}
                    className="absolute top-8"
                    style={{
                      [side === -1 ? 'right' : 'right']: side === -1 ? '56%' : '16%',
                      left: side === -1 ? 'auto' : 'auto',
                      right: side === -1 ? '55%' : '14%',
                    }}
                  >
                    {/* Sconce bracket */}
                    <div className="w-4 h-6 bg-gradient-to-b from-[#B59A6C] to-[#8C734B] rounded-sm shadow-md mx-auto" />
                    {/* Flame / bulb glow */}
                    <motion.div
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [0.95, 1.08, 0.95],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-3 h-4 bg-gradient-to-t from-[#FFB347] to-[#FFF8DC] rounded-full mx-auto -mt-1"
                    />
                    {/* Light pool on wall */}
                    <div className="w-14 h-20 bg-[#FFE5B4]/10 rounded-full blur-[14px] mx-auto -mt-3 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* ── MARBLE PORCH FLOOR ── */}
              <div
                className="absolute bottom-0 inset-x-0 h-[22%]"
                style={{
                  background:
                    'linear-gradient(0deg, #0D0B09 0%, #1C1915 60%, #242018 100%)',
                  borderTop: '2px solid rgba(181,154,108,0.25)',
                }}
              >
                {/* Floor perspective lines */}
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(181,154,108,0.6) 48px, rgba(181,154,108,0.6) 49px)',
                  }}
                />
              </div>

              {/* ══════════  GRAND ARCHED DOORWAY  ══════════ */}
              <div
                className="absolute bottom-[22%] right-[22%] sm:right-[26%]"
                style={{
                  width: '30%',
                  height: '55%',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Arch frame (stone) */}
                <div
                  className="absolute -inset-2 rounded-t-[50%] border-2 border-[#B59A6C]/50"
                  style={{
                    background:
                      'linear-gradient(180deg, #3D362C 0%, #2A241C 100%)',
                    boxShadow:
                      'inset 0 0 15px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.5)',
                  }}
                />

                {/* Interior warm glow (visible when door opens) */}
                <motion.div
                  animate={{ opacity: doorOpen ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-t-[50%] overflow-hidden"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 80%, #FFE4B5 0%, #D4A762 30%, #8B6914 60%, #3D2B00 100%)',
                  }}
                >
                  {/* Interior details: chandelier silhouette */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-6 flex flex-col items-center">
                    <div className="w-[1px] h-2 bg-[#B59A6C]" />
                    <div className="w-6 h-3 border-b-2 border-[#B59A6C]/60 rounded-b-full" />
                  </div>
                </motion.div>

                {/* ── THE 3D DOOR (swings on left hinge) ── */}
                <motion.div
                  animate={{ rotateY: doorOpen ? -68 : 0 }}
                  transition={{
                    duration: 1.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 rounded-t-[50%] origin-left"
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Door front face */}
                  <div
                    className="absolute inset-0 rounded-t-[50%]"
                    style={{
                      background:
                        'linear-gradient(170deg, #3D2B1A 0%, #261A0F 40%, #1A110A 80%, #0F0A06 100%)',
                      boxShadow:
                        'inset 2px 0 8px rgba(181,154,108,0.15), inset -2px 0 8px rgba(0,0,0,0.5), 4px 0 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Upper panel */}
                    <div
                      className="absolute top-[20%] inset-x-[15%] bottom-[55%] border border-[#B59A6C]/25 rounded-t-lg"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(61,43,26,0.6) 0%, rgba(26,17,10,0.8) 100%)',
                      }}
                    />
                    {/* Lower panel */}
                    <div
                      className="absolute top-[52%] inset-x-[15%] bottom-[8%] border border-[#B59A6C]/25 rounded-sm"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(61,43,26,0.6) 0%, rgba(26,17,10,0.8) 100%)',
                      }}
                    />

                    {/* Brass door knob */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 right-[14%] w-3 h-3 rounded-full shadow-lg"
                      style={{
                        background:
                          'radial-gradient(circle at 35% 35%, #F0DEB4, #B59A6C, #7B6B3F)',
                        boxShadow:
                          '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
                      }}
                    />
                    {/* Keyhole plate */}
                    <div className="absolute top-[54%] right-[15%] w-2 h-4 rounded-sm bg-gradient-to-b from-[#B59A6C] to-[#8C734B] border border-white/20 shadow-sm" />
                  </div>
                </motion.div>
              </div>

              {/* ── DOORBELL on wall ── */}
              <div
                className="absolute bottom-[42%] sm:bottom-[44%]"
                style={{ right: '52%' }}
              >
                <div className="relative">
                  {/* Bell housing */}
                  <div
                    className="w-5 h-8 rounded-md shadow-lg border border-white/25 flex flex-col items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(160deg, #E8D5B7, #B59A6C, #8C734B)',
                    }}
                  >
                    {/* Bell button */}
                    <motion.div
                      animate={
                        bellPress
                          ? { scale: [1, 0.6, 1], backgroundColor: ['#fff', '#FFD700', '#fff'] }
                          : {}
                      }
                      transition={{ duration: 0.4, repeat: bellPress ? 3 : 0 }}
                      className="w-2.5 h-2.5 rounded-full bg-white shadow-inner border border-gray-300"
                    />
                  </div>

                  {/* Chime ripple waves */}
                  {bellPress && (
                    <>
                      {[0, 0.3, 0.6].map((delay) => (
                        <motion.div
                          key={delay}
                          initial={{ scale: 0.5, opacity: 0.8 }}
                          animate={{ scale: 4, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, delay }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-[#FFE5B4]/70 pointer-events-none"
                        />
                      ))}
                      {/* Ding text */}
                      <motion.span
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -18 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-heading font-bold text-[#FFE5B4] whitespace-nowrap"
                      >
                        ✦ ding ✦
                      </motion.span>
                    </>
                  )}
                </div>
              </div>

              {/* ══════════  3D COURIER CHARACTER  ══════════ */}
              <motion.div
                initial={{ x: '-120%' }}
                animate={{
                  x: courierLeaving
                    ? '-120%'
                    : courierArrived
                    ? '0%'
                    : '-120%',
                }}
                transition={{
                  duration: courierLeaving ? 1.6 : 1.8,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="absolute bottom-[22%] left-[8%] sm:left-[12%] flex flex-col items-center"
                style={{ transformStyle: 'preserve-3d', width: '14%' }}
              >
                {/* Shadow on ground */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120%] h-2 bg-black/50 rounded-[100%] blur-[3px]" />

                {/* HEAD — 3D sphere with lighting */}
                <div
                  className="relative rounded-full border border-[#C4A882]/50 flex items-center justify-center"
                  style={{
                    width: '55%',
                    aspectRatio: '1',
                    background:
                      'radial-gradient(circle at 38% 35%, #F5E1C8, #D4B896 50%, #B8956E 80%, #96755A 100%)',
                    boxShadow:
                      '0 4px 12px rgba(0,0,0,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Hair */}
                  <div
                    className="absolute -top-[8%] inset-x-[8%] rounded-t-full"
                    style={{
                      height: '55%',
                      background:
                        'linear-gradient(180deg, #1A1209 0%, #2D1F10 100%)',
                    }}
                  />
                  {/* Face features */}
                  <div className="absolute top-[42%] left-[28%] w-[10%] h-[6%] rounded-full bg-[#2C1A0E]" />
                  <div className="absolute top-[42%] right-[28%] w-[10%] h-[6%] rounded-full bg-[#2C1A0E]" />
                  <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-[18%] h-[5%] rounded-full bg-[#C4846C]" />
                </div>

                {/* BODY — Tuxedo with 3D form */}
                <div
                  className="relative -mt-[6%] flex flex-col items-center"
                  style={{ width: '80%' }}
                >
                  {/* Neck */}
                  <div
                    className="w-[30%] bg-[#D4B896]"
                    style={{ height: '8%', aspectRatio: 'auto' }}
                  />

                  {/* Jacket */}
                  <div
                    className="w-full rounded-t-lg relative overflow-hidden"
                    style={{
                      aspectRatio: '1/1.3',
                      background:
                        'linear-gradient(170deg, #222222 0%, #141414 40%, #0A0A0A 100%)',
                      boxShadow:
                        'inset 2px 0 6px rgba(255,255,255,0.06), inset -2px 0 6px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Lapels */}
                    <div
                      className="absolute top-0 left-0 w-[45%] h-[45%]"
                      style={{
                        background:
                          'linear-gradient(135deg, transparent 48%, #1A1A1A 49%, #2A2A2A 100%)',
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-[45%] h-[45%]"
                      style={{
                        background:
                          'linear-gradient(-135deg, transparent 48%, #1A1A1A 49%, #2A2A2A 100%)',
                      }}
                    />
                    {/* White shirt front */}
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[25%] h-[85%] bg-gradient-to-b from-[#F5F5F0] to-[#E0DDD5]" />
                    {/* Bow-tie */}
                    <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex items-center">
                      <div
                        className="w-0 h-0"
                        style={{
                          borderTop: '3px solid transparent',
                          borderBottom: '3px solid transparent',
                          borderRight: '5px solid #B59A6C',
                        }}
                      />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
                      <div
                        className="w-0 h-0"
                        style={{
                          borderTop: '3px solid transparent',
                          borderBottom: '3px solid transparent',
                          borderLeft: '5px solid #B59A6C',
                        }}
                      />
                    </div>
                    {/* Buttons */}
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B59A6C]" />
                    <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B59A6C]" />
                  </div>
                </div>

                {/* ARMS + HANDS holding the box */}
                <motion.div
                  animate={{
                    x: handover ? '90%' : '0%',
                    opacity: handover && !courierLeaving ? 1 : courierLeaving ? 0 : 1,
                  }}
                  transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute flex items-center"
                  style={{
                    top: '55%',
                    right: '-40%',
                  }}
                >
                  {/* White gloves */}
                  <div
                    className="rounded-full bg-white border border-gray-200 shadow-md"
                    style={{ width: 8, height: 8 }}
                  />

                  {/* ── THE VELVET JEWELRY BOX ── */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 6px 18px rgba(181,154,108,0.4), 0 0 12px rgba(181,154,108,0.2)',
                        '0 10px 28px rgba(181,154,108,0.7), 0 0 22px rgba(181,154,108,0.4)',
                        '0 6px 18px rgba(181,154,108,0.4), 0 0 12px rgba(181,154,108,0.2)',
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="relative rounded-md overflow-hidden mx-0.5"
                    style={{
                      width: 42,
                      height: 30,
                      background:
                        'radial-gradient(ellipse at 50% 25%, #6E1A28 0%, #4A0E18 50%, #2D060E 100%)',
                      border: '1.5px solid #D4AF37',
                    }}
                  >
                    {/* Gold ribbon cross */}
                    <div
                      className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#D4AF37] via-[#F0DEB4] to-[#D4AF37]"
                      style={{ width: 4 }}
                    />
                    <div
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AF37] via-[#F0DEB4] to-[#D4AF37]"
                      style={{ height: 4 }}
                    />
                    {/* Center rosette */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                      style={{
                        background:
                          'radial-gradient(circle at 40% 40%, #F0DEB4, #D4AF37, #8B7320)',
                      }}
                    />
                    {/* Specular glare sweep */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        background:
                          'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 48%, transparent 70%)',
                      }}
                    />
                  </motion.div>

                  <div
                    className="rounded-full bg-white border border-gray-200 shadow-md"
                    style={{ width: 8, height: 8 }}
                  />
                </motion.div>
              </motion.div>

              {/* ══════════  LADY CHARACTER  ══════════ */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: ladyVisible ? 1 : 0,
                  x: ladyVisible ? 0 : 20,
                  y: courierLeaving ? 8 : 0,
                }}
                transition={{
                  duration: 1,
                  ease: [0.25, 1, 0.5, 1],
                  delay: ladyVisible ? 0.4 : 0,
                }}
                className="absolute bottom-[22%]"
                style={{
                  right: '28%',
                  width: '12%',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Shadow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[110%] h-2 bg-black/40 rounded-[100%] blur-[3px]" />

                {/* HEAD */}
                <div
                  className="relative rounded-full border border-[#C4A882]/40 mx-auto flex items-center justify-center"
                  style={{
                    width: '52%',
                    aspectRatio: '1',
                    background:
                      'radial-gradient(circle at 38% 35%, #FAF0E6, #E6D2B5 50%, #D4B896 80%, #BFA07A 100%)',
                    boxShadow:
                      '0 3px 10px rgba(0,0,0,0.35), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.35)',
                  }}
                >
                  {/* Hair */}
                  <div
                    className="absolute -top-[15%] -left-[8%] -right-[8%] rounded-t-full"
                    style={{
                      height: '65%',
                      background:
                        'linear-gradient(180deg, #1A0D08 0%, #2D1810 80%)',
                    }}
                  />
                  {/* Face */}
                  <div className="absolute top-[44%] left-[28%] w-[8%] h-[6%] rounded-full bg-[#2C1A0E]" />
                  <div className="absolute top-[44%] right-[28%] w-[8%] h-[6%] rounded-full bg-[#2C1A0E]" />
                  <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[15%] h-[4%] rounded-full bg-[#D4A0A0]" />
                </div>

                {/* BODY — Elegant gown */}
                <div
                  className="w-[85%] mx-auto -mt-[5%] rounded-t-lg relative overflow-hidden"
                  style={{
                    aspectRatio: '1/1.6',
                    background:
                      'linear-gradient(170deg, #3A1E28 0%, #2D1420 40%, #1F0E15 80%, #140A0E 100%)',
                    boxShadow:
                      'inset 2px 0 6px rgba(181,154,108,0.1), inset -2px 0 6px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Neckline detail */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[20%] rounded-b-full"
                    style={{
                      background:
                        'linear-gradient(180deg, #D4B896 0%, #3A1E28 100%)',
                    }}
                  />
                  {/* Gold necklace */}
                  <div
                    className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[40%] h-[8%] rounded-b-full border-b-2 border-[#D4AF37]"
                  />
                  {/* Subtle fabric shimmer */}
                  <motion.div
                    animate={{ opacity: [0.02, 0.08, 0.02] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 30%, rgba(181,154,108,0.15) 50%, transparent 70%)',
                    }}
                  />
                </div>

                {/* Lady's hands receiving box (scene 3+) */}
                {ladyHasBox && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute flex items-center"
                    style={{ top: '52%', left: '-50%' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#E6D2B5] border border-[#C4A882] shadow-sm" />
                    {/* Received box (smaller, held delicately) */}
                    <div
                      className="rounded-sm mx-0.5 relative overflow-hidden"
                      style={{
                        width: 32,
                        height: 22,
                        background:
                          'radial-gradient(ellipse at 50% 25%, #6E1A28 0%, #4A0E18 50%, #2D060E 100%)',
                        border: '1px solid #D4AF37',
                      }}
                    >
                      <div
                        className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#D4AF37] via-[#F0DEB4] to-[#D4AF37]"
                        style={{ width: 3 }}
                      />
                      <div
                        className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AF37] via-[#F0DEB4] to-[#D4AF37]"
                        style={{ height: 3 }}
                      />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#E6D2B5] border border-[#C4A882] shadow-sm" />
                  </motion.div>
                )}
              </motion.div>

              {/* ── Warm porch light bloom (intensifies on bell ring) ── */}
              <motion.div
                animate={{
                  opacity: bellPress ? 0.35 : doorOpen ? 0.15 : 0.06,
                }}
                transition={{ duration: 0.8 }}
                className="absolute bottom-[20%] right-[20%] w-[40%] h-[50%] bg-[#FFE5B4]/30 rounded-full blur-[50px] pointer-events-none"
              />
            </div>
          )}

          {/* ═══════════  ORDER CONFIRMATION  ═══════════ */}
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/35 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Decorative top shimmer */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/60 to-transparent" />

              {/* Product Image Spotlight */}
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
                  {/* Sparkle */}
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

              {/* Timeline */}
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

              {/* Buttons */}
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
