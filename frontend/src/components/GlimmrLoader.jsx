import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const GlimmrLoader = ({ 
  size = 'md', 
  subtitle = 'CURATING ATELIER SELECTIONS...',
  fullScreen = false 
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44 sm:w-52 sm:h-52',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
  };

  const animationContent = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      <div className={`${sizeMap[size] || sizeMap.md} relative flex items-center justify-center`}>
        {!hasError ? (
          <DotLottieReact
            src="https://lottie.host/94bde3aa-ea68-483b-8777-68c2f12f0d24/yUBmU18gqd.lottie"
            loop
            autoplay
            className="w-full h-full object-contain"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-[#B59A6C]/20 border-t-[#B59A6C] animate-spin" />
            <span className="font-heading text-lg font-bold text-[#B59A6C] tracking-widest">G</span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-4 font-body text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#B59A6C] animate-pulse">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF9F7]/95 backdrop-blur-md flex items-center justify-center">
        {animationContent}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[320px] flex items-center justify-center py-12">
      {animationContent}
    </div>
  );
};

export default GlimmrLoader;
