import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════
   1. SYNTHESIZED LUXURY WEB AUDIO SYSTEM (Zero External Files)
   ═══════════════════════════════════════════════════════════════════════ */

class LuxuryAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // 528Hz harmonic resonance
      osc.frequency.exponentialRampToValueAtTime(1056, now + 0.8);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {}
  }

  playLaser() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.5);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playLatch() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playWaxSeal() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playCelebration() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.2);
      });
    } catch (e) {}
  }
}

const audioEngine = new LuxuryAudioEngine();

/* ═══════════════════════════════════════════════════════════════════════
   2. CATEGORY DETECTION & METALS
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

const METALS = {
  '24k-gold': { name: '24K Pure Gold', color: '#E6C280', metalness: 0.96, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.02 },
  '18k-rose': { name: '18K Rose Gold', color: '#E8B4A0', metalness: 0.95, roughness: 0.10, clearcoat: 1.0, clearcoatRoughness: 0.03 },
  'platinum': { name: 'Platinum 950', color: '#E5E7EB', metalness: 0.98, roughness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.01 },
  'white-gold': { name: '18K White Gold', color: '#F0F0F5', metalness: 0.97, roughness: 0.06, clearcoat: 1.0, clearcoatRoughness: 0.02 }
};

const DIAMOND_MAT = {
  color: '#FFFFFF',
  transmission: 0.94,
  opacity: 1,
  transparent: true,
  roughness: 0.02,
  ior: 2.42,
  metalness: 0.05,
  clearcoat: 1.0,
  clearcoatRoughness: 0.02,
  reflectivity: 1.0
};

const ACT_SCRIPTS = [
  { badge: 'ACT 1 OF 4 · MASTER BENCH', title: 'THE ARTISAN\'S BENCH', subtitle: 'Handcrafted 24K gold geometry with optical diamond facet brilliance' },
  { badge: 'ACT 2 OF 4 · BIS HALLMARK', title: 'GOVERNMENT BIS 916 HALLMARK', subtitle: 'Microscopic laser beam inscribes legal authenticity & IGI certification' },
  { badge: 'ACT 3 OF 4 · VELVET VAULT', title: 'ITALIAN VELVET VAULT & WAX SEAL', subtitle: 'Docked in custom-tailored plush cushion, silk ribbon & 24K crimson wax crest' },
  { badge: 'ACT 4 OF 4 · DISPATCH', title: 'INSURED ARMORED DISPATCH', subtitle: 'Enclosed in Glimmr gift carrier for priority concierge delivery' },
];

/* ═══════════════════════════════════════════════════════════════════════
   3. ULTRA-DETAILED 3D PRODUCT GEOMETRIES (Procedural Three.js)
   ═══════════════════════════════════════════════════════════════════════ */

