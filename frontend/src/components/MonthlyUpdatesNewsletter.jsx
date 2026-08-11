import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailIcon, SparklesIcon, CheckCircleIcon } from './Icons';
import api from '../api';
import { useToast } from '../contexts/ToastContext';

const DYNAMIC_JEWELRY_SHOWCASE = [
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    title: 'ROYAL KUNDAN HERITAGE',
    tag: '24K GOLD'
  },
  {
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    title: 'VVS SOLITAIRE DIAMOND',
    tag: '18K GOLD'
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    title: 'TEMPLE BRIDAL NECKLACE',
    tag: '22K GOLD'
  },
  {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    title: 'ARTISANAL HASLI CUFF',
    tag: '925 SILVER'
  },
  {
    url: 'https://images.unsplash.com/photo-1611591475140-be38b738eaad?q=80&w=800&auto=format&fit=crop',
    title: 'EMERALD ROYAL DROP',
    tag: 'HIGH JEWELRY'
  },
  {
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    title: 'ROSE GOLD CHRONOGRAPH',
    tag: 'ATELIER WATCH'
  }
];

const MonthlyUpdatesNewsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const { success: toastSuccess, error: toastError } = useToast();

  // Auto-rotate dynamic jewelry showcase every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % DYNAMIC_JEWELRY_SHOWCASE.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/newsletter/subscribe', { email: email.trim() });
      if (res.data && res.data.success) {
        setVoucherCode(res.data.voucherCode);
        setIsSubmitted(true);
        if (res.data.alreadySubscribed) {
          toastSuccess(res.data.message || `Welcome back! Your code is ${res.data.voucherCode}`);
        } else {
          toastSuccess('Welcome to Glimmr Privé! 10% Voucher code generated.');
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toastError(err.response?.data?.error || 'Failed to process subscription. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyVoucher = () => {
    if (!voucherCode) return;
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    toastSuccess(`Voucher code ${voucherCode} copied to clipboard!`);
    setTimeout(() => setCopied(false), 3000);
  };

  const currentShowcase = DYNAMIC_JEWELRY_SHOWCASE[activeImgIndex];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="relative max-w-[1520px] mx-auto my-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative bg-[#111111] text-[#FAF9F7] rounded-[24px] py-10 px-6 sm:px-10 lg:px-14 overflow-hidden border border-[#B59A6C]/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        
        {/* Subtle Webflow Luxury Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B59A6C_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Form & Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Webflow Pill Badge with Gold Halo Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#FDF2F0] border border-[#E8C8C1] rounded-full"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B59A6C] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B59A6C]" />
              </span>
              <span className="text-[11px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
                ATELIER PRIVÉ VIP CLUB
              </span>
            </motion.div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[0.15em] font-normal leading-tight text-white">
              Get Monthly Updates
            </h2>

            <p className="font-body text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
              Join the Glimmr Social Club for early access to private Kundan pre-launches, live metal rate alerts, and exclusive patron rewards.
            </p>

            {/* Perks Bar */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-[11px] font-mono text-gray-400 uppercase tracking-widest pt-1">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 border border-white/10">
                <SparklesIcon size={12} className="text-[#B59A6C]" />
                10% Welcome Reward
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 border border-white/10">
                <SparklesIcon size={12} className="text-[#B59A6C]" />
                Private Pre-Launches
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 border border-white/10">
                <SparklesIcon size={12} className="text-[#B59A6C]" />
                No Spam Guarantee
              </span>
            </div>

            {/* Form & Success State */}
            <div className="pt-2">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#FAF9F7] text-[#111111] p-5 max-w-md border border-[#B59A6C] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <CheckCircleIcon size={22} className="text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111]">
                          WELCOME TO GLIMMR PRIVÉ!
                        </h4>
                        <p className="text-[11px] font-body text-gray-600 mt-0.5">
                          Your 10% welcome voucher: <strong className="font-mono text-[#B59A6C]">{voucherCode}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={copyVoucher}
                      className="px-4 py-2 bg-[#111111] text-white text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors shrink-0 cursor-pointer"
                    >
                      {copied ? 'COPIED ✓' : 'COPY CODE'}
                    </button>
                  </motion.div>
                ) : (
                  <form 
                    key="form"
                    onSubmit={handleSubmit}
                    className="max-w-md mx-auto lg:mx-0 flex flex-col sm:flex-row gap-3 items-center"
                  >
                    <div className="relative w-full sm:flex-1">
                      <MailIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B59A6C]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-gray-400 font-body text-xs focus:outline-none focus:border-[#B59A6C] transition-colors"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#B59A6C] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#111111] transition-colors shadow-md shrink-0 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>SUBSCRIBING...</span>
                        </>
                      ) : (
                        <span>SUBSCRIBE</span>
                      )}
                    </motion.button>
                  </form>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Dynamic Auto-Rotating High-Resolution Fine Jewelry Showcase Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-3">
            <div className="relative w-full max-w-[380px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-[16px] overflow-hidden border border-[#B59A6C]/40 shadow-[0_15px_35px_rgba(0,0,0,0.3)] bg-[#FAF9F7] group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentShowcase.url}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
                  src={currentShowcase.url}
                  alt={currentShowcase.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white z-10">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">
                  {currentShowcase.title}
                </span>
                <span className="font-mono text-[10px] text-[#B59A6C] bg-black/80 px-2.5 py-0.5 border border-[#B59A6C]/40 font-bold">
                  {currentShowcase.tag}
                </span>
              </div>
            </div>

            {/* Micro Gallery Indicators */}
            <div className="flex items-center gap-1.5">
              {DYNAMIC_JEWELRY_SHOWCASE.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeImgIndex === i ? 'w-6 bg-[#B59A6C]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Showcase image ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </motion.section>
  );
};

export default MonthlyUpdatesNewsletter;
