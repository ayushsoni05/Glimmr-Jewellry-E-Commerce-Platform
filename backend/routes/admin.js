const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DiamondPricing = require('../models/DiamondPricing');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { notifyOrderStatusChange } = require('../utils/orderNotification');
const { calculateProductPrice, getCurrentMetalPrices } = require('../utils/priceCalculator');

const router = express.Router();

// GET /api/admin/users - get all users with activity status (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password -otp -adminKey')
      .sort(sortObj)
      .lean();

    // Add activity status badge logic
    const usersWithStatus = users.map(user => {
      const now = new Date();
      const lastLoginTime = user.lastLogin ? new Date(user.lastLogin) : null;
      const timeSinceLastLogin = lastLoginTime ? (now - lastLoginTime) / 1000 / 60 : null; // minutes

      let activityStatus = 'inactive';
      if (lastLoginTime) {
        if (timeSinceLastLogin < 5) activityStatus = 'active'; // Active if logged in within 5 minutes
        else if (timeSinceLastLogin < 60) activityStatus = 'recently-active'; // Recently active within 1 hour
        else if (timeSinceLastLogin < 1440) activityStatus = 'active-today'; // Active today
        else if (timeSinceLastLogin < 10080) activityStatus = 'active-week'; // Active this week
      }

      return {
        ...user,
        activityStatus,
        timeSinceLastLogin,
        signupDate: user.createdAt,
        totalOrders: null, // Will be populated separately if needed
        lastLoginFormatted: lastLoginTime ? lastLoginTime.toISOString() : null
      };
    });

    res.json({ 
      users: usersWithStatus,
      total: usersWithStatus.length,
      summary: {
        active: usersWithStatus.filter(u => u.activityStatus === 'active').length,
        recentlyActive: usersWithStatus.filter(u => u.activityStatus === 'recently-active').length,
        activeToday: usersWithStatus.filter(u => u.activityStatus === 'active-today').length,
        inactive: usersWithStatus.filter(u => u.activityStatus === 'inactive').length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users/:id - get user details with activity history (admin only)
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -adminKey')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user order count
    const orderCount = await Order.countDocuments({ user: req.params.id });

    const enrichedUser = {
      ...user,
      orderCount,
      activityStatus: calculateActivityStatus(user.lastLogin),
      signupDate: user.createdAt,
      lastLoginFormatted: user.lastLogin ? new Date(user.lastLogin).toISOString() : null
    };

    res.json({ user: enrichedUser });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/users/:id - update user role and status (admin only)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (role) {
      // Prevent removing admin from last admin
      if (user.role === 'admin' && role === 'user') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ error: 'Cannot remove admin role from the last admin user' });
        }
      }
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id - delete user (admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users/:id/activity - get user activity details (admin only)
router.get('/users/:id/activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone createdAt lastLogin lastIp deviceInfo signupIp signupDeviceInfo loginCount')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      activity: {
        userId: user._id,
        userName: user.name,
        email: user.email,
        signupDate: user.createdAt,
        signupIp: user.signupIp || 'N/A',
        signupDevice: user.signupDeviceInfo || 'N/A',
        lastLogin: user.lastLogin || null,
        lastLoginIp: user.lastIp || 'N/A',
        lastLoginDevice: user.deviceInfo || 'N/A',
        totalLogins: user.loginCount || 0,
        daysSinceSignup: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate activity status
function calculateActivityStatus(lastLogin) {
  if (!lastLogin) return 'never-active';
  
  const now = new Date();
  const lastLoginTime = new Date(lastLogin);
  const timeSinceLastLogin = (now - lastLoginTime) / 1000 / 60; // minutes

  if (timeSinceLastLogin < 5) return 'active';
  if (timeSinceLastLogin < 60) return 'recently-active';
  if (timeSinceLastLogin < 1440) return 'active-today';
  if (timeSinceLastLogin < 10080) return 'active-week';
  return 'inactive';
}

// GET /api/admin/orders - get all orders (admin only)
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name price material karat weight description category images')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/orders/:id - update order status (admin only)
router.put('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await order.save();
    
    // Send status notification (this will also update notificationsSent and statusHistory)
    try {
      await notifyOrderStatusChange(order._id, status);
    } catch (notifyErr) {
      console.error('[ADMIN] notifyOrderStatusChange failed:', notifyErr.message || notifyErr);
    }

    // Fetch the updated order with populated fields for the response
    const updatedOrder = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price material karat weight description category images');

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('[ADMIN] Update order status error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/admin/recalc-silver - recalc silver product prices using current per-gram (admin only)
router.post('/recalc-silver', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
    const base = `http://localhost:${backendPort}/api/prices`;
    // Ensure cache has latest
    try { await axios.get(`${base}?currency=inr`, { timeout: 8000 }); } catch {}
    let perGram = 0;
    try {
      const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 });
      perGram = Number(latest.data?.silver?.price || 0);
    } catch {}
    if (!perGram || perGram <= 0) perGram = 75;

    const products = await Product.find({ material: { $regex: /^silver$/i } });
    let updated = 0;
    for (const p of products) {
      const weight = Number(p.weight) || 0;
      if (weight > 0) {
        const newPrice = Math.round(perGram * weight);
        if (newPrice !== p.price) {
          p.price = newPrice;
          await p.save();
          updated += 1;
        }
      }
    }
    return res.json({ ok: true, perGram, updated, total: products.length });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to recalc silver prices' });
  }
});

