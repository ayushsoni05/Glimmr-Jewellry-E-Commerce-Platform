const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Cart = require('../models/Cart');

const router = express.Router();

// Helper: fetch live per-gram rates for gold and silver (GoldAPI.io primary, MetalPriceAPI fallback)
async function fetchPerGramRates(currency = 'INR') {
  const OZ_TO_GRAM = 31.1034768;
  const INDIA_MULTIPLIER_GOLDAPI = 1.16;
  const INDIA_MULTIPLIER_METALAPI = 1.15;
  const curr = currency.toUpperCase();
  const isINR = curr === 'INR';

  let goldPerGram = 0, silverPerGram = 0;

  // Source 1: GoldAPI.io (real-time intraday)
  try {
    const goldApiKey = process.env.GOLDAPI_KEY || 'goldapi-pdixz26mhm8766q-io';
    const headers = { 'x-access-token': goldApiKey, 'Content-Type': 'application/json' };
    const [goldResp, silverResp] = await Promise.all([
      axios.get(`https://www.goldapi.io/api/XAU/${curr}`, { headers, timeout: 8000 }).catch(() => null),
      axios.get(`https://www.goldapi.io/api/XAG/${curr}`, { headers, timeout: 8000 }).catch(() => null),
    ]);
    const gd = goldResp?.data || {};
    const sd = silverResp?.data || {};
    if (gd.price_gram_24k && gd.price_gram_24k > 0) {
      goldPerGram = isINR ? Math.round(Number(gd.price_gram_24k) * INDIA_MULTIPLIER_GOLDAPI) : Number(Number(gd.price_gram_24k).toFixed(2));
    }
    if (sd.price_gram_24k && sd.price_gram_24k > 0) {
      silverPerGram = isINR ? Number((Number(sd.price_gram_24k) * INDIA_MULTIPLIER_GOLDAPI).toFixed(2)) : Number(Number(sd.price_gram_24k).toFixed(2));
    }
  } catch (err) {
    console.warn('[CART RATES] GoldAPI.io failed, trying MetalPriceAPI:', err.message);
  }

  // Source 2: MetalPriceAPI (end-of-day fallback)
  if (!goldPerGram || goldPerGram <= 0) {
    try {
      const metalApiKey = process.env.METALPRICEAPI_KEY || '2231ecdf41631c3c93b8b39dca380250';
      const url = `https://api.metalpriceapi.com/v1/latest?api_key=${metalApiKey}&base=${curr}&currencies=XAU,XAG`;
      const resp = await axios.get(url, { headers: { 'Accept': 'application/json' }, timeout: 5000 });
      const d = resp.data || {};
      if (d.success && d.rates) {
        const ounceGold = Number(d.rates[`${curr}XAU`]) || (d.rates.XAU ? (1 / Number(d.rates.XAU)) : 0);
        const ounceSilver = Number(d.rates[`${curr}XAG`]) || (d.rates.XAG ? (1 / Number(d.rates.XAG)) : 0);
        if (ounceGold > 0) {
          const rawGold = ounceGold / OZ_TO_GRAM;
          goldPerGram = isINR ? Math.round(rawGold * INDIA_MULTIPLIER_METALAPI) : Number(rawGold.toFixed(2));
        }
        if (ounceSilver > 0) {
          const rawSilver = ounceSilver / OZ_TO_GRAM;
          silverPerGram = isINR ? Number((rawSilver * INDIA_MULTIPLIER_METALAPI).toFixed(2)) : Number(rawSilver.toFixed(2));
        }
      }
    } catch (err) {
      console.warn('[CART RATES] MetalPriceAPI also failed, using fallback:', err.message);
    }
  }

  if (!goldPerGram || goldPerGram <= 0) goldPerGram = curr === 'GBP' ? 110.4 : 15400;
  if (!silverPerGram || silverPerGram <= 0) silverPerGram = curr === 'GBP' ? 1.66 : 230;

  return { goldPerGram, silverPerGram };
}

// Helper: compute live unit price for a product (weight in grams, karat for gold)
function computeLivePrice(product, perGram) {
  const weight = Number(product.weight || 0);
  if (!weight || weight <= 0) return 0;
  const material = String(product.material || '').toLowerCase();
  if (material === 'gold') {
    const karat = Number(product.karat || 24);
    const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : karat === 18 ? 18/24 : karat/24;
    return Math.round(perGram.goldPerGram * weight * purity);
  }
  if (material === 'silver') {
    return Math.round(perGram.silverPerGram * weight);
  }
  // Other materials fall back to existing price
  return Math.round(Number(product.price || 0));
}

// POST /api/cart - add to cart
router.post('/', async (req, res) => {
  const { userId, productId, quantity = 1, guestId } = req.body;
  try {
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const query = userId ? { user: userId } : { guestId: guestId || req.ip };
    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart({ user: userId || undefined, guestId: userId ? undefined : (guestId || req.ip), items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    
    // Return cart count quickly without populating full product details
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ 
      success: true, 
      cartCount: totalItems,
      message: 'Product added to cart'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const id = req.params.userId;
    let query;
    if (!id || id === 'undefined' || id === 'null') {
      const guestId = req.query.guestId || req.ip;
      query = { guestId };
    } else {
      const or = [];
      if (mongoose.Types.ObjectId.isValid(id)) {
        or.push({ user: id });
      }
      or.push({ guestId: id });
      query = { $or: or };
    }
    const cart = await Cart.findOne(query).populate('items.product');
    if (!cart) return res.json({ items: [] });
    try {
      const perGram = await fetchPerGramRates('INR');
      cart.items.forEach(it => {
        if (it && it.product && typeof it.product === 'object' && it.product.material) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(cart);
  } catch (err) {
    console.error('[CART] Error fetching cart:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch cart' });
  }
});

// PUT /api/cart/:userId - update quantity
router.put('/:userId', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ $or: [{ user: req.params.userId }, { guestId: req.params.userId }] });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    const item = cart.items.find(item => item.product.toString() === productId);
    if (item) {
      item.quantity = quantity;
      await cart.save();
    }
    const populated = await Cart.findById(cart._id).populate('items.product');
    try {
      const perGram = await fetchPerGramRates('INR');
      populated.items.forEach(it => {
        if (it.product) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(populated);
  } catch (err) {
    console.error('[CART] Error updating cart:', err);
    res.status(400).json({ error: err.message || 'Failed to update cart' });
  }
});

// DELETE /api/cart/:userId/:productId - remove from cart
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ $or: [{ user: req.params.userId }, { guestId: req.params.userId }] });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    try {
      const perGram = await fetchPerGramRates('INR');
      populated.items.forEach(it => {
        if (it.product) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(populated);
  } catch (err) {
    console.error('[CART] Error deleting from cart:', err);
    res.status(400).json({ error: err.message || 'Failed to delete from cart' });
  }
});

module.exports = router;
