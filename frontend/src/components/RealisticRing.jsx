import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────
   METAL GRADIENT PALETTES
   ────────────────────────────────────────────────────────── */
const METAL_GRADIENTS = {
  '24k-gold': {
    band: ['#FFF1C1', '#F5D76E', '#D4A520', '#B8860B', '#D4A520', '#F5D76E', '#FFF1C1'],
    inner: ['#B8860B', '#8B6914', '#6B4F10'],
    highlight: '#FFF8DC',
    shadow: 'rgba(139, 105, 20, 0.5)',
    prong: '#D4A520',
  },
  '22k-gold': {
    band: ['#FFE8A0', '#DAA520', '#C5952A', '#A07820', '#C5952A', '#DAA520', '#FFE8A0'],
    inner: ['#A07820', '#7A5C18', '#5C4412'],
    highlight: '#FFF3D4',
    shadow: 'rgba(160, 120, 32, 0.5)',
    prong: '#C5952A',
  },
  '18k-rose': {
    band: ['#FFE4DE', '#E8B4A0', '#D4927A', '#C07860', '#D4927A', '#E8B4A0', '#FFE4DE'],
    inner: ['#B06848', '#8B4F38', '#6B3A28'],
    highlight: '#FFF0EB',
    shadow: 'rgba(176, 104, 72, 0.5)',
    prong: '#D4927A',
  },
  'platinum': {
    band: ['#FFFFFF', '#E8E8EC', '#C8C8D0', '#A8A8B4', '#C8C8D0', '#E8E8EC', '#FFFFFF'],
    inner: ['#909098', '#787880', '#606068'],
    highlight: '#FFFFFF',
    shadow: 'rgba(96, 96, 104, 0.5)',
    prong: '#C8C8D0',
  },
  '925-silver': {
    band: ['#FAFAFA', '#E0E0E6', '#B8B8C4', '#9898A8', '#B8B8C4', '#E0E0E6', '#FAFAFA'],
    inner: ['#808088', '#686870', '#505058'],
    highlight: '#FFFFFF',
    shadow: 'rgba(80, 80, 88, 0.5)',
    prong: '#B8B8C4',
  },
};

/* ──────────────────────────────────────────────────────────
   GEMSTONE VISUAL CONFIGS
   ────────────────────────────────────────────────────────── */
const GEM_VISUALS = {
  'vvs-diamond': {
    facets: ['#FFFFFF', '#F0F8FF', '#E8F4FD', '#FAFAFA'],
    fire: ['#FF6B6B22', '#FFD93D22', '#6BCB7722', '#4ECDC422', '#45B7D122', '#A78BFA22'],
    brilliance: '#FFFFFF',
    tableColor: '#F8FCFF',
    crownColor: '#E8F0F8',
  },
  'emerald': {
    facets: ['#059669', '#047857', '#10B981', '#34D399'],
    fire: ['#06D6A022', '#10B98133', '#34D39922', '#6EE7B722'],
    brilliance: '#A7F3D0',
    tableColor: '#059669',
    crownColor: '#047857',
  },
  'sapphire': {
    facets: ['#1D4ED8', '#1E40AF', '#3B82F6', '#60A5FA'],
    fire: ['#818CF822', '#6366F133', '#93C5FD22', '#A5B4FC22'],
    brilliance: '#BFDBFE',
    tableColor: '#1D4ED8',
    crownColor: '#1E40AF',
  },
  'ruby': {
    facets: ['#DC2626', '#B91C1C', '#EF4444', '#F87171'],
    fire: ['#FCA5A522', '#F8717133', '#FECACA22', '#FEE2E222'],
    brilliance: '#FECACA',
    tableColor: '#DC2626',
    crownColor: '#B91C1C',
  },
};

/* ──────────────────────────────────────────────────────────
   CUT-SPECIFIC SHAPES
   ────────────────────────────────────────────────────────── */