/* ── 💍 ULTRA RING: Dual-layer shank + 16 micro-pave diamonds + 6-prong crown ── */
function UltraRing3D({ metal = METALS['24k-gold'] }) {
  return (
    <group>
      {/* Main Comfort-Fit Torus Band */}
      <mesh>
        <torusGeometry args={[1.05, 0.16, 40, 80]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>

      {/* Inner Comfort-Fit Bevel */}
      <mesh>
        <torusGeometry args={[0.96, 0.06, 24, 60]} />
        <meshPhysicalMaterial {...metal} roughness={0.18} />
      </mesh>

      {/* Cathedral Arch Shoulders */}
      {[-1, 1].map((dir) => (
        <group key={`arch-${dir}`} position={[dir * 0.42, 0.85, 0]} rotation={[0, 0, dir * -0.35]}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.14, 0.45, 16]} />
            <meshPhysicalMaterial {...metal} />
          </mesh>
        </group>
      ))}

      {/* 16 Micro-Pave Diamonds along the Shank Shoulders */}
      {[-1, 1].map((side) =>
        [0.2, 0.35, 0.5, 0.65, 0.8].map((angle, i) => {
          const x = side * Math.sin(angle) * 1.08;
          const y = Math.cos(angle) * 1.08;
          return (
            <group key={`pave-${side}-${i}`} position={[x, y, 0]}>
              <mesh position={[0, 0, 0.12]}>
                <sphereGeometry args={[0.032, 10, 10]} />
                <meshPhysicalMaterial {...DIAMOND_MAT} />
              </mesh>
              <mesh position={[0, 0, -0.12]}>
                <sphereGeometry args={[0.032, 10, 10]} />
                <meshPhysicalMaterial {...DIAMOND_MAT} />
              </mesh>
            </group>
          );
        })
      )}

      {/* 6 Tapered Claws (Prongs) */}
      {[...Array(6)].map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={`claw-${i}`}
            position={[Math.cos(a) * 0.32, 1.25, Math.sin(a) * 0.32]}
            rotation={[Math.sin(a) * 0.1, a, Math.cos(a) * -0.1]}
          >
            <cylinderGeometry args={[0.03, 0.05, 0.45, 16]} />
            <meshPhysicalMaterial {...metal} />
          </mesh>
        );
      })}

      {/* Brilliant Round Solitaire Diamond */}
      <group position={[0, 1.42, 0]}>
        {/* Table & Crown Facets */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.32, 0.52, 0.22, 16, 1]} />
          <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
        </mesh>
        {/* Girdle Rim */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.05, 16, 1]} />
          <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
        </mesh>
        {/* Pavilion Cone to Culet */}
        <mesh position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.52, 0.38, 16, 1]} />
          <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
        </mesh>
      </group>

      {/* Sparkling Stardust */}
      <Sparkles count={18} scale={2.8} size={2.5} speed={0.6} color="#FFD700" />
    </group>
  );
}

/* ── 📿 ULTRA NECKLACE: Catenary gold rope chain + floral halo cluster pendant ── */
function UltraNecklace3D({ metal = METALS['24k-gold'] }) {
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(t) * 1.35, -Math.sin(t) * 1.05 + 0.65, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <group>
      {/* 3D Interlocking Rope Chain */}
      <mesh>
        <tubeGeometry args={[curve, 80, 0.032, 12, false]} />
        <meshPhysicalMaterial {...metal} roughness={0.2} />
      </mesh>

      {/* Bail Mount Ring */}
      <mesh position={[0, -0.42, 0]}>
        <torusGeometry args={[0.1, 0.028, 12, 24]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>

      {/* Floral Diamond Halo Cluster Pendant */}
      <group position={[0, -0.8, 0]}>
        {/* Central Pear-Cut Diamond */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26, 0.42, 12]} />
          <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
        </mesh>
        {/* Halo Surround of 8 Micro Diamonds */}
        {[...Array(8)].map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={`halo-${i}`} position={[Math.cos(a) * 0.32, Math.sin(a) * 0.28, 0]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshPhysicalMaterial {...DIAMOND_MAT} />
            </mesh>
          );
        })}
        {/* Droplet Sparkle Accent */}
        <mesh position={[0, -0.32, 0]}>
          <octahedronGeometry args={[0.1, 1]} />
          <meshPhysicalMaterial {...DIAMOND_MAT} />
        </mesh>
      </group>

      <Sparkles count={22} scale={2.4} position={[0, -0.7, 0]} size={2.5} speed={0.4} color="#FFD700" />
    </group>
  );
}

