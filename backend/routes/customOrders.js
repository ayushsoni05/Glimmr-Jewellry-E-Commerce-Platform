const express = require('express');
const router = express.Router();
const multer = require('multer');
const CustomOrder = require('../models/CustomOrder');
const { sendAdminBespokeNotification, sendCustomerApprovalNotification } = require('../utils/emailService');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/custom-references/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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
      bandProfile,
      bandWidthMm,
      bandPattern,
      bandFinish,
      twoToneMetal,
      diamondGrading,
      settingStyle,
      sideStones,
      referenceImages,
      designMode,
      aiPrompt,
      diamondTier,
      diamondPlacement,
      threadedDesign,
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
      bandProfile,
      bandWidthMm,
      bandPattern,
      bandFinish,
      twoToneMetal,
      diamondGrading,
      settingStyle,
      sideStones,
      referenceImages,
      designMode,
      aiPrompt,
      diamondTier,
      diamondPlacement,
      threadedDesign,
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
 * @route   POST /api/custom-orders/upload-references
 * @desc    Upload reference images for a custom order
 * @access  Public
 */
router.post('/upload-references', upload.array('referenceImages', 3), (req, res) => {
  try {
    const urls = req.files.map(file => `/uploads/custom-references/${file.filename}`);
    res.json({ success: true, urls });
  } catch (error) {
    console.error('Error uploading reference images:', error);
    res.status(500).json({ success: false, message: 'Server error uploading images.' });
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

router.post('/analyze-photo', upload.single('referencePhoto'), async (req, res) => {
  try {
    // Simulated AI analysis - returns detected ring attributes
    // In production, this would call a vision AI model
    const analysis = {
      detectedMetal: { id: '22k-gold', name: '22K Hallmark Gold', confidence: 0.85 },
      detectedGemstone: { id: 'vvs-diamond', name: 'VVS1 Diamond', confidence: 0.78 },
      detectedCut: { id: 'round', name: 'Brilliant Round', confidence: 0.92 },
      detectedSetting: { id: 'prong', name: 'Classic Prong', confidence: 0.88 },
      detectedPattern: { id: 'plain', name: 'Plain Polished', confidence: 0.95 },
      detectedSideStones: { id: 'none', name: 'No Side Stones', confidence: 0.90 },
      detectedFinish: { id: 'high-polish', name: 'High Polish', confidence: 0.93 },
      estimatedCaratWeight: 1.5,
      estimatedBandWidth: 4,
      photoUrl: req.file ? `/api/uploads/custom-references/${req.file.filename}` : null,
    };
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Photo analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze reference photo.' });
  }
});

router.post('/parse-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a descriptive design prompt.' });
    }
    const lowerPrompt = prompt.toLowerCase();
    // Intelligent keyword extraction
    const parsedConfig = {
      metal: lowerPrompt.includes('platinum') ? '24k-gold' : lowerPrompt.includes('rose') ? '18k-rose' : lowerPrompt.includes('silver') ? '925-silver' : lowerPrompt.includes('22k') ? '22k-gold' : '24k-gold',
      gemstone: lowerPrompt.includes('emerald') ? 'emerald' : lowerPrompt.includes('sapphire') ? 'sapphire' : lowerPrompt.includes('ruby') ? 'ruby' : lowerPrompt.includes('plain') ? 'no-stone' : 'vvs-diamond',
      cut: lowerPrompt.includes('oval') ? 'oval' : lowerPrompt.includes('emerald cut') ? 'emerald-cut' : lowerPrompt.includes('princess') ? 'princess' : lowerPrompt.includes('cushion') ? 'cushion' : lowerPrompt.includes('pear') ? 'pear' : 'round',
      setting: lowerPrompt.includes('halo') ? 'halo' : lowerPrompt.includes('bezel') ? 'bezel' : lowerPrompt.includes('tension') ? 'tension' : lowerPrompt.includes('cathedral') ? 'cathedral' : lowerPrompt.includes('channel') ? 'channel' : lowerPrompt.includes('pave') ? 'pave' : 'prong',
      pattern: lowerPrompt.includes('thread') || lowerPrompt.includes('twist') || lowerPrompt.includes('rope') ? 'rope-twist' : lowerPrompt.includes('braid') ? 'braided' : lowerPrompt.includes('hammer') ? 'hammered' : lowerPrompt.includes('milgrain') ? 'milgrain' : lowerPrompt.includes('celtic') ? 'celtic-knot' : lowerPrompt.includes('filigree') ? 'filigree' : 'plain',
      diamondTier: lowerPrompt.includes('lab') ? 'lab_grown' : lowerPrompt.includes('commercial') || lowerPrompt.includes('budget') ? 'commercial_grade' : 'natural_certified',
      caratWeight: 1.0,
      bandWidthMm: 4,
      sideStones: lowerPrompt.includes('pave') || lowerPrompt.includes('pavé') ? 'pave-band' : lowerPrompt.includes('three stone') || lowerPrompt.includes('trilogy') ? 'three-stone' : 'none',
      finish: lowerPrompt.includes('matte') ? 'matte' : lowerPrompt.includes('satin') ? 'satin' : 'high-polish',
    };
    // Extract carat weight from prompt if mentioned
    const caratMatch = prompt.match(/(\d+\.?\d*)\s*(?:ct|carat)/i);
    if (caratMatch) parsedConfig.caratWeight = parseFloat(caratMatch[1]);
    // Extract band width if mentioned
    const widthMatch = prompt.match(/(\d+\.?\d*)\s*mm/i);
    if (widthMatch) parsedConfig.bandWidthMm = parseFloat(widthMatch[1]);

    res.json({ success: true, parsedConfig, rawPrompt: prompt });
  } catch (error) {
    console.error('Prompt parsing error:', error);
    res.status(500).json({ success: false, message: 'Failed to parse design prompt.' });
  }
});

module.exports = router;
