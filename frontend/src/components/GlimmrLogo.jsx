import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlimmrLogo = ({ 
  autoLoop = true, 
  variant = 'dark', // 'dark' (light bg) | 'light' (dark bg)
  size = 'md',      // 'sm' | 'md' | 'lg'
  showSubtext = false
}) => {
  const [phase, setPhase] = useState('expanded'); // 'ring' | 'expanding' | 'expanded' | 'contracting'
  const [isHovered, setIsHovered] = useState(false);

  // Auto-loop timing cycle matching Reliqium logo gif sequence (4.5s loop)
  useEffect(() => {
    if (!autoLoop) {
      setPhase('expanded');
      return;
    }

    let isMounted = true;
    const runCycle = async () => {
      while (isMounted) {
        // Phase 1: Ring origin (0.8s)
        setPhase('ring');
        await new Promise(r => setTimeout(r, 900));
        if (!isMounted) break;

        // Phase 2: Expanding letters (0.8s)
        setPhase('expanding');
        await new Promise(r => setTimeout(r, 800));
        if (!isMounted) break;

        // Phase 3: Hold expanded with metallic sheen (2.2s)
        setPhase('expanded');
        await new Promise(r => setTimeout(r, 2200));
        if (!isMounted) break;

        // Phase 4: Contracting back to ring (0.7s)
        setPhase('contracting');
        await new Promise(r => setTimeout(r, 700));
      }
    };

    runCycle();
    return () => { isMounted = false; };
  }, [autoLoop]);

  const isExpandedState = phase === 'expanding' || phase === 'expanded' || (!autoLoop && isHovered);

  // Sizing maps
  const sizeMap = {
    sm: {
      fontSize: 'text-xl sm:text-2xl',
      ringSize: 'w-5 h-5',
      tracking: 'tracking-[0.25em]',
      gap: 'gap-1',
    },
    md: {
      fontSize: 'text-2xl sm:text-3xl',
      ringSize: 'w-7 h-7',
      tracking: 'tracking-[0.3em]',
      gap: 'gap-2',
    },
    lg: {
      fontSize: 'text-4xl sm:text-5xl lg:text-6xl',
      ringSize: 'w-10 h-10 sm:w-12 sm:h-12',
      tracking: 'tracking-[0.35em]',
      gap: 'gap-3 sm:gap-4',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Text color gradients based on variant
  const textColorClass = variant === 'light'
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FAF9F7] via-[#E8DCC4] to-[#B59A6C]'
    : 'text-transparent bg-clip-text bg-gradient-to-r from-[#111111] via-[#B59A6C] to-[#111111]';

  const ringBorderClass = variant === 'light'
    ? 'border-[#B59A6C]'
    : 'border-[#111111] border-t-[#B59A6C]';

  return (
    <div 
      className="inline-flex flex-col items-center justify-center select-none cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative flex items-center justify-center font-heading font-extrabold ${currentSize.fontSize} ${currentSize.gap}`}>
        
        {/* Left Branch Letters: G L I (slide left from center) */}
        <AnimatePresence>
          {(isExpandedState || phase === 'expanded') && (
            <motion.div
              initial={{ opacity: 0, x: 28, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 28, filter: 'blur(4px)' }}
              transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <span className={textColorClass}>G</span>
              <span className={textColorClass}>L</span>
              <span className={textColorClass}>I</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Ring Motif (Transforms between Ring Symbol & Center Letter) */}
        <div className="relative flex items-center justify-center">
          {/* Central Ring Symbol when collapsed */}
          <AnimatePresence mode="wait">
            {!isExpandedState && phase === 'ring' ? (
              <motion.div
                key="ring-symbol"
                initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`${currentSize.ringSize} rounded-full border-2 ${ringBorderClass} relative flex items-center justify-center shadow-[0_0_12px_rgba(181,154,108,0.4)]`}
              >
                {/* Central Gold Core Gem Dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C] animate-pulse" />
              </motion.div>
            ) : (
              /* Center M Symbol when expanded */
              <motion.span
                key="letter-m"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={textColorClass}
              >
                M
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Right Branch Letters: M R (slide right from center) */}
        <AnimatePresence>
          {(isExpandedState || phase === 'expanded') && (
            <motion.div
              initial={{ opacity: 0, x: -28, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -28, filter: 'blur(4px)' }}
              transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <span className={textColorClass}>M</span>
              <span className={textColorClass}>R</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metallic Sheen Swipe Overlay Effect */}
        {phase === 'expanded' && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        )}
      </div>

      {/* Optional Atelier Subtext Tagline */}
      {showSubtext && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-body text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] mt-1 ${
            variant === 'light' ? 'text-[#B59A6C]' : 'text-gray-400'
          }`}
        >
          FINE JEWELRY • ATELIER
        </motion.span>
      )}

      {/* Webflow Underline Accent on Hover */}
      <div className="w-full h-[1.5px] bg-transparent relative overflow-hidden mt-1">
        <span className={`absolute bottom-0 left-0 w-0 h-full transition-all duration-300 group-hover:w-full ${
          variant === 'light' ? 'bg-[#B59A6C]' : 'bg-[#111111]'
        }`} />
      </div>
    </div>
  );
};

export default GlimmrLogo;
