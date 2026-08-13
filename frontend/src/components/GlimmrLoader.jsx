import React from 'react';
import { motion } from 'framer-motion';
import GlimmrLogo from './GlimmrLogo';

const GlimmrLoader = ({ 
  size = 'lg', 
  subtitle = 'GLIMMR ATELIER • CRAFTING PERFECTION',
  fullScreen = false 
}) => {
  const animationContent = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Replicated Reliqium Logo Animation for GLIMMR */}
      <div className="mb-6">
        <GlimmrLogo autoLoop={true} size={size} variant="dark" />
      </div>

      {/* Webflow Gold Accent Shimmer Line */}
      <div className="w-36 sm:w-48 h-[2px] bg-gray-200/60 relative overflow-hidden rounded-full mb-5">
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
