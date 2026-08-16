import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY DETECTION — maps orderData product.category to 3D model key
   ═══════════════════════════════════════════════════════════════════════ */

function detectCategory(orderData) {
  const raw = (
    orderData?.items?.[0]?.product?.category ||
    orderData?.orderItems?.[0]?.product?.category ||
    orderData?.items?.[0]?.category ||
    orderData?.orderItems?.[0]?.category ||
    ''
  ).toLowerCase();
  if (raw.includes('necklace') || raw.includes('chain') || raw.includes('mangalsutra') || raw.includes('pendant')) return 'necklace';
  if (raw.includes('earring')) return 'earring';
  if (raw.includes('bracelet') || raw.includes('bangle') || raw.includes('kada') || raw.includes('anklet')) return 'bracelet';
  if (raw.includes('watch')) return 'watch';
  return 'ring';
}

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS & CONFIGS
   ═══════════════════════════════════════════════════════════════════════ */

const CATEGORY_LABELS = { ring: 'Solitaire Ring', necklace: 'Necklace', earring: 'Earrings', bracelet: 'Bracelet', watch: 'Timepiece' };

const BOX_CONFIGS = {
  ring:     { w: 1.6, d: 1.6, h: 0.9, lidH: 0.25 },
  necklace: { w: 2.8, d: 2.0, h: 0.65, lidH: 0.2 },
  earring:  { w: 1.8, d: 1.4, h: 0.75, lidH: 0.22 },
  bracelet: { w: 2.2, d: 2.2, h: 0.8, lidH: 0.22 },
  watch:    { w: 2.4, d: 2.4, h: 0.9, lidH: 0.25 },
};

const ACT_SCRIPTS = [
  { badge: 'ACT 1 OF 4 · MASTERPIECE',  title: 'THE ARTISAN\'S CREATION',         subtitle: 'Your handcrafted masterpiece, inspected under studio brilliance' },
  { badge: 'ACT 2 OF 4 · HALLMARK',      title: 'BIS 916 LASER CERTIFICATION',     subtitle: 'Government-certified purity inscription by IGI laboratory' },
  { badge: 'ACT 3 OF 4 · VAULT',         title: 'LUXURY VAULT ENCAPSULATION',      subtitle: 'Sealed in hand-stitched Italian burgundy velvet with 24K wax crest' },
  { badge: 'ACT 4 OF 4 · DISPATCH',      title: 'INSURED ARMORED DISPATCH',        subtitle: 'Tamper-evident priority transit with concierge tracking' },
];

/* Physically-based material presets */
const GOLD = { color: '#E6C280', metalness: 0.96, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04 };
const DIAMOND = { color: '#FFFFFF', transmission: 0.92, transparent: true, roughness: 0.04, ior: 2.42, clearcoat: 1, clearcoatRoughness: 0.02, metalness: 0.05, opacity: 1 };

/* ═══════════════════════════════════════════════════════════════════════
   3D PRODUCT MODELS — One unique model per product category
   All procedural Three.js geometry, zero external files.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── 💍 RING ── */
function Ring3D() {
  return (
    <group>
      <mesh><torusGeometry args={[1.0, 0.18, 32, 64]} /><meshPhysicalMaterial {...GOLD} /></mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.28, 1.0, Math.sin(a) * 0.28]} rotation={[0, a, 0.12]}>
          <cylinderGeometry args={[0.035, 0.05, 0.4, 12]} /><meshPhysicalMaterial {...GOLD} />
        </mesh>
      ))}
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.45, 2]} /><meshPhysicalMaterial {...DIAMOND} />
      </mesh>
    </group>
  );
}

/* ── 📿 NECKLACE ── */
function Necklace3D() {
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const t = (i / 50) * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(t) * 1.3, -Math.sin(t) * 0.9 + 0.5, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);
  return (
    <group>
      <mesh><tubeGeometry args={[curve, 64, 0.025, 8, false]} /><meshPhysicalMaterial {...GOLD} /></mesh>
      <mesh position={[0, -0.35, 0]}><torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} /><meshPhysicalMaterial {...GOLD} /></mesh>
      <mesh position={[0, -0.55, 0]}><octahedronGeometry args={[0.28, 1]} /><meshPhysicalMaterial {...DIAMOND} /></mesh>
      <Sparkles count={12} scale={1.5} position={[0, -0.55, 0]} size={2} speed={0.4} color="#FFD700" />
    </group>
  );
}

