const express = require('express');
const router = express.Router();
const OfflineBill = require('../models/OfflineBill');
const BillCounter = require('../models/BillCounter');

// ============================================================
// 1. POST / - Save a single bill
// ============================================================
router.post('/', async (req, res) => {
  try {
    const bill = new OfflineBill(req.body);
    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// 2. POST /sync - Batch sync offline bills
// ============================================================
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

// ============================================================
// 3. GET / - List all bills (paginated, filtered)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { from, to, status, billType, paymentMethod, paymentStatus, search } = req.query;

    let query = {};

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    // Status filter
    if (status) query.status = status;

    // Bill type filter (gst / non_gst)
    if (billType) query.billType = billType;

    // Payment method filter
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // Payment status filter (paid / partially_paid / pending / settled)
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Text search filter (bill number, customer name, phone)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { billNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex }
      ];
    }

    const total = await OfflineBill.countDocuments(query);
    const bills = await OfflineBill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ bills, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 4. GET /stats/today - Today's sales stats
// ============================================================
router.get('/stats/today', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const bills = await OfflineBill.find({
      createdAt: { $gte: startOfToday },
      status: 'completed'
    });

    let totalRevenue = 0;
    let totalGstCollected = 0;
    let totalOutstanding = 0;
    const paymentMethods = {};

    bills.forEach(bill => {
      totalRevenue += bill.totalPayable || 0;
      totalGstCollected += bill.totalGst || 0;
      totalOutstanding += bill.balanceRemaining || 0;
      const pm = bill.paymentMethod || 'cash';
      paymentMethods[pm] = (paymentMethods[pm] || 0) + 1;
    });

    let topPaymentMethod = 'cash';
    let maxCount = 0;
    for (const [pm, count] of Object.entries(paymentMethods)) {
      if (count > maxCount) { maxCount = count; topPaymentMethod = pm; }
    }

    res.json({
      totalRevenue,
      billCount: bills.length,
      avgBillValue: bills.length > 0 ? Math.round(totalRevenue / bills.length) : 0,
      topPaymentMethod,
      totalGstCollected,
      totalOutstanding
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 5. GET /stats/period - Revenue, bill count, GST by date range
// ============================================================
router.get('/stats/period', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Both from and to dates are required.' });
    }

    const match = {
      createdAt: { $gte: new Date(from), $lte: new Date(to + 'T23:59:59.999Z') },
      status: { $ne: 'cancelled' }
    };

    const result = await OfflineBill.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPayable' },
          totalAmountPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceRemaining' },
          billCount: { $sum: 1 },
          totalMetal: { $sum: '$totalMetal' },
          totalMaking: { $sum: '$totalMaking' },
          totalDiamond: { $sum: '$totalDiamond' },
          totalGst: { $sum: '$totalGst' },
          totalCgst: { $sum: '$cgst' },
          totalSgst: { $sum: '$sgst' },
          totalIgst: { $sum: '$igst' },
          totalDiscount: { $sum: '$discountAmount' },
          totalOldGold: { $sum: '$oldGoldDeduction' }
        }
      }
    ]);

    const stats = result[0] || {
      totalRevenue: 0, totalAmountPaid: 0, totalOutstanding: 0, billCount: 0,
      totalMetal: 0, totalMaking: 0, totalDiamond: 0,
      totalGst: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0,
      totalDiscount: 0, totalOldGold: 0
    };
    stats.avgBillValue = stats.billCount > 0 ? Math.round(stats.totalRevenue / stats.billCount) : 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 6. GET /stats/monthly - Month-by-month aggregation for FY charts
