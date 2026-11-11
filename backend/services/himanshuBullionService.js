const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const signalR = require('@microsoft/signalr');
const EventEmitter = require('events');

const bullionEmitter = new EventEmitter();
bullionEmitter.setMaxListeners(200);

// Path to persistent fallback cache
const CACHE_DIR = path.join(__dirname, '../data');
const CACHE_FILE = path.join(CACHE_DIR, 'hb_bullion_cache.json');

// Default initial baseline based on verified Himanshu Bullion Jodhpur quotes
const DEFAULT_BASELINE = {
  products: [
    {
      name: 'GOLD 995 JDR',
      bid: '--',
      ask: 144341,
      high: 145004,
      low: 144065,
      diff: 0,
      desc: 'Ready Stock Available In JDR (3% GST Paid)'
    },
    {
      name: 'SILVER BANK PETI 999.9 JDR',
      bid: '--',
      ask: 191910,
      high: 192780,
      low: 190222,
      diff: 0,
      desc: 'Ready Stock Available In JDR (3% GST Paid)'
    },
    {
      name: 'SILVER CHORSA 98.00 JDR',
      bid: '--',
      ask: 188456,
      high: 190429,
      low: 186850,
      diff: 0,
      desc: 'Ready Stock Available In JDR (3% GST Paid)'
    },
    {
      name: 'COPPER 99.9 JDR',
      bid: '--',
      ask: 1998,
      high: 2004,
      low: 1997,
      diff: 0,
      desc: 'Ready Stock Available In JDR (18% GST Plus)'
    }
  ],
  refProduct: [
    { symbol: 'gold', Bid: 141381, Ask: 141426, High: 141990, Low: 141120 },
    { symbol: 'silver', Bid: 187120, Ask: 187200, High: 187979, Low: 185290 },
    { symbol: 'XAUUSD', Bid: 4050.80, Ask: 4051.23, High: 4066.93, Low: 4026.70 },
    { symbol: 'XAGUSD', Bid: 52.95, Ask: 52.97, High: 53.19, Low: 51.45 },
    { symbol: 'INRSpot', Bid: 93.68, Ask: 93.73, High: 93.93, Low: 93.63 }
  ],
  rates: {
    gold_995_ask: 144341,
    gold_995_bid: 143806,
    gold_995_high: 145004,
    gold_995_low: 144065,
    gold_24k_10g: 144921,
    gold_22k_10g: 132844,
    gold_18k_10g: 108691,
    gold_14k_10g: 84537,
    rates_per_gram: {
      gold_24k: 14492.1,
      gold_22k: 13284.4,
      gold_18k: 10869.1,
      gold_14k: 8453.7,
      silver: 191.91
    },
    silver_999_1kg: 191910,
    silver_chorsa_1kg: 188456,
    silver_10g: 1919,
    copper_1kg: 1998,
    mcx_gold: 141426,
    mcx_silver: 187200,
    xau_usd: 4051.23,
    xag_usd: 52.97,
    usd_inr: 93.73
  },
  lastUpdated: new Date().toISOString(),
  isLive: false,
  statusText: 'Himanshu Bullion Jodhpur Baseline',
  provider: 'Himanshu Bullion Jodhpur (HB Jodhpur Pride Stream)'
};

let memoryStore = { ...DEFAULT_BASELINE };
let hubConnection = null;
let isStarted = false;
let lastDiskSaveTime = 0;

/**
 * Load cached snapshot from disk if present
 */
function loadDiskCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.rates) {
        memoryStore = {
          ...parsed,
          isLive: false,
          statusText: 'Cached Himanshu Bullion Jodhpur Feed'
        };
        console.log('[HIMANSHU_BULLION] Loaded persistent cache from disk.');
      }
    }
  } catch (err) {
    console.warn('[HIMANSHU_BULLION] Could not read disk cache, using baseline:', err.message);
  }
}

/**
 * Save snapshot to disk (throttled to at most once every 30 seconds)
 */