/* ── 💎 EARRINGS ── */
function Earring3D() {
  return (
    <group>
      {[-0.65, 0.65].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          <mesh><torusGeometry args={[0.2, 0.018, 16, 32, Math.PI]} /><meshPhysicalMaterial {...GOLD} /></mesh>
          <mesh position={[0, -0.22, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshPhysicalMaterial {...GOLD} /></mesh>
          <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 0.32, 16]} /><meshPhysicalMaterial {...DIAMOND} />
          </mesh>
          <mesh position={[0, -0.16, 0.08]}><sphereGeometry args={[0.04, 8, 8]} /><meshPhysicalMaterial {...DIAMOND} /></mesh>
        </group>
      ))}
    </group>
  );
}

/* ── ⌚ BRACELET / BANGLE ── */
function Bracelet3D() {
  return (
    <group rotation={[Math.PI / 2.5, 0, 0]}>
      <mesh><torusGeometry args={[1.0, 0.1, 24, 64]} /><meshPhysicalMaterial {...GOLD} /></mesh>
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} /><meshPhysicalMaterial {...DIAMOND} />
          </mesh>
        );
      })}
      <mesh><torusGeometry args={[1.0, 0.035, 8, 64]} /><meshPhysicalMaterial {...GOLD} roughness={0.25} /></mesh>
    </group>
  );
}

