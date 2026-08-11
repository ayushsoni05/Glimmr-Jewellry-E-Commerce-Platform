const express = require('express');
const nodemailer = require('nodemailer');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

// Helper to create Nodemailer transport with Brevo SMTP / environment config
function createMailTransport() {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
}

const mailTransport = createMailTransport();

// POST /api/newsletter/subscribe - Subscribe email to newsletter & dispatch 10% voucher code
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // Check if subscriber already exists
    let subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (subscriber) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        voucherCode: subscriber.voucherCode,
        message: `You are already subscribed to Glimmr Privé! Your 10% welcome voucher code is ${subscriber.voucherCode}.`
      });
    }

    // Generate unique 10% welcome voucher code (e.g. WELCOME10-4892)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = `WELCOME10-${randomSuffix}`;

    // Save subscriber to MongoDB
    subscriber = new Subscriber({
      email: cleanEmail,
      voucherCode,
      status: 'active',
      subscribedAt: new Date()
    });

    await subscriber.save();

    // Dispatch automated welcome email via Nodemailer / Brevo SMTP
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'glimmr05@gmail.com';
    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF9F7; border: 1px solid #E5E2D9; color: #222222;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #E5E2D9;">
          <h1 style="font-size: 26px; letter-spacing: 0.25em; text-transform: uppercase; color: #111111; margin: 0;">GLIMMR ATELIER</h1>
          <p style="font-size: 11px; letter-spacing: 0.15em; color: #B59A6C; text-transform: uppercase; margin-top: 5px;">ATELIER PRIVÉ VIP CLUB</p>
        </div>
        
        <div style="padding: 30px 0; text-align: center;">
          <h2 style="font-size: 20px; font-weight: normal; text-transform: uppercase; letter-spacing: 0.1em; color: #222222; margin-bottom: 15px;">WELCOME TO GLIMMR PRIVÉ</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 25px;">
            Thank you for joining the Glimmr Atelier Social Club. As a Privé patron, you enjoy priority access to private Kundan pre-launches, hourly metal rate alerts, and exclusive rewards.
          </p>
          
          <div style="background-color: #111111; color: #FAF9F7; padding: 20px; border: 1px solid #B59A6C; max-width: 320px; margin: 0 auto;">
            <span style="font-family: monospace; font-size: 10px; color: #B59A6C; text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 5px;">10% WELCOME VOUCHER CODE</span>
            <span style="font-family: monospace; font-size: 22px; font-weight: bold; letter-spacing: 0.15em; color: #FFFFFF;">${voucherCode}</span>
          </div>
          
          <p style="font-size: 12px; color: #888888; margin-top: 20px;">
            Apply this voucher code at checkout to claim 10% off your next fine jewelry acquisition.
          </p>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #E5E2D9; pt: 20px; font-size: 11px; color: #999999;">
          <p>© ${new Date().getFullYear()} Glimmr Atelier. 100% BIS Hallmarked Fine Jewelry.</p>
        </div>
      </div>
    `;

    try {
      await mailTransport.sendMail({
        from: `Glimmr Atelier <${fromEmail}>`,
        to: cleanEmail,
        subject: `Welcome to Glimmr Privé — Your 10% Voucher Code: ${voucherCode}`,
        html: emailHtml
      });
      console.log(`[NEWSLETTER] Welcome email sent to ${cleanEmail}`);
    } catch (mailErr) {
      console.warn(`[NEWSLETTER] Mail send error for ${cleanEmail}:`, mailErr?.message || mailErr);
    }

    res.json({
      success: true,
      alreadySubscribed: false,
      voucherCode,
      message: `Welcome to Glimmr Privé! Your 10% welcome voucher code is ${voucherCode}.`
    });
  } catch (error) {
    console.error('[NEWSLETTER] Subscription error:', error);
    res.status(500).json({ error: 'Server error processing newsletter subscription.' });
  }
});

// GET /api/newsletter/subscribers - Admin route to list all newsletter subscribers
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;
