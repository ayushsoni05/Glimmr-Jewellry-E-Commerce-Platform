const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/user/profile - get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// PUT /api/user/profile - update profile
router.put('/profile', authMiddleware, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, email, phone, gender, dob, removeProfilePhoto } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    
    // Handle profile photo removal
    if (removeProfilePhoto === 'true') {
      // Delete the old file if it exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto.replace('/api/uploads/', 'uploads/'));
        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (err) {
          console.error('Error deleting old profile photo:', err);
        }
      }
      user.profilePhoto = null;
    }
    
    // Handle profile photo upload
    if (req.file) {
      // Delete old photo if it exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto.replace('/api/uploads/', 'uploads/'));
        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (err) {
          console.error('Error deleting old profile photo:', err);
        }
      }
      user.profilePhoto = `/api/uploads/profiles/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// PUT /api/user/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// GET /api/user/addresses - list saved addresses (sorted default first)
router.get('/addresses', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses defaultShippingAddressId defaultBillingAddressId');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addresses = (user.addresses || []).slice().sort((a, b) => (b.isDefault === true) - (a.isDefault === true));

    res.json({
      addresses,
      defaultShippingAddressId: user.defaultShippingAddressId,
      defaultBillingAddressId: user.defaultBillingAddressId,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch addresses' });
  }
});

// POST /api/user/addresses - add address
router.post('/addresses', authMiddleware, async (req, res) => {
  try {
    console.log('[ADDRESS] POST request from user:', req.user._id);
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.error('[ADDRESS] User not found:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, phone, line1, line2, city, state, pincode, country, isDefault, isDefaultShipping, isDefaultBilling } = req.body;
    
    console.log('[ADDRESS] Address data received:', { name, phone, line1, city, state, pincode, country });
    
    // Validate required fields
    if (!name || !phone || !line1 || !city || !state || !pincode || !country) {
      console.error('[ADDRESS] Missing required fields');
      return res.status(400).json({ error: 'Name, phone, line1, city, state, pincode, and country are required' });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
      console.log('[ADDRESS] Initialized addresses array');
    }

    // Clear default flags if setting new default
    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
      console.log('[ADDRESS] Cleared previous default flags');
    }

    // Add new address
    const newAddress = { 
      name, 
      phone,
      line1, 
      line2: line2 || '', 
      city, 
      state, 
      pincode, 
      country, 
      isDefault: !!isDefault 
    };
    
    user.addresses.push(newAddress);
    console.log('[ADDRESS] New address pushed, total addresses:', user.addresses.length);
    
    await user.save();
    console.log('[ADDRESS] User saved');
    
    const savedAddr = user.addresses[user.addresses.length - 1];
    console.log('[ADDRESS] Saved address with _id:', savedAddr._id);

    // Set as default shipping/billing if specified
    if (isDefaultShipping) {
      user.defaultShippingAddressId = savedAddr._id;
      console.log('[ADDRESS] Set as default shipping');
    }
    if (isDefaultBilling) {
      user.defaultBillingAddressId = savedAddr._id;
      console.log('[ADDRESS] Set as default billing');
    }
    
    if (isDefaultShipping || isDefaultBilling) {
      await user.save();
      console.log('[ADDRESS] User saved with default flags');
    }
    
    console.log('[ADDRESS] Returning addresses:', user.addresses.length);
    res.json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    console.error('[ADDRESS] Error adding address:', error);
    res.status(500).json({ error: error.message || 'Failed to add address' });
  }
});

// PUT /api/user/addresses/:id - update address
router.put('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addressIndex === -1) return res.status(404).json({ error: 'Address not found' });
    
    const { name, phone, line1, line2, city, state, pincode, country, isDefault, isDefaultShipping, isDefaultBilling } = req.body;
    
    if (!name || !phone || !line1 || !city || !state || !pincode || !country) {
      return res.status(400).json({ error: 'Name, phone, line1, city, state, pincode, and country are required' });
    }
    
    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }
    
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      name,
      phone,
      line1,
      city,
      state,
      pincode,
      country,
      line2: line2 || '',
      isDefault: !!isDefault,
    };
    
    const addrId = user.addresses[addressIndex]._id;
    if (isDefaultShipping) user.defaultShippingAddressId = addrId;
    if (isDefaultBilling) user.defaultBillingAddressId = addrId;
    await user.save();
    
    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: error.message || 'Failed to update address' });
  }
});

// DELETE /api/user/addresses/:id - delete address
router.delete('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const removeId = req.params.id;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== removeId);
    
    if (user.defaultShippingAddressId && user.defaultShippingAddressId.toString() === removeId) {
      user.defaultShippingAddressId = undefined;
    }
    if (user.defaultBillingAddressId && user.defaultBillingAddressId.toString() === removeId) {
      user.defaultBillingAddressId = undefined;
    }
    await user.save();
    
    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: error.message || 'Failed to delete address' });
  }
});

// Orders routes
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images material karat weight description category')
      .sort({ createdAt: -1 });

    // Calculate subtotal and add 3% tax
    const corrected = orders.map((o) => {
      const obj = o.toObject();
      const subtotal = (obj.items || []).reduce((sum, it) => {
        const unit = Number(it.price) || 0;
        const qty = Number(it.quantity) || 0;
        return sum + unit * qty;
      }, 0);
      const tax = subtotal * 0.03;
      obj.subtotal = subtotal;
      obj.tax = tax;
      obj.totalAmount = subtotal + tax;
      return obj;
    });

    res.json({ orders: corrected });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Coupons & Rewards
router.get('/coupons', authMiddleware, async (req, res) => {
  try {
    // Placeholder: static available coupons
    res.json({
      coupons: [
        { code: 'WELCOME10', description: '10% off on first order', expiresAt: null },
        { code: 'FESTIVE20', description: '20% off on selected items', expiresAt: new Date(Date.now() + 30*24*3600*1000) }
      ]
    });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Placeholder: loyalty points and cashback history
    res.json({
      points: 850,
      history: [
        { date: new Date(Date.now() - 7*24*3600*1000), type: 'purchase', points: 50 },
        { date: new Date(Date.now() - 14*24*3600*1000), type: 'referral', points: 100 }
      ]
    });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product', 'name price images karat purity weight material description category');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const obj = order.toObject();
    const subtotal = (obj.items || []).reduce((sum, it) => {
      const unit = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return sum + unit * qty;
    }, 0);
    const tax = subtotal * 0.03;
    obj.subtotal = subtotal;
    obj.tax = tax;
    obj.totalAmount = subtotal + tax;

    res.json({ order: obj });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/orders/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const subtotal = (order.items || []).reduce((sum, it) => {
      const unit = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return sum + unit * qty;
    }, 0);
    const tax = subtotal * 0.03;
    res.json({
      invoice: {
        id: order._id,
        date: order.createdAt,
        subtotal: subtotal,
        tax: tax,
        totalAmount: subtotal + tax,
        status: order.status,
        items: order.items.map(i => ({ product: i.product, quantity: i.quantity, price: i.price }))
      }
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// PUT /api/user/orders/:id/cancel - cancel order
router.put('/orders/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Only allow cancellation for pending and confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel orders that are already shipped or delivered' });
    }
    
    order.status = 'cancelled';
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: 'Cancelled by user' });
    await order.save();
    
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Order cancel error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;
