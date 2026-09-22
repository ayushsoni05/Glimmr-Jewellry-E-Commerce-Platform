const express = require('express');
const axios = require('axios');

const router = express.Router();

// In-memory cache & automated update interval
// Cache key: `${currency}`; stores last successful normalized payload
const PRICE_CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes for fresher prices

const TROY_OUNCE_TO_GRAM = 31.1034768;

// Indian retail benchmark multiplier:
//   Import duty (15%) + GST (3%) = ~1.18x total markup on international spot
//   GoldAPI.io returns INR spot (already includes USD->INR conversion)
//   We apply the Indian duty+GST premium to match IBJA published rates
const INDIA_RETAIL_MULTIPLIER_GOLDAPI = 1.16;   // GoldAPI.io spot -> IBJA retail
const INDIA_RETAIL_MULTIPLIER_METALAPI = 1.15;   // MetalPriceAPI spot -> IBJA retail

// Multi-Source Live Metals Fetcher
// Priority: GoldAPI.io (real-time) -> MetalPriceAPI (end-of-day) -> Yahoo Finance -> Cached/Fallback
const fetchLiveMetals = async (currency = 'inr') => {
  const isINR = currency.toLowerCase() === 'inr';
  const isGBP = currency.toLowerCase() === 'gbp';
  const curr = currency.toUpperCase();
  let provider = 'IBJA Benchmark Fallback';
  let goldPerGram = 0;
  let silverPerGram = 0;
  let rawGoldPerGram = 0;
  let rawSilverPerGram = 0;
  let apiData = {};
  let marketData = {};  // open, high, low, change data from GoldAPI.io

  // ---------- Source 1: GoldAPI.io (Real-Time Intraday) ----------
  try {
    const goldApiKey = process.env.GOLDAPI_KEY || 'goldapi-pdixz26mhm8766q-io';
    const goldHeaders = {
      'x-access-token': goldApiKey,
      'Content-Type': 'application/json',
    };

    // Fetch gold and silver in parallel
    const [goldResp, silverResp] = await Promise.all([
      axios.get(`https://www.goldapi.io/api/XAU/${curr}`, { headers: goldHeaders, timeout: 8000 }).catch(() => null),
      axios.get(`https://www.goldapi.io/api/XAG/${curr}`, { headers: goldHeaders, timeout: 8000 }).catch(() => null),
    ]);

    const goldData = goldResp?.data || {};
    const silverData = silverResp?.data || {};

    if (goldData.price_gram_24k && goldData.price_gram_24k > 0) {
      apiData = goldData;
      rawGoldPerGram = Number(goldData.price_gram_24k);

      if (isINR) {
        // Apply Indian import duty + GST to match IBJA published benchmark
        goldPerGram = Math.round(rawGoldPerGram * INDIA_RETAIL_MULTIPLIER_GOLDAPI);
      } else {
        goldPerGram = Number(rawGoldPerGram.toFixed(2));
      }

      // Store intraday market data for the Prices page
      marketData = {
        openPrice: Number(goldData.open_price) || 0,
        highPrice: Number(goldData.high_price) || 0,
        lowPrice: Number(goldData.low_price) || 0,
        change: Number(goldData.ch) || 0,
        changePercent: Number(goldData.chp) || 0,
        prevClosePrice: Number(goldData.prev_close_price) || 0,
      };

      provider = 'GoldAPI.io (Real-Time IBJA Benchmark)';
    }

    if (silverData.price_gram_24k && silverData.price_gram_24k > 0) {
      rawSilverPerGram = Number(silverData.price_gram_24k);
      if (isINR) {
        silverPerGram = Number((rawSilverPerGram * INDIA_RETAIL_MULTIPLIER_GOLDAPI).toFixed(2));
      } else {
        silverPerGram = Number(rawSilverPerGram.toFixed(2));
      }
    }
  } catch (goldApiErr) {
    console.warn('[PRICE_SERVICE] GoldAPI.io error, proceeding to fallback:', goldApiErr.message);
  }

  // ---------- Source 2: MetalPriceAPI (End-of-Day Fallback) ----------
  if (!goldPerGram || goldPerGram <= 0) {
    try {
      const metalApiKey = process.env.METALPRICEAPI_KEY || '2231ecdf41631c3c93b8b39dca380250';
      const metalPriceUrl = `https://api.metalpriceapi.com/v1/latest?api_key=${metalApiKey}&base=${curr}&currencies=XAU,XAG`;
      const resp = await axios.get(metalPriceUrl, {
        headers: { 'Accept': 'application/json' },
        timeout: 6000,
      });
      const d = resp.data || {};
      if (d.success && d.rates) {
        apiData = d;
        const ounceGold = Number(d.rates[`${curr}XAU`]) || (d.rates.XAU ? (1 / Number(d.rates.XAU)) : 0);
        const ounceSilver = Number(d.rates[`${curr}XAG`]) || (d.rates.XAG ? (1 / Number(d.rates.XAG)) : 0);

        if (ounceGold > 0) {
          rawGoldPerGram = ounceGold / TROY_OUNCE_TO_GRAM;
          goldPerGram = isINR ? Math.round(rawGoldPerGram * INDIA_RETAIL_MULTIPLIER_METALAPI) : Number(rawGoldPerGram.toFixed(2));
        }
        if (ounceSilver > 0) {
          rawSilverPerGram = ounceSilver / TROY_OUNCE_TO_GRAM;
          silverPerGram = isINR ? Number((rawSilverPerGram * INDIA_RETAIL_MULTIPLIER_METALAPI).toFixed(2)) : Number(rawSilverPerGram.toFixed(2));
        }

        if (goldPerGram > 0) {
          provider = 'MetalPriceAPI (IBJA Benchmark)';
        }
      }
    } catch (apiErr) {
      console.warn('[PRICE_SERVICE] MetalPriceAPI error, proceeding to fallback:', apiErr.message);
    }
  }

  // ---------- Source 3: Yahoo Finance (Live Commodities + FX) ----------
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
          rawGoldPerGram = (goldUsdOz * usdInr) / TROY_OUNCE_TO_GRAM;
          goldPerGram = Math.round(rawGoldPerGram * INDIA_RETAIL_MULTIPLIER_METALAPI);
        }
        if (silverUsdOz > 0) {
          rawSilverPerGram = (silverUsdOz * usdInr) / TROY_OUNCE_TO_GRAM;
          silverPerGram = Number((rawSilverPerGram * INDIA_RETAIL_MULTIPLIER_METALAPI).toFixed(2));
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

  // ---------- Source 4: Cached or IBJA Baseline Fallback ----------
  const cached = PRICE_CACHE.get(`${currency}`);
  if (!goldPerGram || goldPerGram <= 0) {
    if (cached?.payload?.gold?.price) {
      goldPerGram = cached.payload.gold.price;
      silverPerGram = cached.payload.silver?.price || (isGBP ? 1.66 : 235);
      provider = cached.payload.provider || provider;
    } else {
      // Updated baseline rates (Sep 2026 IBJA benchmark)
      goldPerGram = isGBP ? 110.4 : 15400;
      silverPerGram = isGBP ? 1.66 : 230.0;
      provider = 'IBJA Benchmark Fallback';
    }
  }

  const purity = { '24k': 1.0, '22k': 22 / 24, '18k': 18 / 24, '14k': 14 / 24 };

  const result = {
    gold: {
      price: goldPerGram,
      spotPrice: rawGoldPerGram > 0 ? Number(rawGoldPerGram.toFixed(2)) : goldPerGram,
      currency: currency.toUpperCase(),
      unit: 'gram'
    },
    silver: {
      price: silverPerGram,
      spotPrice: rawSilverPerGram > 0 ? Number(rawSilverPerGram.toFixed(2)) : silverPerGram,
      currency: currency.toUpperCase(),
      unit: 'gram',
      pricePerKg: Math.round(silverPerGram * 1000)
    },
    gold_10g_24k: Math.round(goldPerGram * 10 * purity['24k']),
    gold_10g_22k: Math.round(goldPerGram * 10 * purity['22k']),
    gold_10g_18k: Math.round(goldPerGram * 10 * purity['18k']),
    gold_10g_14k: Math.round(goldPerGram * 10 * purity['14k']),
    silver_1kg: Math.round(silverPerGram * 1000),
    rates_per_gram: {
      gold_24k: goldPerGram,
      gold_22k: Math.round(goldPerGram * purity['22k']),
      gold_18k: Math.round(goldPerGram * purity['18k']),
      gold_14k: Math.round(goldPerGram * purity['14k']),
      silver: silverPerGram
    },
    market: marketData,
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    nextUpdateIn: '30 minutes',
    authority: 'ibja',
    provider,
    source: provider.includes('GoldAPI') ? 'goldapi.io' : 'metalpriceapi.com',
    raw: apiData,
  };

  PRICE_CACHE.set(`${currency}`, { _ts: Date.now(), payload: result });
  return result;
};

// Background auto-refresh: every 30 minutes for fresh IBJA-aligned rates
setInterval(() => {
  console.log('[PRICE_SERVICE] Running automated 30-min IBJA price refresh...');
  fetchLiveMetals('inr').catch(() => {});
  fetchLiveMetals('gbp').catch(() => {});
}, 30 * 60 * 1000);

// Initial pre-fetch on server startup
fetchLiveMetals('inr').catch(() => {});
fetchLiveMetals('gbp').catch(() => {});

// GET /api/prices - real-time live IBJA rates
router.get('/', async (req, res) => {
  try {
    const currency = String(req.query.currency || 'inr').toLowerCase();
    const cacheKey = `${currency}`;

    // Serve from cache if fresh (within 30 minutes)
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
    const goldPerGram = isGBP ? 110.4 : 15400;
    const silverPerGram = isGBP ? 1.66 : 230.0;
    const payload = {
      gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      gold_10g_24k: Math.round(goldPerGram * 10 * 1.0),
      gold_10g_22k: Math.round(goldPerGram * 10 * (22/24)),
      gold_10g_18k: Math.round(goldPerGram * 10 * (18/24)),
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      nextUpdateIn: '30 minutes',
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
