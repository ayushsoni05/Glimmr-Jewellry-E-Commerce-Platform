import React from 'react';
import { motion } from 'framer-motion';
import GlimmrLogo from './GlimmrLogo';

const GlimmrLoader = ({
  size = 'lg',
  subtitle = 'GLIMMR ATELIER • CRAFTING PERFECTION',
  fullScreen = false,
}) => {
  const animationContent = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Pixel-perfect Reliqium-style logo animation for GLIMMR */}
      <div className="mb-8">
        <GlimmrLogo autoLoop={true} size={size} variant="dark" />
      </div>

      {/* Minimal gold shimmer accent line */}
      <div className="w-24 sm:w-32 h-[1px] bg-gray-200/40 relative overflow-hidden rounded-full mb-5">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-[#B59A6C]/60 to-transparent"
        />
      </div>

      {/* Subtle subtitle */}
      {subtitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-flex items-center gap-2"
        >
          <span
            className="font-body uppercase font-medium text-[#aaaaaa]"
            style={{
              fontFamily: "'Josefin Sans', 'DM Sans', sans-serif",
              fontWeight: 200,
              fontSize: '10px',
              letterSpacing: '0.3em',
            }}
          >
            {subtitle}
          </span>
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-sm flex items-center justify-center">
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
