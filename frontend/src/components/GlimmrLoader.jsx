import React from 'react';
import { motion } from 'framer-motion';

const GlimmrLoader = ({ 
  size = 'md', 
  subtitle = 'GLIMMR ATELIER • CRAFTING PERFECTION',
  fullScreen = false 
}) => {
  const letters = ['G', 'L', 'I', 'M', 'M', 'R'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 18, 
      scale: 0.8,
      filter: 'blur(4px)' 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const sizeScales = {
    sm: 'scale-75',
    md: 'scale-100',
    lg: 'scale-125',
  };

  const animationContent = (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${sizeScales[size] || sizeScales.md}`}>
      {/* 1. Radiant Crown & Solitaire Diamond Emblem */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
        {/* Ambient Radial Gold Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#B59A6C_0%,transparent_70%)] opacity-25 blur-xl animate-pulse" />

        {/* Outer Rotating Gold Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#B59A6C]/50"
        />

        {/* Inner Counter-Rotating Precision Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border border-t-[#B59A6C] border-r-transparent border-b-[#E8DCC4] border-l-transparent"
        />

        {/* Central Solitaire Diamond Sparkle SVG */}
        <motion.div
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 text-[#B59A6C] drop-shadow-[0_0_12px_rgba(181,154,108,0.5)]"
        >
          <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {/* Solitaire Diamond Sparkle Path */}
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="url(#goldGradient)"
              stroke="#B59A6C"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
            {/* Secondary Accent Stars */}
            <path d="M19 4L19.8 6.2L22 7L19.8 7.8L19 10L18.2 7.8L16 7L18.2 6.2L19 4Z" fill="#E8DCC4" opacity="0.9" />
            <path d="M5 16L5.6 17.65L7.25 18.25L5.6 18.85L5 20.5L4.4 18.85L2.75 18.25L4.4 17.65L5 16Z" fill="#B59A6C" opacity="0.8" />
            
            <defs>
              <linearGradient id="goldGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E8DCC4" />
                <stop offset="50%" stopColor="#B59A6C" />
                <stop offset="100%" stopColor="#8A6D3B" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* 2. Staggered Animated Brand Name: G L I M M R */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-4"
      >
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-[#FAF9F7] via-[#B59A6C] to-[#8A6D3B] drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {/* 3. Expanding Webflow Metallic Gold Accent Bar */}
      <div className="w-36 sm:w-44 h-[2px] bg-gray-200/60 relative overflow-hidden rounded-full mb-5">
        <motion.div
          animate={{ 
            x: ['-100%', '100%'],
          }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-[#B59A6C] to-transparent shadow-[0_0_8px_#B59A6C]"
        />
      </div>

      {/* 4. Luxury Atelier Subtitle Pill Badge */}
      {subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FAF9F7] border border-[#B59A6C]/30 rounded-full shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C] animate-ping" />
          <span className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#B59A6C]">
            {subtitle}
          </span>
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF9F7]/98 backdrop-blur-lg flex items-center justify-center">
        {animationContent}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[360px] flex items-center justify-center py-12">
      {animationContent}
    </div>
  );
};

export default GlimmrLoader;
