const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const GiftCard = require('../models/GiftCard');
const { sendEmail } = require('../utils/emailService');

// POST /create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, senderName, senderEmail, recipientName, recipientEmail, giftNote, deliveryDate } = req.body;

    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({ success: false, error: 'recipientEmail, recipientName, senderName are required' });
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
      receipt: `gift_receipt_${Date.now()}`
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
      deliveryDate
    });

    await giftCard.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      giftCardId: giftCard._id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

// POST /verify-payment
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
    await giftCard.save();

    // Try sending email
    try {
      const emailContent = `
        Hi ${giftCard.recipientName},
        
        You have received a gift card from ${giftCard.senderName}!
        Amount: ₹${giftCard.amount.toLocaleString('en-IN')} ${giftCard.currency}
        Redeem Code: ${giftCard.redeemCode}
        Note: ${giftCard.giftNote || 'Enjoy your gift!'}
      `;
      
      await sendEmail({
        to: giftCard.recipientEmail,
        subject: `You received a Glimmr Gift Card from ${giftCard.senderName}`,
        text: emailContent
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the payment verification if email fails
    }

    res.json({
      success: true,
      giftCard: {
        redeemCode: giftCard.redeemCode,
        amount: giftCard.amount,
        recipientEmail: giftCard.recipientEmail
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
