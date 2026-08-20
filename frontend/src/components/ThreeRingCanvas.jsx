import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// Metal properties with studio polish reflectivity
const METAL_MATERIALS = {
  '24k-gold': { color: '#FFD700', metalness: 1.0, roughness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.02 },
  '22k-gold': { color: '#DAA520', metalness: 1.0, roughness: 0.06, clearcoat: 1.0, clearcoatRoughness: 0.04 },
  '18k-rose': { color: '#E8B4A0', metalness: 1.0, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.02 },
  'platinum': { color: '#F0F0F5', metalness: 1.0, roughness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.01 },
  '925-silver': { color: '#E6E6EE', metalness: 0.95, roughness: 0.10, clearcoat: 0.9, clearcoatRoughness: 0.05 },
};

// Gemstone properties with physical light transmission & refractive index
const GEM_MATERIALS = {
  'vvs-diamond': { color: '#FFFFFF', transmission: 0.98, opacity: 1.0, roughness: 0.0, ior: 2.42, thickness: 1.2, dispersion: 0.05 },
  'emerald': { color: '#00A86B', transmission: 0.88, opacity: 1.0, roughness: 0.02, ior: 1.57, thickness: 1.0, dispersion: 0.02 },
  'sapphire': { color: '#0F52BA', transmission: 0.85, opacity: 1.0, roughness: 0.02, ior: 1.77, thickness: 1.0, dispersion: 0.03 },
  'ruby': { color: '#E0115F', transmission: 0.85, opacity: 1.0, roughness: 0.02, ior: 1.77, thickness: 1.0, dispersion: 0.03 },
};

// Generate Parametric Heart Curve Points in 2D
function generateHeartPoints(scale = 0.35, count = 32) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const x = scale * 16 * Math.pow(Math.sin(t), 3) * 0.035;
    const y = scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.035;
    points.push({ x, y });
  }
  return points;
}

// ─── 3D ENTWINED DUAL HEARTS MOTIF COMPONENT ──────────────────
function EntwinedHeartsMotif({ primaryColor = '#DAA520', accentColor = '#F0F0F5', scale = 1.0 }) {
  const heart1Points = useMemo(() => generateHeartPoints(scale * 0.95, 20), [scale]);
  const heart2Points = useMemo(() => generateHeartPoints(scale * 0.85, 24), [scale]);

  return (
    <group position={[0, 0.22, 0.04]} rotation={[0.2, 0, 0]}>
      
      {/* 1. PRIMARY UPPER HEART (Diamond Pavé Encrusted Outline) */}
      <group position={[-0.12, 0.15, 0.06]} rotation={[0, 0, 0.15]}>
        {/* Metal Base Wire */}
        {heart1Points.map((pt, i) => {
          const nextPt = heart1Points[(i + 1) % heart1Points.length];
          const mx = (pt.x + nextPt.x) / 2;
          const my = (pt.y + nextPt.y) / 2;
          const dx = nextPt.x - pt.x;
          const dy = nextPt.y - pt.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          return (
            <mesh key={`h1-seg-${i}`} position={[mx, my, 0]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.022, 0.022, len, 8]} />
              <meshPhysicalMaterial color={accentColor} metalness={1.0} roughness={0.05} />
            </mesh>
          );
        })}

        {/* 16 Pavé Micro-Diamonds Encrusted along Heart 1 */}
        {heart1Points.filter((_, idx) => idx % 1 === 0).map((pt, i) => (
          <mesh key={`h1-gem-${i}`} position={[pt.x, pt.y, 0.025]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} reflectivity={1.0} />
          </mesh>
        ))}
      </group>

      {/* 2. SECONDARY LOWER INTERLOCKING HEART (Polished White Gold / Platinum) */}
      <group position={[0.08, -0.05, -0.02]} rotation={[0, 0, -0.2]}>
        {heart2Points.map((pt, i) => {
          const nextPt = heart2Points[(i + 1) % heart2Points.length];
          const mx = (pt.x + nextPt.x) / 2;
          const my = (pt.y + nextPt.y) / 2;
          const dx = nextPt.x - pt.x;
          const dy = nextPt.y - pt.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          return (
            <mesh key={`h2-seg-${i}`} position={[mx, my, 0]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.035, 0.035, len, 12]} />
              <meshPhysicalMaterial color={accentColor} metalness={1.0} roughness={0.03} clearcoat={1.0} />
            </mesh>
          );
        })}
      </group>

      {/* Under-Gallery Structural Welding Pin */}
      <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 12]} />
        <meshPhysicalMaterial color={primaryColor} metalness={1.0} roughness={0.06} />
      </mesh>
    </group>
  );
}