/* ── 💎 ULTRA EARRINGS: Chandelier drop earrings with huggie hoop & briolette gems ── */
function UltraEarring3D({ metal = METALS['24k-gold'] }) {
  return (
    <group>
      {[-0.7, 0.7].map((x, idx) => (
        <group key={`earring-${idx}`} position={[x, 0.1, 0]}>
          {/* Huggie Hoop with Pave Diamonds */}
          <mesh>
            <torusGeometry args={[0.24, 0.03, 16, 32, Math.PI * 1.2]} />
            <meshPhysicalMaterial {...metal} />
          </mesh>
          {[-0.15, 0, 0.15].map((off, i) => (
            <mesh key={`hp-${i}`} position={[off, 0.22, 0.03]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshPhysicalMaterial {...DIAMOND_MAT} />
            </mesh>
          ))}

          {/* Articulated Filigree Connector */}
          <mesh position={[0, -0.22, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshPhysicalMaterial {...metal} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <torusGeometry args={[0.06, 0.015, 8, 16]} />
            <meshPhysicalMaterial {...metal} />
          </mesh>

          {/* Faceted Teardrop Briolette Diamond Drop */}
          <group position={[0, -0.65, 0]}>
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.18, 0.44, 12]} />
              <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
            </mesh>
          </group>
        </group>
      ))}
      <Sparkles count={20} scale={3.0} size={2.5} speed={0.5} color="#FFD700" />
    </group>
  );
}

/* ── ⌚ ULTRA BRACELET: Articulated tennis bracelet with 18 bezel-set diamonds ── */
function UltraBracelet3D({ metal = METALS['24k-gold'] }) {
  return (
    <group rotation={[Math.PI / 2.6, 0, 0]}>
      {/* Solid Polished Gold Bangle Rim */}
      <mesh>
        <torusGeometry args={[1.08, 0.09, 32, 80]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>

      {/* 18 Articulated Bezel-Set Brilliant Diamonds */}
      {[...Array(18)].map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const x = Math.cos(a) * 1.08;
        const y = Math.sin(a) * 1.08;
        return (
          <group key={`bez-${i}`} position={[x, y, 0]} rotation={[0, 0, a]}>
            {/* Bezel Collar */}
            <mesh>
              <cylinderGeometry args={[0.075, 0.075, 0.14, 12]} />
              <meshPhysicalMaterial {...metal} />
            </mesh>
            {/* Inset Solitaire Diamond */}
            <mesh position={[0, 0, 0.05]}>
              <octahedronGeometry args={[0.065, 1]} />
              <meshPhysicalMaterial {...DIAMOND_MAT} flatShading={true} />
            </mesh>
          </group>
        );
      })}

      {/* Concealed Safety Clasp with Gold Screw Motif */}
      <group position={[1.08, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.18, 0.14, 0.14]} />
          <meshPhysicalMaterial {...metal} roughness={0.15} />
        </mesh>
      </group>
      <Sparkles count={24} scale={3.2} size={2.2} speed={0.5} color="#FFD700" />
    </group>
  );
}

/* ── 🕐 ULTRA WATCH: Fluted 24K bezel + chronograph sub-dials + jubilee bracelet ── */
function UltraWatch3D({ metal = METALS['24k-gold'] }) {
  const secondsRef = useRef();

  useFrame((_, d) => {
    if (secondsRef.current) {
      secondsRef.current.rotation.z -= d * 1.8;
    }
  });

  return (
    <group>
      {/* Watch Case Shell */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.14, 36]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>

      {/* Fluted Gold Bezel (48 scalloped facets) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.045, 12, 48]} />
        <meshPhysicalMaterial {...metal} roughness={0.04} />
      </mesh>

      {/* Sunburst Black Sapphire Crystal Dial */}
      <mesh position={[0, 0, 0.076]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.01, 36]} />
        <meshPhysicalMaterial color="#0A0A10" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* 12 Diamond Hour Baton Indices */}
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r = 0.44;
        return (
          <mesh key={`ind-${i}`} position={[Math.cos(a) * r, Math.sin(a) * r, 0.084]}>
            <boxGeometry args={[0.016, i % 3 === 0 ? 0.08 : 0.045, 0.012]} />
            <meshStandardMaterial color="#E6C280" emissive="#E6C280" emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        );
      })}

      {/* 3 Chronograph Sub-Dials */}
      {[
        { x: -0.2, y: 0 },
        { x: 0.2, y: 0 },
        { x: 0, y: -0.22 },
      ].map((sub, i) => (
        <group key={`sub-${i}`} position={[sub.x, sub.y, 0.082]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.005, 20]} />
            <meshStandardMaterial color="#16161F" metalness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, i * 1.2]}>
            <boxGeometry args={[0.008, 0.09, 0.005]} />
            <meshStandardMaterial color="#E6C280" />
          </mesh>
        </group>
      ))}

      {/* Hour & Minute Hands */}
      <mesh position={[0.03, 0.06, 0.088]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.022, 0.22, 0.008]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[-0.02, 0.08, 0.09]} rotation={[0, 0, -Math.PI / 3]}>
        <boxGeometry args={[0.016, 0.32, 0.008]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>

      {/* Sweeping Golden Second Hand */}
      <mesh ref={secondsRef} position={[0, 0, 0.092]}>
        <boxGeometry args={[0.008, 0.42, 0.005]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.096]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>

      {/* Crown Button */}
      <mesh position={[0.68, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.04, 0.12, 16]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>

      {/* Segmented Jubilee Bracelet Links */}
      {[-1, 1].map((dir) =>
        [...Array(5)].map((_, i) => (
          <group key={`jub-${dir}-${i}`} position={[0, dir * (0.76 + i * 0.18), -0.02]}>
            <mesh>
              <boxGeometry args={[0.42, 0.14, 0.06]} />
              <meshPhysicalMaterial {...metal} roughness={0.12} />
            </mesh>
            <mesh position={[0, 0, 0.015]}>
              <boxGeometry args={[0.2, 0.14, 0.06]} />
              <meshPhysicalMaterial {...metal} roughness={0.03} />
            </mesh>
          </group>
        ))
      )}
      <Sparkles count={20} scale={2.6} size={2.2} speed={0.5} color="#FFD700" />
    </group>
  );
}

