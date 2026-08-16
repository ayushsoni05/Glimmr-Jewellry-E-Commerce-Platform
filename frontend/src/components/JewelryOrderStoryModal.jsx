import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { getProductImage } from '../utils/productImages';

/*──────────────────────────────────────────────────────────────────────
 *  3D REAL-TIME WEBGL JEWELRY MODEL COMPONENT
 *  — Physically Based Metallic Shaders + Optical Diamond Dispersion —
 *──────────────────────────────────────────────────────────────────────*/

const Real3DJewelryPiece = ({ isDocked }) => {
  const ringRef = useRef();
  const diamondRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.8;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15 + 0.2;
    }
    if (diamondRef.current) {
      diamondRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group ref={ringRef} position={[0, isDocked ? -0.4 : 0, 0]} scale={isDocked ? 0.75 : 1.15}>
      {/* 24K Gold Band (Torus Geometry) */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.22, 32, 64]} />
        <meshStandardMaterial
          color="#E6C280"
          metalness={0.96}
          roughness={0.12}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* 4-Prong Gold Crown */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.35,
            1.25,
            Math.sin(angle) * 0.35,
          ]}
          rotation={[0, angle, 0.15]}
        >
          <cylinderGeometry args={[0.04, 0.06, 0.45, 16]} />
          <meshStandardMaterial color="#F5D79E" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Solitaire Diamond Gemstone (Multi-Faceted Octahedron) */}
      <mesh ref={diamondRef} position={[0, 1.45, 0]}>
        <octahedronGeometry args={[0.55, 2]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.92}
          opacity={1}
          transparent
          roughness={0.04}
          ior={2.42}
          reflectivity={0.9}
          metalness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* 3D Orbiting Sparkles */}
      <Sparkles count={25} scale={3.5} size={2.5} speed={0.6} color="#FFD700" />
    </group>
  );
};

/*──────────────────────────────────────────────────────────────────────
 *  MAIN 3D ATELIER ORDER STORY MODAL
 *──────────────────────────────────────────────────────────────────────*/

