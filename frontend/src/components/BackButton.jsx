import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on Home page
  if (location.pathname === '/') return null;

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.9, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: -10 }}
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        onClick={handleBack}
        className="fixed top-28 left-3 sm:left-6 z-[60] flex items-center gap-2 px-3.5 py-1.5 bg-[#111111]/90 hover:bg-[#111111] text-[#FAF9F7] shadow-lg backdrop-blur-md border border-white/20 transition-all font-body text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer group"
        aria-label="Go Back"
        title="Go back to previous page"
      >
        <motion.span
          animate={{ x: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="text-xs leading-none font-bold text-[#B59A6C]"
        >
          ←
        </motion.span>
        <span className="font-bold text-[10px] tracking-widest text-white">Back</span>
      </motion.button>
    </AnimatePresence>
  );
};

export default BackButton;