/* ── PRODUCT SELECTOR ── */
function UltraProductModel3D({ category, metal }) {
  switch (category) {
    case 'necklace': return <UltraNecklace3D metal={metal} />;
    case 'earring':  return <UltraEarring3D metal={metal} />;
    case 'bracelet': return <UltraBracelet3D metal={metal} />;
    case 'watch':    return <UltraWatch3D metal={metal} />;
    default:         return <UltraRing3D metal={metal} />;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   4. TAILORED 3D VAULT PACKAGING & INTERIORS
   ═══════════════════════════════════════════════════════════════════════ */

const BOX_DIMENSIONS = {
  ring:     { w: 1.7, d: 1.7, h: 0.95, lidH: 0.28 },
  necklace: { w: 2.9, d: 2.1, h: 0.70, lidH: 0.22 },
  earring:  { w: 1.9, d: 1.5, h: 0.80, lidH: 0.24 },
  bracelet: { w: 2.3, d: 2.3, h: 0.85, lidH: 0.25 },
  watch:    { w: 2.5, d: 2.5, h: 0.95, lidH: 0.28 },
};

function UltraJewelryBox3D({ category, lidRef }) {
  const c = BOX_DIMENSIONS[category] || BOX_DIMENSIONS.ring;

  return (
    <group>
      {/* ── 1. LOWER SHELL (Italian Burgundy Velvet) ── */}
      <mesh position={[0, c.h / 4, 0]}>
        <boxGeometry args={[c.w, c.h / 2, c.d]} />
        <meshPhysicalMaterial color="#4A0E17" roughness={0.88} metalness={0.04} clearcoat={0.12} />
      </mesh>

      {/* Gold Trim Filigree Band */}
      <mesh position={[0, c.h / 2 + 0.01, 0]}>
        <boxGeometry args={[c.w + 0.04, 0.02, c.d + 0.04]} />
        <meshPhysicalMaterial color="#E6C280" metalness={0.96} roughness={0.08} />
      </mesh>

      {/* 4 Gold Corner Filigree Brackets */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`c-${x}-${z}`} position={[x * (c.w / 2), c.h / 4, z * (c.d / 2)]}>
            <boxGeometry args={[0.06, c.h / 2, 0.06]} />
            <meshPhysicalMaterial color="#E6C280" metalness={0.96} roughness={0.08} />
          </mesh>
        ))
      )}

      {/* ── 2. TAILORED PLUSH INTERIOR SLOTS ── */}
      <group position={[0, c.h / 2 - 0.02, 0]}>
        {/* Main Tufted Satin Base Cushion */}
        <mesh>
          <boxGeometry args={[c.w * 0.84, 0.08, c.d * 0.84]} />
          <meshStandardMaterial color="#E8D5B7" roughness={0.35} />
        </mesh>

        {/* Ring: Vertical Velvet Slit */}
        {category === 'ring' && (
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.08]} />
            <meshBasicMaterial color="#1E0508" />
          </mesh>
        )}

        {/* Necklace: Slanted Neck-Bust Pad */}
        {category === 'necklace' && (
          <mesh position={[0, 0.05, 0]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.7, 0.06, 16]} />
            <meshStandardMaterial color="#DDC29B" roughness={0.4} />
          </mesh>
        )}

        {/* Earrings: Twin Pierced Velvet Pads */}
        {category === 'earring' && (
          <group position={[0, 0.05, 0]}>
            <mesh position={[-0.35, 0, 0]}>
              <boxGeometry args={[0.3, 0.03, 0.5]} />
              <meshStandardMaterial color="#DDC29B" />
            </mesh>
            <mesh position={[0.35, 0, 0]}>
              <boxGeometry args={[0.3, 0.03, 0.5]} />
              <meshStandardMaterial color="#DDC29B" />
            </mesh>
          </group>
        )}

        {/* Bracelet / Watch: Padded Cylinder Roll Cushion */}
        {(category === 'bracelet' || category === 'watch') && (
          <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, c.w * 0.65, 20]} />
            <meshStandardMaterial color="#DDC29B" roughness={0.3} />
          </mesh>
        )}
      </group>

      {/* ── 3. HINGED LID (Opens on rear brass piano hinge) ── */}
      <group ref={lidRef} position={[0, c.h / 2, -c.d / 2]}>
        <mesh position={[0, c.lidH / 2, c.d / 2]}>
          <boxGeometry args={[c.w, c.lidH, c.d]} />
          <meshPhysicalMaterial color="#4A0E17" roughness={0.88} metalness={0.04} clearcoat={0.12} />
        </mesh>
        {/* Gold Filigree Ribbon Embossing on Lid */}
        <mesh position={[0, c.lidH + 0.006, c.d / 2]}>
          <boxGeometry args={[c.w * 0.35, 0.012, c.d * 0.35]} />
          <meshPhysicalMaterial color="#E6C280" metalness={0.96} roughness={0.08} />
        </mesh>
        {/* Royal 24K Monogram Seal */}
        <mesh position={[0, c.lidH + 0.016, c.d / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.01, 20]} />
          <meshPhysicalMaterial color="#E6C280" metalness={0.98} roughness={0.04} />
        </mesh>
      </group>

      {/* Base Plate */}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[c.w + 0.06, 0.02, c.d + 0.06]} />
        <meshPhysicalMaterial color="#200306" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5. CINEMATIC CAMERA & SCENE ORCHESTRATION
   ═══════════════════════════════════════════════════════════════════════ */

