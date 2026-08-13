import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// Metal properties mapping
const METAL_MATERIALS = {
  '24k-gold': { color: '#FFD700', metalness: 1.0, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.05 },
  '22k-gold': { color: '#DAA520', metalness: 1.0, roughness: 0.10, clearcoat: 1.0, clearcoatRoughness: 0.08 },
  '18k-rose': { color: '#E8B4A0', metalness: 1.0, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.05 },
  'platinum': { color: '#E5E4E2', metalness: 1.0, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.02 },
  '925-silver': { color: '#E0E0E6', metalness: 0.95, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.1 },
};

// Gemstone properties mapping
const GEM_MATERIALS = {
  'vvs-diamond': { color: '#FFFFFF', transmission: 0.96, opacity: 1.0, roughness: 0.02, ior: 2.42, thickness: 0.8 },
  'emerald': { color: '#00A86B', transmission: 0.88, opacity: 1.0, roughness: 0.05, ior: 1.57, thickness: 0.9 },
  'sapphire': { color: '#1D4ED8', transmission: 0.85, opacity: 1.0, roughness: 0.05, ior: 1.77, thickness: 0.9 },
  'ruby': { color: '#DC2626', transmission: 0.85, opacity: 1.0, roughness: 0.05, ior: 1.77, thickness: 0.9 },
};

// 3D Ring Mesh Component
function RingMesh({ metal, gemstone, cut, caratWeight, bandWeight, artEmblem, autoRotate }) {
  const groupRef = useRef();

  // Subtle continuous rotation if enabled
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const metalProps = METAL_MATERIALS[metal?.id] || METAL_MATERIALS['24k-gold'];
  const gemProps = GEM_MATERIALS[gemstone?.id] || null;
  const hasGem = gemstone?.id !== 'no-stone' && gemProps;

  // Band thickness scaling
  const tubeRadius = useMemo(() => {
    const w = bandWeight || 8;
    return 0.12 + ((w - 3) / 22) * 0.12; // 0.12 to 0.24
  }, [bandWeight]);

  // Gem size scaling
  const gemScale = useMemo(() => {
    const ct = caratWeight || 1.0;
    return Math.pow(ct / 1.0, 0.4) * 0.42;
  }, [caratWeight]);

  return (
    <group ref={groupRef} position={[0, 0.1, 0]} rotation={[0.3, 0, 0]}>
      
      {/* Main Metallic Torus Ring Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, tubeRadius, 48, 128]} />
        <meshPhysicalMaterial
          color={metalProps.color}
          metalness={metalProps.metalness}
          roughness={metalProps.roughness}
          clearcoat={metalProps.clearcoat}
          clearcoatRoughness={metalProps.clearcoatRoughness}
          reflectivity={1.0}
        />
      </mesh>

      {/* 3D Art Emblem Motif mounted on band shoulder */}
      {artEmblem && artEmblem !== 'none' && (
        <group position={[0.7, 0.85, 0.3]} rotation={[0, 0, -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
            <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.1} />
          </mesh>
          {artEmblem === 'lotus' && (
            <mesh position={[0, 0.03, 0]}>
              <coneGeometry args={[0.08, 0.1, 8]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.05} />
            </mesh>
          )}
          {artEmblem === 'infinity' && (
            <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.02, 16, 32]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.05} />
            </mesh>
          )}
          {artEmblem === 'heart' && (
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.05} />
            </mesh>
          )}
        </group>
      )}

      {/* Crown Prongs and Gemstone */}
      {hasGem && (
        <group position={[0, 1.1 + tubeRadius, 0]}>
          
          {/* Prong Basket Base */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[gemScale * 0.7, gemScale * 0.4, 0.18, 8]} />
            <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.1} />
          </mesh>

          {/* 4 Metallic Prongs */}
          {[-1, 1].map((x) =>
            [-1, 1].map((z) => (
              <mesh key={`prong-${x}-${z}`} position={[x * gemScale * 0.45, 0.02, z * gemScale * 0.45]}>
                <cylinderGeometry args={[0.03, 0.025, gemScale * 0.6, 8]} />
                <meshPhysicalMaterial color={metalProps.color} metalness={1.0} roughness={0.05} />
              </mesh>
            ))
          )}

          {/* 3D Gemstone Mesh */}
          <mesh position={[0, 0.1, 0]} scale={[gemScale, gemScale, gemScale]}>
            {cut?.id === 'emerald-cut' ? (
              <boxGeometry args={[1.2, 0.8, 0.9]} />
            ) : cut?.id === 'princess' ? (
              <boxGeometry args={[1.0, 0.9, 1.0]} />
            ) : cut?.id === 'oval' ? (
              <sphereGeometry args={[1.0, 32, 16]} />
            ) : cut?.id === 'cushion' ? (
              <boxGeometry args={[1.1, 0.85, 1.1]} />
            ) : cut?.id === 'pear' ? (
              <coneGeometry args={[0.9, 1.3, 16]} />
            ) : (
              // Brilliant Round Octahedron
              <octahedronGeometry args={[1, 2]} />
            )}
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
            />
          </mesh>

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
        camera={{ position: [0, 1.5, 3.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, -4, -5]} intensity={0.5} />
        <pointLight position={[0, 4, 2]} intensity={1.2} color="#FFFFFF" />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
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
          <ContactShadows position={[0, -1.0, 0]} opacity={0.5} scale={4} blur={1.5} far={1.5} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={6.0}
          maxPolarAngle={Math.PI / 1.8}
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
