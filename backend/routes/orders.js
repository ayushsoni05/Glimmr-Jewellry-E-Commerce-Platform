const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const axios = require('axios');
const { notifyOrderStatusChange } = require('../utils/orderNotification');
const { sendOrderNotificationToAdmin } = require('../utils/adminNotification');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// Helper: fetch live per-gram rates for gold and silver from metals.dev (IBJA)
async function fetchPerGramRates(currency = 'INR') {
  const apiKey = process.env.METALS_DEV_API_KEY || 'RJ1XWLR1MA9FGVR0I41A488R0I41A';
  const metalsDevUrl = `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=ibja&currency=${currency.toUpperCase()}&unit=g`;

  let goldPerGram = 0, silverPerGram = 0;
  try {
    const resp = await axios.get(metalsDevUrl, {
      headers: { 'Accept': 'application/json' },
      timeout: 5000,
    });
    const apiData = resp.data || {};
    if (apiData.status === 'success' && apiData.rates) {
      goldPerGram = Number(apiData.rates.ibja_gold) || 0;
      silverPerGram = Number(apiData.rates.ibja_silver) || 0;
    }
  } catch (err) {
    console.warn('[ORDER RATES] Failed to fetch from metals.dev, using fallback rates:', err.message);
  }

  // Exact IBJA fallback standards
  if (!goldPerGram || goldPerGram <= 0) goldPerGram = currency.toUpperCase() === 'GBP' ? 116.8 : 15064;
  if (!silverPerGram || silverPerGram <= 0) silverPerGram = currency.toUpperCase() === 'GBP' ? 1.8 : 231.3;

  return { goldPerGram, silverPerGram };
}

// Helper: compute complete live breakdown for a product based on current rates
function computeLivePrice(product, perGram) {
  if (!product) return { totalLivePrice: 0, subtotal: 0, rawMetalCost: 0, makingCharges: 0, gstTax: 0 };
  const weight = Number(product.metalWeight || product.weight || 5.0);
  const material = String(product.material || 'gold').toLowerCase();
  
  let baseRate = material.includes('silver') ? perGram.silverPerGram : perGram.goldPerGram;
  let karatNum = Number(product.karat) || (material.includes('silver') ? 925 : 22);
  let purityMultiplier = karatNum === 24 ? 1.0 : karatNum === 22 ? 22 / 24 : karatNum === 18 ? 18 / 24 : karatNum === 14 ? 14 / 24 : (karatNum / 24);
  if (material.includes('silver')) {
    purityMultiplier = karatNum === 999 ? 1.0 : 0.925;
  }

  const rawMetalCost = Math.round(weight * baseRate * purityMultiplier);
  const makingChargeRate = Number(product.makingChargePerGram) || 450;
  const makingCharges = Math.round(weight * makingChargeRate);

  let gemstoneCost = 0;
  const hasDiamond = Boolean(
    product.diamond?.hasDiamond || 
    product.diamondCarat || 
    product.diamondWeight || 
    String(product.category || '').toLowerCase().includes('diamond') ||
    String(product.material || '').toLowerCase().includes('diamond') ||
    String(product.name || '').toLowerCase().includes('diamond')
  );

  if (hasDiamond) {
    const carat = Number(product.diamond?.carat) || Number(product.diamondCarat) || Number(product.diamondWeight) || 0.50;
    const baseCaratRate = 65000;
    gemstoneCost = Math.round(carat * baseCaratRate * 1.5);
  }

  const subtotal = rawMetalCost + makingCharges + gemstoneCost;
  const gstTax = Math.round(subtotal * 0.03);
  const totalLivePrice = subtotal + gstTax;

  return {
    rawMetalCost,
    makingCharges,
    gemstoneCost,
    subtotal,
    gstTax,
    totalLivePrice
  };
}