// ==================== DIAMOND PRICING ROUTES ====================

// GET /api/admin/diamond-pricing - Get diamond pricing configuration
router.get('/diamond-pricing', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await DiamondPricing.getSingleton();
    res.json({ config });
  } catch (error) {
    console.error('Error fetching diamond pricing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/diamond-pricing - Update diamond pricing configuration
router.put('/diamond-pricing', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { 
      baseRatePerCarat, 
      cutMultipliers, 
      colorMultipliers, 
      clarityMultipliers,
      makingChargePercent,
      gstPercent,
    } = req.body;

    let config = await DiamondPricing.getSingleton();
    
    if (baseRatePerCarat !== undefined) config.baseRatePerCarat = baseRatePerCarat;
    if (cutMultipliers) config.cutMultipliers = { ...config.cutMultipliers, ...cutMultipliers };
    if (colorMultipliers) config.colorMultipliers = { ...config.colorMultipliers, ...colorMultipliers };
    if (clarityMultipliers) config.clarityMultipliers = { ...config.clarityMultipliers, ...clarityMultipliers };
    if (makingChargePercent !== undefined) config.makingChargePercent = makingChargePercent;
    if (gstPercent !== undefined) config.gstPercent = gstPercent;
    
    config.lastUpdated = new Date();
    config.updatedBy = req.user.id;
    
    await config.save();

    res.json({ 
      message: 'Diamond pricing configuration updated successfully',
      config,
    });
  } catch (error) {
    console.error('Error updating diamond pricing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/recalc-diamond - Recalculate all diamond product prices
router.post('/recalc-diamond', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get current metal prices
    const metalPrices = await getCurrentMetalPrices();
    
    // Find all products with diamonds
    const products = await Product.find({ 
      'diamond.hasDiamond': true,
    });

    let updated = 0;
    const errors = [];

    for (const product of products) {
      try {
        const { price, breakdown } = await calculateProductPrice(
          product, 
          metalPrices.gold, 
          metalPrices.silver
        );
        
        if (price !== product.price) {
          product.price = price;
          await product.save();
          updated++;
        }
      } catch (error) {
        errors.push({
          productId: product._id,
          productName: product.name,
          error: error.message,
        });
      }
    }

    res.json({ 
      success: true,
      message: `Updated ${updated} diamond products`,
      total: products.length,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error recalculating diamond prices:', error);
    res.status(500).json({ error: 'Failed to recalculate diamond prices' });
  }
});

// POST /api/admin/calculate-diamond-price - Calculate price for specific diamond specs (preview)
router.post('/calculate-diamond-price', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { carat, cut, color, clarity } = req.body;
    
    if (!carat || !cut || !color || !clarity) {
      return res.status(400).json({ 
        error: 'Missing required fields: carat, cut, color, clarity' 
      });
    }

    const config = await DiamondPricing.getSingleton();
    const calculation = config.calculateDiamondPrice(carat, cut, color, clarity);
    
    res.json({
      carat,
      cut,
      color,
      clarity,
      baseRatePerCarat: config.baseRatePerCarat,
      ...calculation,
    });
  } catch (error) {
    console.error('Error calculating diamond price:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