// ─── 3D INFINITY LOOP MOTIF COMPONENT ─────────────────────────
function InfinityLoopMotif({ metalColor, scale = 1.0 }) {
  return (
    <group position={[0, 0.22, 0]} rotation={[0.2, 0, 0]} scale={[scale, scale, scale]}>
      {[-0.22, 0.22].map((xOffset, idx) => (
        <group key={`inf-${idx}`} position={[xOffset, 0, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.22, 0.045, 16, 32]} />
            <meshPhysicalMaterial color={metalColor} metalness={1.0} roughness={0.04} />
          </mesh>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={`inf-gem-${idx}-${i}`} position={[Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0.03]}>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// ─── 3D LOTUS / FLORAL BLOOM MOTIF ────────────────────────────
function LotusBloomMotif({ metalColor, scale = 1.0, gemProps }) {
  return (
    <group position={[0, 0.20, 0]} scale={[scale, scale, scale]}>
      {/* 6 Sculpted Gold Petals */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={`petal-${i}`} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.30, 0]} rotation={[0.3, 0, 0]}>
              <coneGeometry args={[0.12, 0.32, 8]} />
              <meshPhysicalMaterial color={metalColor} metalness={1.0} roughness={0.04} />
            </mesh>
          </group>
        );
      })}
      {/* Center Solitaire Gem */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial
          color={gemProps?.color || '#FFFFFF'}
          transmission={gemProps?.transmission || 0.98}
          roughness={gemProps?.roughness || 0.0}
          ior={gemProps?.ior || 2.42}
        />
      </mesh>
    </group>
  );
}

// ─── 3D TOI ET MOI (TWIN GEMSTONE BYPASS) MOTIF ───────────────
function ToiEtMoiMotif({ metalColor, scale = 1.0 }) {
  return (
    <group position={[0, 0.20, 0]} scale={[scale, scale, scale]}>
      {/* Gem 1: Pear Teardrop */}
      <group position={[-0.22, 0.08, 0]} rotation={[0, 0, 0.35]}>
        <mesh>
          <coneGeometry args={[0.26, 0.44, 16]} />
          <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.28, 0.18, 0.12, 16]} />
          <meshPhysicalMaterial color={metalColor} metalness={1.0} roughness={0.04} />
        </mesh>
      </group>

      {/* Gem 2: Emerald Cut / Oval Gem */}
      <group position={[0.22, -0.08, 0]} rotation={[0, 0, -0.35]}>
        <mesh>
          <boxGeometry args={[0.36, 0.48, 0.28]} />
          <meshPhysicalMaterial color="#00A86B" transmission={0.88} opacity={1.0} roughness={0.02} ior={1.57} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.28, 0.18, 0.12, 16]} />
          <meshPhysicalMaterial color={metalColor} metalness={1.0} roughness={0.04} />
        </mesh>
      </group>
    </group>
  );
}