// POST /api/orders - create order from cart
router.post('/', async (req, res) => {
  const { userId, guestId, paymentMethod, shippingAddress } = req.body;
  try {
    console.log('[ORDER] POST request received');
    console.log('[ORDER] userId:', userId);
    console.log('[ORDER] guestId:', guestId);
    console.log('[ORDER] paymentMethod:', paymentMethod);
    console.log('[ORDER] shippingAddress:', shippingAddress);

    // Validate required fields
    if (!userId && !guestId) {
      return res.status(400).json({ error: 'userId or guestId is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'paymentMethod is required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'shippingAddress is required' });
    }

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ error: 'Complete shipping address is required (name, phone, line1, city, pincode)' });
    }
    
    const activeId = userId || guestId;
    const cart = await Cart.findOne({ user: userId, guestId }).populate('items.product');
    
    console.log('[ORDER] Cart found:', cart ? 'yes' : 'no');
    if (!cart) {
      return res.status(400).json({ error: 'Cart not found. Please add items to cart first.' });
    }

    console.log('[ORDER] Cart items count:', cart.items.length);
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Fetch live gold/silver rates at checkout time with timeout protection
    let perGramRates = { goldPerGram: 15064, silverPerGram: 231.3 }; // defaults
    const startTime = Date.now();
    try {
      perGramRates = await Promise.race([
        fetchPerGramRates('INR'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Rate fetch timeout - using fallback rates')), 3000)
        )
      ]);
      console.log('[ORDER] Live rates fetched in', Date.now() - startTime, 'ms - Gold: ₹' + perGramRates.goldPerGram + '/g, Silver: ₹' + perGramRates.silverPerGram + '/g');
    } catch (err) {
      console.warn('[ORDER] Failed to fetch live rates, using fallback:', err.message);
    }

    // Calculate subtotal and tax using LIVE prices at checkout time
    let subtotal = 0;
    let totalTax = 0;
    const itemsWithLivePrice = cart.items
      .map(item => {
        if (!item.product) {
          console.warn('[ORDER] Skipping cart item because product is missing');
          return null;
        }
        const calc = computeLivePrice(item.product, perGramRates);
        const itemSubtotal = calc.subtotal * item.quantity;
        const itemGst = calc.gstTax * item.quantity;
        subtotal += itemSubtotal;
        totalTax += itemGst;
        console.log(`[ORDER] Item: ${item.product.name}, Unit: ₹${calc.totalLivePrice}, Qty: ${item.quantity}, Subtotal: ₹${itemSubtotal}`);
        return {
          product: item.product._id,
          quantity: item.quantity,
          price: calc.totalLivePrice,
        };
      })
      .filter(Boolean);

    if (!itemsWithLivePrice.length) {
      return res.status(400).json({ error: 'No valid cart items to place order. Please refresh your cart.' });
    }
    
    // Total amount including tax - matches frontend live pricing
    const totalAmount = subtotal + totalTax;

    console.log('[ORDER] Subtotal: ₹' + subtotal + ', Tax: ₹' + totalTax + ', Total: ₹' + totalAmount);

    // Create order with LIVE prices
    const order = new Order({
      user: userId,
      items: itemsWithLivePrice,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    });

    if (paymentMethod === 'card' && process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.items.map(item => ({
          price_data: {
            currency: 'inr',
            product_data: { name: item.product.name },
            unit_amount: Math.round(item.product.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      });
      order.paymentIntentId = session.id;
    }

    await order.save();

    // Clear cart immediately
    cart.items = [];
    await cart.save();

    // Send notifications asynchronously (fire and forget - don't block response)
    setImmediate(async () => {
      try {
        // Send order status notification to customer (supports guest via shipping email)
        await notifyOrderStatusChange(order._id, 'confirmed').catch(err => 
          console.error('Failed to send order status notification:', err.message)
        );

        let user = null;
        if (userId) {
          user = await User.findById(userId);
        }
        
        // Send admin notification about new order (for ALL orders - guest or logged-in)
        console.log('[ORDER] Preparing to send admin notification...');
        const populatedOrder = await Order.findById(order._id).populate('items.product');
        
        // For guest orders, create a temporary user object with shipping address details
        const notificationUser = user || {
          name: shippingAddress?.name || 'Guest Customer',
          email: shippingAddress?.email || 'guest@order.com',
          phone: shippingAddress?.phone || 'N/A'
        };
        
        const adminNotifResult = await sendOrderNotificationToAdmin(populatedOrder, notificationUser);
        console.log('[ORDER] Admin notification result:', adminNotifResult ? 'SUCCESS' : 'FAILED');
        
      } catch (notifError) {
        console.error('[ORDER] Notification error (non-critical):', notifError);
      }
    });

    // Return fully populated order
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder || order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:userId - order history (protected: owner or admin only)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    // Enforce ownership check: logged in user must match parameter ID or be admin
    if (req.user._id.toString() !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only view your own order history.' });
    }

    const orders = await Order.find({ user: targetUserId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:orderId/status - update order status (admin only)
router.put('/:orderId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery, note } = req.body;
    
    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(estimatedDelivery && { estimatedDelivery })
      },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Trigger notification
    await notifyOrderStatusChange(order._id, status);

    res.json({
      message: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/detail/:orderId - get single order (protected: owner or admin only)
router.get('/detail/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Enforce ownership check: logged in user must match order owner or be admin
    if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only inspect your own order details.' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
