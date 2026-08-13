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

// Faceted Gemstone 3D Component with authentic crown, girdle & pavilion facets
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
        // Brilliant Round
        return [scale, scale, scale];
    }
  }, [cutId, scale]);

  return (
    <group scale={scaleVec}>
      {/* Crown & Table Facets (Top Pyramid/Cylinder) */}
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
          clearcoatRoughness={0.0}
          flatShading={true}
        />
      </mesh>

      {/* Girdle Rim (Middle Facet Ring) */}
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
          clearcoatRoughness={0.0}
          flatShading={true}
        />
      </mesh>

      {/* Pavilion Facets (Bottom Inverted Cone to Culet) */}
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
          clearcoatRoughness={0.0}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}

// Seamless Unified 3D Ring Assembly
function RingMesh({ metal, gemstone, cut, caratWeight, bandWeight, artEmblem, autoRotate }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  const metalProps = METAL_MATERIALS[metal?.id] || METAL_MATERIALS['24k-gold'];
  const gemProps = GEM_MATERIALS[gemstone?.id] || null;
  const hasGem = gemstone?.id !== 'no-stone' && gemProps;

  // Band thickness calculation
  const tubeRadius = useMemo(() => {
    const w = bandWeight || 8;
    return 0.11 + ((w - 3) / 22) * 0.09; // 0.11 to 0.20
  }, [bandWeight]);

  // Main torus band radius
  const bandRadius = 1.1;

  // Top of the ring band where crown rests
  const bandTopY = bandRadius + tubeRadius * 0.5;

  // Gem size scaling
  const gemScale = useMemo(() => {
    const ct = caratWeight || 1.0;
    return Math.pow(ct / 1.0, 0.38) * 0.52;
  }, [caratWeight]);

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} rotation={[0.35, 0.4, 0]}>
      
      {/* ── 1. MAIN METALLIC RING BAND (Upright in XY Plane) ── */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[bandRadius, tubeRadius, 48, 128]} />
        <meshPhysicalMaterial
          color={metalProps.color}
          metalness={metalProps.metalness}
          roughness={metalProps.roughness}
          clearcoat={metalProps.clearcoat}
          clearcoatRoughness={metalProps.clearcoatRoughness}
          reflectivity={1.0}
        />
      </mesh>

      {/* ── 2. CATHEDRAL SHOULDER BRIDGES (Connecting band to crown) ── */}
      {[-1, 1].map((dir) => (
        <group key={`shoulder-${dir}`} position={[dir * 0.45, bandRadius * 0.85, 0]} rotation={[0, 0, dir * -0.45]}>
          <mesh>
            <cylinderGeometry args={[tubeRadius * 0.8, tubeRadius * 1.1, 0.5, 16]} />
            <meshPhysicalMaterial
              color={metalProps.color}
              metalness={metalProps.metalness}
              roughness={metalProps.roughness}
              clearcoat={metalProps.clearcoat}
              reflectivity={1.0}
            />
          </mesh>
        </group>
      ))}

      {/* ── 3. 3D ART EMBLEM MOTIF (Mounted on band shoulder) ── */}
      {artEmblem && artEmblem !== 'none' && (
        <group position={[bandRadius * 0.72, bandRadius * 0.68, 0]} rotation={[0, 0, -0.75]}>
          <mesh>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 16]} />
            <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.06} />
          </mesh>
          {artEmblem === 'lotus' && (
            <mesh position={[0, 0.04, 0]}>
              <coneGeometry args={[0.09, 0.12, 8]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.04} />
            </mesh>
          )}
          {artEmblem === 'infinity' && (
            <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.07, 0.02, 16, 32]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.04} />
            </mesh>
          )}
          {artEmblem === 'heart' && (
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.04} />
            </mesh>
          )}
          {artEmblem === 'monogram' && (
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.12, 0.06, 0.12]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.04} />
            </mesh>
          )}
        </group>
      )}

      {/* ── 4. PRONG BASKET & FACETED GEMSTONE (Attached directly at bandTopY) ── */}
      {hasGem && (
        <group position={[0, bandTopY + 0.02, 0]}>
          
          {/* Solid Metallic Basket Collar (Mounting Base) */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[gemScale * 0.58, gemScale * 0.42, 0.14, 16]} />
            <meshPhysicalMaterial
              color={metalProps.color}
              metalness={metalProps.metalness}
              roughness={metalProps.roughness}
              clearcoat={metalProps.clearcoat}
              reflectivity={1.0}
            />
          </mesh>

          {/* 4 Tapered Metallic Prongs Gripping Girdle */}
          {[-1, 1].map((x) =>
            [-1, 1].map((z) => (
              <mesh
                key={`prong-${x}-${z}`}
                position={[x * gemScale * 0.4, 0.22, z * gemScale * 0.4]}
                rotation={[z * -0.12, 0, x * 0.12]}
              >
                <cylinderGeometry args={[0.035, 0.025, gemScale * 0.55, 12]} />
                <meshPhysicalMaterial
                  color={metalProps.color}
                  metalness={metalProps.metalness}
                  roughness={metalProps.roughness}
                  clearcoat={metalProps.clearcoat}
                  reflectivity={1.0}
                />
              </mesh>
            ))
          )}

          {/* Faceted 3D Gemstone */}
          <group position={[0, 0.24, 0]}>
            <FacetedGemstone cutId={cut?.id} scale={gemScale} gemProps={gemProps} />
          </group>

        </group>
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
}) {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 8, 5]} intensity={1.8} castShadow />
        <directionalLight position={[-4, -2, -4]} intensity={0.6} />
        <pointLight position={[0, 3, 2]} intensity={1.4} color="#FFFFFF" />

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

      {/* 3D Canvas Helper Overlay */}
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#808080] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200/50 pointer-events-none">
        3D REAL-TIME WEBGL · DRAG TO ROTATE 360°
      </div>
    </div>
  );
}
