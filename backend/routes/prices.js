const express = require('express');
const axios = require('axios');

const router = express.Router();

// In-memory cache & 1-hour automated update interval
// Cache key: `${currency}`; stores last successful normalized payload
const PRICE_CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (3,600,000 ms)

const TROY_OUNCE_TO_GRAM = 31.1034768;
const IMPORT_DUTY_MULTIPLIER = 1.09; // Domestic IBJA benchmark includes custom duty / cess

// Multi-Source Live Metals Fetcher (metals.dev -> Yahoo Commodities -> Standard IBJA Baseline)
const fetchLiveMetals = async (currency = 'inr') => {
  const isINR = currency.toLowerCase() === 'inr';
  const isGBP = currency.toLowerCase() === 'gbp';
  let provider = 'metals.dev (IBJA)';
  let goldPerGram = 0;
  let silverPerGram = 0;
  let apiData = {};

  // Source 1: metals.dev IBJA authority endpoint
  try {
    const apiKey = process.env.METALS_DEV_API_KEY || 'RJ1XWLR1MA9FGVR0I41A488R0I41A';
    const metalsDevUrl = `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=ibja&currency=${currency.toUpperCase()}&unit=g`;
    const resp = await axios.get(metalsDevUrl, {
      headers: { 'Accept': 'application/json' },
      timeout: 4000,
    });
    apiData = resp.data || {};
    if (apiData.status === 'success' && apiData.rates) {
      goldPerGram = Number(apiData.rates.ibja_gold) || 0;
      silverPerGram = Number(apiData.rates.ibja_silver) || 0;
      provider = 'metals.dev (IBJA)';
    }
  } catch (apiErr) {
    // metals.dev quota limit or network timeout - automatically proceed to Source 2
  }

  // Source 2: Live Commodity Market Feeds (Yahoo Finance Gold GC=F, Silver SI=F, Live FX)
  if (!goldPerGram || goldPerGram <= 0) {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      };
      const fxUrl = isGBP 
        ? 'https://query1.finance.yahoo.com/v8/finance/chart/GBPUSD=X?interval=1d&range=1d'
        : 'https://query1.finance.yahoo.com/v8/finance/chart/INR=X?interval=1d&range=1d';

      const [goldRes, silverRes, fxRes] = await Promise.all([
        axios.get('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d', { headers, timeout: 5000 }).catch(() => null),
        axios.get('https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1d', { headers, timeout: 5000 }).catch(() => null),
        axios.get(fxUrl, { headers, timeout: 5000 }).catch(() => null),
      ]);

      const goldUsdOz = goldRes?.data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
      const silverUsdOz = silverRes?.data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;

      if (isINR) {
        const usdInr = fxRes?.data?.chart?.result?.[0]?.meta?.regularMarketPrice || 95.5;
        if (goldUsdOz > 0) {
          goldPerGram = Math.round(((goldUsdOz * usdInr) / TROY_OUNCE_TO_GRAM) * IMPORT_DUTY_MULTIPLIER);
        }
        if (silverUsdOz > 0) {
          silverPerGram = Number((((silverUsdOz * usdInr) / TROY_OUNCE_TO_GRAM) * IMPORT_DUTY_MULTIPLIER).toFixed(2));
        }
      } else if (isGBP) {
        const gbpUsd = fxRes?.data?.chart?.result?.[0]?.meta?.regularMarketPrice || 1.30;
        if (goldUsdOz > 0) {
          goldPerGram = Number(((goldUsdOz / gbpUsd) / TROY_OUNCE_TO_GRAM).toFixed(2));
        }
        if (silverUsdOz > 0) {
          silverPerGram = Number(((silverUsdOz / gbpUsd) / TROY_OUNCE_TO_GRAM).toFixed(2));
        }
      }
      if (goldPerGram > 0) {
        provider = 'Live Market Feed (IBJA Benchmark)';
      }
    } catch (err) {
      console.warn('[PRICE_SERVICE] Live market feed error:', err.message);
    }
  }

  // Source 3: Cached or High-Precision Baseline Fallback
  const cached = PRICE_CACHE.get(`${currency}`);
  if (!goldPerGram || goldPerGram <= 0) {
    if (cached?.payload?.gold?.price) {
      goldPerGram = cached.payload.gold.price;
      silverPerGram = cached.payload.silver?.price || (isGBP ? 1.66 : 235);
      provider = cached.payload.provider || provider;
    } else {
      goldPerGram = isGBP ? 110.4 : 15600;
      silverPerGram = isGBP ? 1.66 : 235.0;
      provider = 'IBJA Benchmark Fallback';
    }
  }

  const purity = { '24k': 1.0, '22k': 22 / 24, '18k': 18 / 24, '14k': 14 / 24 };

  const result = {
    gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
    silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
    gold_10g_24k: Math.round(goldPerGram * 10 * purity['24k']),
    gold_10g_22k: Math.round(goldPerGram * 10 * purity['22k']),
    gold_10g_18k: Math.round(goldPerGram * 10 * purity['18k']),
    timestamp: apiData.timestamp || new Date().toISOString(),
    nextUpdateIn: '1 hour',
    authority: 'ibja',
    provider,
    raw: apiData,
  };

  PRICE_CACHE.set(`${currency}`, { _ts: Date.now(), payload: result });
  return result;
};