// ============================================================
router.get('/stats/monthly', async (req, res) => {
  try {
    const { fy } = req.query; // e.g. "2025-26"
    let startYear, endYear;
    if (fy && fy.includes('-')) {
      const parts = fy.split('-');
      startYear = parseInt(parts[0]);
      endYear = startYear + 1;
    } else {
      // Default: current FY
      const now = new Date();
      startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      endYear = startYear + 1;
    }

    const fyStart = new Date(startYear, 3, 1); // April 1
    const fyEnd = new Date(endYear, 2, 31, 23, 59, 59, 999); // March 31

    const result = await OfflineBill.aggregate([
      { $match: { createdAt: { $gte: fyStart, $lte: fyEnd }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPayable' },
          billCount: { $sum: 1 },
          gstCollected: { $sum: '$totalGst' },
          amountCollected: { $sum: '$amountPaid' },
          outstanding: { $sum: '$balanceRemaining' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Map months to FY order (Apr=0 ... Mar=11)
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const monthlyData = months.map((label, idx) => {
      const calMonth = ((idx + 4) % 12) || 12; // Apr=4, May=5, ..., Mar=3 -> 1-indexed
      const calYear = idx < 9 ? startYear : endYear;
      const match = result.find(r => r._id.year === calYear && r._id.month === calMonth);
      return {
        label,
        month: calMonth,
        year: calYear,
        revenue: match?.revenue || 0,
        billCount: match?.billCount || 0,
        gstCollected: match?.gstCollected || 0,
        amountCollected: match?.amountCollected || 0,
        outstanding: match?.outstanding || 0
      };
    });

    res.json({ fy: `${startYear}-${String(endYear).slice(2)}`, months: monthlyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 7. GET /stats/gst-summary - GST vs non-GST breakdown with rate-wise split
// ============================================================
router.get('/stats/gst-summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { status: { $ne: 'cancelled' } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const result = await OfflineBill.aggregate([
      { $match: match },
      {
        $group: {
          _id: { gstRate: '$gstRate', billType: '$billType' },
          billCount: { $sum: 1 },
          taxableValue: { $sum: '$subtotal' },
          cgst: { $sum: '$cgst' },
          sgst: { $sum: '$sgst' },
          igst: { $sum: '$igst' },
          totalGst: { $sum: '$totalGst' },
          totalInvoiceValue: { $sum: '$totalPayable' }
        }
      },
      { $sort: { '_id.gstRate': 1 } }
    ]);

    // Also compute B2B vs B2C counts
    const b2bResult = await OfflineBill.aggregate([
      { $match: { ...match, 'customer.gstin': { $ne: '' } } },
      { $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$totalPayable' }, gst: { $sum: '$totalGst' } } }
    ]);
    const b2cResult = await OfflineBill.aggregate([
      { $match: { ...match, $or: [{ 'customer.gstin': '' }, { 'customer.gstin': { $exists: false } }] } },
      { $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$totalPayable' }, gst: { $sum: '$totalGst' } } }
    ]);

    res.json({
      rateWise: result.map(r => ({
        gstRate: r._id.gstRate,
        billType: r._id.billType,
        billCount: r.billCount,
        taxableValue: r.taxableValue,
        cgst: r.cgst,
        sgst: r.sgst,
        igst: r.igst,
        totalGst: r.totalGst,
        totalInvoiceValue: r.totalInvoiceValue
      })),
      b2b: b2bResult[0] || { count: 0, value: 0, gst: 0 },
      b2c: b2cResult[0] || { count: 0, value: 0, gst: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 8. GET /stats/payment-modes - Payment method distribution
// ============================================================
router.get('/stats/payment-modes', async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { status: { $ne: 'cancelled' } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const result = await OfflineBill.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$paymentMethod',
          billCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPayable' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json(result.map(r => ({
      method: r._id || 'cash',
      billCount: r.billCount,
      totalRevenue: r.totalRevenue
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 9. GET /stats/metal-categories - Revenue by metal type and karat
// ============================================================
router.get('/stats/metal-categories', async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { status: { $ne: 'cancelled' } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const result = await OfflineBill.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: { material: '$items.material', karat: '$items.karat' },
          piecesSold: { $sum: '$items.quantity' },
          totalWeight: { $sum: { $multiply: ['$items.weight', '$items.quantity'] } },
          revenue: { $sum: { $multiply: ['$items.totalPrice', '$items.quantity'] } },
          metalCost: { $sum: { $multiply: ['$items.metalCost', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(result.map(r => ({
      material: r._id.material || 'gold',
      karat: r._id.karat || 22,
      piecesSold: r.piecesSold,
      totalWeight: Math.round(r.totalWeight * 100) / 100,
      revenue: r.revenue,
      metalCost: r.metalCost
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 10. GET /stats/top-customers - Top N customers by spend
// ============================================================
router.get('/stats/top-customers', async (req, res) => {
  try {
    const { from, to } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const match = { status: { $ne: 'cancelled' }, 'customer.phone': { $ne: '' } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const result = await OfflineBill.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$customer.phone',
          name: { $last: '$customer.name' },
          visits: { $sum: 1 },
          totalSpent: { $sum: '$totalPayable' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceRemaining' },
          lastVisit: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]);

    res.json(result.map(r => ({
      phone: r._id,
      name: r.name || 'Walk-in',
      visits: r.visits,
      totalSpent: r.totalSpent,
      totalPaid: r.totalPaid,
      totalOutstanding: r.totalOutstanding,
      lastVisit: r.lastVisit
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 11. GET /stats/outstanding - Total outstanding balance summary
// ============================================================
router.get('/stats/outstanding', async (req, res) => {
  try {
    const result = await OfflineBill.aggregate([
      { $match: { paymentStatus: { $in: ['partially_paid', 'pending'] }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$balanceRemaining' },
          billCount: { $sum: 1 },
          totalBillValue: { $sum: '$totalPayable' },
          totalCollected: { $sum: '$amountPaid' }
        }
      }
    ]);

    // Count overdue
    const now = new Date();
    const overdueResult = await OfflineBill.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['partially_paid', 'pending'] },
          status: { $ne: 'cancelled' },
          dueDate: { $lt: now, $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          overdueCount: { $sum: 1 },
          overdueAmount: { $sum: '$balanceRemaining' }
        }
      }
    ]);

    const stats = result[0] || { totalOutstanding: 0, billCount: 0, totalBillValue: 0, totalCollected: 0 };
    const overdue = overdueResult[0] || { overdueCount: 0, overdueAmount: 0 };

    res.json({ ...stats, ...overdue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 12. GET /pending - List all bills with pending balance
// ============================================================
router.get('/pending', async (req, res) => {
  try {
    const bills = await OfflineBill.find({
      paymentStatus: { $in: ['partially_paid', 'pending'] },
      status: { $ne: 'cancelled' }
    }).sort({ dueDate: 1, createdAt: -1 });

    res.json({ bills, count: bills.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 13. GET /next-number - Get next server-synced bill number
// ============================================================
router.get('/next-number', async (req, res) => {
  try {
    const billNumber = await BillCounter.getNext('BILL');
    res.json({ billNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 14. GET /:billNumber - Get a specific bill by billNumber
// ============================================================
router.get('/:billNumber', async (req, res) => {
  try {
    const bill = await OfflineBill.findOne({ billNumber: req.params.billNumber });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 15. PATCH /:id/cancel - Cancel a bill
// ============================================================
router.patch('/:id/cancel', async (req, res) => {
  try {
    const bill = await OfflineBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    bill.status = 'cancelled';
    bill.auditLog = bill.auditLog || [];
    bill.auditLog.push({
      action: 'cancelled',
      timestamp: new Date(),
      operator: req.body.operator || 'Owner',
      reason: req.body.reason || 'Cancelled by owner'
    });

    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 16. PATCH /:id/payment - Record a payment on a partially-paid bill
// ============================================================
router.patch('/:id/payment', async (req, res) => {
  try {
    const { amount, method, reference, note, operator } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be positive.' });
    }

    const bill = await OfflineBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });

    // Append payment entry
    bill.paymentEntries = bill.paymentEntries || [];
    bill.paymentEntries.push({
      amount,
      method: method || 'cash',
      reference: reference || '',
      date: new Date(),
      operator: operator || 'Owner',
      note: note || ''
    });

    // Update totals
    bill.amountPaid = (bill.amountPaid || 0) + amount;
    bill.balanceRemaining = Math.max(0, bill.totalPayable - bill.amountPaid);

    // Update status
    if (bill.balanceRemaining <= 0) {
      bill.paymentStatus = 'settled';
    } else {
      bill.paymentStatus = 'partially_paid';
    }

    // Audit log
    bill.auditLog = bill.auditLog || [];
    bill.auditLog.push({
      action: 'payment_recorded',
      timestamp: new Date(),
      operator: operator || 'Owner',
      reason: `Payment of Rs.${amount} via ${method || 'cash'}. Balance: Rs.${bill.balanceRemaining}`
    });

    await bill.save();
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 17. PATCH /:id/reminder - Track WhatsApp reminder sent
// ============================================================
router.patch('/:id/reminder', async (req, res) => {
  try {
    const bill = await OfflineBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    bill.lastReminderSent = new Date();
    bill.reminderCount = (bill.reminderCount || 0) + 1;

    bill.auditLog = bill.auditLog || [];
    bill.auditLog.push({
      action: 'reprinted',
      timestamp: new Date(),
      operator: req.body.operator || 'Owner',
      reason: `WhatsApp payment reminder #${bill.reminderCount} sent`
    });

    await bill.save();
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