/* ── 🕐 WATCH ── */
function Watch3D() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.55, 0.55, 0.12, 32]} /><meshPhysicalMaterial color="#0a0a1a" metalness={0.4} roughness={0.15} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.045, 16, 32]} /><meshPhysicalMaterial {...GOLD} /></mesh>
      <mesh position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.01, 32]} /><meshPhysicalMaterial color="#101020" metalness={0.1} roughness={0.05} transmission={0.3} transparent />
      </mesh>
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2, r = 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0.072]}>
            <boxGeometry args={[0.012, i % 3 === 0 ? 0.07 : 0.04, 0.012]} />
            <meshStandardMaterial color="#E6C280" emissive="#E6C280" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        );
      })}
      <mesh position={[0.02, 0.04, 0.075]} rotation={[0, 0, Math.PI / 5]}>
        <boxGeometry args={[0.018, 0.18, 0.008]} /><meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.01, 0.06, 0.075]} rotation={[0, 0, -Math.PI / 3.5]}>
        <boxGeometry args={[0.012, 0.26, 0.008]} /><meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0, 0.078]}><sphereGeometry args={[0.02, 12, 12]} /><meshPhysicalMaterial {...GOLD} /></mesh>
      <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} /><meshPhysicalMaterial {...GOLD} />
      </mesh>
      {[...Array(4)].map((_, i) => (
        <mesh key={`u${i}`} position={[0, 0.72 + i * 0.2, -0.01]}>
          <boxGeometry args={[0.38, 0.16, 0.05]} /><meshStandardMaterial color="#2d1810" roughness={0.75} />
        </mesh>
      ))}
      {[...Array(4)].map((_, i) => (
        <mesh key={`d${i}`} position={[0, -0.72 - i * 0.2, -0.01]}>
          <boxGeometry args={[0.38, 0.16, 0.05]} /><meshStandardMaterial color="#2d1810" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

/* ── PRODUCT SELECTOR ── */
function ProductModel3D({ category }) {
  switch (category) {
    case 'necklace': return <Necklace3D />;
    case 'earring':  return <Earring3D />;
    case 'bracelet': return <Bracelet3D />;
    case 'watch':    return <Watch3D />;
    default:         return <Ring3D />;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   3D JEWELRY BOX — Category-specific dimensions with hinged lid
   ═══════════════════════════════════════════════════════════════════════ */

function JewelryBox3D({ category, lidRef }) {
  const c = BOX_CONFIGS[category] || BOX_CONFIGS.ring;
  return (
    <group>
      {/* Base shell */}
      <mesh position={[0, c.h / 4, 0]}>
        <boxGeometry args={[c.w, c.h / 2, c.d]} />
        <meshPhysicalMaterial color="#5E111E" roughness={0.85} metalness={0.05} clearcoat={0.15} />
      </mesh>
      {/* Gold rim */}
      <mesh position={[0, c.h / 2 + 0.008, 0]}>
        <boxGeometry args={[c.w + 0.03, 0.016, c.d + 0.03]} />
        <meshPhysicalMaterial {...GOLD} />
      </mesh>
      {/* Satin cushion */}
      <mesh position={[0, c.h / 2 - 0.04, 0]}>
        <boxGeometry args={[c.w * 0.8, 0.08, c.d * 0.8]} />
        <meshStandardMaterial color="#E8D5B7" roughness={0.4} />
      </mesh>
      {/* Hinged lid group — pivot at back-top edge */}
      <group ref={lidRef} position={[0, c.h / 2, -c.d / 2]}>
        <mesh position={[0, c.lidH / 2, c.d / 2]}>
          <boxGeometry args={[c.w, c.lidH, c.d]} />
          <meshPhysicalMaterial color="#5E111E" roughness={0.85} metalness={0.05} clearcoat={0.15} />
        </mesh>
        {/* Gold accent on lid top */}
        <mesh position={[0, c.lidH + 0.005, c.d / 2]}>
          <boxGeometry args={[c.w * 0.4, 0.012, c.d * 0.4]} />
          <meshPhysicalMaterial {...GOLD} />
        </mesh>
        {/* Glimmr monogram disc */}
        <mesh position={[0, c.lidH + 0.015, c.d / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.008, 16]} />
          <meshPhysicalMaterial {...GOLD} />
        </mesh>
      </group>
      {/* Base plate */}
      <mesh position={[0, -0.008, 0]}>
        <boxGeometry args={[c.w + 0.05, 0.016, c.d + 0.05]} />
        <meshPhysicalMaterial color="#2A0508" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN 3D ANIMATION SCENE — Orchestrates all 4 acts inside the Canvas
   Uses act-relative timing via refs for smooth, frame-rate-independent
   interpolation. Product rotates, descends into box; lid opens/closes;
   box dispatches upward.
   ═══════════════════════════════════════════════════════════════════════ */

function AnimationScene({ act, category }) {
  const productRef  = useRef();
  const boxLidRef   = useRef();
  const boxGroupRef = useRef();
  const laserRef    = useRef();
  const actTimesRef = useRef({});

  useFrame((state, delta) => {
    const clock = state.clock.elapsedTime;

    /* Record the first frame of each act */
    if (actTimesRef.current[act] === undefined) actTimesRef.current[act] = clock;
    const at = clock - actTimesRef.current[act]; // act-local time

    /* ── PRODUCT ANIMATION ── */
    if (productRef.current) {
      productRef.current.rotation.y += delta * 0.5;

      if (act <= 1) {
        productRef.current.position.y = Math.sin(clock * 1.2) * 0.08;
        productRef.current.scale.setScalar(
          THREE.MathUtils.lerp(productRef.current.scale.x, 1, delta * 4)
        );
      } else if (act === 2) {
        /* 0-0.6s: hold, 0.6-1.8s: descend, 1.8+: docked */
        if (at > 0.6 && at < 1.8) {
          const p = (at - 0.6) / 1.2;
          const e = p * p * (3 - 2 * p);
          productRef.current.position.y = THREE.MathUtils.lerp(0, -1.4, e);
          productRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.5, e));
        } else if (at >= 1.8) {
          productRef.current.position.y = -1.4;
          productRef.current.scale.setScalar(0.5);
        }
      }
    }

    /* ── BOX LID ── */
    if (boxLidRef.current) {
      const boxAt = clock - (actTimesRef.current[2] ?? clock);
      const target = (act === 2 && boxAt < 2.2) ? -2.0 : 0;
      boxLidRef.current.rotation.x = THREE.MathUtils.lerp(
        boxLidRef.current.rotation.x, target, delta * 5
      );
    }

    /* ── LASER BEAM (ACT 1) ── */
    if (laserRef.current && act === 1) {
      const t = (at % 1.5) / 1.5;
      laserRef.current.scale.x = t;
    }

    /* ── BOX DISPATCH (ACT 3) ── */
    if (boxGroupRef.current && act === 3) {
      boxGroupRef.current.position.y += delta * 2.0;
      const s = Math.max(0.01, boxGroupRef.current.scale.x - delta * 0.35);
      boxGroupRef.current.scale.setScalar(s);
    }
  });

  const showProduct = act <= 2;
  const showBox     = act >= 2 && act <= 3;
  const showLaser   = act === 1;

  return (
    <Suspense fallback={null}>
      {/* ── STUDIO LIGHTING RIG ── */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={2.0} color="#FFF8E7" />
      <pointLight position={[-4, 3, -3]} intensity={1.2} color="#B59A6C" />
      <pointLight position={[2, -2, 4]} intensity={0.8} color="#E8D5B7" />

      {/* HDR environment for metallic reflections */}
      <Environment preset="city" />

      {/* ── PRODUCT ── */}
      {showProduct && (
        <group ref={productRef}>
          <ProductModel3D category={category} />
        </group>
      )}

      {/* ── GOLDEN SPARKLE CLOUD (acts 0-1) ── */}
      {act <= 1 && <Sparkles count={35} scale={4} size={3} speed={0.5} color="#FFD700" />}

      {/* ── LASER HALLMARK BEAM (act 1) ── */}
      {showLaser && (
        <group position={[0, 0, 0.6]}>
          <mesh ref={laserRef}>
            <boxGeometry args={[1.6, 0.006, 0.006]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={8} toneMapped={false} />
          </mesh>
          <mesh><sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#FFF" emissive="#00E5FF" emissiveIntensity={12} toneMapped={false} />
          </mesh>
          {/* Spark embers */}
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.3, -0.1 - Math.random() * 0.3, 0.6 + (Math.random() - 0.5) * 0.2]}>
              <sphereGeometry args={[0.012, 6, 6]} />
              <meshStandardMaterial color="#FFD54F" emissive="#FFD54F" emissiveIntensity={4} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}

      {/* ── JEWELRY BOX (acts 2-3) ── */}
      {showBox && (
        <group ref={boxGroupRef} position={[0, -1.8, 0]}>
          <JewelryBox3D category={category} lidRef={boxLidRef} />
        </group>
      )}

      {/* ── CINEMATIC POST-PROCESSING ── */}
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.85} mipmapBlur />
        <Vignette darkness={0.35} offset={0.3} />
      </EffectComposer>
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MINI 3D PRODUCT PREVIEW — Small inline Canvas for confirmation card
   Replaces the product photo entirely with a live rotating 3D model.
   ═══════════════════════════════════════════════════════════════════════ */

function AutoRotate({ children }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.8; });
  return <group ref={ref}>{children}</group>;
}

function MiniProductCanvas({ category }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, category === 'watch' ? 4.2 : 3.5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 4, 3]} intensity={1.5} color="#FFF8E7" />
      <pointLight position={[-2, -1, 2]} intensity={0.8} color="#B59A6C" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.3}>
          <AutoRotate><ProductModel3D category={category} /></AutoRotate>
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [act, setAct] = useState(0);

  const category = useMemo(() => detectCategory(orderData), [orderData]);

  const orderId =
    orderData?._id || orderData?.orderId || orderData?.id ||
    `GLM-${Math.floor(100000 + Math.random() * 900000)}`;
  const firstItem = orderData?.items?.[0] || orderData?.orderItems?.[0] || {};
  const productObj = firstItem.product || firstItem;
  const productName = productObj.name || firstItem.name || 'Glimmr Royal Creation';

  /* ── Act timeline driven by React state ── */
  useEffect(() => {
    if (!isOpen) { setAct(0); return; }
    const t1 = setTimeout(() => setAct(1), 3000);
    const t2 = setTimeout(() => setAct(2), 5500);
    const t3 = setTimeout(() => setAct(3), 8500);
    const t4 = setTimeout(() => {
      setAct(4);
      try { confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 }, colors: ['#B59A6C', '#E8D5B7', '#D4AF37', '#FFFFFF'] }); } catch (e) { /* noop */ }
    }, 11000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07070a]/96 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* ── Background atmospheric studio glow ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#B59A6C]/20 via-[#B59A6C]/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-[#8B1A1A]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">

          {/* ═══════════ LIVE SCRIPT HUD ═══════════ */}
          {isStoryPlaying && (
            <div className="w-full text-center mb-4">
              <AnimatePresence mode="wait">
                <motion.div key={act} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.35 }} className="inline-flex flex-col items-center">
                  <div className="flex items-center gap-2.5 px-4 py-1 bg-[#15151a]/90 border border-[#B59A6C]/35 rounded-full shadow-xl mb-2 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span className="text-[9px] font-mono tracking-[0.22em] text-[#E8D5B7] uppercase font-bold">{ACT_SCRIPTS[act]?.badge}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{ACT_SCRIPTS[act]?.title}</h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 max-w-md text-center mt-0.5 italic">"{ACT_SCRIPTS[act]?.subtitle}"</p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* ═══════════ 3D WEBGL THEATER STAGE ═══════════ */}
          {isStoryPlaying && (
            <div
              className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-[#B59A6C]/35 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#141418] via-[#0E0E12] to-[#08080A]"
              style={{ aspectRatio: '16/10' }}
            >
              <Canvas camera={{ position: [0, 0.5, 4.5], fov: 42 }} gl={{ antialias: true, alpha: true }}>
                <AnimationScene act={act} category={category} />
              </Canvas>

              {/* Act 1 — BIS Hallmark Certification Badge */}
              {act === 1 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#18181B]/90 border border-[#B59A6C] rounded-lg px-4 py-2 shadow-2xl flex items-center gap-3 backdrop-blur-md z-20"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FF8F00] flex items-center justify-center text-[10px] font-bold text-black">✓</div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase block">BIS 916 HALLMARKED</span>
                    <span className="text-[8px] font-mono text-[#B59A6C] block">IGI Laser Verified Purity</span>
                  </div>
                </motion.div>
              )}

              {/* Act 2 — Wax Seal Stamp */}
              {act === 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.4, duration: 0.5 }}
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-20"
                  style={{ background: 'radial-gradient(circle at 35% 35%, #9E1B1B, #5E0B0B)', boxShadow: '0 6px 20px rgba(94,11,11,0.8)' }}
                >
                  <div className="absolute inset-1 rounded-full border border-white/25" />
                  <span className="text-[8px] font-bold text-white tracking-[0.15em]">GLM</span>
                </motion.div>
              )}

              {/* Act 3 — Dispatch stardust particles */}
              {act === 3 && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`dp-${i}`}
                      initial={{ opacity: 0, y: '60%' }}
                      animate={{ opacity: [0, 1, 0], y: '-100%', x: `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}%` }}
                      transition={{ duration: 2, delay: i * 0.06, ease: 'easeOut' }}
                      className="absolute left-1/2 w-2 h-2 rounded-full bg-[#FFD54F]"
                      style={{ boxShadow: '0 0 10px #FFD54F, 0 0 20px #FFB300' }}
                    />
                  ))}
                </div>
              )}

              {/* Skip button */}
              <button
                onClick={() => { setAct(4); try { confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 }, colors: ['#B59A6C', '#E8D5B7', '#D4AF37', '#FFFFFF'] }); } catch (e) { /* */ } }}
                className="absolute bottom-3 right-4 bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg z-30"
              >
                Skip to Details ➔
              </button>
            </div>
          )}

          {/* ═══════════ ORDER CONFIRMATION CARD (ACT 5) ═══════════ */}
          {act >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/70 to-transparent" />

              <div className="flex flex-col items-center mb-5">
                {/* ── MINI 3D PRODUCT CANVAS (replaces product photo) ── */}
                <div
                  className="w-20 h-20 rounded-2xl mb-3 overflow-hidden relative"
                  style={{ background: 'radial-gradient(ellipse at 50% 30%, #2D1420, #1A0D08)', border: '1.5px solid #B59A6C', boxShadow: '0 8px 24px rgba(181,154,108,0.35)' }}
                >
                  <MiniProductCanvas category={category} />
                  <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1.5 -right-1.5 text-sm text-[#D4AF37]">✦</motion.div>
                </div>

                <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[#B59A6C] uppercase block mb-0.5">ORDER CONFIRMED & RESERVED</span>
                <h3 className="text-xl sm:text-2xl text-white mb-1 text-center font-bold">
                  Your {CATEGORY_LABELS[category] || 'Creation'} is in the Atelier
                </h3>
                <p className="text-xs text-gray-300 text-center max-w-sm">
                  Master goldsmiths have initiated creation and hallmark validation for{' '}
                  <strong className="text-white">{productName}</strong>.
                </p>
              </div>

              {/* Order Reference */}
              <div className="bg-black/65 border border-[#B59A6C]/35 rounded-xl p-3 mb-5 max-w-sm mx-auto shadow-inner">
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1 text-center">ORDER REFERENCE NUMBER</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#E8D5B7] tracking-wider">{orderId}</span>
                  <button onClick={handleCopy} className="px-2 py-0.5 bg-[#B59A6C]/25 hover:bg-[#B59A6C]/45 text-[#E8D5B7] text-[10px] font-mono rounded cursor-pointer transition-colors">
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
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] mb-1 font-bold ${s.on ? 'bg-[#B59A6C] text-white shadow-lg' : 'bg-white/8 text-gray-500 border border-white/10'}`}>
                      {s.icon}
                    </div>
                    <span className={`text-[8px] font-mono ${s.on ? 'text-[#E8D5B7] font-bold' : 'text-gray-500'}`}>{s.t}</span>
                  </div>
                ))}
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <button onClick={handleGoToOrder} className="flex-1 py-3.5 bg-[#B59A6C] hover:bg-[#A3885C] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer shadow-xl hover:shadow-2xl">
                  View Order Details
                </button>
                <button onClick={() => { onClose?.(); navigate('/'); }} className="py-3.5 px-5 bg-white/8 hover:bg-white/15 text-gray-300 text-xs font-bold uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer">
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
