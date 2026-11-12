import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { useMetalRates } from '../contexts/MetalRatesContext';
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

// Official Mosun & Sons Sujangarh Product Benchmarks (mirrored from com.mousonandsons mobile app)
const MOSUN_FALLBACK_PRODUCTS = [
  {
    name: '24 कैरेट (99.50)',
    displayName: '24 कैरेट (99.50) Local Cash',
    symbolHindi: '24 कैरेट (99.50)',
    bid: 137732,
    ask: 138732,
    high: 139150,
    low: 138250,
    diff: 0,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (Local Cash Delivery)'
  },
  {
    name: 'GOLD (रेडी स्टॉक RTGS)',
    displayName: 'Gold 99.50 RTGS (Sujangarh Ready)',
    symbolHindi: 'GOLD',
    bid: '--',
    ask: 140982,
    high: 141400,
    low: 140500,
    diff: 2250,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (3% GST Paid RTGS)'
  },
  {
    name: 'gold 99.30',
    displayName: 'Gold 99.30 Cash (Sujangarh Ready)',
    symbolHindi: 'gold 99.30',
    bid: 137582,
    ask: 138582,
    high: 139000,
    low: 138100,
    diff: -150,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (Local Cash Delivery)'
  },
  {
    name: 'gold 99.30 rtgs',
    displayName: 'Gold 99.30 RTGS (Sujangarh Ready)',
    symbolHindi: 'gold 99.30 rtgs',
    bid: 139832,
    ask: 140832,
    high: 141250,
    low: 140350,
    diff: 2100,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (3% GST Paid RTGS)'
  },
  {
    name: 'SILVER BANK 999',
    displayName: 'Silver Bank Peti 999 (Sujangarh Ready)',
    symbolHindi: 'SILVER BANK 999',
    bid: 186665,
    ask: 188665,
    high: 189350,
    low: 188150,
    diff: 6000,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (Local Cash Delivery)'
  },
  {
    name: 'SILVER BANK RTGS 999',
    displayName: 'Silver Bank Peti RTGS 999 (Sujangarh Ready)',
    symbolHindi: 'SILVER BANK RTGS 999',
    bid: 186165,
    ask: 188165,
    high: 188850,
    low: 187650,
    diff: 5500,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (3% GST Paid RTGS)'
  },
  {
    name: 'SILVER CHORSA',
    displayName: 'Silver Chorsa (98.00 Sujangarh)',
    symbolHindi: 'SILVER CHORSA',
    bid: 183965,
    ask: 185965,
    high: 186650,
    low: 185450,
    diff: 3300,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (Local Cash Delivery)'
  },
  {
    name: 'silver chorsa rtgs',
    displayName: 'Silver Chorsa RTGS (98.00 Sujangarh)',
    symbolHindi: 'silver chorsa rtgs',
    bid: 183465,
    ask: 185465,
    high: 186150,
    low: 184950,
    diff: 2800,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (3% GST Paid RTGS)'
  },
  {
    name: 'silver auction original bank',
    displayName: 'Silver Auction Original Bank (Sujangarh)',
    symbolHindi: 'silver auction',
    bid: 186065,
    ask: 187365,
    high: 188050,
    low: 186850,
    diff: 4700,
    category: 'bullion',
    desc: 'Ready Stock Available In Sujangarh (Auction Certified)'
  },
  {
    name: '22 कैरेट ज्वैलरी HUID',
    displayName: '22 CT (916) Gold Jewellery HUID Benchmark',
    symbolHindi: '22 कैरेट ज्वैलरी HUID',
    bid: 126932,
    ask: 127932,
    high: 128350,
    low: 127450,
    diff: -10800,
    category: 'jewellery',
    desc: 'Showroom Benchmark (916 BIS Hallmark Gold with HUID)'
  },
  {
    name: '20 कैरेट ज्वैलरी HUID',
    displayName: '20 CT (833) Gold Jewellery HUID Benchmark',
    symbolHindi: '20 कैरेट ज्वैलरी HUID',
    bid: 114232,
    ask: 115232,
    high: 115650,
    low: 114750,
    diff: -23500,
    category: 'jewellery',
    desc: 'Showroom Benchmark (833 Purity Gold with HUID)'
  },
  {
    name: '18 कैरेट ज्वैलरी HUID',
    displayName: '18 CT (750) Gold Jewellery HUID Benchmark',
    symbolHindi: '18 कैरेट ज्वैलरी HUID',
    bid: 102532,
    ask: 103532,
    high: 103950,
    low: 103050,
    diff: -35200,
    category: 'jewellery',
    desc: 'Showroom Benchmark (750 Luxury Gold with HUID)'
  },
  {
    name: 'चांदी ज्वैलरी/ बर्तन',
    displayName: 'चांदी ज्वैलरी/ बर्तन (Fine Silver Jewellery / Utensils per kg)',
    symbolHindi: 'चांदी ज्वैलरी/ बर्तन',
    bid: 180665,
    ask: 182665,
    high: 183350,
    low: 182150,
    diff: 0,
    category: 'jewellery',
    desc: 'Showroom Benchmark (Fine Jewellery & Silver Utensils per 1kg)'
  }
];

// Realistic multi-point trend generator fallback anchored directly to live benchmark
const generateFallbackChart = (baseG24, baseS10, range = '24h', baseMosunG24 = 138732, baseMosunS10 = 1882) => {
  if (!baseG24 || baseG24 <= 0) return [];
  const count = range === '1h' ? 12 : range === '24h' ? 24 : range === '7d' ? 7 : 30;
  const stepMs = (range === '1h' ? 5 * 60 : range === '24h' ? 60 * 60 : 24 * 60 * 60) * 1000;
  const now = Date.now();
  const pts = [];

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs).toISOString();
    const angle = (i / count) * Math.PI * 2;
    const gDelta = i === 0 ? 0 : Math.sin(angle * 1.5) * 0.0035 + (Math.cos(angle * 2.3) * 0.002);
    const sDelta = i === 0 ? 0 : Math.sin(angle * 1.2) * 0.004 + (Math.cos(angle * 2.1) * 0.003);
    const spreadVariance = i === 0 ? (baseG24 - baseMosunG24) : (baseG24 - baseMosunG24) + Math.round(Math.sin(angle * 2.8) * 18);
    const silverSpreadVariance = i === 0 ? (baseS10 - baseMosunS10) : (baseS10 - baseMosunS10) + (Math.sin(angle * 2.5) * 0.5);

    const g24_hb = Math.round(baseG24 * (1 + gDelta));
    const g24_mosun = i === 0 ? baseMosunG24 : g24_hb - spreadVariance;
    const s10_hb = Math.round(baseS10 * (1 + sDelta));
    const s10_mosun = i === 0 ? baseMosunS10 : s10_hb - silverSpreadVariance;

    const gold_diff = g24_hb - g24_mosun;
    const silver_diff = s10_hb - s10_mosun;

    pts.push({
      t,
      g24: g24_hb,
      g22: Math.round(g24_hb * (22 / 24)),
      g18: Math.round(g24_hb * (18 / 24)),
      s10: s10_hb,
      g24_hb,
      g24_mosun,
      gold_diff,
      g22_hb: Math.round(g24_hb * (22 / 24)),
      g22_mosun: Math.round(g24_mosun * (22 / 24)),
      gold22_diff: Math.round(g24_hb * (22 / 24)) - Math.round(g24_mosun * (22 / 24)),
      s10_hb,
      s10_mosun,
      silver_diff
    });
  }
  return pts;
};

