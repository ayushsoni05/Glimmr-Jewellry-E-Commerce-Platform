import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GlimmrLogo — Pixel-perfect replica of the Reliqium logo.gif animation
 * adapted for "GLIMMR".
 *
 * Animation timeline (3.71s total loop, matching 111 frames @ ~33ms):
 *   Phase 1  Blank         0–700ms
 *   Phase 2  Cursor blink  700–1700ms  (3 on/off cycles)
 *   Phase 3  Typewriter    1700–2335ms (6 letters @ ~105ms each)
 *   Phase 4  Hold          2335–3710ms
 *
 * Visual specs extracted from frame-by-frame pixel analysis:
 *   Text color   #969696  (ultra-light silver-gray, anti-aliased)
 *   Font         Josefin Sans weight 100  (hair-thin uppercase sans-serif)
 *   Tracking     0.45em   (~7-8px gaps between letters at GIF scale)
 *   Cursor       thin "|" bar, same gray, opacity blink
 */

const LETTERS = ['G', 'L', 'I', 'M', 'M', 'R'];

// Timing constants (milliseconds) — matched to original GIF
const PHASE_BLANK     = 700;
const PHASE_CURSOR    = 1000;   // 3 blink cycles
const LETTER_DELAY    = 105;    // ~105ms per letter typed
const PHASE_HOLD      = 1375;   // hold full text until loop restarts

const GlimmrLogo = ({
  autoLoop = true,
  variant = 'dark',   // 'dark' (light bg) | 'light' (dark bg)
  size = 'md',        // 'sm' | 'md' | 'lg'
  showSubtext = false,
}) => {
  const [phase, setPhase] = useState(autoLoop ? 'blank' : 'hold');
  const [visibleCount, setVisibleCount] = useState(autoLoop ? 0 : LETTERS.length);
  const [cursorVisible, setCursorVisible] = useState(false);
  const mounted = useRef(true);

  // Run the full animation cycle
  const runCycle = useCallback(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const ok = () => mounted.current;

    while (ok()) {
      // Phase 1: Blank
      setPhase('blank');
      setVisibleCount(0);
      setCursorVisible(false);
      await sleep(PHASE_BLANK);
      if (!ok()) break;

      // Phase 2: Cursor blink (3 on/off cycles @ ~167ms each half)
      setPhase('cursor');
      for (let i = 0; i < 3; i++) {
        setCursorVisible(true);
        await sleep(167);
        if (!ok()) break;
        setCursorVisible(false);
        await sleep(167);
        if (!ok()) break;
      }
      if (!ok()) break;

      // Phase 3: Typewriter — letters appear one by one left to right
      setPhase('typing');
      setCursorVisible(true);
      for (let i = 1; i <= LETTERS.length; i++) {
        setVisibleCount(i);
        await sleep(LETTER_DELAY);
        if (!ok()) break;
      }
      if (!ok()) break;

      // Phase 4: Hold full text
      setPhase('hold');
      setCursorVisible(false);
      await sleep(PHASE_HOLD);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (autoLoop) {
      runCycle();
    } else {
      setPhase('hold');
      setVisibleCount(LETTERS.length);
      setCursorVisible(false);
    }
    return () => { mounted.current = false; };
  }, [autoLoop, runCycle]);

  // Size presets
  const sizeConfig = {
    sm: { fontSize: '20px', cursorH: '16px', gap: '0.4em' },
    md: { fontSize: '28px', cursorH: '22px', gap: '0.45em' },
    lg: { fontSize: '42px', cursorH: '34px', gap: '0.45em' },
  };
  const cfg = sizeConfig[size] || sizeConfig.md;

  // Color based on variant
  const textColor = variant === 'light' ? '#c0c0c0' : '#969696';
  const cursorColor = variant === 'light' ? '#b0b0b0' : '#969696';

  return (
    <div className="inline-flex flex-col items-center justify-center select-none">
      {/* Logo container — maintains fixed height to prevent layout shift */}
      <div
        className="relative flex items-center justify-center"
        style={{
          minHeight: cfg.cursorH,
          fontFamily: "'Josefin Sans', 'DM Sans', sans-serif",
          fontWeight: 100,
          fontSize: cfg.fontSize,
          letterSpacing: cfg.gap,
          textTransform: 'uppercase',
          color: textColor,
          lineHeight: 1,
        }}
      >
        {/* Letters */}
        {phase !== 'blank' && (
          <span className="inline-flex items-center">
            {LETTERS.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: i < visibleCount ? 1 : 0 }}
                transition={{ duration: 0.06, ease: 'linear' }}
                style={{
                  display: 'inline-block',
                  visibility: i < visibleCount ? 'visible' : 'hidden',
                  width: i < visibleCount ? 'auto' : 0,
                  overflow: 'hidden',
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        )}

        {/* Cursor bar */}
        {(phase === 'cursor' || phase === 'typing') && (
          <motion.span
            animate={{ opacity: cursorVisible ? 1 : 0 }}
            transition={{ duration: 0.05 }}
            style={{
              display: 'inline-block',
              width: '1.5px',
              height: cfg.cursorH,
              backgroundColor: cursorColor,
              marginLeft: phase === 'cursor' ? 0 : '2px',
              verticalAlign: 'middle',
            }}
          />
        )}
      </div>

      {/* Optional subtext */}
      {showSubtext && phase === 'hold' && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            fontFamily: "'Josefin Sans', 'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: '9px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: variant === 'light' ? '#B59A6C' : '#aaaaaa',
            marginTop: '6px',
          }}
        >
          FINE JEWELRY
        </motion.span>
      )}
    </div>
  );
};

export default GlimmrLogo;
