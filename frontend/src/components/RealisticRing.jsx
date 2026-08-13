import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────
   METAL GRADIENT PALETTES
   Each metal gets a multi-stop linear gradient that mimics
   real metallic luster with highlights and shadow bands.
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
   Each gem gets facet colors, fire dispersion hues, and
   brilliance patterns for the CSS-rendered top-down view.
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
   Each cut produces a different SVG polygon for the
   top-down "table" view of the gemstone.
   ────────────────────────────────────────────────────────── */
const CUT_POLYGONS = {
  'round': (s) => {
    // Brilliant round — circle approximated as 16-gon
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${50 + s * Math.cos(angle)},${50 + s * Math.sin(angle)}`);
    }
    return pts.join(' ');
  },
  'emerald-cut': (s) => {
    // Emerald — elongated octagon
    const w = s * 1.15, h = s * 0.85, c = s * 0.25;
    return `${50 - w + c},${50 - h} ${50 + w - c},${50 - h} ${50 + w},${50 - h + c} ${50 + w},${50 + h - c} ${50 + w - c},${50 + h} ${50 - w + c},${50 + h} ${50 - w},${50 + h - c} ${50 - w},${50 - h + c}`;
  },
  'princess': (s) => {
    // Princess — square rotated 0°
    return `${50},${50 - s} ${50 + s},${50} ${50},${50 + s} ${50 - s},${50}`;
  },
  'oval': (s) => {
    // Oval — elongated ellipse as polygon
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${50 + s * 1.3 * Math.cos(angle)},${50 + s * 0.85 * Math.sin(angle)}`);
    }
    return pts.join(' ');
  },
  'cushion': (s) => {
    // Cushion — rounded square (approximated)
    const r = s * 0.3;
    return `${50 - s + r},${50 - s} ${50 + s - r},${50 - s} ${50 + s},${50 - s + r} ${50 + s},${50 + s - r} ${50 + s - r},${50 + s} ${50 - s + r},${50 + s} ${50 - s},${50 + s - r} ${50 - s},${50 - s + r}`;
  },
  'pear': (s) => {
    // Pear — teardrop shape
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
}) => {
  const palette = METAL_GRADIENTS[metal.id] || METAL_GRADIENTS['24k-gold'];
  const gemVis = GEM_VISUALS[gemstone.id] || null;
  const hasGem = gemstone.id !== 'no-stone' && gemVis;

  // Band thickness scales with weight (3g=thin → 25g=thick)
  const bandThickness = useMemo(() => {
    return 12 + ((bandWeight - 3) / 22) * 18; // 12px to 30px
  }, [bandWeight]);

  // Gem size scales with carat (0.25ct → 5ct)
  const gemSize = useMemo(() => {
    return 14 + (caratWeight / 5) * 22; // 14 to 36 in SVG units
  }, [caratWeight]);

  const gradientId = `metalGrad-${metal.id}`;
  const innerGradientId = `innerGrad-${metal.id}`;
  const highlightId = `highlight-${metal.id}`;
  const shadowFilterId = `bandShadow`;
  const gemGradientId = `gemGrad-${gemstone.id}`;
  const gemFireId = `gemFire-${gemstone.id}`;

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
            {/* Metallic band gradient — horizontal sweep for luster */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {palette.band.map((color, i) => (
                <stop key={i} offset={`${(i / (palette.band.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>

            {/* Inner ring gradient — darker interior */}
            <linearGradient id={innerGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {palette.inner.map((color, i) => (
                <stop key={i} offset={`${(i / (palette.inner.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>

            {/* Specular highlight */}
            <radialGradient id={highlightId} cx="35%" cy="30%" r="40%">
              <stop offset="0%" stopColor={palette.highlight} stopOpacity="0.9" />
              <stop offset="60%" stopColor={palette.highlight} stopOpacity="0.15" />
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

            {/* Engraving text path — inner ellipse */}
            <path
              id="engravePath"
              d={`M 30,52 A 20,8 0 1,1 70,52`}
              fill="none"
            />
          </defs>

          {/* ── RING BAND (3/4 perspective view) ── */}
          <g filter={`url(#${shadowFilterId})`}>
            {/* Back half of ring — slightly behind, creates 3D depth */}
            <ellipse
              cx="50" cy="55"
              rx="32" ry="12"
              fill="none"
              stroke={`url(#${innerGradientId})`}
              strokeWidth={bandThickness * 0.85}
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Main ring band — front arc (the visible part) */}
            <ellipse
              cx="50" cy="55"
              rx="32" ry="12"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={bandThickness}
              strokeLinecap="round"
              filter="url(#innerShadow)"
            />

            {/* Specular highlight sweep across the top-front face */}
            <ellipse
              cx="50" cy="55"
              rx="32" ry="12"
              fill="none"
              stroke={`url(#${highlightId})`}
              strokeWidth={bandThickness * 0.6}
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Thin bright edge highlight — top rim */}
            <ellipse
              cx="50" cy="55"
              rx={32 + bandThickness * 0.25}
              ry={12 + bandThickness * 0.08}
              fill="none"
              stroke={palette.highlight}
              strokeWidth="0.4"
              opacity="0.5"
            />

            {/* Thin dark edge — bottom rim for depth */}
            <ellipse
              cx="50" cy="55"
              rx={32 - bandThickness * 0.25}
              ry={12 - bandThickness * 0.08}
              fill="none"
              stroke={palette.inner[2]}
              strokeWidth="0.3"
              opacity="0.4"
            />
          </g>

          {/* ── PRONG SETTING ── */}
          {hasGem && (
            <g>
              {/* 4-prong basket */}
              {[
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
              {/* Prong tips — small circles gripping the stone */}
              {[
                { cx: 50 - gemSize * 0.2, cy: 43 - gemSize * 0.45 },
                { cx: 50 + gemSize * 0.2, cy: 43 - gemSize * 0.45 },
                { cx: 50 - gemSize * 0.4, cy: 43 - gemSize * 0.2 },
                { cx: 50 + gemSize * 0.4, cy: 43 - gemSize * 0.2 },
              ].map((tip, i) => (
                <motion.circle
                  key={`tip-${i}`}
                  cx={tip.cx} cy={tip.cy}
                  r="1"
                  fill={palette.highlight}
                  stroke={palette.prong}
                  strokeWidth="0.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.4 + i * 0.05 }}
                />
              ))}
            </g>
          )}

          {/* ── GEMSTONE ── */}
          <AnimatePresence>
            {hasGem && (
              <motion.g
                key={`${gemstone.id}-${cut.id}-${caratWeight}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                style={{ transformOrigin: '50px 43px' }}
              >
                {/* Main gemstone body */}
                <polygon
                  points={CUT_POLYGONS[cut.id]?.(gemSize) || CUT_POLYGONS['round'](gemSize)}
                  fill={`url(#${gemGradientId})`}
                  stroke={gemVis.crownColor}
                  strokeWidth="0.5"
                  opacity="0.92"
                  transform="translate(0, -7)"
                />

                {/* Fire dispersion overlay */}
                <polygon
                  points={CUT_POLYGONS[cut.id]?.(gemSize * 0.85) || CUT_POLYGONS['round'](gemSize * 0.85)}
                  fill={`url(#${gemFireId})`}
                  opacity="0.6"
                  transform="translate(0, -7)"
                />

                {/* Table facet — bright center reflection */}
                <polygon
                  points={CUT_POLYGONS[cut.id]?.(gemSize * 0.4) || CUT_POLYGONS['round'](gemSize * 0.4)}
                  fill={gemVis.tableColor}
                  opacity="0.45"
                  transform="translate(0, -7)"
                />

                {/* Brilliance point — white hot spot */}
                <circle
                  cx="47" cy="40"
                  r={gemSize * 0.12}
                  fill={gemVis.brilliance}
                  opacity="0.7"
                >
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Facet lines — radial lines from center to edge */}
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

                {/* Sparkle animation dots — simulates light catching facets */}
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
            )}
          </AnimatePresence>

          {/* ── ENGRAVING TEXT (curved along inner band) ── */}
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

        {/* ── AMBIENT LIGHT REFLECTION (CSS overlay) ── */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full opacity-20"
          style={{
            background: `radial-gradient(ellipse 60% 30% at 35% 35%, ${palette.highlight}, transparent)`,
          }}
        />
      </motion.div>

      {/* ── SURFACE SHADOW beneath the ring ── */}
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
