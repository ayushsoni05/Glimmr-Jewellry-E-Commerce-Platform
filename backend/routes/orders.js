const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const axios = require('axios');
const { notifyOrderStatusChange } = require('../utils/orderNotification');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// Helper: fetch live per-gram rates for gold and silver
async function fetchPerGramRates(currency = 'INR') {
  const goldApiToken = process.env.GOLDAPI_TOKEN || 'goldapi-pdixz26mhm8766q-io';
  const OZ_TO_GRAM = 31.1034768;

  const tryEndpoint = async (metal) => {
    const base = `https://www.goldapi.io/api/${metal}/${currency.toUpperCase()}`;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;
    const urls = [base, `${base}/${dateStr}`];
    let lastErr;
    for (const u of urls) {
      try {
        const resp = await axios.get(u, {
          headers: { 'x-access-token': goldApiToken, 'Accept': 'application/json' },
          timeout: 5000, // Reduced to 5 seconds
        });
        const data = resp.data || {};
        const ounce = (data && !data.error) ? (data.price || data.close_price || data.open_price) : null;
        if (ounce) return Number(ounce) / OZ_TO_GRAM; // per gram
      } catch (e) {
        lastErr = e;
        console.warn(`[RATES] Failed to fetch ${metal} from ${u}:`, e.message);
      }
    }
    throw lastErr || new Error(`Failed fetching ${metal}`);
  };

  let goldPerGram = 0, silverPerGram = 0;
  
  // Fetch rates with timeout protection
  try { 
    goldPerGram = await Promise.race([
      tryEndpoint('XAU'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gold rate timeout')), 5000))
    ]);
  } catch (e) {
    console.warn('[RATES] Gold rate fetch failed, using fallback:', e.message);
  }
  
  try { 
    silverPerGram = await Promise.race([
      tryEndpoint('XAG'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Silver rate timeout')), 5000))
    ]);
  } catch (e) {
    console.warn('[RATES] Silver rate fetch failed, using fallback:', e.message);
  }

  // Use fallback rates if fetching failed
  if (!goldPerGram) goldPerGram = currency.toUpperCase() === 'GBP' ? 60 : 6500;
  if (!silverPerGram) silverPerGram = currency.toUpperCase() === 'GBP' ? 0.7 : 75;

  return { goldPerGram, silverPerGram };
}

// Helper: compute live unit price for a product based on current rates
function computeLivePrice(product, perGram) {
  if (!product) return 0;
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
  return Math.round(Number(product.price || 0));
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
    let perGramRates = { goldPerGram: 6500, silverPerGram: 75 }; // defaults
    const startTime = Date.now();
    try {
      // Reduce timeout to 3 seconds to ensure fast order processing
      perGramRates = await Promise.race([
        fetchPerGramRates('INR'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Rate fetch timeout - using fallback rates')), 3000)
        )
      ]);
      console.log('[ORDER] Live rates fetched in', Date.now() - startTime, 'ms - Gold: ₹' + perGramRates.goldPerGram + '/g, Silver: ₹' + perGramRates.silverPerGram + '/g');
    } catch (err) {
      console.warn('[ORDER] Failed to fetch live rates, using fallback:', err.message);
      // perGramRates already has fallback values
    }

    // Calculate subtotal using LIVE prices at checkout time
    let subtotal = 0;
    const itemsWithLivePrice = cart.items
      .map(item => {
        if (!item.product) {
          console.warn('[ORDER] Skipping cart item because product is missing');
          return null;
        }
        const livePrice = computeLivePrice(item.product, perGramRates);
        const itemSubtotal = livePrice * item.quantity;
        subtotal += itemSubtotal;
        console.log(`[ORDER] Item: ${item.product.name}, Static: ₹${item.product.price}, Live: ₹${livePrice}, Qty: ${item.quantity}, Subtotal: ₹${itemSubtotal}`);
        return {
          product: item.product._id,
          quantity: item.quantity,
          price: livePrice,
        };
      })
      .filter(Boolean);

    if (!itemsWithLivePrice.length) {
      return res.status(400).json({ error: 'No valid cart items to place order. Please refresh your cart.' });
    }
    
    // Calculate tax (3% on subtotal)
    const taxAmount = subtotal * 0.03;
    
    // Total amount including tax - this is what the user actually pays
    const totalAmount = subtotal + taxAmount;

    console.log('[ORDER] Subtotal: ₹' + subtotal + ', Tax: ₹' + taxAmount + ', Total: ₹' + totalAmount);

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

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        createdAt: order.createdAt,
        paymentIntentId: order.paymentIntentId
      }
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
