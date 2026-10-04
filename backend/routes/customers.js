const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const OfflineBill = require('../models/OfflineBill');
const { staffAuth, managerOrAdminAuth } = require('../middleware/admin');
const { crmLimiter } = require('../middleware/rateLimiter');
const { cleanPhone, backfillCustomersFromBills } = require('../utils/inventoryAndCrmSync');

// ============================================================
// 1. GET / - List all customers (paginated, filtered, searchable)
// ============================================================
router.get('/', staffAuth, crmLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { search, tier, hasDues, sortBy = 'totalSpent', order = 'desc' } = req.query;

    const query = {};

    if (search && String(search).trim() !== '') {
      const s = String(search).trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { gstin: { $regex: s, $options: 'i' } },
        { panNumber: { $regex: s, $options: 'i' } },
        { city: { $regex: s, $options: 'i' } }
      ];
    }

    if (tier && tier !== 'all') {
      query.patronTier = tier;
    }

    if (hasDues === 'true') {
      query.totalOutstanding = { $gt: 0 };
    }

    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      customers,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 2. GET /stats/summary - CRM KPI metrics and upcoming milestones
// ============================================================
router.get('/stats/summary', staffAuth, async (req, res) => {
  try {
    const [aggregates, tierCounts, milestones] = await Promise.all([
      Customer.aggregate([
        {
          $group: {
            _id: null,
            totalPatrons: { $sum: 1 },
            totalLtv: { $sum: '$totalSpent' },
            totalOutstanding: { $sum: '$totalOutstanding' },
            totalGoldGrams: { $sum: '$totalGoldGramsPurchased' },
            totalSilverGrams: { $sum: '$totalSilverGramsPurchased' },
            totalDiamondCarats: { $sum: '$totalDiamondCaratsPurchased' }
          }
        }
      ]),
      Customer.aggregate([
        {
          $group: {
            _id: '$patronTier',
            count: { $sum: 1 }
          }
        }
      ]),
      Customer.find({
        $or: [
          { anniversaryDate: { $ne: null } },
          { birthdayDate: { $ne: null } }
        ]
      }).select('name phone anniversaryDate birthdayDate patronTier').lean()
    ]);

    const stats = aggregates[0] || {
      totalPatrons: 0,
      totalLtv: 0,
      totalOutstanding: 0,
      totalGoldGrams: 0,
      totalSilverGrams: 0,
      totalDiamondCarats: 0
    };

    const tiers = { Bronze: 0, Silver: 0, Gold: 0, 'Royal Patron': 0 };
    tierCounts.forEach(t => {
      if (t._id) tiers[t._id] = t.count;
    });

    // Compute upcoming milestone celebrations in the next 14 days
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const upcomingMilestones = milestones.filter(m => {
      let isUpcoming = false;
      [m.birthdayDate, m.anniversaryDate].forEach(d => {
        if (!d) return;
        const dateObj = new Date(d);
        const mMonth = dateObj.getMonth();
        const mDay = dateObj.getDate();
        // Check if within 14 days
        if (mMonth === currentMonth && mDay >= currentDay && mDay <= currentDay + 14) {
          isUpcoming = true;
        }
      });
      return isUpcoming;
    });

    res.json({
      stats,
      tiers,
      upcomingMilestonesCount: upcomingMilestones.length,
      upcomingMilestones: upcomingMilestones.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 3. GET /lookup/:phone - Fast autocomplete for POS Billing
// ============================================================
router.get('/lookup/:phone', staffAuth, async (req, res) => {
  try {
    const phone = cleanPhone(req.params.phone);
    if (!phone || phone.length < 5) {
      return res.status(400).json({ error: 'Valid phone prefix required' });
    }

    const customer = await Customer.findOne({
      phone: { $regex: `^${phone}` }
    }).lean();

    if (!customer) {
      return res.status(404).json({ message: 'Patron not found' });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 4. GET /:phone - Complete 360-degree Customer Dossier
// ============================================================
router.get('/:phone', staffAuth, async (req, res) => {
  try {
    const phone = cleanPhone(req.params.phone);
    if (!phone) {
      return res.status(400).json({ error: 'Valid phone required' });
    }

    let customer = await Customer.findOne({ phone }).lean();

    // Fetch full bill history for this customer phone
    const bills = await OfflineBill.find({
      'customer.phone': { $regex: phone }
    }).sort({ createdAt: -1 }).lean();

    if (!customer && bills.length > 0) {
      // If bills exist but CRM profile not yet created, create on the fly
      const { syncCustomerFromBill } = require('../utils/inventoryAndCrmSync');
      customer = await syncCustomerFromBill(bills[0]);
    }

    if (!customer && bills.length === 0) {
      return res.status(404).json({ error: 'Patron profile not found' });
    }

    res.json({
      customer,
      bills,
      totalBills: bills.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 5. PATCH /:id - Update customer profile details
// ============================================================
router.patch('/:id', managerOrAdminAuth, async (req, res) => {
  try {
    const {
      name, email, address, city, state, pincode,
      gstin, panNumber, anniversaryDate, birthdayDate, notes, preferredCategory
    } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (name) customer.name = name.trim();
    if (email !== undefined) customer.email = email.trim();
    if (address !== undefined) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (state !== undefined) customer.state = state;
    if (pincode !== undefined) customer.pincode = pincode;
    if (gstin !== undefined) customer.gstin = gstin.trim().toUpperCase();
    if (panNumber !== undefined) customer.panNumber = panNumber.trim().toUpperCase();
    if (anniversaryDate !== undefined) customer.anniversaryDate = anniversaryDate ? new Date(anniversaryDate) : null;
    if (birthdayDate !== undefined) customer.birthdayDate = birthdayDate ? new Date(birthdayDate) : null;
    if (notes !== undefined) customer.notes = notes;
    if (preferredCategory !== undefined) customer.preferredCategory = preferredCategory;

    await customer.save();
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 6. POST /backfill - Backfill Customer profiles from historical bills
// ============================================================
router.post('/backfill', managerOrAdminAuth, async (req, res) => {
  try {
    const result = await backfillCustomersFromBills();
    res.json({
      success: true,
      message: 'Historical patron records consolidated successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 7. GET /export/csv - Download customer register CSV
// ============================================================
router.get('/export/csv', managerOrAdminAuth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ totalSpent: -1 }).lean();

    const headers = [
      'Name',
      'Phone',
      'Patron Tier',
      'Lifetime Spend (INR)',
      'Total Paid (INR)',
      'Outstanding Balance (INR)',
      'Gold Grams Purchased',
      'Silver Grams Purchased',
      'Total Bills',
      'GSTIN',
      'PAN Number',
      'Address',
      'City',
      'Last Purchase Date'
    ];

    const rows = customers.map(c => [
      c.name || '',
      c.phone || '',
      c.patronTier || 'Bronze',
      c.totalSpent || 0,
      c.totalPaid || 0,
      c.totalOutstanding || 0,
      c.totalGoldGramsPurchased || 0,
      c.totalSilverGramsPurchased || 0,
      c.totalBillsCount || 0,
      c.gstin || '',
      c.panNumber || '',
      c.address || '',
      c.city || 'Mumbai',
      c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toISOString().split('T')[0] : ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`));

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Monika_Jewellers_Customer_Register.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
