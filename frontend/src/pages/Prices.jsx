import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import MonthlyUpdatesNewsletter from '../components/MonthlyUpdatesNewsletter';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SparkleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.85 || p.alpha < 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(181, 154, 108, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#B59A6C';
        ctx.fill();
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-75" />;
};

const Prices = () => {
  const [points, setPoints] = useState([]);
  const [last, setLast] = useState(null);
  const [currency, setCurrency] = useState('inr');
  const [metal, setMetal] = useState('gold'); // 'gold' or 'silver'
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcPurity, setCalcPurity] = useState('24k');

  const { success: toastSuccess, error: toastError } = useToast();
  const { user } = useAuth();

  const fetchPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get(`/prices?currency=${currency}`);
      const payload = res.data || {};
      setLast(payload);
      setPoints(prev => {
        const next = [
          ...prev,
          {
            t: payload.timestamp || new Date().toISOString(),
            g24: payload.gold_10g_24k ?? 0,
            g22: payload.gold_10g_22k ?? 0,
            g18: payload.gold_10g_18k ?? 0,
            s10: payload.silver && payload.silver.price ? Math.round(Number(payload.silver.price) * 10) : 0,
          },
        ];
        return next.slice(-50);
      });
    } catch (e) {
      console.error('Error fetching prices:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [currency]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, [currency, fetchPrices]);

  const currencySymbol = currency === 'inr' ? '₹' : '£';

  // Calculator price calculation
  const getCalculatedPrice = () => {
    if (!last) return 0;
    let basePricePerGram = 0;
    if (calcPurity === '24k') basePricePerGram = (last.gold_10g_24k || 0) / 10;
    else if (calcPurity === '22k') basePricePerGram = (last.gold_10g_22k || 0) / 10;
    else if (calcPurity === '18k') basePricePerGram = (last.gold_10g_18k || 0) / 10;
    else if (calcPurity === 'silver') basePricePerGram = (last.silver?.price ? Number(last.silver.price) : 0);

    return Math.round(basePricePerGram * (Number(calcWeight) || 0));
  };

  // Peak and lowest rate calculation for micro metrics bar
  const g24Rates = points.map(p => p.g24).filter(Boolean);
  const peakRate = g24Rates.length ? Math.max(...g24Rates) : (last?.gold_10g_24k || 0);
  const lowestRate = g24Rates.length ? Math.min(...g24Rates) : (last?.gold_10g_24k || 0);

  const dataGold = {
    labels: points.map(p => new Date(p.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: '24K Pure Gold (10g)',
        data: points.map(p => p.g24 || 0),
        borderColor: '#B59A6C',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(181, 154, 108, 0.35)');
          gradient.addColorStop(1, 'rgba(181, 154, 108, 0.02)');
          return gradient;
        },
        borderWidth: 2.5,
        tension: 0.45,
        pointRadius: 4,
        pointBackgroundColor: '#B59A6C',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointHoverRadius: 7,
        fill: true,
      },
      {
        label: '22K Bridal Gold (10g)',
        data: points.map(p => p.g22 || 0),
        borderColor: '#D4AF37',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(212, 175, 55, 0.20)');
          gradient.addColorStop(1, 'rgba(212, 175, 55, 0.01)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.45,
        pointRadius: 3,
        pointBackgroundColor: '#D4AF37',
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: '18K Solitaire Gold (10g)',
        data: points.map(p => p.g18 || 0),
        borderColor: '#64748B',
        backgroundColor: 'rgba(100, 116, 139, 0.05)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.45,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: false,
      },
    ],
  };

  const dataSilver = {
    labels: points.map(p => new Date(p.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: '925 Fine Sterling Silver (10g)',
        data: points.map(p => p.s10 || 0),
        borderColor: '#475569',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(71, 85, 105, 0.25)');
          gradient.addColorStop(1, 'rgba(71, 85, 105, 0.01)');
          return gradient;
        },
        borderWidth: 2.5,
        tension: 0.45,
        pointRadius: 4,
        pointBackgroundColor: '#475569',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointHoverRadius: 7,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#222222',
          font: { family: 'Cinzel, Georgia, serif', size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#FAF9F7',
        titleColor: '#222222',
        bodyColor: '#555555',
        borderColor: '#B59A6C',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 8,
        titleFont: { family: 'Cinzel, Georgia, serif', size: 12, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y || 0;
            return `${ctx.dataset.label}: ${currencySymbol}${v.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(229, 226, 217, 0.6)', strokeDash: [4, 4] },
        ticks: { color: '#808080', font: { family: 'Plus Jakarta Sans, sans-serif', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(229, 226, 217, 0.6)' },
        ticks: { 
          color: '#808080', 
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 10 },
          callback: (value) => `${currencySymbol}${value.toLocaleString('en-IN')}`
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] font-body selection:bg-[#B59A6C]/20">
      
      {/* Webflow Editorial Hero Banner with Canvas Particle Sparkles */}
      <section className="relative bg-[#FAF9F7] text-[#222222] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-100">
        <SparkleCanvas />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          
          {/* Webflow Pill Badge with Gold Halo Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-[#E5E2D9] shadow-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B59A6C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B59A6C]" />
            </span>
            <span className="font-heading font-bold text-xs uppercase tracking-[0.25em] text-[#222222]">
              REAL-TIME BULLION INDEX • 100% BIS HALLMARKED
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-3xl sm:text-5xl lg:text-6xl text-[#222222] uppercase tracking-[0.2em] font-normal leading-tight max-w-5xl mx-auto mb-4"
          >
            LIVE METAL RATES
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-[#808080] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Official Glimmr Atelier bullion valuation ticker. Sourced directly from Indian Bullion and Jewellers Association (IBJA) and international bullion markets for total purchasing transparency.
          </motion.p>
        </div>
      </section>

      {/* Control Bar: Metal Toggle, Currency Filter & Refresh Action */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2D9] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Framer Motion Sliding Metal Selector */}
          <div className="flex items-center gap-2 bg-[#FAF9F7] p-1 border border-[#E5E2D9]">
            <button
              onClick={() => setMetal('gold')}
              className={`relative px-6 py-2 text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer z-10 ${
                metal === 'gold' ? 'text-white' : 'text-[#808080] hover:text-[#222222]'
              }`}
            >
              {metal === 'gold' && (
                <motion.div 
                  layoutId="metalTab"
                  className="absolute inset-0 bg-[#222222] -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span>GOLD BULLION</span>
            </button>

            <button
              onClick={() => setMetal('silver')}
              className={`relative px-6 py-2 text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer z-10 ${
                metal === 'silver' ? 'text-white' : 'text-[#808080] hover:text-[#222222]'
              }`}
            >
              {metal === 'silver' && (
                <motion.div 
                  layoutId="metalTab"
                  className="absolute inset-0 bg-[#222222] -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span>STERLING SILVER</span>
            </button>
          </div>

          {/* Right Controls: IBJA Authority Badge, Currency Pill & Manual Refresh Button */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* IBJA Authority Badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F7] border border-[#E5E2D9] font-mono text-[10px] font-bold text-[#B59A6C] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              IBJA OFFICIAL FEED
            </span>
            
            {/* Currency Pill Filter */}
            <div className="flex items-center gap-2 bg-[#FAF9F7] px-3 py-1.5 border border-[#E5E2D9] text-xs font-body">
              <span className="text-[#808080] font-mono text-[10px] uppercase font-bold">CURRENCY:</span>
              {['inr', 'gbp'].map(c => (
                <button
                  key={c}
                  onClick={() => { setPoints([]); setCurrency(c); }}
                  className={`px-2 py-0.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                    currency === c ? 'bg-[#222222] text-white' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  {c.toUpperCase()} ({c === 'inr' ? '₹' : '£'})
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setPoints([]); fetchPrices(); }}
              className="px-5 py-2 bg-white border border-[#E5E2D9] hover:border-[#B59A6C] text-[#222222] text-xs font-body font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <svg className={`w-3.5 h-3.5 text-[#B59A6C] ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>REFRESH TICKER</span>
            </motion.button>

            {/* Admin Silver Recalculate Trigger */}
            {user?.role === 'admin' && metal === 'silver' && (
              <button
                onClick={async () => {
                  try {
                    const res = await api.post('/admin/recalc-silver');
                    toastSuccess(`Recalculated ${res.data.updated}/${res.data.total} at ₹${(res.data.perGram||0).toLocaleString('en-IN')} /g`);
                  } catch (e) {
                    toastError(e.response?.data?.error || 'Failed to recalculate silver prices');
                  }
                }}
                className="px-4 py-2 bg-[#222222] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Recalc Silver
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Live Rates Ticker Cards */}
        <div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#222222] uppercase tracking-wide">
              {metal === 'gold' ? 'CURRENT GOLD BULLION VALUATION' : 'CURRENT STERLING SILVER VALUATION'}
            </h2>
            <span className="font-mono text-xs text-[#B59A6C] font-bold uppercase tracking-wider">
              {last?.timestamp ? `LAST UPDATED: ${new Date(last.timestamp).toLocaleTimeString()}` : 'LIVE REAL-TIME FEED'}
            </span>
          </div>

          {metal === 'gold' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 24K Pure Gold */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className="bg-white border border-[#E5E2D9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest">
                    99.9% PURE GOLD
                  </span>
                  <span className="font-mono text-xs text-gray-400">24K</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2">
                  24K Gold Bullion
                </h3>
                <div className="space-y-1 my-4">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-[#222222]">
                    {currencySymbol}{(last?.gold_10g_24k ?? 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}
                    <span className="text-xs font-body font-normal text-gray-400 ml-2">/ 10g</span>
                  </div>
                  <div className="text-xs font-mono text-[#B59A6C]">
                    Per Gram: {currencySymbol}{Math.round((last?.gold_10g_24k ?? 0) / 10).toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-xs font-body text-gray-500 pt-3 border-t border-gray-100">
                  Ideal for bullion investment, 24K gold bars & pure raw metal trade.
                </p>
              </motion.div>

              {/* 22K Fine Gold */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className="bg-white border border-[#E5E2D9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest">
                    91.6% JEWELRY STANDARD
                  </span>
                  <span className="font-mono text-xs text-gray-400">22K</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2">
                  22K Bridal Kundan Gold
                </h3>
                <div className="space-y-1 my-4">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-[#222222]">
                    {currencySymbol}{(last?.gold_10g_22k ?? 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}
                    <span className="text-xs font-body font-normal text-gray-400 ml-2">/ 10g</span>
                  </div>
                  <div className="text-xs font-mono text-[#B59A6C]">
                    Per Gram: {currencySymbol}{Math.round((last?.gold_10g_22k ?? 0) / 10).toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-xs font-body text-gray-500 pt-3 border-t border-gray-100">
                  Standard purity for Glimmr Royal Kundan bridal necklaces & bangles.
                </p>
              </motion.div>

              {/* 18K Modern Gold */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className="bg-white border border-[#E5E2D9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest">
                    75.0% SOLITAIRE SETTING
                  </span>
                  <span className="font-mono text-xs text-gray-400">18K</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2">
                  18K Diamond Setting Gold
                </h3>
                <div className="space-y-1 my-4">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-[#222222]">
                    {currencySymbol}{(last?.gold_10g_18k ?? 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}
                    <span className="text-xs font-body font-normal text-gray-400 ml-2">/ 10g</span>
                  </div>
                  <div className="text-xs font-mono text-[#B59A6C]">
                    Per Gram: {currencySymbol}{Math.round((last?.gold_10g_18k ?? 0) / 10).toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-xs font-body text-gray-500 pt-3 border-t border-gray-100">
                  Optimal strength for setting VVS diamonds & engagement rings.
                </p>
              </motion.div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 925 Sterling Silver 10g */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className="bg-white border border-[#E5E2D9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-gray-300 text-gray-600 font-mono text-[10px] uppercase font-bold tracking-widest">
                    92.5% FINE STERLING
                  </span>
                  <span className="font-mono text-xs text-gray-400">925 AG</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2">
                  925 Sterling Silver (10g)
                </h3>
                <div className="space-y-1 my-4">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-[#222222]">
                    {currencySymbol}{(last?.silver && last.silver.price ? Math.round(Number(last.silver.price) * 10) : 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}
                    <span className="text-xs font-body font-normal text-gray-400 ml-2">/ 10g</span>
                  </div>
                </div>
                <p className="text-xs font-body text-gray-500 pt-3 border-t border-gray-100">
                  Standard purity for Glimmr artisanal Hasli necklaces & solid cuffs.
                </p>
              </motion.div>

              {/* 925 Sterling Silver 1kg */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className="bg-white border border-[#E5E2D9] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-gray-300 text-gray-600 font-mono text-[10px] uppercase font-bold tracking-widest">
                    BULLION BAR (1 KG)
                  </span>
                  <span className="font-mono text-xs text-gray-400">1000G</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#222222] uppercase tracking-wider mb-2">
                  Fine Silver Bar (1 Kilogram)
                </h3>
                <div className="space-y-1 my-4">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-[#222222]">
                    {currencySymbol}{(last?.silver && last.silver.price ? Math.round(Number(last.silver.price) * 1000) : 0).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-GB')}
                    <span className="text-xs font-body font-normal text-gray-400 ml-2">/ 1kg</span>
                  </div>
                </div>
                <p className="text-xs font-body text-gray-500 pt-3 border-t border-gray-100">
                  Bulk silver valuation for custom silver casting and silverware.
                </p>
              </motion.div>

            </div>
          )}
        </div>

        {/* Webflow Interactive Bullion Rate Calculator */}
        <div className="bg-white border border-[#E5E2D9] p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="font-mono text-[11px] text-[#B59A6C] font-bold uppercase tracking-widest block mb-1">
                ATELIER VALUATION WIDGET
              </span>
              <h3 className="font-heading font-bold text-xl text-[#222222] uppercase tracking-wide">
                Live Precious Metal Price Calculator
              </h3>
            </div>
            <span className="text-xs font-body text-gray-400">Enter custom weight in grams for instant valuation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-xs font-body text-gray-500 uppercase tracking-wider font-semibold mb-2">
                Enter Weight (Grams):
              </label>
              <input
                type="number"
                min="1"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#E5E2D9] font-mono text-sm font-bold text-[#222222] focus:outline-none focus:border-[#B59A6C]"
              />
            </div>

            <div>
              <label className="block text-xs font-body text-gray-500 uppercase tracking-wider font-semibold mb-2">
                Select Metal Purity:
              </label>
              <select
                value={calcPurity}
                onChange={(e) => setCalcPurity(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#E5E2D9] font-body text-xs font-bold text-[#222222] focus:outline-none focus:border-[#B59A6C] cursor-pointer"
              >
                <option value="24k">24K Pure Gold (99.9%)</option>
                <option value="22k">22K Bridal Kundan Gold (91.6%)</option>
                <option value="18k">18K Diamond Setting Gold (75.0%)</option>
                <option value="silver">925 Fine Sterling Silver</option>
              </select>
            </div>

            <div className="bg-[#FAF9F7] border border-[#B59A6C]/40 p-4 text-right">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
                ESTIMATED METAL VALUE
              </span>
              <div className="text-2xl font-mono font-extrabold text-[#B59A6C]">
                {currencySymbol}{getCalculatedPrice().toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Webflow & Framer Motion Light Architectural Chart Container */}
        <div className="bg-white text-[#222222] border border-[#E5E2D9] p-6 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative overflow-hidden space-y-8">
          
          {/* Subtle Radial Grid Background Overlay */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#E5E2D9_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Chart Header with Live Metrics & Time Range Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B59A6C] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B59A6C]" />
                </span>
                <span className="font-mono text-[11px] text-[#B59A6C] font-bold uppercase tracking-widest">
                  ANALYTICS ENGINE • {points.length} SAMPLES RECORDED
                </span>
              </div>
              
              <h3 className="font-heading text-2xl text-[#222222] uppercase tracking-wider font-bold">
                {metal === 'gold' ? 'Intraday Gold Price Trend Analytics' : 'Intraday Silver Price Trend Analytics'}
              </h3>
            </div>

            {/* Framer Motion Time Horizon Selector Pills */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F7] p-1.5 border border-[#E5E2D9] shrink-0">
              {[
                { id: '1h', label: '1H LIVE' },
                { id: '24h', label: '24H INTRADAY' },
                { id: '7d', label: '7D TREND' },
                { id: '30d', label: '30D ANALYTICS' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  className={`relative px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer z-10 ${
                    timeRange === tab.id ? 'text-white' : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  {timeRange === tab.id && (
                    <motion.div 
                      layoutId="timeRangeTab"
                      className="absolute inset-0 bg-[#222222] -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Micro Metrics Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF9F7] border border-[#E5E2D9] p-4 text-center relative z-10">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">24K INTRADAY PEAK</span>
              <span className="font-mono text-base font-bold text-[#B59A6C]">{currencySymbol}{peakRate.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">INTRADAY LOW</span>
              <span className="font-mono text-base font-bold text-[#222222]">{currencySymbol}{lowestRate.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">MARKET SPREAD</span>
              <span className="font-mono text-base font-bold text-emerald-600">±0.35% (STABLE)</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">UPDATE FREQUENCY</span>
              <span className="font-mono text-base font-bold text-gray-600">EVERY 1 HOUR</span>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div style={{ height: 420 }} className="w-full relative z-10">
            <Line key={metal + '-' + currency + '-' + timeRange} data={metal === 'gold' ? dataGold : dataSilver} options={chartOptions} />
          </div>
        </div>

        {/* Transparency & BIS Guarantee Banner */}
        <div className="bg-[#222222] text-white p-8 sm:p-12 border border-[#B59A6C]/30 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-mono text-[#B59A6C] font-bold uppercase tracking-[0.25em] block">
              PATRON GUARANTEE & TRANSPARENCY
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl text-white uppercase tracking-wider font-bold">
              100% BIS Hallmarked & Fair Metal Rate Promise
            </h3>
            <p className="text-xs font-body text-gray-300 leading-relaxed font-light">
              Every gold and silver creation at Glimmr Atelier is crafted using 100% BIS Hallmarked metals with transparent making charges. Our live rates are linked to official bullion benchmarks, guaranteeing that your exchange and buyback valuations remain 100% fair and verified.
            </p>
          </div>
        </div>

      </section>

      {/* Newsletter Section */}
      <MonthlyUpdatesNewsletter />

    </div>
  );
};

export default Prices;
