const express = require('express');
const router = express.Router();
const CustomOrder = require('../models/CustomOrder');
const { sendAdminBespokeNotification, sendCustomerApprovalNotification } = require('../utils/emailService');

/**
 * @route   POST /api/custom-orders
 * @desc    Submit a new bespoke 3D ring custom creation request
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      preferredContactMethod,
      notes,
      metal,
      gemstone,
      cut,
      caratWeight,
      personalization,
      pricing,
      userId,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Please provide customer name, email, and phone number.' });
    }

    // Generate unique Tracking ID e.g. GLM-BESPOKE-8492
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const customOrderId = `GLM-BESPOKE-${randomCode}`;

    const newCustomOrder = new CustomOrder({
      customOrderId,
      user: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      preferredContactMethod: preferredContactMethod || 'phone',
      notes: notes || '',
      metal,
      gemstone,
      cut,
      caratWeight: caratWeight || 1.0,
      personalization: personalization || {},
      pricing: pricing || {},
      status: 'pending_approval',
    });

    const savedOrder = await newCustomOrder.save();

    // Trigger asynchronous Nodemailer email alert to Admin
    sendAdminBespokeNotification(savedOrder).catch(err => console.error('Admin email async error:', err));

    res.status(201).json({
      success: true,
      message: 'Your bespoke creation request has been submitted to our master goldsmiths.',
      order: savedOrder,
      customOrderId: savedOrder.customOrderId,
    });
  } catch (error) {
    console.error('Error creating custom order:', error);
    res.status(500).json({ success: false, message: 'Server error submitting bespoke request.' });
  }
});

/**
 * @route   GET /api/custom-orders
 * @desc    Get all bespoke orders (Admin portal / Customer tracking)
 * @access  Public / Admin
 */
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    if (email) {
      query.customerEmail = email;
    }

    const orders = await CustomOrder.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching custom orders.' });
  }
});

/**
 * @route   GET /api/custom-orders/:id
 * @desc    Get single custom order by customOrderId or MongoDB ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await CustomOrder.findOne({
      $or: [{ _id: req.params.id }, { customOrderId: req.params.id }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Bespoke order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching single custom order:', error);
    res.status(500).json({ success: false, message: 'Server error fetching custom order.' });
  }
});

/**
 * @route   PATCH /api/custom-orders/:id/status
 * @desc    Admin endpoint: Update bespoke order status, completion date, and admin message
 * @access  Admin
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, estimatedCompletionDate, adminNotes, notifyCustomer } = req.body;

    const order = await CustomOrder.findOne({
      $or: [{ _id: req.params.id }, { customOrderId: req.params.id }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Bespoke order not found.' });
    }

    if (status) order.status = status;
    if (estimatedCompletionDate) order.estimatedCompletionDate = estimatedCompletionDate;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    const updatedOrder = await order.save();

    // Trigger automated email update to customer if requested or approved
    if (notifyCustomer || status === 'approved') {
      sendCustomerApprovalNotification(
        updatedOrder,
        updatedOrder.estimatedCompletionDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        adminNotes
      ).catch(err => console.error('Customer email async error:', err));
    }

    res.json({
      success: true,
      message: `Order ${updatedOrder.customOrderId} status updated to ${updatedOrder.status}.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating custom order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating bespoke order.' });
  }
});

module.exports = router;