// ─── FACETED GEMSTONE 3D COMPONENT ────────────────────────────
function FacetedGemstone({ cutId, scale, gemProps }) {
  const scaleVec = useMemo(() => {
    switch (cutId) {
      case 'emerald-cut':
        return [scale * 1.25, scale * 0.9, scale * 0.85];
      case 'princess':
        return [scale * 0.95, scale * 0.95, scale * 0.95];
      case 'oval':
        return [scale * 1.3, scale * 0.9, scale * 0.9];
      case 'cushion':
        return [scale * 1.1, scale * 0.9, scale * 1.1];
      case 'pear':
        return [scale * 0.9, scale * 1.2, scale * 0.85];
      default:
        return [scale, scale, scale];
    }
  }, [cutId, scale]);

  return (
    <group scale={scaleVec}>
      {/* Crown & Table Facets */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.32, 0.52, 0.28, cutId === 'princess' ? 4 : cutId === 'emerald-cut' || cutId === 'cushion' ? 8 : 16, 1]} />
        <meshPhysicalMaterial
          color={gemProps.color}
          transmission={gemProps.transmission}
          opacity={gemProps.opacity}
          transparent={true}
          roughness={gemProps.roughness}
          ior={gemProps.ior}
          thickness={gemProps.thickness}
          reflectivity={1.0}
          clearcoat={1.0}
          flatShading={true}
        />
      </mesh>

      {/* Girdle Rim */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.06, cutId === 'princess' ? 4 : cutId === 'emerald-cut' || cutId === 'cushion' ? 8 : 16, 1]} />
        <meshPhysicalMaterial
          color={gemProps.color}
          transmission={gemProps.transmission}
          opacity={gemProps.opacity}
          transparent={true}
          roughness={gemProps.roughness}
          ior={gemProps.ior}
          thickness={gemProps.thickness}
          reflectivity={1.0}
          clearcoat={1.0}
          flatShading={true}
        />
      </mesh>

      {/* Pavilion Facets */}
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.52, 0.44, cutId === 'princess' ? 4 : cutId === 'emerald-cut' || cutId === 'cushion' ? 8 : 16, 1]} />
        <meshPhysicalMaterial
          color={gemProps.color}
          transmission={gemProps.transmission}
          opacity={gemProps.opacity}
          transparent={true}
          roughness={gemProps.roughness}
          ior={gemProps.ior}
          thickness={gemProps.thickness}
          reflectivity={1.0}
          clearcoat={1.0}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}

