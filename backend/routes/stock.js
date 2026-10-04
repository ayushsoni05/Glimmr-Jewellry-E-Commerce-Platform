const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const { staffAuth, managerOrAdminAuth } = require('../middleware/admin');
const { getCurrentMetalPrices } = require('../utils/priceCalculator');

// ============================================================
// 1. GET / - List all products with stock and inventory metrics
// ============================================================
router.get('/', staffAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const { search, category, material, stockStatus, location } = req.query;

    const query = { isActive: true };

    if (search && String(search).trim() !== '') {
      const s = String(search).trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { sku: { $regex: s, $options: 'i' } },
        { barcode: { $regex: s, $options: 'i' } },
        { huid: { $regex: s, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      const stem = category.toLowerCase().replace(/s$/, '');
      query.category = { $regex: new RegExp(`^${stem}s?$`, 'i') };
    }

    if (material && material !== 'all') {
      query.material = material.toLowerCase();
    }

    if (stockStatus && stockStatus !== 'all') {
      query.stockStatus = stockStatus;
    }

    if (location && location !== 'all') {
      query.location = location;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ stock: 1, updatedAt: -1 }) // Show low stock first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Quick counts for badges
    const [lowStockCount, outOfStockCount, totalUnitsResult] = await Promise.all([
      Product.countDocuments({ isActive: true, stockStatus: 'low_stock' }),
      Product.countDocuments({ isActive: true, stockStatus: 'out_of_stock' }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalUnits: { $sum: '$stock' } } }
      ])
    ]);

    const totalUnits = totalUnitsResult[0]?.totalUnits || 0;

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
      metrics: {
        lowStockCount,
        outOfStockCount,
        totalUnits
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 2. GET /vault-summary - Weight breakdown and live inventory valuation
// ============================================================
router.get('/vault-summary', staffAuth, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).lean();

    let gold24kWt = 0;
    let gold22kWt = 0;
    let gold18kWt = 0;
    let gold14kWt = 0;
    let silverWt = 0;
    let diamondCarats = 0;
    let totalPieces = 0;

    products.forEach(p => {
      const units = Math.max(0, p.stock || 0);
      totalPieces += units;
      const netWt = (p.netWeight || p.weight || 0) * units;

      const mat = String(p.material || 'gold').toLowerCase();
      const karat = Number(p.karat) || 22;

      if (mat === 'gold') {
        if (karat === 24) gold24kWt += netWt;
        else if (karat === 22) gold22kWt += netWt;
        else if (karat === 18) gold18kWt += netWt;
        else gold14kWt += netWt;
      } else if (mat === 'silver') {
        silverWt += netWt;
      }

      if (p.diamond?.hasDiamond && p.diamond.carat) {
        diamondCarats += (Number(p.diamond.carat) || 0) * units;
      }
    });

    // Fetch live metal rates for real-time inventory valuation
    let goldRate = 15600;
    let silverRate = 235;
    try {
      const prices = await getCurrentMetalPrices();
      if (prices?.gold?.price) goldRate = Number(prices.gold.price);
      if (prices?.silver?.price) silverRate = Number(prices.silver.price);
    } catch (e) {
      // Fallback
    }

    const goldValuation = (
      (gold24kWt * goldRate) +
      (gold22kWt * goldRate * (22 / 24)) +
      (gold18kWt * goldRate * (18 / 24)) +
      (gold14kWt * goldRate * (14 / 24))
    );

    const silverValuation = silverWt * silverRate;
    const estimatedDiamondValuation = diamondCarats * 95000; // Average certified rate per carat
    const totalValuation = Math.round(goldValuation + silverValuation + estimatedDiamondValuation);

    res.json({
      vault: {
        gold24kWt: Math.round(gold24kWt * 100) / 100,
        gold22kWt: Math.round(gold22kWt * 100) / 100,
        gold18kWt: Math.round(gold18kWt * 100) / 100,
        gold14kWt: Math.round(gold14kWt * 100) / 100,
        totalGoldWt: Math.round((gold24kWt + gold22kWt + gold18kWt + gold14kWt) * 100) / 100,
        silverWt: Math.round(silverWt * 100) / 100,
        diamondCarats: Math.round(diamondCarats * 100) / 100,
        totalPieces
      },
      valuation: {
        goldValuation: Math.round(goldValuation),
        silverValuation: Math.round(silverValuation),
        diamondValuation: Math.round(estimatedDiamondValuation),
        totalValuation,
        ratesUsed: { goldRate, silverRate }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 3. PATCH /:id/adjust - Manual stock quantity or location adjustment
// ============================================================
router.patch('/:id/adjust', managerOrAdminAuth, async (req, res) => {
  try {
    const { delta, action = 'manual_adjustment', notes = '', location, lowStockThreshold, huid } = req.body;
    const operator = req.user?.name || 'Store Manager';

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const prevQty = product.stock || 0;
    let qtyChange = parseInt(delta, 10);
    if (isNaN(qtyChange)) qtyChange = 0;

    const newQty = Math.max(0, prevQty + qtyChange);
    product.stock = newQty;

    if (location) product.location = location;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (huid !== undefined) product.huid = String(huid).trim().toUpperCase();

    await product.save();

    let logEntry = null;
    if (qtyChange !== 0) {
      logEntry = await StockLog.create({
        productId: product._id,
        sku: product.sku || '',
        productName: product.name,
        action,
        quantityDelta: qtyChange,
        previousQuantity: prevQty,
        newQuantity: newQty,
        weightDelta: (product.netWeight || product.weight || 0) * qtyChange,
        operator,
        notes: notes || `Manual stock adjustment of ${qtyChange > 0 ? '+' + qtyChange : qtyChange} pcs`,
        createdAt: new Date()
      });
    }

    res.json({
      success: true,
      product,
      log: logEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 4. GET /logs - Audit trail of all stock movements
// ============================================================
router.get('/logs', staffAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const { productId, action } = req.query;

    const query = {};
    if (productId) query.productId = productId;
    if (action && action !== 'all') query.action = action;

    const total = await StockLog.countDocuments(query);
    const logs = await StockLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
