import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';

const GlimmrLoader = ({ 
  size = 'md', 
  subtitle = 'GLIMMR ATELIER • CRAFTING PERFECTION',
  fullScreen = false 
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    sm: 'w-28 h-28',
    md: 'w-48 h-48 sm:w-60 sm:h-60',
    lg: 'w-64 h-64 sm:w-80 sm:h-80',
  };

  const animationContent = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Container for Exact Lottie Animation */}
      <div className={`${sizeMap[size] || sizeMap.md} relative flex items-center justify-center`}>
        {!hasError ? (
          <DotLottieReact
            src="https://lottie.host/16b69e12-0efb-4061-b33d-12dc2b93fd84/Ax2k12jKRd.lottie"
            loop
            autoplay
            className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(181,154,108,0.25)]"
            onError={() => setHasError(true)}
          />
        ) : (
          /* Graceful Fallback Indicator */
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 rounded-full border-2 border-[#B59A6C]/20 border-t-[#B59A6C] animate-spin" />
            <span className="font-heading text-xl font-bold text-[#B59A6C] tracking-widest">GLIMMR</span>
          </div>
        )}
      </div>

      {/* Webflow Gold Accent Shimmer Line */}
      <div className="w-32 sm:w-40 h-[2px] bg-gray-200/60 relative overflow-hidden rounded-full mt-2 mb-4">
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

      {/* Luxury Subtitle Badge */}
      {subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
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
      <div className="fixed inset-0 z-50 bg-[#FAF9F7]/98 backdrop-blur-md flex items-center justify-center">
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
