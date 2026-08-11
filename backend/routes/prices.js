const express = require('express');
const axios = require('axios');

const router = express.Router();

// In-memory cache & 1-hour automated update interval
// Cache key: `${currency}`; stores last successful normalized payload
const PRICE_CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (3,600,000 ms)

// Helper function to fetch live IBJA rates from metals.dev
const fetchLiveMetals = async (currency = 'inr') => {
  const apiKey = process.env.METALS_DEV_API_KEY || 'RJ1XWLR1MA9FGVR0I41A488R0I41A';
  const metalsDevUrl = `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=ibja&currency=${currency.toUpperCase()}&unit=g`;

  let provider = 'metals.dev (IBJA)';
  let goldPerGram = 0;
  let silverPerGram = 0;
  let apiData = {};

  try {
    const resp = await axios.get(metalsDevUrl, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    });

    apiData = resp.data || {};
    if (apiData.status === 'success' && apiData.rates) {
      goldPerGram = Number(apiData.rates.ibja_gold) || 0;
      silverPerGram = Number(apiData.rates.ibja_silver) || 0;
    }
  } catch (apiErr) {
    console.warn(`[metals.dev IBJA] Fetch failed for ${currency.toUpperCase()}:`, apiErr?.message || apiErr);
  }

  const cached = PRICE_CACHE.get(`${currency}`);
  if (!goldPerGram || goldPerGram <= 0) {
    if (cached?.payload?.gold?.price) {
      goldPerGram = cached.payload.gold.price;
      silverPerGram = cached.payload.silver?.price || (currency === 'gbp' ? 1.8 : 230);
      provider = cached.payload.provider || provider;
    } else {
      goldPerGram = currency === 'gbp' ? 116.8 : 15064;
      silverPerGram = currency === 'gbp' ? 1.8 : 231.3;
      provider = 'fallback';
    }
  }

  const purity = { '24k': 1.0, '22k': 22 / 24, '18k': 18 / 24 };

  const result = {
    gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
    silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
    gold_10g_24k: Math.round(goldPerGram * 10 * purity['24k']),
    gold_10g_22k: Math.round(goldPerGram * 10 * purity['22k']),
    gold_10g_18k: Math.round(goldPerGram * 10 * purity['18k']),
    timestamp: apiData.timestamp || new Date().toISOString(),
    nextUpdateIn: '1 hour',
    authority: apiData.authority || 'ibja',
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

// GET /api/prices - real-time live metals.dev IBJA rates
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
    const goldPerGram = currency === 'gbp' ? 116.8 : 15064;
    const silverPerGram = currency === 'gbp' ? 1.8 : 231.3;
    const payload = {
      gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      gold_10g_24k: Math.round(goldPerGram * 10 * 1.0),
      gold_10g_22k: Math.round(goldPerGram * 10 * (22/24)),
      gold_10g_18k: Math.round(goldPerGram * 10 * (18/24)),
      timestamp: new Date().toISOString(),
      nextUpdateIn: '1 hour',
      authority: 'ibja',
      provider: 'fallback',
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
