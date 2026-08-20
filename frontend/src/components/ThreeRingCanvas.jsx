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
function RingMesh({ 
  metal, gemstone, cut, caratWeight, bandWeight, artEmblem, autoRotate, 
  bandProfile, bandPattern, bandFinish, bandWidthMm, settingStyle, sideStones, twoToneMetal,
  diamondTier = 'natural_certified', paveCount = 0, haloEnabled = false, hiddenHaloEnabled = false
}) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  const metalProps = METAL_MATERIALS[metal?.id] || METAL_MATERIALS['24k-gold'];
  
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
    return 0.11 + ((w - 3) / 22) * 0.09; // 0.11 to 0.20
  }, [bandWidthMm, bandWeight]);

  // Main torus band radius
  const bandRadius = 1.1;

  // Top of the ring band where crown rests
  const bandTopY = bandRadius + tubeRadius;

  // Gem size scaling
  const gemScale = useMemo(() => {
    const ct = caratWeight || 1.0;
    return Math.pow(ct / 1.0, 0.38) * 0.52;
  }, [caratWeight]);

  // Apply finishes
  let adjustedRoughness = metalProps.roughness;
  if (bandFinish === 'matte') adjustedRoughness = 0.45;
  else if (bandFinish === 'satin') adjustedRoughness = 0.2;
  else if (bandFinish === 'sandblast') adjustedRoughness = 0.55;

  // Apply patterns
  let bumpScale = 0;
  if (bandPattern === 'hammered') {
    adjustedRoughness = Math.max(adjustedRoughness, 0.25);
    bumpScale = 0.05;
  } else if (bandPattern === 'rope-twist') {
    adjustedRoughness = Math.max(adjustedRoughness, 0.15);
  } else if (bandPattern === 'brushed') {
    adjustedRoughness = Math.max(adjustedRoughness, 0.3);
  }

  // Profile handling
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
  
  // Pave Stones distribution
  const paveStones = [];
  if (paveCount > 0) {
    for (let i = 0; i < paveCount; i++) {
      const startAngle = Math.PI / 2 - Math.PI / 3;
      const angleStep = (Math.PI * 2/3) / Math.max(paveCount - 1, 1);
      const theta = startAngle + i * angleStep;
      const px = Math.cos(theta) * bandRadius;
      const py = Math.sin(theta) * bandRadius;
      paveStones.push({ x: px, y: py, rotation: theta - Math.PI/2 });
    }
  }

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} rotation={[0.35, 0.4, 0]}>
      
      {/* 1. MAIN METALLIC RING BAND (Upright in XY Plane) */}
      {bandFinish === 'two-tone' || twoToneMetal ? (
        <>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[bandRadius, tubeRadius, tubularSegments, 64, Math.PI]} />
            {bandMaterial()}
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[bandRadius, tubeRadius, tubularSegments, 64, Math.PI]} />
            {bandMaterial(twoToneMetal?.color || '#FFD700')}
          </mesh>
        </>
      ) : (
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[bandRadius, tubeRadius, tubularSegments, 128]} />
          {bandMaterial()}
        </mesh>
      )}

      {/* Band Pattern Extras */}
      {bandPattern === 'milgrain' && (
        <group>
          {[...Array(60)].map((_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            return (
              <mesh key={`milgrain-1-${i}`} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, tubeRadius * 0.9]}>
                <sphereGeometry args={[tubeRadius * 0.15, 8, 8]} />
                {bandMaterial()}
              </mesh>
            )
          })}
          {[...Array(60)].map((_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            return (
              <mesh key={`milgrain-2-${i}`} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, -tubeRadius * 0.9]}>
                <sphereGeometry args={[tubeRadius * 0.15, 8, 8]} />
                {bandMaterial()}
              </mesh>
            )
          })}
        </group>
      )}

      {/* SIDE STONES AND PAVE COUNT */}
      {paveCount > 0 && (
        <group>
          {paveStones.map((pos, i) => (
            <mesh key={`pave-count-${i}`} position={[pos.x, pos.y, 0]} rotation={[0, 0, pos.rotation]}>
              <mesh position={[0, tubeRadius * 0.8, 0]}>
                <sphereGeometry args={[tubeRadius * 0.35, 8, 8]} />
                <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
              </mesh>
            </mesh>
          ))}
        </group>
      )}
      
      {sideStones !== 'none' && paveCount === 0 && (
        <group>
          {[-1, 1].map((side) => {
            if (sideStones === 'pave-band') {
               return [...Array(6)].map((_, i) => {
                 const angle = (Math.PI / 2) + side * ((i + 1) * 0.2);
                 return (
                   <mesh key={`pave-${side}-${i}`} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, 0]} rotation={[0, 0, angle - Math.PI / 2]}>
                     <mesh position={[0, tubeRadius * 0.8, 0]}>
                       <sphereGeometry args={[tubeRadius * 0.4, 8, 8]} />
                       <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
                     </mesh>
                   </mesh>
                 );
               });
            } else if (sideStones === 'channel-baguette') {
               return [...Array(4)].map((_, i) => {
                 const angle = (Math.PI / 2) + side * ((i + 1) * 0.25);
                 return (
                   <mesh key={`baguette-${side}-${i}`} position={[Math.cos(angle) * bandRadius, Math.sin(angle) * bandRadius, 0]} rotation={[0, 0, angle - Math.PI / 2]}>
                     <mesh position={[0, tubeRadius * 0.8, 0]}>
                       <boxGeometry args={[tubeRadius * 0.8, tubeRadius * 0.4, tubeRadius * 0.8]} />
                       <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
                     </mesh>
                   </mesh>
                 );
               });
            } else if (sideStones === 'three-stone' && side === 1) {
                return [-1, 1].map((s) => {
                   const sAngle = (Math.PI / 2) + s * 0.28;
                   const sx = Math.cos(sAngle) * bandRadius;
                   const sy = Math.sin(sAngle) * bandRadius;
                   return (
                     <group key={`three-stone-${s}`} position={[sx, sy, 0]} rotation={[0, 0, s * -0.28]}>
                       <mesh position={[0, tubeRadius * 0.85, 0]}>
                         <cylinderGeometry args={[gemScale * 0.32, gemScale * 0.22, 0.14, 16]} />
                         {bandMaterial()}
                       </mesh>
                       <group position={[0, tubeRadius * 0.85 + 0.12, 0]}>
                          <FacetedGemstone cutId="round" scale={gemScale * 0.58} gemProps={GEM_MATERIALS['vvs-diamond']} />
                       </group>
                     </group>
                   );
                });
            } else if (sideStones === 'side-rounds' && side === 1) {
                return [-1, 1].map((s) => {
                   const sAngle = (Math.PI / 2) + s * 0.22;
                   const sx = Math.cos(sAngle) * bandRadius;
                   const sy = Math.sin(sAngle) * bandRadius;
                   return (
                     <group key={`side-rounds-${s}`} position={[sx, sy, 0]} rotation={[0, 0, s * -0.22]}>
                       <mesh position={[0, tubeRadius * 0.85, 0]}>
                          <cylinderGeometry args={[gemScale * 0.22, gemScale * 0.16, 0.1, 16]} />
                          {bandMaterial()}
                       </mesh>
                       <mesh position={[0, tubeRadius * 0.85 + 0.08, 0]}>
                          <sphereGeometry args={[gemScale * 0.22, 16, 16]} />
                          <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
                       </mesh>
                     </group>
                   );
                });
            }
            return null;
          })}
        </group>
      )}

      {/* 2. CATHEDRAL SHOULDER BRIDGES (Connecting band to crown) */}
      {settingStyle === 'cathedral' && [-1, 1].map((dir) => {
        const baseAngle = Math.PI/2 - (dir * 0.45);
        const bx = Math.cos(baseAngle) * bandRadius;
        const by = Math.sin(baseAngle) * bandRadius;
        return (
          <group key={`shoulder-${dir}`} position={[bx, by + tubeRadius, 0]} rotation={[0, 0, dir * -0.45]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[tubeRadius * 0.8, tubeRadius * 1.1, 0.5, 16]} />
              {bandMaterial()}
            </mesh>
          </group>
        );
      })}

      {/* 3. 3D ART EMBLEM MOTIF (Mounted on band surface) */}
      {artEmblem && artEmblem !== 'none' && (
        <group position={[Math.cos(Math.PI/2 - 0.75) * bandRadius, Math.sin(Math.PI/2 - 0.75) * bandRadius, 0]} rotation={[0, 0, -0.75]}>
          <group position={[0, tubeRadius * 0.8, 0]}>
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
        </group>
      )}

      {/* 4. PRONG BASKET & FACETED GEMSTONE (Attached directly at bandTopY) */}
      {hasGem && (
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
                   <mesh key={`halo-${i}`} position={[Math.cos(angle) * gemScale * 0.65, 0.05, Math.sin(angle) * gemScale * 0.65]}>
                     <sphereGeometry args={[0.06, 8, 8]} />
                     <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
                   </mesh>
                 );
               })}
             </group>
          ) : settingStyle !== 'tension' && settingStyle !== 'flush' ? (
            <>
              {/* Solid Metallic Basket Collar (Mounting Base) */}
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[gemScale * 0.58, gemScale * 0.42, 0.14, 16]} />
                {bandMaterial()}
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
                    {bandMaterial()}
                  </mesh>
                ))
              )}
              {settingStyle === 'pave' && (
                <group position={[0, 0.06, 0]}>
                  {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    return (
                      <mesh key={`pave-base-${i}`} position={[Math.cos(angle) * gemScale * 0.55, 0, Math.sin(angle) * gemScale * 0.55]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
                      </mesh>
                    );
                  })}
                </group>
              )}
            </>
          ) : null}

          {/* Optional Extras: Halo and Hidden Halo */}
          {haloEnabled && settingStyle !== 'halo' && (
             <group position={[0, 0.20, 0]}>
               {[...Array(16)].map((_, i) => {
                 const angle = (i / 16) * Math.PI * 2;
                 return (
                   <mesh key={`halo-extra-${i}`} position={[Math.cos(angle) * gemScale * 0.65, 0, Math.sin(angle) * gemScale * 0.65]}>
                     <sphereGeometry args={[0.06, 8, 8]} />
                     <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
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
                   <mesh key={`hidden-halo-${i}`} position={[Math.cos(angle) * gemScale * 0.48, 0, Math.sin(angle) * gemScale * 0.48]}>
                     <sphereGeometry args={[0.04, 8, 8]} />
                     <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.1} transmission={0.9} ior={2.4} />
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