const CUT_POLYGONS = {
  'round': (s) => {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${50 + s * Math.cos(angle)},${50 + s * Math.sin(angle)}`);
    }
    return pts.join(' ');
  },
  'emerald-cut': (s) => {
    const w = s * 1.15, h = s * 0.85, c = s * 0.25;
    return `${50 - w + c},${50 - h} ${50 + w - c},${50 - h} ${50 + w},${50 - h + c} ${50 + w},${50 + h - c} ${50 + w - c},${50 + h} ${50 - w + c},${50 + h} ${50 - w},${50 + h - c} ${50 - w},${50 - h + c}`;
  },
  'princess': (s) => {
    return `${50},${50 - s} ${50 + s},${50} ${50},${50 + s} ${50 - s},${50}`;
  },
  'oval': (s) => {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${50 + s * 1.3 * Math.cos(angle)},${50 + s * 0.85 * Math.sin(angle)}`);
    }
    return pts.join(' ');
  },
  'cushion': (s) => {
    const r = s * 0.3;
    return `${50 - s + r},${50 - s} ${50 + s - r},${50 - s} ${50 + s},${50 - s + r} ${50 + s},${50 + s - r} ${50 + s - r},${50 + s} ${50 - s + r},${50 + s} ${50 - s},${50 + s - r} ${50 - s},${50 - s + r}`;
  },
  'pear': (s) => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * Math.PI * 2;
      const r = s * (1 + 0.3 * Math.cos(t));
      pts.push(`${50 + r * 0.8 * Math.sin(t)},${50 - r * Math.cos(t)}`);
    }
    return pts.join(' ');
  },
};

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */
const RealisticRing = ({
  metal = { id: '24k-gold' },
  gemstone = { id: 'no-stone' },
  cut = { id: 'round' },
  caratWeight = 1.0,
  bandWeight = 8,
  engravingText = '',
  bandProfile = 'comfort-fit',
  bandPattern = 'plain',
  bandFinish = 'high-polish',
  bandWidthMm = 4,
  settingStyle = 'prong',
  sideStones = 'none',
  twoToneMetal = null,
}) => {
  const palette = METAL_GRADIENTS[metal.id] || METAL_GRADIENTS['24k-gold'];
  const gemVis = GEM_VISUALS[gemstone.id] || null;
  const hasGem = gemstone.id !== 'no-stone' && gemVis;

  // Band thickness scales with bandWidthMm if provided, else bandWeight
  const bandThickness = useMemo(() => {
    if (bandWidthMm) return bandWidthMm * 3.5;
    return 12 + ((bandWeight - 3) / 22) * 18; // 12px to 30px
  }, [bandWidthMm, bandWeight]);

  // Gem size scales with carat
  const gemSize = useMemo(() => {
    return 14 + (caratWeight / 5) * 22; // 14 to 36 in SVG units
  }, [caratWeight]);

  const gradientId = `metalGrad-${metal.id}`;
  const innerGradientId = `innerGrad-${metal.id}`;
  const highlightId = `highlight-${metal.id}`;
  const shadowFilterId = `bandShadow`;
  const gemGradientId = `gemGrad-${gemstone.id}`;
  const gemFireId = `gemFire-${gemstone.id}`;

  const isMatte = bandFinish === 'matte' || bandFinish === 'sandblast' || bandFinish === 'satin';

  return (
    <div className="relative w-full aspect-square flex items-center justify-center select-none" style={{ perspective: '900px' }}>
      <motion.div
        key={metal.id}
        initial={{ rotateY: -8 }}
        animate={{ rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-[85%] aspect-square"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic band gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {palette.band.map((color, i) => (
                <stop key={i} offset={`${(i / (palette.band.length - 1)) * 100}%`} stopColor={color} stopOpacity={isMatte ? 0.8 : 1} />
              ))}
            </linearGradient>

            {/* Inner ring gradient */}
            <linearGradient id={innerGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {palette.inner.map((color, i) => (
                <stop key={i} offset={`${(i / (palette.inner.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>

            {/* Specular highlight */}
            <radialGradient id={highlightId} cx="35%" cy="30%" r="40%">
              <stop offset="0%" stopColor={palette.highlight} stopOpacity={isMatte ? "0.3" : "0.9"} />
              <stop offset="60%" stopColor={palette.highlight} stopOpacity={isMatte ? "0.05" : "0.15"} />
              <stop offset="100%" stopColor={palette.highlight} stopOpacity="0" />
            </radialGradient>

            {/* Drop shadow filter */}
            <filter id={shadowFilterId} x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={palette.shadow} floodOpacity="0.4" />
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.15)" floodOpacity="0.3" />
            </filter>

            {/* Inner shadow for ring depth */}
            <filter id="innerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
              <feOffset dx="0" dy="1" result="offsetBlur" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
              <feFlood floodColor="#000000" floodOpacity="0.25" result="shadowColor" />
              <feComposite in="shadowColor" in2="shadowDiff" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="shadow" />
              </feMerge>
            </filter>

            {/* Hammered Pattern Filter */}
            <filter id="hammeredFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
              <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
              <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
            </filter>

            {/* Gemstone gradient */}
            {hasGem && (
              <>
                <radialGradient id={gemGradientId} cx="40%" cy="35%" r="65%">
                  {gemVis.facets.map((c, i) => (
                    <stop key={i} offset={`${(i / (gemVis.facets.length - 1)) * 100}%`} stopColor={c} />
                  ))}
                </radialGradient>
                <radialGradient id={gemFireId} cx="55%" cy="45%" r="50%">
                  {gemVis.fire.map((c, i) => (
                    <stop key={i} offset={`${(i / (gemVis.fire.length - 1)) * 100}%`} stopColor={c} />
                  ))}
                </radialGradient>
              </>
            )}

            {/* Engraving text path */}
            <path
              id="engravePath"
              d={`M 30,52 A 20,8 0 1,1 70,52`}
              fill="none"
            />
          </defs>

          {/* ── RING BAND ── */}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Back half of ring */}
            <ellipse
              cx="50" cy="55"
              rx="32" ry="12"
              fill="none"
              stroke={`url(#${innerGradientId})`}
              strokeWidth={bandThickness * 0.85}
              strokeLinecap={bandProfile === 'flat' ? 'square' : 'round'}
              opacity="0.55"
            />

            {/* Main ring band */}
            <ellipse
              cx="50" cy="55"
              rx="32" ry="12"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={bandThickness}
              strokeLinecap={bandProfile === 'flat' ? 'square' : 'round'}
              filter={bandPattern === 'hammered' ? "url(#hammeredFilter)" : "url(#innerShadow)"}
            />

            {/* Pattern overlays */}
            {bandPattern === 'milgrain' && (
               <ellipse
                 cx="50" cy="55"
                 rx="32" ry="12"
                 fill="none"
                 stroke={palette.highlight}
                 strokeWidth="1"
                 strokeDasharray="2, 2"
                 opacity="0.6"
               />
            )}
            
            {bandPattern === 'rope-twist' && (
               <ellipse
                 cx="50" cy="55"
                 rx="32" ry="12"
                 fill="none"
                 stroke={palette.inner[0]}
                 strokeWidth="2"
                 strokeDasharray="4, 4"
                 opacity="0.4"
               />
            )}

            {/* Specular highlight sweep */}
            <ellipse
              cx="50" cy="55"
              rx="32" ry="12"
              fill="none"
              stroke={`url(#${highlightId})`}
              strokeWidth={bandThickness * 0.6}
              strokeLinecap={bandProfile === 'flat' ? 'square' : 'round'}
              opacity="0.7"
            />

            {/* Thin bright edge highlight */}
            <ellipse
              cx="50" cy="55"
              rx={32 + bandThickness * 0.25}
              ry={12 + bandThickness * 0.08}
              fill="none"
              stroke={palette.highlight}
              strokeWidth="0.4"
              opacity="0.5"
            />
          </g>

          {/* ── SIDE STONES ── */}
          {sideStones !== 'none' && (
            <g>
               {[...Array(8)].map((_, i) => {
                 const angle = Math.PI + (i * Math.PI / 7);
                 const x = 50 + 32 * Math.cos(angle);
                 const y = 55 + 12 * Math.sin(angle);
                 return (
                   <circle key={`side-stone-${i}`} cx={x} cy={y} r={bandThickness * 0.25} fill="#FFFFFF" opacity="0.9" stroke="#DDD" strokeWidth="0.5" />
                 );
               })}
            </g>
          )}

          {/* ── SETTING & GEMSTONE ── */}
          {hasGem && (
            <g>
              {/* Bezel Setting */}
              {settingStyle === 'bezel' && (
                 <circle cx="50" cy="43" r={gemSize * 0.6} fill="none" stroke={palette.prong} strokeWidth={gemSize * 0.15} opacity="0.9" />
              )}
              
              {/* Halo Setting */}
              {settingStyle === 'halo' && (
                 <g>
                   {[...Array(16)].map((_, i) => {
                     const angle = (i / 16) * Math.PI * 2;
                     const hx = 50 + gemSize * 0.65 * Math.cos(angle);
                     const hy = 43 + gemSize * 0.65 * Math.sin(angle);
                     return <circle key={`halo-${i}`} cx={hx} cy={hy} r={gemSize * 0.15} fill="#FFF" stroke="#DDD" strokeWidth="0.5" />;
                   })}
                 </g>
              )}

              {/* Prongs */}
              {(settingStyle === 'prong' || settingStyle === 'cathedral') && [
                { x1: 50 - gemSize * 0.45, y1: 43 + gemSize * 0.15, x2: 50 - gemSize * 0.2, y2: 43 - gemSize * 0.45 },
                { x1: 50 + gemSize * 0.45, y1: 43 + gemSize * 0.15, x2: 50 + gemSize * 0.2, y2: 43 - gemSize * 0.45 },
                { x1: 50 - gemSize * 0.15, y1: 43 + gemSize * 0.45, x2: 50 - gemSize * 0.4, y2: 43 - gemSize * 0.2 },
                { x1: 50 + gemSize * 0.15, y1: 43 + gemSize * 0.45, x2: 50 + gemSize * 0.4, y2: 43 - gemSize * 0.2 },
              ].map((prong, i) => (
                <motion.line
                  key={i}
                  x1={prong.x1} y1={prong.y1}
                  x2={prong.x2} y2={prong.y2}
                  stroke={palette.prong}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                />
              ))}

              {/* Gemstone */}
              <AnimatePresence>
                <motion.g
                  key={`${gemstone.id}-${cut.id}-${caratWeight}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  style={{ transformOrigin: '50px 43px' }}
                >
                  <polygon
                    points={CUT_POLYGONS[cut.id]?.(gemSize) || CUT_POLYGONS['round'](gemSize)}
                    fill={`url(#${gemGradientId})`}
                    stroke={gemVis.crownColor}
                    strokeWidth="0.5"
                    opacity="0.92"
                    transform="translate(0, -7)"
                  />
                  <polygon
                    points={CUT_POLYGONS[cut.id]?.(gemSize * 0.85) || CUT_POLYGONS['round'](gemSize * 0.85)}
                    fill={`url(#${gemFireId})`}
                    opacity="0.6"
                    transform="translate(0, -7)"
                  />
                  <polygon
                    points={CUT_POLYGONS[cut.id]?.(gemSize * 0.4) || CUT_POLYGONS['round'](gemSize * 0.4)}
                    fill={gemVis.tableColor}
                    opacity="0.45"
                    transform="translate(0, -7)"
                  />
                  <circle cx="47" cy="40" r={gemSize * 0.12} fill={gemVis.brilliance} opacity="0.7">
                    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
                  </circle>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    const cx = 50, cy = 43;
                    return (
                      <line
                        key={`facet-${i}`}
                        x1={cx}
                        y1={cy}
                        x2={cx + gemSize * 0.8 * Math.cos(angle)}
                        y2={(cy - 7) + gemSize * 0.8 * Math.sin(angle)}
                        stroke={gemVis.brilliance}
                        strokeWidth="0.3"
                        opacity="0.25"
                      />
                    );
                  })}
                  {[
                    { cx: 45, cy: 37, delay: 0 },
                    { cx: 55, cy: 40, delay: 1.2 },
                    { cx: 48, cy: 46, delay: 2.4 },
                  ].map((spark, i) => (
                    <circle key={`spark-${i}`} cx={spark.cx} cy={spark.cy} r="0.8" fill="#FFFFFF">
                      <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin={`${spark.delay}s`} repeatCount="indefinite" />
                      <animate attributeName="r" values="0.5;1.2;0.5" dur="2.5s" begin={`${spark.delay}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </motion.g>
              </AnimatePresence>
            </g>
          )}

          {/* ── ENGRAVING TEXT ── */}
          {engravingText && (
            <text
              fontSize="3"
              fill={palette.inner[1]}
              fontFamily="'Playfair Display', serif"
              fontStyle="italic"
              letterSpacing="0.5"
              opacity="0.6"
            >
              <textPath href="#engravePath" startOffset="50%" textAnchor="middle">
                {engravingText}
              </textPath>
            </text>
          )}
        </svg>

        {/* ── AMBIENT LIGHT REFLECTION ── */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full opacity-20"
          style={{
            background: `radial-gradient(ellipse 60% 30% at 35% 35%, ${palette.highlight}, transparent)`,
          }}
        />
      </motion.div>

      {/* ── SURFACE SHADOW ── */}
      <div
        className="absolute bottom-[12%] left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '55%',
          height: '8px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
};

export default RealisticRing;