function MasterAtelierScene({ act, category, metal }) {
  const { camera } = useThree();
  const productRef = useRef();
  const boxLidRef = useRef();
  const boxGroupRef = useRef();
  const laserRef = useRef();
  const actTimesRef = useRef({});

  useFrame((state, delta) => {
    const clock = state.clock.elapsedTime;
    if (actTimesRef.current[act] === undefined) actTimesRef.current[act] = clock;
    const at = clock - actTimesRef.current[act];

    /* ── DYNAMIC CAMERA CHOREOGRAPHY ── */
    if (act === 0) {
      // Act 0: 360° orbiting glide
      const targetPos = new THREE.Vector3(
        Math.sin(clock * 0.45) * 1.2,
        0.35 + Math.cos(clock * 0.3) * 0.15,
        3.8
      );
      camera.position.lerp(targetPos, delta * 3);
      camera.lookAt(0, 0.1, 0);
    } else if (act === 1) {
      // Act 1: Macro zoom for laser hallmarking
      const targetPos = new THREE.Vector3(0, 0.15, 2.4);
      camera.position.lerp(targetPos, delta * 4);
      camera.lookAt(0, 0.15, 0);
    } else if (act === 2) {
      // Act 2: High-angle presentation view
      const targetPos = new THREE.Vector3(0, 1.4, 3.4);
      camera.position.lerp(targetPos, delta * 3.5);
      camera.lookAt(0, -0.3, 0);
    } else if (act === 3) {
      // Act 3: Dramatic transit pull-back
      const targetPos = new THREE.Vector3(0, 0.6, 4.6);
      camera.position.lerp(targetPos, delta * 2.5);
      camera.lookAt(0, 0.2, 0);
    }

    /* ── PRODUCT DOCKING PHYSICS ── */
    if (productRef.current) {
      productRef.current.rotation.y += delta * 0.55;

      if (act <= 1) {
        productRef.current.position.y = Math.sin(clock * 1.4) * 0.08;
        productRef.current.scale.setScalar(
          THREE.MathUtils.lerp(productRef.current.scale.x, 1, delta * 4)
        );
      } else if (act === 2) {
        // Smooth descent into velvet slot
        if (at > 0.6 && at < 2.0) {
          const p = (at - 0.6) / 1.4;
          const e = p * p * (3 - 2 * p);
          productRef.current.position.y = THREE.MathUtils.lerp(0, -1.35, e);
          productRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.52, e));
        } else if (at >= 2.0) {
          productRef.current.position.y = -1.35;
          productRef.current.scale.setScalar(0.52);
        }
      }
    }

    /* ── BOX LID HINGE MECHANICS ── */
    if (boxLidRef.current) {
      const boxAt = clock - (actTimesRef.current[2] ?? clock);
      const target = (act === 2 && boxAt < 2.4) ? -1.95 : 0;
      boxLidRef.current.rotation.x = THREE.MathUtils.lerp(
        boxLidRef.current.rotation.x, target, delta * 5
      );
    }

    /* ── LASER BEAM (ACT 1) ── */
    if (laserRef.current && act === 1) {
      const t = (at % 1.6) / 1.6;
      laserRef.current.scale.x = t;
    }

    /* ── ARMORED TRANSIT LAUNCH (ACT 3) ── */
    if (boxGroupRef.current && act === 3) {
      boxGroupRef.current.position.y += delta * 2.2;
      const s = Math.max(0.01, boxGroupRef.current.scale.x - delta * 0.32);
      boxGroupRef.current.scale.setScalar(s);
    }
  });

  return (
    <Suspense fallback={null}>
      {/* Multi-Point Studio Lighting Rig */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]} intensity={2.2} color="#FFF8E7" />
      <pointLight position={[-5, 4, -4]} intensity={1.4} color="#B59A6C" />
      <pointLight position={[3, -2, 4]} intensity={0.9} color="#E8D5B7" />

      <Environment preset="city" />

      {/* 3D Product */}
      {act <= 2 && (
        <group ref={productRef}>
          <UltraProductModel3D category={category} metal={metal} />
        </group>
      )}

      {/* Floating Stardust Particles */}
      {act <= 1 && <Sparkles count={40} scale={4.5} size={3} speed={0.6} color="#FFD700" />}

      {/* Laser Hallmark Inscription Beam */}
      {act === 1 && (
        <group position={[0, 0.15, 0.55]}>
          <mesh ref={laserRef}>
            <boxGeometry args={[1.8, 0.008, 0.008]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={10} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#FFF" emissive="#00E5FF" emissiveIntensity={14} toneMapped={false} />
          </mesh>
          {/* Thermal Ember Sparks */}
          {[...Array(8)].map((_, i) => (
            <mesh key={`spark-${i}`} position={[(Math.random() - 0.5) * 0.35, -0.1 - Math.random() * 0.3, 0.55 + (Math.random() - 0.5) * 0.2]}>
              <sphereGeometry args={[0.014, 6, 6]} />
              <meshStandardMaterial color="#FFD54F" emissive="#FFD54F" emissiveIntensity={6} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}

      {/* 3D Velvet Vault */}
      {act >= 2 && act <= 3 && (
        <group ref={boxGroupRef} position={[0, -1.8, 0]}>
          <UltraJewelryBox3D category={category} lidRef={boxLidRef} />
        </group>
      )}

      {/* Post-Processing Pipeline */}
      <EffectComposer>
        <Bloom intensity={0.75} luminanceThreshold={0.88} mipmapBlur />
        <Vignette darkness={0.38} offset={0.28} />
      </EffectComposer>
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6. INTERACTIVE 3D VIEWER ON CONFIRMATION (360° Orbit + Metal Switcher)
   ═══════════════════════════════════════════════════════════════════════ */

function InteractiveProductViewer({ category, selectedMetal }) {
  return (
    <Canvas
      camera={{ position: [0, 0.35, category === 'watch' ? 4.2 : 3.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 5, 4]} intensity={1.8} color="#FFF8E7" />
      <pointLight position={[-3, -2, 3]} intensity={0.9} color="#B59A6C" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.25}>
          <UltraProductModel3D category={category} metal={selectedMetal} />
        </Float>
      </Suspense>
      <OrbitControls enablePan={false} minDistance={2.0} maxDistance={5.5} autoRotate autoRotateSpeed={0.8} />
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7. MAIN MODAL COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

const JewelryOrderStoryModal = ({ isOpen, orderData, onClose }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [act, setAct] = useState(0);
  const [muted, setMuted] = useState(false);
  const [selectedMetalKey, setSelectedMetalKey] = useState('24k-gold');

  const category = useMemo(() => detectCategory(orderData), [orderData]);
  const selectedMetal = METALS[selectedMetalKey] || METALS['24k-gold'];

  const orderId =
    orderData?._id || orderData?.orderId || orderData?.id ||
    `GLM-${Math.floor(100000 + Math.random() * 900000)}`;
  const firstItem = orderData?.items?.[0] || orderData?.orderItems?.[0] || {};
  const productObj = firstItem.product || firstItem;
  const productName = productObj.name || firstItem.name || 'Glimmr Royal Creation';

  // Toggle Audio
  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    audioEngine.muted = newMuted;
  };

  /* ── Master Act Timeline with Synchronized Sound FX ── */
  useEffect(() => {
    if (!isOpen) {
      setAct(0);
      return;
    }

    audioEngine.init();
    audioEngine.playChime();

    const t1 = setTimeout(() => {
      setAct(1); // Act 2: Laser Hallmark
      audioEngine.playLaser();
    }, 3000);

    const t2 = setTimeout(() => {
      setAct(2); // Act 3: Velvet Vault Encapsulation
      audioEngine.playLatch();
      setTimeout(() => audioEngine.playWaxSeal(), 2200);
    }, 5600);

    const t3 = setTimeout(() => {
      setAct(3); // Act 4: Armored Dispatch
      audioEngine.playChime();
    }, 8600);

    const t4 = setTimeout(() => {
      setAct(4); // Act 5: Order Confirmation
      audioEngine.playCelebration();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#B59A6C', '#E8D5B7', '#D4AF37', '#FFFFFF'],
        });
      } catch (e) {}
    }, 11200);

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-b from-[#B59A6C]/20 via-[#B59A6C]/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/4 w-[450px] h-[350px] bg-[#8B1A1A]/10 rounded-full blur-[110px]" />
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          className="absolute top-5 right-5 z-50 bg-[#18181B]/80 hover:bg-[#18181B] border border-[#B59A6C]/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 cursor-pointer backdrop-blur-md transition-all shadow-lg"
        >
          <span>{muted ? '🔇 Sound Off' : '🔊 Sound On'}</span>
        </button>

        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center z-10">

          {/* ═══════════ LIVE SCRIPT HUD ═══════════ */}
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
                      {ACT_SCRIPTS[act]?.badge}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-wider uppercase">
                    {ACT_SCRIPTS[act]?.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 max-w-md text-center mt-0.5 italic">
                    "{ACT_SCRIPTS[act]?.subtitle}"
                  </p>
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
              <Canvas camera={{ position: [0, 0.35, 3.8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
                <MasterAtelierScene act={act} category={category} metal={selectedMetal} />
              </Canvas>

              {/* Act 1 — Holographic BIS Hallmark 916 Badge */}
              {act === 1 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#18181B]/90 border border-[#B59A6C] rounded-lg px-4 py-2 shadow-2xl flex items-center gap-3 backdrop-blur-md z-20"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FF8F00] flex items-center justify-center text-[10px] font-bold text-black">
                    ✓
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase block">
                      BIS 916 HALLMARKED
                    </span>
                    <span className="text-[8px] font-mono text-[#B59A6C] block">
                      IGI Laser Verified Purity
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Act 2 — Molten 24K Wax Seal Stamp */}
              {act === 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-20"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #9E1B1B, #5E0B0B)',
                    boxShadow: '0 6px 20px rgba(94,11,11,0.85)',
                  }}
                >
                  <div className="absolute inset-1 rounded-full border border-white/25" />
                  <span className="text-[8px] font-bold text-white tracking-[0.15em]">GLM</span>
                </motion.div>
              )}

              {/* Act 3 — Golden Stardust Dispatch Shower */}
              {act === 3 && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={`dp-${i}`}
                      initial={{ opacity: 0, y: '70%' }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: '-110%',
                        x: `${(i % 2 === 0 ? 1 : -1) * (12 + i * 4)}%`,
                      }}
                      transition={{ duration: 2.2, delay: i * 0.05, ease: 'easeOut' }}
                      className="absolute left-1/2 w-2 h-2 rounded-full bg-[#FFD54F]"
                      style={{ boxShadow: '0 0 10px #FFD54F, 0 0 20px #FFB300' }}
                    />
                  ))}
                </div>
              )}

              {/* Skip Button */}
              <button
                onClick={() => {
                  setAct(4);
                  audioEngine.playCelebration();
                  try {
                    confetti({
                      particleCount: 90,
                      spread: 80,
                      origin: { y: 0.6 },
                      colors: ['#B59A6C', '#E8D5B7', '#D4AF37', '#FFFFFF'],
                    });
                  } catch (e) {}
                }}
                className="absolute bottom-3 right-4 bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg z-30"
              >
                Skip to Details ➔
              </button>
            </div>
          )}

          {/* ═══════════ ORDER CONFIRMATION CARD WITH 3D INSPECTION (ACT 5) ═══════════ */}
          {act >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="w-full bg-[#121215]/95 border border-[#B59A6C]/40 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B59A6C]/70 to-transparent" />

              <div className="flex flex-col items-center mb-5">
                {/* ── INTERACTIVE 3D PRODUCT INSPECTOR CANVAS ── */}
                <div
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl mb-3 overflow-hidden relative cursor-grab active:cursor-grabbing"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 30%, #2D1420, #1A0D08)',
                    border: '1.5px solid #B59A6C',
                    boxShadow: '0 8px 24px rgba(181,154,108,0.35)',
                  }}
                >
                  <InteractiveProductViewer category={category} selectedMetal={selectedMetal} />
                  <div className="absolute bottom-1.5 inset-x-0 text-center pointer-events-none">
                    <span className="text-[7px] font-mono text-gray-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                      DRAG TO ROTATE 360°
                    </span>
                  </div>
                </div>

                {/* Metal Switcher for Live 3D Inspection */}
                <div className="flex gap-1.5 mb-3">
                  {Object.entries(METALS).map(([k, m]) => (
                    <button
                      key={k}
                      onClick={() => setSelectedMetalKey(k)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold transition-all cursor-pointer ${
                        selectedMetalKey === k
                          ? 'bg-[#B59A6C] text-white shadow-md'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {m.name.split(' ')[0]}
                    </button>
                  ))}
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

              {/* Order Reference */}
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
                  className="flex-1 py-3.5 bg-[#B59A6C] hover:bg-[#A3885C] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer shadow-xl hover:shadow-2xl"
                >
                  View Order Details
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
