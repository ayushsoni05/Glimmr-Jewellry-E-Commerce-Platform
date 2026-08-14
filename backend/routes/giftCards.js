const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const GiftCard = require('../models/GiftCard');
const { sendLuxuryGiftCardEmail } = require('../utils/emailService');

// POST /dispatch-preview (Direct dispatch & email delivery for instant preview/testing)
router.post('/dispatch-preview', async (req, res) => {
  try {
    const { amount, senderName, senderEmail, recipientName, recipientEmail, giftNote, deliveryDate } = req.body;

    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({ success: false, error: 'Recipient email, recipient name, and sender name are required' });
    }

    if (!amount || amount < 1000 || amount > 100000) {
      return res.status(400).json({ success: false, error: 'Amount must be between ₹1,000 and ₹1,00,000' });
    }

    const mockOrderId = 'preview_order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const generatedRedeemCode = 'GLM-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const giftCard = new GiftCard({
      razorpayOrderId: mockOrderId,
      amount,
      currency: 'INR',
      senderName,
      senderEmail,
      recipientName,
      recipientEmail,
      giftNote,
      deliveryDate,
      status: 'paid',
      redeemCode: generatedRedeemCode,
      paidAt: new Date(),
      dispatchedAt: new Date(),
    });

    await giftCard.save();

    // Send luxury HTML email in background
    try {
      await sendLuxuryGiftCardEmail({
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        senderName: giftCard.senderName,
        amount: giftCard.amount,
        redeemCode: giftCard.redeemCode,
        giftNote: giftCard.giftNote,
        deliveryDate: giftCard.deliveryDate,
      });
    } catch (emailErr) {
      console.warn('[GIFT CARD] Email dispatch warning:', emailErr && emailErr.message ? emailErr.message : emailErr);
    }

    res.json({
      success: true,
      giftCard: {
        id: giftCard._id,
        redeemCode: giftCard.redeemCode,
        amount: giftCard.amount,
        recipientEmail: giftCard.recipientEmail,
        recipientName: giftCard.recipientName,
      },
    });
  } catch (error) {
    console.error('Error dispatching gift card preview:', error);
    res.status(500).json({ success: false, error: 'Failed to process gift card preview' });
  }
});

// POST /create-order (Razorpay order creation)
router.post('/create-order', async (req, res) => {
  try {
    const { amount, senderName, senderEmail, recipientName, recipientEmail, giftNote, deliveryDate } = req.body;

    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({ success: false, error: 'Recipient email, recipient name, and sender name are required' });
    }

    if (!amount || amount < 1000 || amount > 100000) {
      return res.status(400).json({ success: false, error: 'Amount must be between ₹1,000 and ₹1,00,000' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `gift_receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const giftCard = new GiftCard({
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      senderName,
      senderEmail,
      recipientName,
      recipientEmail,
      giftNote,
      deliveryDate,
    });

    await giftCard.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      giftCardId: giftCard._id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

// POST /verify-payment (Razorpay HMAC signature verification & email dispatch)
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
    }

    const giftCard = await GiftCard.findOne({ razorpayOrderId: razorpay_order_id });
    if (!giftCard) {
      return res.status(404).json({ success: false, error: 'Gift card order not found' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      giftCard.status = 'failed';
      await giftCard.save();
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    giftCard.status = 'paid';
    giftCard.razorpayPaymentId = razorpay_payment_id;
    giftCard.razorpaySignature = razorpay_signature;
    giftCard.paidAt = new Date();
    giftCard.dispatchedAt = new Date();
    await giftCard.save();

    // Dispatch luxury HTML email
    try {
      await sendLuxuryGiftCardEmail({
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        senderName: giftCard.senderName,
        amount: giftCard.amount,
        redeemCode: giftCard.redeemCode,
        giftNote: giftCard.giftNote,
        deliveryDate: giftCard.deliveryDate,
      });
    } catch (emailError) {
      console.error('Error sending luxury gift card email:', emailError);
    }

    res.json({
      success: true,
      giftCard: {
        redeemCode: giftCard.redeemCode,
        amount: giftCard.amount,
        recipientEmail: giftCard.recipientEmail,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