// ─── SEAMLESS UNIFIED 3D RING ASSEMBLY ────────────────────────
function RingMesh({ 
  metal, gemstone, cut, caratWeight, bandWeight, artEmblem, autoRotate, 
  bandProfile, bandPattern, bandFinish, bandWidthMm, settingStyle, sideStones, twoToneMetal,
  diamondTier = 'natural_certified', paveCount = 0, haloEnabled = false, hiddenHaloEnabled = false,
  ringHeadStyle = 'solitaire', shankStyle = 'classic'
}) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  const metalProps = METAL_MATERIALS[metal?.id] || METAL_MATERIALS['24k-gold'];
  const twoToneColor = twoToneMetal?.color || '#F0F0F5';
  
  let baseGemProps = GEM_MATERIALS[gemstone?.id] || null;
  if (baseGemProps && gemstone?.id === 'vvs-diamond') {
    if (diamondTier === 'lab_grown') {
      baseGemProps = { ...baseGemProps, transmission: 0.95, roughness: 0.01, ior: 2.42 };
    } else if (diamondTier === 'commercial_grade') {
      baseGemProps = { ...baseGemProps, transmission: 0.80, roughness: 0.08, ior: 2.35 };
    } else {
      baseGemProps = { ...baseGemProps, transmission: 0.98, roughness: 0.0, ior: 2.42 };
    }
  }
  const gemProps = baseGemProps;
  const hasGem = gemstone?.id !== 'no-stone' && gemProps;

  // Band thickness calculation
  const tubeRadius = useMemo(() => {
    if (bandWidthMm) return bandWidthMm * 0.025;
    const w = bandWeight || 8;
    return 0.11 + ((w - 3) / 22) * 0.09;
  }, [bandWidthMm, bandWeight]);

  const bandRadius = 1.1;
  const bandTopY = bandRadius + tubeRadius;

  const gemScale = useMemo(() => {
    const ct = caratWeight || 1.0;
    return Math.pow(ct / 1.0, 0.38) * 0.52;
  }, [caratWeight]);

  // Roughness mapping
  let adjustedRoughness = metalProps.roughness;
  if (bandFinish === 'matte') adjustedRoughness = 0.45;
  else if (bandFinish === 'satin') adjustedRoughness = 0.2;
  else if (bandFinish === 'sandblast') adjustedRoughness = 0.55;

  let bumpScale = 0;
  if (bandPattern === 'hammered') {
    adjustedRoughness = Math.max(adjustedRoughness, 0.25);
    bumpScale = 0.05;
  } else if (bandPattern === 'rope-twist' || bandPattern === 'threaded') {
    adjustedRoughness = Math.max(adjustedRoughness, 0.15);
  } else if (bandPattern === 'brushed') {
    adjustedRoughness = Math.max(adjustedRoughness, 0.3);
  }

  let tubularSegments = 48;
  if (bandProfile === 'flat') tubularSegments = 4;
  else if (bandProfile === 'knife-edge') tubularSegments = 3;

  const bandMaterial = (color) => (
    <meshPhysicalMaterial
      color={color || metalProps.color}
      metalness={metalProps.metalness}
      roughness={adjustedRoughness}
      clearcoat={bandFinish === 'high-polish' ? metalProps.clearcoat : 0}
      clearcoatRoughness={metalProps.clearcoatRoughness}
      reflectivity={1.0}
      bumpScale={bumpScale}
    />
  );

  const isSplitShank = shankStyle === 'split-shank';
  const isBypass = shankStyle === 'bypass';
  const isEntwinedHearts = ringHeadStyle === 'entwined-hearts';
  const isInfinity = ringHeadStyle === 'infinity-loop' || artEmblem === 'infinity';
  const isLotus = ringHeadStyle === 'lotus-bloom' || artEmblem === 'lotus';
  const isToiEtMoi = ringHeadStyle === 'toi-et-moi';

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} rotation={[0.35, 0.4, 0]}>
      
      {/* ── 1. METALLIC SHANK ARCHITECTURE ── */}
      {isSplitShank ? (
        // ── SPLIT SHANK (Bifurcated Double Rails with Inset Pavé Channels) ──
        <group>
          {/* Main Base Half Torus */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[bandRadius, tubeRadius * 0.95, tubularSegments, 64, Math.PI]} />
            {bandMaterial()}
          </mesh>

          {/* Dual Bifurcated Upper Rails (Left & Right Split Arms) */}
          {[-1, 1].map((railZ) => (
            <mesh key={`split-rail-${railZ}`} position={[0, 0, railZ * 0.09]} rotation={[0, 0, -Math.PI / 2]}>
              <torusGeometry args={[bandRadius, tubeRadius * 0.55, tubularSegments, 64, Math.PI]} />
              {bandMaterial()}
            </mesh>
          ))}

          {/* Pavé Diamond Rows Inset along Split Rail Arms */}
          {[-1, 1].map((side) =>
            [...Array(6)].map((_, i) => {
              const angle = (Math.PI / 2) + side * ((i + 1) * 0.16);
              const px = Math.cos(angle) * bandRadius;
              const py = Math.sin(angle) * bandRadius;
              return (
                <group key={`split-gem-${side}-${i}`} position={[px, py, 0.09]} rotation={[0, 0, angle - Math.PI / 2]}>
                  <mesh position={[0, tubeRadius * 0.6, 0]}>
                    <sphereGeometry args={[tubeRadius * 0.32, 8, 8]} />
                    <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
      ) : isBypass ? (
        // ── BYPASS FLUID OVERLAPPING SHANK ──
        <group>
          <mesh position={[0, 0, -0.06]} rotation={[0.1, 0, 0.3]}>
            <torusGeometry args={[bandRadius, tubeRadius * 0.85, tubularSegments, 64, Math.PI * 1.8]} />
            {bandMaterial()}
          </mesh>
          <mesh position={[0, 0, 0.06]} rotation={[-0.1, 0, -0.3]}>
            <torusGeometry args={[bandRadius, tubeRadius * 0.85, tubularSegments, 64, Math.PI * 1.8]} />
            {bandMaterial()}
          </mesh>
        </group>
      ) : (
        // ── CLASSIC SINGLE SOLID TORUS ──
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[bandRadius, tubeRadius, tubularSegments, 128]} />
          {bandMaterial()}
        </mesh>
      )}

      {/* ── 2. THREADED SPIRAL ROPE HELIX (If selected) ── */}
      {(bandPattern === 'threaded' || bandPattern === 'rope-twist' || shankStyle === 'threaded') && (
        <group>
          {[...Array(48)].map((_, i) => {
            const angle = (i / 48) * Math.PI * 2;
            const px = Math.cos(angle) * bandRadius;
            const py = Math.sin(angle) * bandRadius;
            const spiralZ = Math.sin(i * 0.6) * (tubeRadius * 0.8);
            return (
              <mesh key={`thread-helix-${i}`} position={[px, py, spiralZ]} rotation={[0, 0, angle]}>
                <cylinderGeometry args={[tubeRadius * 0.18, tubeRadius * 0.18, 0.15, 8]} />
                {bandMaterial()}
              </mesh>
            );
          })}
        </group>
      )}

      {/* ── 3. MILGRAIN BEAD PATTERN ── */}
      {bandPattern === 'milgrain' && (
        <group>
          {[...Array(60)].map((_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            return (
              <mesh key={`milgrain-1-${i}`} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, tubeRadius * 0.9]}>
                <sphereGeometry args={[tubeRadius * 0.15, 8, 8]} />
                {bandMaterial()}
              </mesh>
            );
          })}
        </group>
      )}

      {/* ── 4. STANDARD PAVÉ DIAMOND ACCENTS (When not in split shank) ── */}
      {!isSplitShank && paveCount > 0 && (
        <group>
          {[...Array(paveCount)].map((_, i) => {
            const startAngle = Math.PI / 2 - Math.PI / 3;
            const angleStep = (Math.PI * 2/3) / Math.max(paveCount - 1, 1);
            const theta = startAngle + i * angleStep;
            const px = Math.cos(theta) * bandRadius;
            const py = Math.sin(theta) * bandRadius;
            return (
              <group key={`pave-cnt-${i}`} position={[px, py, 0]} rotation={[0, 0, theta - Math.PI / 2]}>
                <mesh position={[0, tubeRadius * 0.8, 0]}>
                  <sphereGeometry args={[tubeRadius * 0.35, 8, 8]} />
                  <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* ── 5. CENTER HEAD MOTIF ARCHITECTURE ── */}
      {isEntwinedHearts ? (
        // ── ENTWINED DUAL HEARTS MOTIF (Matches Bluestone Reference Photo) ──
        <group position={[0, bandTopY * 0.95, 0]}>
          <EntwinedHeartsMotif
            primaryColor={metalProps.color}
            accentColor={twoToneColor}
            scale={gemScale * 1.3}
          />
        </group>
      ) : isInfinity ? (
        // ── INFINITY LOOP MOTIF ──
        <group position={[0, bandTopY * 0.95, 0]}>
          <InfinityLoopMotif metalColor={metalProps.color} scale={gemScale * 1.2} />
        </group>
      ) : isLotus ? (
        // ── LOTUS BLOOM MOTIF ──
        <group position={[0, bandTopY * 0.95, 0]}>
          <LotusBloomMotif metalColor={metalProps.color} scale={gemScale * 1.2} gemProps={gemProps} />
        </group>
      ) : isToiEtMoi ? (
        // ── TOI ET MOI TWIN STONE ──
        <group position={[0, bandTopY * 0.95, 0]}>
          <ToiEtMoiMotif metalColor={metalProps.color} scale={gemScale * 1.1} />
        </group>
      ) : (
        // ── CLASSIC SOLITAIRE / HALO / BEZEL / PRONG BASKET ──
        hasGem && (
          <group position={[0, bandTopY, 0]}>
            {settingStyle === 'bezel' ? (
              <group>
                <mesh position={[0, 0.15, 0]}>
                  <torusGeometry args={[gemScale * 0.6, 0.05, 16, 64]} />
                  {bandMaterial()}
                </mesh>
                <mesh position={[0, 0.075, 0]}>
                  <cylinderGeometry args={[gemScale * 0.6, gemScale * 0.42, 0.15, 16]} />
                  {bandMaterial()}
                </mesh>
              </group>
            ) : settingStyle === 'halo' ? (
              <group position={[0, 0.15, 0]}>
                <mesh position={[0, -0.05, 0]}>
                  <cylinderGeometry args={[gemScale * 0.7, gemScale * 0.42, 0.14, 16]} />
                  {bandMaterial()}
                </mesh>
                {[...Array(16)].map((_, i) => {
                  const angle = (i / 16) * Math.PI * 2;
                  return (
                    <mesh key={`halo-m-${i}`} position={[Math.cos(angle) * gemScale * 0.65, 0.05, Math.sin(angle) * gemScale * 0.65]}>
                      <sphereGeometry args={[0.06, 8, 8]} />
                      <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
                    </mesh>
                  );
                })}
              </group>
            ) : settingStyle !== 'tension' && settingStyle !== 'flush' ? (
              <>
                <mesh position={[0, 0.06, 0]}>
                  <cylinderGeometry args={[gemScale * 0.58, gemScale * 0.42, 0.14, 16]} />
                  {bandMaterial()}
                </mesh>
                {[-1, 1].map((x) =>
                  [-1, 1].map((z) => (
                    <mesh
                      key={`prong-${x}-${z}`}
                      position={[x * gemScale * 0.4, 0.22, z * gemScale * 0.4]}
                      rotation={[z * -0.12, 0, x * 0.12]}
                    >
                      <cylinderGeometry args={[0.035, 0.025, gemScale * 0.55, 12]} />
                      {bandMaterial()}
                    </mesh>
                  ))
                )}
              </>
            ) : null}

            {/* Optional Halo & Hidden Halo */}
            {haloEnabled && settingStyle !== 'halo' && (
              <group position={[0, 0.20, 0]}>
                {[...Array(16)].map((_, i) => {
                  const angle = (i / 16) * Math.PI * 2;
                  return (
                    <mesh key={`halo-ext-${i}`} position={[Math.cos(angle) * gemScale * 0.65, 0, Math.sin(angle) * gemScale * 0.65]}>
                      <sphereGeometry args={[0.06, 8, 8]} />
                      <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
                    </mesh>
                  );
                })}
              </group>
            )}

            {hiddenHaloEnabled && (
              <group position={[0, 0.10, 0]}>
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  return (
                    <mesh key={`hidden-halo-m-${i}`} position={[Math.cos(angle) * gemScale * 0.48, 0, Math.sin(angle) * gemScale * 0.48]}>
                      <sphereGeometry args={[0.04, 8, 8]} />
                      <meshPhysicalMaterial color="#FFFFFF" transmission={0.98} opacity={1.0} roughness={0.0} ior={2.42} />
                    </mesh>
                  );
                })}
              </group>
            )}

            {/* Faceted 3D Gemstone */}
            <group position={[0, settingStyle === 'flush' ? -0.1 : 0.24, 0]}>
              <FacetedGemstone cutId={cut?.id} scale={gemScale} gemProps={gemProps} />
            </group>
          </group>
        )
      )}

    </group>
  );
}

export default function ThreeRingCanvas({
  metal,
  gemstone,
  cut,
  caratWeight = 1.0,
  bandWeight = 8,
  artEmblem = 'none',
  autoRotate = false,
  bandProfile = 'comfort-fit',
  bandPattern = 'plain',
  bandFinish = 'high-polish',
  bandWidthMm = 4,
  settingStyle = 'prong',
  sideStones = 'none',
  twoToneMetal = null,
  diamondTier = 'natural_certified',
  paveCount = 0,
  haloEnabled = false,
  hiddenHaloEnabled = false,
  ringHeadStyle = 'solitaire',
  shankStyle = 'classic',
}) {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 8, 5]} intensity={1.9} castShadow />
        <directionalLight position={[-4, -2, -4]} intensity={0.6} />
        <pointLight position={[0, 3, 2]} intensity={1.5} color="#FFFFFF" />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Float speed={1.0} rotationIntensity={0.15} floatIntensity={0.25}>
            <RingMesh
              metal={metal}
              gemstone={gemstone}
              cut={cut}
              caratWeight={caratWeight}
              bandWeight={bandWeight}
              artEmblem={artEmblem}
              autoRotate={autoRotate}
              bandProfile={bandProfile}
              bandPattern={bandPattern}
              bandFinish={bandFinish}
              bandWidthMm={bandWidthMm}
              settingStyle={settingStyle}
              sideStones={sideStones}
              twoToneMetal={twoToneMetal}
              diamondTier={diamondTier}
              paveCount={paveCount}
              haloEnabled={haloEnabled}
              hiddenHaloEnabled={hiddenHaloEnabled}
              ringHeadStyle={ringHeadStyle}
              shankStyle={shankStyle}
            />
          </Float>
          <ContactShadows position={[0, -1.3, 0]} opacity={0.6} scale={4.5} blur={1.5} far={1.8} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.0}
          maxDistance={5.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#808080] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200/50 pointer-events-none">
        3D REAL-TIME WEBGL · DRAG TO ROTATE 360°
      </div>
    </div>
  );
}