// Start background interval to automatically update rates every 1 hour (3,600,000 ms)
setInterval(() => {
  console.log('[PRICE_SERVICE] Running automated 1-hour IBJA price refresh...');
  fetchLiveMetals('inr').catch(() => {});
  fetchLiveMetals('gbp').catch(() => {});
}, 60 * 60 * 1000);

// Initial pre-fetch on server startup
fetchLiveMetals('inr').catch(() => {});
fetchLiveMetals('gbp').catch(() => {});

// GET /api/prices - real-time live IBJA rates
router.get('/', async (req, res) => {
  try {
    const currency = String(req.query.currency || 'inr').toLowerCase();
    const cacheKey = `${currency}`;

    // Serve from cache if fresh (within 1 hour)
    const cached = PRICE_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached._ts) < CACHE_TTL_MS) {
      return res.json(cached.payload);
    }

    const payload = await fetchLiveMetals(currency);
    res.json(payload);
  } catch (err) {
    console.warn('Price API error, returning fallback:', err?.message || err);
    const currency = String(req.query.currency || 'inr').toLowerCase();
    const isGBP = currency === 'gbp';
    const goldPerGram = isGBP ? 110.4 : 15600;
    const silverPerGram = isGBP ? 1.66 : 235.0;
    const payload = {
      gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      gold_10g_24k: Math.round(goldPerGram * 10 * 1.0),
      gold_10g_22k: Math.round(goldPerGram * 10 * (22/24)),
      gold_10g_18k: Math.round(goldPerGram * 10 * (18/24)),
      timestamp: new Date().toISOString(),
      nextUpdateIn: '1 hour',
      authority: 'ibja',
      provider: 'IBJA Benchmark Fallback',
    };
    PRICE_CACHE.set(`${currency}`, { _ts: Date.now(), payload });
    res.json(payload);
  }
});

// GET /api/prices/latest - expose latest per-gram and karat prices from cache
router.get('/latest', (req, res) => {
  const currency = String(req.query.currency || 'inr').toLowerCase();
  const cached = PRICE_CACHE.get(`${currency}`);
  if (cached && (Date.now() - cached._ts) < CACHE_TTL_MS) {
    return res.json(cached.payload);
  }
  
  fetchLiveMetals(currency)
    .then(payload => res.json(payload))
    .catch(() => res.status(500).json({ error: 'Failed to fetch prices' }));
});

// POST /api/prices/calc - calculate live price from weight and karat (24/22/18)
router.post('/calc', (req, res) => {
  try {
    const currency = String(req.query.currency || 'inr').toLowerCase();
    const { weight, karat } = req.body || {};
    if (!weight || !karat) return res.status(400).json({ error: 'Missing weight or karat' });
    const cached = PRICE_CACHE.get(`${currency}`);
    if (!cached || (Date.now() - cached._ts) >= CACHE_TTL_MS) {
      return res.status(503).json({ error: 'Price not ready. Please fetch /api/prices first.' });
    }
    const basePerGram = cached.payload.gold?.price || 0;
    const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : karat === 18 ? 18/24 : null;
    if (!purity) return res.status(400).json({ error: 'Invalid karat. Use 24, 22, or 18.' });
    const livePrice = Math.round(basePerGram * weight * purity);
    return res.json({ currency: currency.toUpperCase(), unit: 'gram', weight, karat, price: livePrice });
  } catch (e) {
    return res.status(500).json({ error: 'Calculation error' });
  }
});

module.exports = router;