const SCRIPTS = [
  {
    badge: 'ACT 1 OF 4 · MASTER BENCH',
    title: 'REAL-TIME 3D GOLDSMITH BENCH',
    subtitle: 'Inspecting 24K gold band tension, prong alignment & diamond facet brilliance',
  },
  {
    badge: 'ACT 2 OF 4 · BIS HALLMARK',
    title: 'GOVERNMENT BIS 916 LASER HALLMARK',
    subtitle: 'Microscopic laser beam inscribes legal authenticity & IGI laboratory certification',
  },
  {
    badge: 'ACT 3 OF 4 · VELVET VAULT',
    title: 'ITALIAN VELVET VAULT & WAX SEAL',
    subtitle: 'Encased in hand-sewn burgundy velvet, Champagne silk ribbon & hot 24K wax crest',
  },
  {
    badge: 'ACT 4 OF 4 · ARMORED TRANSIT',
    title: 'INSURED ARMORED CONCIERGE TRANSIT',
    subtitle: 'Secured inside tamper-evident armored vault for high-value priority dispatch',
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
    productObj.name || firstItem.name || 'Glimmr Royal Creation';

  // Story act progression
  useEffect(() => {
    if (!isOpen) {
      setAct(0);
      return;
    }

    const t1 = setTimeout(() => setAct(1), 2600); // Act 2: Laser Hallmark
    const t2 = setTimeout(() => setAct(2), 5200); // Act 3: Velvet Vault Encasing
    const t3 = setTimeout(() => setAct(3), 7800); // Act 4: Armored Transit
    const t4 = setTimeout(() => {
      setAct(4); // Act 5: Order Confirmation
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B59A6C', '#E8D5B7', '#D4AF37', '#FFFFFF'],
        });
      } catch (e) {}
    }, 10200);

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

  const isStoryPlaying = act < 4;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07070a]/96 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* Background Atmospheric Studio Glow */}
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

          {/* ═══════════ REAL-TIME 3D WEBGL THEATER STAGE ═══════════ */}
          {isStoryPlaying && (
            <div
              className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-[#B59A6C]/35 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#141418] via-[#0E0E12] to-[#08080A]"
              style={{ aspectRatio: '16/10', perspective: '1200px' }}
            >
              {/* ── 1. THREE.JS REAL-TIME WEBGL CANVAS ── */}
              <div className="absolute inset-0 z-10">
                <Canvas camera={{ position: [0, 0.4, 4.5], fov: 45 }}>
                  <ambientLight intensity={0.7} />
                  <pointLight position={[5, 6, 5]} intensity={2.5} color="#FFF8E7" />
                  <pointLight position={[-5, -4, -3]} intensity={1.2} color="#B59A6C" />
                  <directionalLight position={[0, 5, 2]} intensity={2.0} color="#FFFFFF" />

                  <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
                    <Real3DJewelryPiece isDocked={act >= 2} />
                  </Float>
                </Canvas>
              </div>

              {/* ── 2. ACT 2: LASER HALLMARKING BEAM OVERLAY ── */}
              {act === 1 && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                  {/* Glowing Laser Inscription Line */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '140px', opacity: 1 }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="h-0.5 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_15px_#00E5FF] -mt-10"
                  />

                  {/* BIS Hallmark 916 Hologram Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 60 }}
                    transition={{ duration: 0.6 }}
                    className="absolute bg-[#18181B]/90 border border-[#B59A6C] rounded-lg px-4 py-2 shadow-2xl flex items-center gap-3 backdrop-blur-md"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FF8F00] flex items-center justify-center shadow-md text-[10px] font-bold text-black">
                      ✓
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase block">
                        BIS 916 HALLMARKED
                      </span>
                      <span className="text-[8px] font-mono text-[#B59A6C] block">
                        IGI Laser Verified Purity
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ── 3. ACT 3: 3D VELVET VAULT BOX ENCAPSULATION ── */}
              {act >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.88 }}
                  animate={{
                    opacity: act === 3 ? [1, 1, 0] : 1,
                    y: act === 3 ? [0, 0, -500] : 0,
                    scale: act === 3 ? [1, 1, 0.4] : 1,
                  }}
                  transition={{ duration: 2.4, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute inset-x-12 bottom-6 top-16 z-25 pointer-events-none flex flex-col items-center justify-between"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Velvet Box Lower Shell */}
                  <div
                    className="w-full h-full rounded-2xl border border-[#B59A6C]/60 p-4 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 30%, #5E111E, #200408)',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.2)',
                    }}
                  >
                    {/* Champagne Silk Ribbon Cross */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r from-[#9E8357] via-[#E8D5B7] to-[#9E8357] opacity-80" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-b from-[#9E8357] via-[#E8D5B7] to-[#9E8357] opacity-80" />

                    {/* Royal 24K Wax Seal Stamp */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center relative shadow-2xl z-30"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, #9E1B1B, #5E0B0B)',
                        boxShadow: '0 8px 24px rgba(94,11,11,0.85)',
                      }}
                    >
                      <div className="absolute inset-1.5 rounded-full border border-white/30" />
                      <span className="font-heading text-[10px] font-bold text-white tracking-[0.2em]">GLM</span>
                    </motion.div>

                    <div className="w-full flex justify-between items-center text-[8px] font-mono text-[#E8D5B7] tracking-widest pt-2 border-t border-[#B59A6C]/30">
                      <span>GLIMMR ATELIER</span>
                      <span>VAULT SECURED</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── 4. ACT 4: GOLDEN STARDUST FLIGHT TRAIL ── */}
              {act === 3 && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`flight-spark-${i}`}
                      initial={{ opacity: 0, y: 150 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [-50, -450],
                        x: (i % 2 === 0 ? 1 : -1) * (20 + i * 12),
                        scale: [0.5, 1.6, 0.2],
                      }}
                      transition={{ duration: 2.2, delay: i * 0.08, ease: 'easeOut' }}
                      className="absolute bottom-10 left-1/2 w-2 h-2 rounded-full bg-[#FFD54F]"
                      style={{ boxShadow: '0 0 12px #FFD54F, 0 0 24px #FFB300' }}
                    />
                  ))}
                </div>
              )}

              {/* ── 5. SKIP ANIMATION LUXURY BUTTON ── */}
              <button
                onClick={() => setAct(4)}
                className="absolute bottom-3 right-4 bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg z-30"
              >
                Skip to Details ➔
              </button>
            </div>
          )}

          {/* ═══════════ ACT 5: LUXURY ORDER CONFIRMATION CARD ═══════════ */}
          {act >= 4 && (
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
                  ORDER CONFIRMED & RESERVED
                </span>
                <h3 className="font-heading text-xl sm:text-2xl text-white mb-1 text-center">
                  Your Creation is in the Atelier
                </h3>
                <p className="text-xs font-body text-gray-300 text-center max-w-sm">
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
