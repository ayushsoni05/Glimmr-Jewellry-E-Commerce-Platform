import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: string, id: number }
  const [timerId, setTimerId] = useState(null);

  const hide = useCallback(() => {
    setToast(null);
    if (timerId) {
      clearTimeout(timerId);
    }
  }, [timerId]);

  const show = useCallback((type, message, duration = 3000) => {
    if (timerId) clearTimeout(timerId);
    setToast({ type, message, duration, id: Date.now() });
    const id = setTimeout(() => setToast(null), duration);
    setTimerId(id);
  }, [timerId]);

  const success = useCallback((message, duration) => show('success', message, duration), [show]);
  const error = useCallback((message, duration) => show('error', message, duration), [show]);
  const info = useCallback((message, duration) => show('info', message, duration), [show]);

  const value = useMemo(() => ({ show, success, error, info, hide }), [show, success, error, info, hide]);

  const variant = toast?.type || 'info';

  const renderIcon = () => {
    if (variant === 'success') {
      return (
        <div className="w-7 h-7 rounded-full bg-[#B59A6C]/20 border border-[#B59A6C]/40 text-[#B59A6C] flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm">
          ✓
        </div>
      );
    }
    if (variant === 'error') {
      return (
        <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm">
          ✕
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm">
        ✨
      </div>
    );
  };

  const getLabel = () => {
    if (variant === 'success') return 'GLIMMR CONCIERGE';
    if (variant === 'error') return 'NOTICE';
    return 'ATELIER UPDATE';
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 w-full max-w-md flex justify-center">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative w-full bg-[#222222]/95 text-white backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-4 pr-10 flex items-center gap-3.5 rounded-none overflow-hidden"
            >
              {renderIcon()}

              <div className="flex-1 min-w-0 text-left">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#B59A6C] block leading-tight">
                  {getLabel()}
                </span>
                <p className="font-body text-xs text-gray-200 font-medium leading-snug mt-0.5 truncate">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={hide}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 text-sm font-bold"
                title="Dismiss"
              >
                ✕
              </button>

              {/* Animated Bottom Timer Bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 3000) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-[2px] ${variant === 'error' ? 'bg-rose-500' : 'bg-[#B59A6C]'}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