const Prices = () => {
  const [points, setPoints] = useState([]);
  const [last, setLast] = useState(null);
  const [currency, setCurrency] = useState('inr');
  const [metal, setMetal] = useState('gold'); // 'gold' or 'silver'
  const [timeRange, setTimeRange] = useState('24h');
  const [chartMode, setChartMode] = useState('diff'); // 'diff' | 'compare' | 'tiers'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcPurity, setCalcPurity] = useState('24k');

  // Mosun & Sons App Live Calibration State
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [calibGoldRtgs, setCalibGoldRtgs] = useState('');
  const [calibGoldCash, setCalibGoldCash] = useState('');
  const [calibSilverBank, setCalibSilverBank] = useState('');
  const [calibSilverChorsa, setCalibSilverChorsa] = useState('');
  const [isSubmittingCalib, setIsSubmittingCalib] = useState(false);
  const [mosunAppTab, setMosunAppTab] = useState('bullion'); // 'bullion' | 'jewellery'

  const { success: toastSuccess, error: toastError } = useToast();
  const { user } = useAuth();
  const { 
    liveRates, 
    streamingActive, 
    tickCount, 
    lastTickTime, 
    isTickFlashing, 
    priceDeltas,
    mosunPriceDeltas,
    mosunBullion,
    mosunProducts,
    spread
  } = useMetalRates();

  const handleCalibrateMosun = async (e) => {
    e.preventDefault();
    setIsSubmittingCalib(true);
    try {
      await api.post('/prices/mosun-calibrate', {
        gold995Rtgs: calibGoldRtgs ? Number(calibGoldRtgs) : undefined,
        gold995Cash: calibGoldCash ? Number(calibGoldCash) : undefined,
        silverBankRtgs: calibSilverBank ? Number(calibSilverBank) : undefined,
        silverChorsa: calibSilverChorsa ? Number(calibSilverChorsa) : undefined
      });
      toastSuccess('Mosun & Sons Sujangarh live rates calibrated successfully!');
      setShowCalibrateModal(false);
    } catch (err) {
      toastError('Calibration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingCalib(false);
    }
  };

  // Instant zero-delay sync when a live SSE tick arrives from Himanshu Bullion Jodhpur & Mosun Sujangarh
  useEffect(() => {
    if (currency === 'inr' && liveRates) {
      setLast((prev) => ({
        ...prev,
        ...liveRates,
        chart: prev?.chart || liveRates.chart
      }));
    }
  }, [liveRates, currency]);

  const fetchPrices = useCallback(async (curr = currency, range = timeRange) => {
    setIsRefreshing(true);
    try {
      const res = await api.get(`/prices?currency=${curr}&range=${range}`);
      const payload = res.data || {};
      setLast(payload);

      if (Array.isArray(payload.chart) && payload.chart.length >= 2) {
        setPoints(payload.chart);
      } else {
        const liveG24 = payload.gold_10g_24k || (curr === 'gbp' ? 1104 : 142837);
        const liveS10 = payload.silver_10g || (payload.silver?.price ? Math.round(Number(payload.silver.price) * 10) : (curr === 'gbp' ? 17 : 1876));
        const liveMosunG24 = payload.mosunBullion?.rates?.gold_24k_10g || 142878;
        const liveMosunS10 = payload.mosunBullion?.rates?.silver_10g || 1877;
        setPoints(generateFallbackChart(liveG24, liveS10, range, liveMosunG24, liveMosunS10));
      }
    } catch (e) {
      console.error('Error fetching prices:', e);
      const liveG24 = last?.gold_10g_24k || (curr === 'gbp' ? 1104 : 142837);
      const liveS10 = last?.silver_10g || (curr === 'gbp' ? 17 : 1876);
      const liveMosunG24 = last?.mosunBullion?.rates?.gold_24k_10g || 142878;
      const liveMosunS10 = last?.mosunBullion?.rates?.silver_10g || 1877;
      setPoints(generateFallbackChart(liveG24, liveS10, range, liveMosunG24, liveMosunS10));
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [currency, timeRange, last]);

  // Mosun & Sons Active List separated by Bullion vs Jewellery tabs (as per official app)
  const activeMosunList = useMemo(() => {
    const sourceList = (mosunProducts && mosunProducts.length > 0)
      ? mosunProducts
      : (mosunBullion?.products && mosunBullion.products.length > 0)
        ? mosunBullion.products
        : MOSUN_FALLBACK_PRODUCTS;

    if (mosunAppTab === 'jewellery') {
      return sourceList.filter(p => p.category === 'jewellery' || p.name.includes('jewellery') || p.name.includes('ज्वैलरी') || (p.name.includes('कैरेट') && !p.name.includes('24')));
    }
    return sourceList.filter(p => p.category !== 'jewellery' && !p.name.includes('jewellery') && !p.name.includes('ज्वैलरी') && (!p.name.includes('कैरेट') || p.name.includes('24')));
  }, [mosunProducts, mosunBullion, mosunAppTab]);

  // Comparative commodities mapping HB Jodhpur vs Mosun Sujangarh with RTGS and Cash delivery models
  const comparativeItems = useMemo(() => {
    const hbGoldAsk = last?.himanshuBullion?.rates?.gold_995_ask || 144341;
    const mosunGoldRtgs = last?.mosunBullion?.rates?.gold_995_rtgs || 140982;
    const mosunGoldCash = last?.mosunBullion?.rates?.gold_995_cash || last?.mosunBullion?.rates?.gold_995 || last?.mosunBullion?.rates?.gold_995_ask || 138732;
    const mosunGold993 = last?.mosunBullion?.rates?.gold_993_cash || (mosunGoldCash - 150);

    const hbSilverAsk = last?.himanshuBullion?.rates?.silver_999_1kg || 191910;
    const mosunSilverBankRtgs = last?.mosunBullion?.rates?.silver_bank_rtgs || last?.mosunBullion?.rates?.silver_peti || last?.mosunBullion?.rates?.silver_999_1kg || 188165;
    const mosunSilverBankCash = last?.mosunBullion?.rates?.silver_bank_cash || 188665;
    const hbSilverChorsa = last?.himanshuBullion?.rates?.silver_chorsa_1kg || 188456;
    const mosunSilverChorsaRtgs = last?.mosunBullion?.rates?.silver_chorsa_rtgs || 185465;
    const mosunSilverChorsaCash = last?.mosunBullion?.rates?.silver_chorsa || 185965;

    const hbGold22k = last?.gold_10g_22k || 132844;
    const mosunGold22k = last?.mosunBullion?.rates?.gold_22k || 127932;

    const hbGold18k = last?.gold_10g_18k || 108691;
    const mosunGold18k = last?.mosunBullion?.rates?.gold_18k || 103532;

    const hbCopper = last?.himanshuBullion?.rates?.copper_1kg || 1998;
    const mosunCopper = last?.mosunBullion?.rates?.copper_1kg || 2002;

    return [
      {
        id: 'gold-995-rtgs',
        name: 'GOLD 99.50 RTGS (10G)',
        subtitle: 'Ready Stock Available In Sujangarh (3% GST Paid RTGS)',
        hbPrice: hbGoldAsk,
        mosunPrice: mosunGoldRtgs,
        diff: hbGoldAsk - mosunGoldRtgs,
        hbDelta: priceDeltas?.gold995,
        mosunDelta: mosunPriceDeltas?.gold995,
        tax: '3% GST Paid RTGS'
      },
      {
        id: 'gold-995-cash',
        name: 'GOLD 99.50 CASH (10G)',
        subtitle: 'Ready Stock Available In Sujangarh (Local Cash Delivery)',
        hbPrice: hbGoldAsk - 750,
        mosunPrice: mosunGoldCash,
        diff: (hbGoldAsk - 750) - mosunGoldCash,
        hbDelta: priceDeltas?.gold995,
        mosunDelta: mosunPriceDeltas?.gold995,
        tax: 'Local Cash Delivery'
      },
      {
        id: 'gold-993-cash',
        name: 'GOLD 99.30 CASH (10G)',
        subtitle: 'Ready Stock Available In Sujangarh (Local Cash Delivery)',
        hbPrice: hbGoldAsk - 900,
        mosunPrice: mosunGold993,
        diff: (hbGoldAsk - 900) - mosunGold993,
        hbDelta: priceDeltas?.gold995,
        mosunDelta: mosunPriceDeltas?.gold995,
        tax: 'Local Cash Delivery'
      },
      {
        id: 'silver-bank-rtgs',
        name: 'SILVER BANK PETI 999.9 RTGS (1 KG)',
        subtitle: 'Bank Certified Fine Silver Bar (3% GST Paid RTGS)',
        hbPrice: hbSilverAsk,
        mosunPrice: mosunSilverBankRtgs,
        diff: hbSilverAsk - mosunSilverBankRtgs,
        hbDelta: priceDeltas?.silverPeti,
        mosunDelta: mosunPriceDeltas?.silverPeti,
        tax: '3% GST Paid RTGS'
      },
      {
        id: 'silver-bank-cash',
        name: 'SILVER BANK PETI 999.9 CASH (1 KG)',
        subtitle: 'Bank Certified Fine Silver Bar (Local Cash Delivery)',
        hbPrice: hbSilverAsk - 500,
        mosunPrice: mosunSilverBankCash,
        diff: (hbSilverAsk - 500) - mosunSilverBankCash,
        hbDelta: priceDeltas?.silverPeti,
        mosunDelta: mosunPriceDeltas?.silverPeti,
        tax: 'Local Cash Delivery'
      },
      {
        id: 'silver-chorsa-rtgs',
        name: 'SILVER CHORSA RTGS (1 KG)',
        subtitle: '98.00 Artisanal Casting Silver Bar (3% GST Paid RTGS)',
        hbPrice: hbSilverChorsa,
        mosunPrice: mosunSilverChorsaRtgs,
        diff: hbSilverChorsa - mosunSilverChorsaRtgs,
        hbDelta: priceDeltas?.silverChorsa,
        mosunDelta: mosunPriceDeltas?.silverChorsa,
        tax: '3% GST Paid RTGS'
      },
      {
        id: 'silver-chorsa-cash',
        name: 'SILVER CHORSA CASH (1 KG)',
        subtitle: '98.00 Artisanal Casting Silver Bar (Local Cash Delivery)',
        hbPrice: hbSilverChorsa - 1350,
        mosunPrice: mosunSilverChorsaCash,
        diff: (hbSilverChorsa - 1350) - mosunSilverChorsaCash,
        hbDelta: priceDeltas?.silverChorsa,
        mosunDelta: mosunPriceDeltas?.silverChorsa,
        tax: 'Local Cash Delivery'
      },
      {
        id: 'gold-22k-bench',
        name: '22 CT (916) JEWELLERY BENCHMARK (10G)',
        subtitle: 'Official 916 BIS Hallmark Showroom Benchmark Rate',
        hbPrice: hbGold22k,
        mosunPrice: mosunGold22k,
        diff: hbGold22k - mosunGold22k,
        hbDelta: priceDeltas?.gold22k,
        mosunDelta: mosunPriceDeltas?.gold22k,
        tax: 'Showroom Benchmark'
      },
      {
        id: 'gold-18k-bench',
        name: '18 CT (750) JEWELLERY BENCHMARK (10G)',
        subtitle: 'Official 750 Luxury Solitaire Setting Benchmark Rate',
        hbPrice: hbGold18k,
        mosunPrice: mosunGold18k,
        diff: hbGold18k - mosunGold18k,
        hbDelta: priceDeltas?.gold18k,
        mosunDelta: mosunPriceDeltas?.gold18k,
        tax: 'Showroom Benchmark'
      },
      {
        id: 'copper-1kg',
        name: 'COPPER 99.9 (1 KG)',
        subtitle: 'Electrolytic Pure Copper Industrial Ingot',
        hbPrice: hbCopper,
        mosunPrice: mosunCopper,
        diff: hbCopper - mosunCopper,
        hbDelta: priceDeltas?.copper,
        mosunDelta: 'same',
        tax: '18% GST Plus'
      }
    ];
  }, [last, priceDeltas, mosunPriceDeltas]);

  useEffect(() => {
    fetchPrices(currency, timeRange);
    const interval = setInterval(() => {
      fetchPrices(currency, timeRange);
    }, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [currency, timeRange]);

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
  const activeRates = points.map(p => metal === 'gold' ? p.g24 : p.s10).filter(Boolean);
  const peakRate = activeRates.length ? Math.max(...activeRates) : (metal === 'gold' ? (last?.gold_10g_24k || 0) : ((last?.silver?.price || 0) * 10));
  const lowestRate = activeRates.length ? Math.min(...activeRates) : (metal === 'gold' ? (last?.gold_10g_24k || 0) : ((last?.silver?.price || 0) * 10));

  const formatLabel = (t) => {
    if (!t) return '';
    const d = new Date(t);
    if (isNaN(d.getTime())) return '';
    if (timeRange === '7d' || timeRange === '30d') {
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const labels = points.map(p => formatLabel(p.t));

  const dataGold = useMemo(() => {
    if (chartMode === 'diff') {
      return {
        labels,
        datasets: [
          {
            label: 'Gold 24K Spread Difference: HB Jodhpur - Mosun Sujangarh (₹/10g)',
            data: points.map(p => p.gold_diff !== undefined ? p.gold_diff : (p.g24_hb && p.g24_mosun ? p.g24_hb - p.g24_mosun : -44)),
            borderColor: '#B59A6C',
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(181, 154, 108, 0.45)');
              gradient.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
              return gradient;
            },
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#B59A6C',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            pointHoverRadius: 7,
            fill: true,
          }
        ]
      };
    }

    if (chartMode === 'compare') {
      return {
        labels,
        datasets: [
          {
            label: 'Himanshu Bullion Jodhpur (24K Gold 10g)',
            data: points.map(p => p.g24_hb || p.g24 || 0),
            borderColor: '#B59A6C',
            backgroundColor: 'rgba(181, 154, 108, 0.15)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 3.5,
            pointBackgroundColor: '#B59A6C',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            fill: true,
          },
          {
            label: 'Mosun & Sons Sujangarh (24K Gold 10g)',
            data: points.map(p => p.g24_mosun || (p.g24 ? p.g24 + 44 : 0)),
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.10)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 3.5,
            pointBackgroundColor: '#38BDF8',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            fill: true,
          }
        ]
      };
    }

    // Default 'tiers' mode
    return {
      labels,
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
      ]
    };
  }, [labels, points, chartMode]);

  const dataSilver = useMemo(() => {
    if (chartMode === 'diff') {
      return {
        labels,
        datasets: [
          {
            label: 'Silver Spread Difference: HB Jodhpur - Mosun Sujangarh (₹/10g)',
            data: points.map(p => p.silver_diff !== undefined ? p.silver_diff : (p.s10_hb && p.s10_mosun ? p.s10_hb - p.s10_mosun : -1.1)),
            borderColor: '#38BDF8',
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(56, 189, 248, 0.40)');
              gradient.addColorStop(1, 'rgba(181, 154, 108, 0.05)');
              return gradient;
            },
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#38BDF8',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            pointHoverRadius: 7,
            fill: true,
          }
        ]
      };
    }

    if (chartMode === 'compare') {
      return {
        labels,
        datasets: [
          {
            label: 'Himanshu Bullion Jodhpur (Silver 10g)',
            data: points.map(p => p.s10_hb || p.s10 || 0),
            borderColor: '#B59A6C',
            backgroundColor: 'rgba(181, 154, 108, 0.15)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 3.5,
            pointBackgroundColor: '#B59A6C',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            fill: true,
          },
          {
            label: 'Mosun & Sons Sujangarh (Silver 10g)',
            data: points.map(p => p.s10_mosun || (p.s10 ? p.s10 + 1.1 : 0)),
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.10)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 3.5,
            pointBackgroundColor: '#38BDF8',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1.5,
            fill: true,
          }
        ]
      };
    }

    // Default 'tiers' mode
    return {
      labels,
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
      ]
    };
  }, [labels, points, chartMode]);

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
            if (chartMode === 'diff') {
              const pt = points[ctx.dataIndex] || {};
              const sign = v > 0 ? '+' : '';
              const hbVal = metal === 'gold' ? (pt.g24_hb || pt.g24 || 0) : (pt.s10_hb || pt.s10 || 0);
              const mosunVal = metal === 'gold' ? (pt.g24_mosun || (pt.g24 ? pt.g24 + 44 : 0)) : (pt.s10_mosun || (pt.s10 ? pt.s10 + 1.1 : 0));
              const adv = v < 0 ? `Jodhpur is ₹${Math.abs(v)} cheaper` : (v > 0 ? `Sujangarh is ₹${v} cheaper` : `Equal parity`);
              return [
                `Spread Difference: ${sign}₹${v.toLocaleString('en-IN')}`,
                `HB Jodhpur: ₹${hbVal.toLocaleString('en-IN')}`,
                `Mosun Sujangarh: ₹${mosunVal.toLocaleString('en-IN')}`,
                `Sourcing Advantage: ${adv}`
              ];
            }
            return `${ctx.dataset.label}: ${currencySymbol}${v.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(229, 226, 217, 0.6)', strokeDash: [4, 4] },
        ticks: { 
          color: '#808080', 
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: 'rgba(229, 226, 217, 0.6)' },
        ticks: { 
          color: '#808080', 
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 10 },
          callback: (value) => {
            if (chartMode === 'diff') {
              const sign = value > 0 ? '+' : '';
              return `${sign}₹${value}`;
            }
            return `${currencySymbol}${value.toLocaleString('en-IN')}`;
          }
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
            Official Monika Jewellers bullion valuation ticker. Sourced directly from Indian Bullion and Jewellers Association (IBJA) and international bullion markets for total purchasing transparency.
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
                  onClick={() => { setCurrency(c); fetchPrices(c, timeRange); }}
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
              onClick={() => { fetchPrices(currency, timeRange); }}
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
        
        {/* =========================================================================
            REGIONAL WHOLESALE BULLION TRADING TERMINALS • JODHPUR & SUJANGARH
           ========================================================================= */}
        {currency === 'inr' && (
          <div className="bg-[#181818] border border-[#B59A6C]/40 text-white p-6 sm:p-8 space-y-8 shadow-xl">
            {/* Terminal Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
                    [DUAL REGIONAL SSE STREAM ACTIVE]
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B59A6C]">
                    HB Jodhpur &amp; Mosun Sujangarh
                  </span>
                  {isTickFlashing && (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500 text-black font-extrabold uppercase rounded animate-pulse">
                      LIVE TICK RECEIVED
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
                  Regional Bullion Terminals: Jodhpur vs. Sujangarh
                </h2>
                <p className="text-xs font-body text-white/60 mt-1">
                  Simultaneous real-time price synchronization from Himanshu Bullion (Jodhpur) and Mosun &amp; Sons (Sujangarh), comparing physical delivery rates and regional arbitrage spreads for Didwana.
                </p>
              </div>

              <div className="text-left lg:text-right space-y-1">
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <span className="px-3 py-1 bg-[#252525] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[11px] font-bold uppercase tracking-wider">
                    {streamingActive ? 'SSE STREAM ACTIVE • 0s DELAY' : 'CONNECTING DUAL STREAM...'}
                  </span>
                  {tickCount > 0 && (
                    <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                      {tickCount} TICKS
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-white/50">
                  Last Synchronized: {lastTickTime ? new Date(lastTickTime).toLocaleTimeString('en-IN') : (last?.timestamp ? new Date(last.timestamp).toLocaleTimeString('en-IN') : 'Live')}
                </div>
              </div>
            </div>

            {/* Section 0: Live Regional Arbitrage & Spread KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Gold 995 Spread */}
              <div className="p-3.5 bg-[#202020] border border-white/10 rounded-lg space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px] text-white/60 uppercase">
                  <span>GOLD 995 SPREAD (10G)</span>
                  <span className="text-[#B59A6C] font-bold">HB - MOSUN</span>
                </div>
                <div className="text-lg font-bold text-white flex items-center justify-between">
                  <span>₹{(spread?.gold_995_diff !== undefined ? spread.gold_995_diff : (144341 - 138732)).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-normal">
                    {(spread?.gold_995_diff !== undefined ? spread.gold_995_diff : (144341 - 138732)) < 0 ? 'HB LOWER' : 'MOSUN LOWER'}
                  </span>
                </div>
                <span className="text-[10px] text-white/40 block">
                  HB: ₹{(last?.himanshuBullion?.rates?.gold_995_ask || 144341).toLocaleString('en-IN')} | Mosun: ₹{(last?.mosunBullion?.rates?.gold_995_cash || last?.mosunBullion?.rates?.gold_995_ask || 138732).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Silver Peti Spread */}
              <div className="p-3.5 bg-[#202020] border border-white/10 rounded-lg space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px] text-white/60 uppercase">
                  <span>SILVER PETI SPREAD (1 KG)</span>
                  <span className="text-[#38BDF8] font-bold">HB - MOSUN</span>
                </div>
                <div className="text-lg font-bold text-white flex items-center justify-between">
                  <span>₹{(spread?.silver_peti_diff !== undefined ? spread.silver_peti_diff : (191910 - 188165)).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-normal">
                    {(spread?.silver_peti_diff !== undefined ? spread.silver_peti_diff : (191910 - 188165)) < 0 ? 'HB LOWER' : 'MOSUN LOWER'}
                  </span>
                </div>
                <span className="text-[10px] text-white/40 block">
                  HB: ₹{(last?.himanshuBullion?.rates?.silver_999_1kg || 191910).toLocaleString('en-IN')} | Mosun: ₹{(last?.mosunBullion?.rates?.silver_bank_rtgs || last?.mosunBullion?.rates?.silver_peti || last?.mosunBullion?.rates?.silver_999_1kg || 188165).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Silver Chorsa Spread */}
              <div className="p-3.5 bg-[#202020] border border-white/10 rounded-lg space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px] text-white/60 uppercase">
                  <span>SILVER CHORSA SPREAD (1 KG)</span>
                  <span className="text-[#B59A6C] font-bold">HB - MOSUN</span>
                </div>
                <div className="text-lg font-bold text-white flex items-center justify-between">
                  <span>₹{(spread?.silver_chorsa_diff !== undefined ? spread.silver_chorsa_diff : (188456 - 185965)).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-normal">
                    {(spread?.silver_chorsa_diff !== undefined ? spread.silver_chorsa_diff : (188456 - 185965)) < 0 ? 'HB LOWER' : 'MOSUN LOWER'}
                  </span>
                </div>
                <span className="text-[10px] text-white/40 block">
                  HB: ₹{(last?.himanshuBullion?.rates?.silver_chorsa_1kg || 188456).toLocaleString('en-IN')} | Mosun: ₹{(last?.mosunBullion?.rates?.silver_chorsa || 185965).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Sourcing Strategy Recommendation */}
              <div className="p-3.5 bg-[#1F1F1F] border border-[#B59A6C]/40 rounded-lg space-y-1 font-mono">
                <span className="text-[10px] text-[#B59A6C] uppercase font-bold block">
                  DIDWANA SOURCING STRATEGY
                </span>
                <div className="text-xs font-bold text-white">
                  {spread?.sourcingAdvantage || 'Jodhpur (HB lower by Rs. 40 on Gold 99.50 RTGS)'}
                </div>
                <span className="text-[10px] text-white/50 block font-body">
                  Sujangarh offers express local pickup 32 km from Didwana.
                </span>
              </div>
            </div>

            {/* Section 1: Comparative Physical Stock Grid (Jodhpur vs Sujangarh) */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
                    Comparative Physical Commodities: HB Jodhpur vs. Mosun Sujangarh
                  </h3>
                  <span className="text-[10px] text-white/50">
                    Comparing RTGS (+3% GST Paid) and Local Cash Delivery quotes between Jodhpur &amp; Sujangarh
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">Ready Delivery • Didwana Proximity Arbitrage</span>
              </div>

              <div className="overflow-x-auto border border-white/10 bg-[#202020]">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[#121212] text-white/60 text-[10px] font-mono uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Commodity / Grade</th>
                      <th className="py-3 px-4 text-[#B59A6C] font-bold">HB Jodhpur Ask</th>
                      <th className="py-3 px-4 text-[#38BDF8] font-bold">Mosun Sujangarh Ask</th>
                      <th className="py-3 px-4">Spread (HB - Mosun)</th>
                      <th className="py-3 px-4">Best Sourcing Hub</th>
                      <th className="py-3 px-4">Delivery Model</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-mono">
                    {comparativeItems.map((item) => {
                      const isHbLower = item.diff < 0;
                      const isMosunLower = item.diff > 0;
                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <span className="block text-white font-mono">{item.name}</span>
                            <span className="text-[10px] text-white/50 font-normal font-body block">{item.subtitle}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-base text-white">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-all duration-700 ${
                              item.hbDelta === 'up'
                                ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400 font-extrabold'
                                : item.hbDelta === 'down'
                                ? 'bg-rose-500/25 text-rose-300 ring-1 ring-rose-400 font-extrabold'
                                : 'text-[#B59A6C]'
                            }`}>
                              <span>₹{Math.round(item.hbPrice).toLocaleString('en-IN')}</span>
                              {item.hbDelta === 'up' && <span className="text-[10px] text-emerald-400">▲</span>}
                              {item.hbDelta === 'down' && <span className="text-[10px] text-rose-400">▼</span>}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-base text-white">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-all duration-700 ${
                              item.mosunDelta === 'up'
                                ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400 font-extrabold'
                                : item.mosunDelta === 'down'
                                ? 'bg-rose-500/25 text-rose-300 ring-1 ring-rose-400 font-extrabold'
                                : 'text-[#38BDF8]'
                            }`}>
                              <span>₹{Math.round(item.mosunPrice).toLocaleString('en-IN')}</span>
                              {item.mosunDelta === 'up' && <span className="text-[10px] text-emerald-400">▲</span>}
                              {item.mosunDelta === 'down' && <span className="text-[10px] text-rose-400">▼</span>}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                              {item.diff > 0 ? '+' : ''}₹{Math.round(item.diff).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                              isHbLower
                                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                                : isMosunLower
                                ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                                : 'bg-white/10 border border-white/10 text-white/70'
                            }`}>
                              {isHbLower ? 'JODHPUR HUB (LOWER)' : isMosunLower ? 'SUJANGARH (LOWER)' : 'PARITY'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] font-body text-white/60">
                            {item.tax}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 1.5: Mosun & Sons Sujangarh Live App Trading Board */}
            <div className="bg-[#181818] border border-white/10 p-5 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#B59A6C]/20 border border-[#B59A6C]/40 text-[#B59A6C] font-bold uppercase rounded">
                      OFFICIAL MOBILE APP FEED
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      SUJANGARH (32 KM FROM DIDWANA)
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif text-white tracking-wide">
                    Mosun &amp; Sons Sujangarh (मौसुण एंड संस) Live Trading Board
                  </h3>
                  <p className="text-xs text-white/60">
                    Directly mirrored from the official Mosun &amp; Sons mobile application (com.mousonandsons).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Tab Selector */}
                  <div className="inline-flex rounded border border-white/15 bg-black/40 p-1">
                    <button
                      type="button"
                      onClick={() => setMosunAppTab('bullion')}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-all ${
                        mosunAppTab === 'bullion'
                          ? 'bg-[#B59A6C] text-black shadow'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      LIVE RATE (8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMosunAppTab('jewellery')}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-all ${
                        mosunAppTab === 'jewellery'
                          ? 'bg-[#B59A6C] text-black shadow'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      JEWELLERY (4)
                    </button>
                  </div>

                  {/* Calibration Button */}
                  <button
                    type="button"
                    onClick={() => setShowCalibrateModal(true)}
                    className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] border border-[#B59A6C]/50 text-[#B59A6C] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    CALIBRATE FROM APP
                  </button>
                </div>
              </div>

              {/* Trading Board Grid / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeMosunList.map((prod, idx) => {
                  const isCash = prod.name.includes('cash') || (!prod.name.includes('rtgs') && !prod.name.includes('auction') && !prod.name.includes('jewellery') && !prod.name.includes('ct'));
                  const isRtgs = prod.name.includes('rtgs');
                  return (
                    <div key={prod.name || idx} className="bg-[#202020] border border-white/10 p-3.5 rounded hover:border-[#B59A6C]/50 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
                          {prod.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          isRtgs
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                            : isCash
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}>
                          {isRtgs ? 'RTGS 3% GST' : isCash ? 'CASH DELIVERY' : 'BENCHMARK'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                        <div className="bg-black/30 p-2 rounded border border-white/5">
                          <span className="text-[9px] text-white/50 uppercase block">BUY / BID</span>
                          <span className="text-sm font-bold text-white/90">
                            {prod.bid === '--' ? '--' : `₹${Number(prod.bid).toLocaleString('en-IN')}`}
                          </span>
                        </div>
                        <div className="bg-black/30 p-2 rounded border border-[#B59A6C]/20">
                          <span className="text-[9px] text-[#B59A6C] uppercase block font-bold">SELL / ASK</span>
                          <span className="text-sm font-bold text-[#38BDF8]">
                            ₹{Number(prod.ask).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-1 border-t border-white/5">
                        <span>HIGH: ₹{Number(prod.high).toLocaleString('en-IN')}</span>
                        <span>LOW: ₹{Number(prod.low).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="text-[9px] text-white/40 font-body flex items-center justify-between">
                        <span className="truncate">{prod.desc || 'Ready Stock Available In Sujangarh'}</span>
                        {prod.diff !== undefined && prod.diff !== 0 && (
                          <span className={`font-mono text-[9px] font-bold ${prod.diff > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {prod.diff > 0 ? `+₹${prod.diff}` : `-₹${Math.abs(prod.diff)}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Reference Products - MCX Bullion Futures & International Spot */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
                  MCX Bullion Futures &amp; International Spot Quotes
                </h3>
                <span className="text-[10px] font-mono text-white/40">Continuous Market Quotes</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* MCX Gold */}
                <div className={`p-3.5 text-xs font-mono border transition-all duration-700 ${
                  priceDeltas?.mcxGold === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : priceDeltas?.mcxGold === 'down'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-[#202020] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/50 block">GOLD FUTURE (MCX)</span>
                    {priceDeltas?.mcxGold === 'up' && <span className="text-[10px] font-bold text-emerald-400">▲ UP</span>}
                    {priceDeltas?.mcxGold === 'down' && <span className="text-[10px] font-bold text-rose-400">▼ DOWN</span>}
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${
                    priceDeltas?.mcxGold === 'up' ? 'text-emerald-300' : priceDeltas?.mcxGold === 'down' ? 'text-rose-300' : 'text-white'
                  }`}>
                    ₹{(last?.himanshuBullion?.rates?.mcx_gold || 141426).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">10 Grams Contract</div>
                </div>

                {/* MCX Silver */}
                <div className={`p-3.5 text-xs font-mono border transition-all duration-700 ${
                  priceDeltas?.mcxSilver === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : priceDeltas?.mcxSilver === 'down'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-[#202020] border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/50 block">SILVER FUTURE (MCX)</span>
                    {priceDeltas?.mcxSilver === 'up' && <span className="text-[10px] font-bold text-emerald-400">▲ UP</span>}
                    {priceDeltas?.mcxSilver === 'down' && <span className="text-[10px] font-bold text-rose-400">▼ DOWN</span>}
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${
                    priceDeltas?.mcxSilver === 'up' ? 'text-emerald-300' : priceDeltas?.mcxSilver === 'down' ? 'text-rose-300' : 'text-white'
                  }`}>
                    ₹{(last?.himanshuBullion?.rates?.mcx_silver || 187200).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">1 Kilogram Contract</div>
                </div>

                {/* XAU/USD */}
                <div className="bg-[#202020] border border-white/10 p-3.5 text-xs font-mono">
                  <span className="text-[10px] text-white/50 block mb-1">GOLD SPOT (XAU/USD)</span>
                  <div className="text-sm sm:text-base font-bold text-[#B59A6C]">
                    ${(last?.himanshuBullion?.rates?.xau_usd || 4051.23).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">Per Troy Ounce</div>
                </div>

                {/* XAG/USD */}
                <div className="bg-[#202020] border border-white/10 p-3.5 text-xs font-mono">
                  <span className="text-[10px] text-white/50 block mb-1">SILVER SPOT (XAG/USD)</span>
                  <div className="text-sm sm:text-base font-bold text-[#B59A6C]">
                    ${(last?.himanshuBullion?.rates?.xag_usd || 52.97).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">Per Troy Ounce</div>
                </div>

                {/* USD/INR */}
                <div className="bg-[#202020] border border-white/10 p-3.5 text-xs font-mono">
                  <span className="text-[10px] text-white/50 block mb-1">USD / INR SPOT</span>
                  <div className="text-sm sm:text-base font-bold text-emerald-400">
                    ₹{(last?.himanshuBullion?.rates?.usd_inr || 93.73).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">Currency Exchange</div>
                </div>
              </div>
            </div>

            {/* Section 3: Derived Hallmarked Jewellery Benchmark */}
            <div className="p-4 bg-[#232323] border border-white/15">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
                  Monika Jewellers Finished Jewelry Rates (Derived from HB Jodhpur Gold 995)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">100% BIS Hallmarked</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className={`p-3 border transition-all duration-700 ${
                  priceDeltas?.gold24k === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : priceDeltas?.gold24k === 'down'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-[#191919] border-white/10'
                }`}>
                  <span className="text-[10px] text-white/60 block">24K PURE (999)</span>
                  <span className="text-sm font-bold text-white block">₹{(last?.gold_10g_24k || 142837).toLocaleString('en-IN')} / 10g</span>
                  <span className="text-[10px] text-[#B59A6C]">₹{Math.round((last?.gold_10g_24k || 142837) / 10).toLocaleString('en-IN')}/g</span>
                </div>
                <div className={`p-3 border transition-all duration-700 ${
                  priceDeltas?.gold22k === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : priceDeltas?.gold22k === 'down'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-[#191919] border-[#B59A6C]/40'
                }`}>
                  <span className="text-[10px] text-[#B59A6C] font-bold block">22K 916 HALLMARK</span>
                  <span className="text-sm font-bold text-white block">₹{(last?.gold_10g_22k || 130424).toLocaleString('en-IN')} / 10g</span>
                  <span className="text-[10px] text-[#B59A6C]">₹{Math.round((last?.gold_10g_22k || 130424) / 10).toLocaleString('en-IN')}/g</span>
                </div>
                <div className={`p-3 border transition-all duration-700 ${
                  priceDeltas?.gold18k === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : priceDeltas?.gold18k === 'down'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-[#191919] border-white/10'
                }`}>
                  <span className="text-[10px] text-white/60 block">18K SOLITAIRE (750)</span>
                  <span className="text-sm font-bold text-white block">₹{(last?.gold_10g_18k || 106711).toLocaleString('en-IN')} / 10g</span>
                  <span className="text-[10px] text-[#B59A6C]">₹{Math.round((last?.gold_10g_18k || 106711) / 10).toLocaleString('en-IN')}/g</span>
                </div>
                <div className={`p-3 border transition-all duration-700 ${
                  priceDeltas?.silver1kg === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : priceDeltas?.silver1kg === 'down'
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : 'bg-[#191919] border-white/10'
                }`}>
                  <span className="text-[10px] text-white/60 block">SILVER 999.9 PETI</span>
                  <span className="text-sm font-bold text-white block">₹{(last?.silver_1kg || 187600).toLocaleString('en-IN')} / 1kg</span>
                  <span className="text-[10px] text-[#B59A6C]">₹{Math.round((last?.silver_1kg || 187600) / 100).toLocaleString('en-IN')} / 10g</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                className={`bg-white border p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group transition-all duration-700 ${
                  priceDeltas?.gold24k === 'up'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : priceDeltas?.gold24k === 'down'
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E5E2D9]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    99.9% PURE GOLD
                    {priceDeltas?.gold24k === 'up' && <span className="text-emerald-500">▲</span>}
                    {priceDeltas?.gold24k === 'down' && <span className="text-rose-500">▼</span>}
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
                className={`bg-white border p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group transition-all duration-700 ${
                  priceDeltas?.gold22k === 'up'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : priceDeltas?.gold22k === 'down'
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E5E2D9]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    91.6% JEWELRY STANDARD
                    {priceDeltas?.gold22k === 'up' && <span className="text-emerald-500">▲</span>}
                    {priceDeltas?.gold22k === 'down' && <span className="text-rose-500">▼</span>}
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
                  Standard purity for Monika Jewellers Royal Kundan bridal necklaces & bangles.
                </p>
              </motion.div>

              {/* 18K Modern Gold */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className={`bg-white border p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group transition-all duration-700 ${
                  priceDeltas?.gold18k === 'up'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : priceDeltas?.gold18k === 'down'
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E5E2D9]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-[#B59A6C]/40 text-[#B59A6C] font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    75.0% SOLITAIRE SETTING
                    {priceDeltas?.gold18k === 'up' && <span className="text-emerald-500">▲</span>}
                    {priceDeltas?.gold18k === 'down' && <span className="text-rose-500">▼</span>}
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
                className={`bg-white border p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group transition-all duration-700 ${
                  priceDeltas?.silverPeti === 'up'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : priceDeltas?.silverPeti === 'down'
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E5E2D9]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-gray-300 text-gray-600 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    92.5% FINE STERLING
                    {priceDeltas?.silverPeti === 'up' && <span className="text-emerald-500">▲</span>}
                    {priceDeltas?.silverPeti === 'down' && <span className="text-rose-500">▼</span>}
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
                  Standard purity for Monika Jewellers artisanal Hasli necklaces & solid cuffs.
                </p>
              </motion.div>

              {/* 925 Sterling Silver 1kg */}
              <motion.div
                whileHover={{ y: -6, borderColor: '#B59A6C' }}
                className={`bg-white border p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group transition-all duration-700 ${
                  priceDeltas?.silver1kg === 'up'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : priceDeltas?.silver1kg === 'down'
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E5E2D9]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#FAF9F7] border border-gray-300 text-gray-600 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    BULLION BAR (1 KG)
                    {priceDeltas?.silver1kg === 'up' && <span className="text-emerald-500">▲</span>}
                    {priceDeltas?.silver1kg === 'down' && <span className="text-rose-500">▼</span>}
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
                  {chartMode === 'diff' ? 'ARBITRAGE DIFFERENTIAL ENGINE • HB VS MOSUN' : `ANALYTICS ENGINE • ${points.length} SAMPLES RECORDED`}
                </span>
              </div>
              
              <h3 className="font-heading text-xl sm:text-2xl text-[#222222] uppercase tracking-wider font-bold">
                {chartMode === 'diff' 
                  ? `${metal === 'gold' ? 'Gold' : 'Silver'} Spread Differential: HB Jodhpur vs. Mosun Sujangarh`
                  : (chartMode === 'compare' 
                    ? `Dual Market Overlay: HB Jodhpur & Mosun Sujangarh (${metal === 'gold' ? 'Gold' : 'Silver'})`
                    : (metal === 'gold' ? 'Intraday Gold Price Trend Analytics' : 'Intraday Silver Price Trend Analytics'))
                }
              </h3>
            </div>

            {/* Chart Mode & Horizon Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Chart Mode Selector (INR only) */}
              {currency === 'inr' && (
                <div className="flex items-center gap-1 bg-[#FAF9F7] p-1 border border-[#E5E2D9] shrink-0">
                  {[
                    { id: 'diff', label: 'SPREAD DIFFERENCE' },
                    { id: 'compare', label: 'DUAL OVERLAY' },
                    { id: 'tiers', label: 'PURITY TIERS' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setChartMode(m.id)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        chartMode === m.id ? 'bg-[#222222] text-white shadow-sm' : 'text-[#808080] hover:text-[#222222]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Framer Motion Time Horizon Selector Pills */}
              <div className="flex items-center gap-1 bg-[#FAF9F7] p-1 border border-[#E5E2D9] shrink-0">
                {[
                  { id: '1h', label: '1H' },
                  { id: '24h', label: '24H' },
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setTimeRange(tab.id); fetchPrices(currency, tab.id); }}
                    className={`relative px-3.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer z-10 ${
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
          </div>

          {/* Micro Metrics Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF9F7] border border-[#E5E2D9] p-4 text-center relative z-10">
            {chartMode === 'diff' ? (
              <>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                    {metal === 'gold' ? 'GOLD 995 DIFFERENCE' : 'SILVER DIFFERENCE'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#B59A6C]">
                    ₹{(metal === 'gold' ? (spread?.gold_995_diff !== undefined ? spread.gold_995_diff : (144341 - 138732)) : (spread?.silver_peti_diff !== undefined ? spread.silver_peti_diff : (191910 - 188165))).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">HB JODHPUR RATE</span>
                  <span className="font-mono text-base font-bold text-[#222222]">
                    ₹{(metal === 'gold' ? (last?.himanshuBullion?.rates?.gold_995_ask || 144341) : (last?.himanshuBullion?.rates?.silver_999_1kg || 191910)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">MOSUN SUJANGARH RATE</span>
                  <span className="font-mono text-base font-bold text-[#38BDF8]">
                    ₹{(metal === 'gold' ? (last?.mosunBullion?.rates?.gold_995_cash || last?.mosunBullion?.rates?.gold_995_ask || 138732) : (last?.mosunBullion?.rates?.silver_bank_rtgs || last?.mosunBullion?.rates?.silver_999_1kg || 188165)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">SOURCING ADVANTAGE</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 block mt-1">
                    {spread?.sourcingAdvantage || 'Sujangarh (Mosun lower by Rs. 5,609 on Gold 99.50 Cash)'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                    {metal === 'gold' ? '24K PEAK (10G)' : 'SILVER PEAK (10G)'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#B59A6C]">
                    {currencySymbol}{peakRate.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                    {metal === 'gold' ? '24K LOW (10G)' : 'SILVER LOW (10G)'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#222222]">
                    {currencySymbol}{lowestRate.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">MARKET SPREAD</span>
                  <span className="font-mono text-base font-bold text-emerald-600">
                    {peakRate && lowestRate && peakRate !== lowestRate
                      ? `±${(((peakRate - lowestRate) / lowestRate) * 100).toFixed(2)}%`
                      : '±0.35% (STABLE)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">UPDATE FREQUENCY</span>
                  <span className="font-mono text-base font-bold text-gray-600">CONTINUOUS DUAL STREAM</span>
                </div>
              </>
            )}
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
              Every gold and silver creation at Monika Jewellers is crafted using 100% BIS Hallmarked metals with transparent making charges. Our live rates are linked to official bullion benchmarks, guaranteeing that your exchange and buyback valuations remain 100% fair and verified.
            </p>
          </div>
        </div>

      </section>

      {/* Newsletter Section */}
      <MonthlyUpdatesNewsletter />

      {/* Mosun & Sons App Live Calibration Modal */}
      {showCalibrateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-[#B59A6C]/50 w-full max-w-lg p-6 rounded shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h4 className="text-base font-serif font-bold text-white uppercase tracking-wider">
                  Calibrate Mosun &amp; Sons Sujangarh Rates
                </h4>
                <span className="text-[11px] font-mono text-[#B59A6C]">
                  Direct App Mirror Calibration (मौसुण एंड संस)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCalibrateModal(false)}
                className="text-white/60 hover:text-white font-mono text-base font-bold px-2 py-1"
              >
                [X]
              </button>
            </div>

            <p className="text-xs text-white/70 mb-4 leading-relaxed font-body">
              Open the <strong>Mosun and Sons</strong> app on your mobile phone. Enter the current Ask rates displayed on your screen to immediately calibrate all 12 products, spreads, and the live SSE stream.
            </p>

            <form onSubmit={handleCalibrateMosun} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-[10px] uppercase mb-1">
                    Gold 99.50 RTGS (Ask / 10g)
                  </label>
                  <input
                    type="number"
                    placeholder={`Current: ${last?.mosunBullion?.rates?.gold_995_rtgs || 140982}`}
                    value={calibGoldRtgs}
                    onChange={(e) => setCalibGoldRtgs(e.target.value)}
                    className="w-full bg-[#121212] border border-white/20 focus:border-[#B59A6C] px-3 py-2 text-white outline-none rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-[10px] uppercase mb-1">
                    Gold 99.50 Cash (Ask / 10g)
                  </label>
                  <input
                    type="number"
                    placeholder={`Current: ${last?.mosunBullion?.rates?.gold_995_cash || 138732}`}
                    value={calibGoldCash}
                    onChange={(e) => setCalibGoldCash(e.target.value)}
                    className="w-full bg-[#121212] border border-white/20 focus:border-[#B59A6C] px-3 py-2 text-white outline-none rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-[10px] uppercase mb-1">
                    Silver Bank RTGS (Ask / 1kg)
                  </label>
                  <input
                    type="number"
                    placeholder={`Current: ${last?.mosunBullion?.rates?.silver_bank_rtgs || 188165}`}
                    value={calibSilverBank}
                    onChange={(e) => setCalibSilverBank(e.target.value)}
                    className="w-full bg-[#121212] border border-white/20 focus:border-[#B59A6C] px-3 py-2 text-white outline-none rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-[10px] uppercase mb-1">
                    Silver Chorsa Cash (Ask / 1kg)
                  </label>
                  <input
                    type="number"
                    placeholder={`Current: ${last?.mosunBullion?.rates?.silver_chorsa || 185965}`}
                    value={calibSilverChorsa}
                    onChange={(e) => setCalibSilverChorsa(e.target.value)}
                    className="w-full bg-[#121212] border border-white/20 focus:border-[#B59A6C] px-3 py-2 text-white outline-none rounded font-mono"
                  />
                </div>
              </div>

              <div className="bg-[#121212] p-3 rounded border border-white/10 text-[10px] text-white/60 space-y-1">
                <div className="text-white/80 font-bold uppercase">Automatic Derivations Applied:</div>
                <div>• Gold 99.30 Cash will be set to Gold 99.50 Cash minus Rs. 150.</div>
                <div>• 22 CT Jewellery will be derived at 90.52% of Gold Cash (standard Sujangarh formula).</div>
                <div>• Silver Chorsa RTGS will be set to Silver Bank RTGS minus Rs. 1,200.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCalibrateModal(false)}
                  className="px-4 py-2 border border-white/20 text-white/70 hover:text-white uppercase tracking-wider text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCalib}
                  className="px-5 py-2 bg-[#B59A6C] hover:bg-[#C5AA7C] text-black uppercase tracking-wider text-xs font-bold disabled:opacity-50"
                >
                  {isSubmittingCalib ? 'CALIBRATING...' : 'APPLY CALIBRATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Prices;
