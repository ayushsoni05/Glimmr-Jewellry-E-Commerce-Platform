const express = require('express');
const router = express.Router();
const OfflineBill = require('../models/OfflineBill');

// 1. POST / - Save a single bill
router.post('/', async (req, res) => {
  try {
    const bill = new OfflineBill(req.body);
    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. POST /sync - Batch sync
router.post('/sync', async (req, res) => {
  try {
    const { bills } = req.body;
    if (!bills || !Array.isArray(bills)) {
      return res.status(400).json({ error: 'Invalid bills array' });
    }
    
    if (bills.length === 0) {
      return res.json({ synced: 0 });
    }

    try {
      const result = await OfflineBill.insertMany(bills, { ordered: false });
      res.json({ synced: result.length });
    } catch (insertError) {
      // If some inserted and some failed (e.g. duplicate key)
      if (insertError.code === 11000 && insertError.insertedDocs) {
        res.json({ synced: insertError.insertedDocs.length });
      } else {
        throw insertError;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET / - List all bills
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { from, to, status } = req.query;

    let query = {};
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (status) {
      query.status = status;
    }

    const total = await OfflineBill.countDocuments(query);
    const bills = await OfflineBill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      bills,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /stats/today - Today's sales stats
router.get('/stats/today', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const query = {
      createdAt: { $gte: startOfToday },
      status: 'completed'
    };

    const bills = await OfflineBill.find(query);

    let totalRevenue = 0;
    const paymentMethods = {};

    bills.forEach(bill => {
      totalRevenue += bill.totalPayable || 0;
      const pm = bill.paymentMethod || 'cash';
      paymentMethods[pm] = (paymentMethods[pm] || 0) + 1;
    });

    let topPaymentMethod = 'cash';
    let maxCount = 0;
    for (const [pm, count] of Object.entries(paymentMethods)) {
      if (count > maxCount) {
        maxCount = count;
        topPaymentMethod = pm;
      }
    }

    res.json({
      totalRevenue,
      billCount: bills.length,
      avgBillValue: bills.length > 0 ? totalRevenue / bills.length : 0,
      topPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /:billNumber - Get a specific bill by billNumber
router.get('/:billNumber', async (req, res) => {
  try {
    const bill = await OfflineBill.findOne({ billNumber: req.params.billNumber });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. PATCH /:id/cancel - Set status to 'cancelled' by MongoDB _id
router.patch('/:id/cancel', async (req, res) => {
  try {
    const bill = await OfflineBill.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