function saveDiskCache() {
  const now = Date.now();
  if (now - lastDiskSaveTime < 30000) return;
  lastDiskSaveTime = now;

  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[HIMANSHU_BULLION] Could not write cache to disk:', err.message);
  }
}

/**
 * Parse raw number safely from string or number
 */
function parseNum(val, fallback = 0) {
  if (val === undefined || val === null || val === '--') return fallback;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? fallback : num;
}

/**
 * Process decoded SignalR data payload
 */
function processBullionPayload(payload) {
  if (!payload) return;

  const products = Array.isArray(payload.products) ? payload.products : [];
  const refProduct = Array.isArray(payload.refProduct) ? payload.refProduct : [];
  const refDetails = Array.isArray(payload.refDetails) ? payload.refDetails : [];

  // Find physical Gold 995
  const gold995Obj = products.find(p => p.name && (p.name.includes('GOLD 995') || p.name.includes('Gold 995'))) || {};
  const gold995Ask = parseNum(gold995Obj.ask, memoryStore.rates.gold_995_ask);
  const gold995Bid = parseNum(gold995Obj.bid, memoryStore.rates.gold_995_bid);
  const gold995High = parseNum(gold995Obj.high, memoryStore.rates.gold_995_high);
  const gold995Low = parseNum(gold995Obj.low, memoryStore.rates.gold_995_low);

  // Find Silver Peti 999.9
  const silverPetiObj = products.find(p => p.name && (p.name.includes('SILVER BANK PETI') || p.name.includes('SIL PETI'))) || {};
  const silverPetiAsk = parseNum(silverPetiObj.ask, memoryStore.rates.silver_999_1kg);

  // Find Silver Chorsa 98.00
  const silverChorsaObj = products.find(p => p.name && (p.name.includes('SILVER CHORSA') || p.name.includes('SIL CHORSA'))) || {};
  const silverChorsaAsk = parseNum(silverChorsaObj.ask, memoryStore.rates.silver_chorsa_1kg);

  // Find Copper 99.9
  const copperObj = products.find(p => p.name && p.name.includes('COPPER')) || {};
  const copperAsk = parseNum(copperObj.ask, memoryStore.rates.copper_1kg);

  // Reference MCX & Spot
  const mcxGoldObj = refProduct.find(p => p.symbol === 'gold') || {};
  const mcxSilverObj = refProduct.find(p => p.symbol === 'silver') || {};
  const xauUsdObj = refProduct.find(p => p.symbol === 'XAUUSD') || {};
  const xagUsdObj = refProduct.find(p => p.symbol === 'XAGUSD') || {};
  const inrSpotObj = refProduct.find(p => p.symbol === 'INRSpot') || {};

  const mcxGold = parseNum(mcxGoldObj.Ask, memoryStore.rates.mcx_gold);
  const mcxSilver = parseNum(mcxSilverObj.Ask, memoryStore.rates.mcx_silver);
  const xauUsd = parseNum(xauUsdObj.Ask, memoryStore.rates.xau_usd);
  const xagUsd = parseNum(xagUsdObj.Ask, memoryStore.rates.xag_usd);
  const usdInr = parseNum(inrSpotObj.Ask, memoryStore.rates.usd_inr);

  // Derived Retail Purity Calculations
  // Gold 999 24K Pure per 10g
  const gold24k10g = gold995Ask > 0 ? Math.round(gold995Ask * (99.9 / 99.5)) : memoryStore.rates.gold_24k_10g;
  // Gold 22K 916 BIS Hallmark per 10g
  const gold22k10g = Math.round(gold24k10g * (22 / 24));
  // Gold 18K Solitaire per 10g
  const gold18k10g = Math.round(gold24k10g * (18 / 24));
  // Gold 14K Daily Wear per 10g
  const gold14k10g = Math.round(gold24k10g * (14 / 24));

  const silver10g = Math.round(silverPetiAsk / 100);

  memoryStore = {
    products,
    refProduct,
    refDetails,
    rates: {
      gold_995_ask: gold995Ask,
      gold_995_bid: gold995Bid,
      gold_995_high: gold995High,
      gold_995_low: gold995Low,
      gold_24k_10g: gold24k10g,
      gold_22k_10g: gold22k10g,
      gold_18k_10g: gold18k10g,
      gold_14k_10g: gold14k10g,
      rates_per_gram: {
        gold_24k: Number((gold24k10g / 10).toFixed(2)),
        gold_22k: Number((gold22k10g / 10).toFixed(2)),
        gold_18k: Number((gold18k10g / 10).toFixed(2)),
        gold_14k: Number((gold14k10g / 10).toFixed(2)),
        silver: Number((silverPetiAsk / 1000).toFixed(2))
      },
      silver_999_1kg: silverPetiAsk,
      silver_chorsa_1kg: silverChorsaAsk,
      silver_10g: silver10g,
      copper_1kg: copperAsk,
      mcx_gold: mcxGold,
      mcx_silver: mcxSilver,
      xau_usd: xauUsd,
      xag_usd: xagUsd,
      usd_inr: usdInr
    },
    lastUpdated: new Date().toISOString(),
    isLive: true,
    statusText: 'Himanshu Bullion Jodhpur Real-Time Feed Active',
    provider: 'Himanshu Bullion Jodhpur (HB Jodhpur Pride Stream)'
  };

  saveDiskCache();
  bullionEmitter.emit('tick', memoryStore);
}

/**
 * Connect to Himanshu Bullion SignalR Stream
 */
async function connectSignalR() {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://hbjodhpur.com:1001/bullion?user=Pride&auth=1&type=web', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 15000);
        }
      })
      .build();

    hubConnection.on('workerPublish', encodedData => {
      try {
        const buffer = Buffer.from(encodedData, 'base64');
        const unzipped = zlib.gunzipSync(buffer);
        const parsed = JSON.parse(unzipped.toString('utf8'));
        processBullionPayload(parsed);
      } catch (err) {
        console.warn('[HIMANSHU_BULLION] Failed to decode workerPublish payload:', err.message);
      }
    });

    hubConnection.onclose(() => {
      console.warn('[HIMANSHU_BULLION] WebSocket connection closed, will reconnect...');
      memoryStore.isLive = false;
      memoryStore.statusText = 'Himanshu Bullion Jodhpur Feed Reconnecting';
    });

    hubConnection.onreconnecting(() => {
      console.warn('[HIMANSHU_BULLION] SignalR reconnecting...');
      memoryStore.isLive = false;
    });

    hubConnection.onreconnected(() => {
      console.log('[HIMANSHU_BULLION] SignalR reconnected successfully. Invoking client Pride...');
      hubConnection.invoke('client', 'Pride').catch(() => {});
      memoryStore.isLive = true;
      memoryStore.statusText = 'Himanshu Bullion Jodhpur Real-Time Feed Active';
    });

    await hubConnection.start();
    console.log('[HIMANSHU_BULLION] Connected to wss://hbjodhpur.com:1001/bullion. Registering client Pride...');
    await hubConnection.invoke('client', 'Pride');
    console.log('[HIMANSHU_BULLION] Registered as client Pride. Live stream ready.');
    memoryStore.isLive = true;
  } catch (err) {
    console.warn('[HIMANSHU_BULLION] Initial connection failed:', err.message, '- scheduling retry in 5s.');
    memoryStore.isLive = false;
    memoryStore.statusText = 'Himanshu Bullion Jodhpur Offline / Standby';
    setTimeout(connectSignalR, 5000);
  }
}

/**
 * Start the ingestion service on backend boot
 */
function startBullionService() {
  if (isStarted) return;
  isStarted = true;
  loadDiskCache();
  connectSignalR().catch(err => {
    console.warn('[HIMANSHU_BULLION] Startup exception:', err.message);
  });
}

/**
 * Get the latest normalized bullion rates
 */
function getLatestBullionData() {
  return memoryStore;
}

module.exports = {
  startBullionService,
  getLatestBullionData,
  bullionEmitter
};
