const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const axios = require('axios');
// Twilio removed: prefer Firebase client-side phone auth
const crypto = require('crypto');
const admin = require('firebase-admin');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { validateEmail } = require('../utils/emailValidator');
const { sendSignupNotificationToAdmin, sendSuspiciousActivityAlert, sendLoginNotificationToAdmin } = require('../utils/adminNotification');
const { sendOtpViaSms } = require('../utils/fast2sms');


const router = express.Router();
const { authLimiter, verifyLimiter } = require('../middleware/rateLimiter');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_INTERVAL_MS =
  parseInt(process.env.OTP_RESEND_INTERVAL_SECONDS || '60', 10) * 1000;
const OTP_LOCK_DURATION_MS =
  parseInt(process.env.OTP_LOCK_DURATION_MINUTES || '10', 10) * 60 * 1000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Firebase Admin initialization is handled in `server.js` so the app can
// initialize it from a service account path or key and expose it via
// `app.locals.firebaseAdmin` and `app.locals.firebaseEnabled`.
// We still `require('firebase-admin')` here to access the module if it
// was initialized by the server process, but we do not initialize it here.

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const mailTransport = createMailTransport();
// Server-side SMS provider removed in favor of Firebase client-side phone auth

// Lightweight audit log for SMS/Verify events (non-sensitive metadata)
const smsAuditLogFile = path.join(__dirname, '..', 'logs', 'sms_audit.log');
function auditSmsEvent(event) {
  try {
    fs.mkdirSync(path.dirname(smsAuditLogFile), { recursive: true });
    const out = Object.assign({ ts: new Date().toISOString() }, event);
    fs.appendFileSync(smsAuditLogFile, JSON.stringify(out) + '\n');
  } catch (err) {
    console.error('SMS audit log error:', err && err.message ? err.message : err);
  }
}

function createMailTransport() {
  // Brevo SMTP is recommended (works on Render, no activation issues)
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' ? true : false;
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD;

  if (user && pass) {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
      pool: false,
      maxConnections: 1,
      maxMessages: Infinity,
      rateDelta: 1000,
      rateLimit: 10,
      logger: true,
      debug: true,
      tls: {
        rejectUnauthorized: false
      }
    });

    // Log verification result at startup
    transport.verify((err) => {
      if (err) {
        console.error('[SMTP] ❌ Transport verify failed:', err && err.message ? err.message : err);
        console.error('[SMTP] Config:', { 
          host, 
          port, 
          secure, 
          user: user.substring(0, 5) + '***',
          isBrevo: host.includes('brevo') || host.includes('sendinblue'),
          isGmail: host.includes('gmail')
        });
        console.error('[SMTP] Troubleshooting: Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are correct');
      } else {
        console.log('[SMTP] ✅ Transport verified successfully:', { 
          host, 
          port, 
          secure, 
          user: user.substring(0, 5) + '***',
          isBrevo: host.includes('brevo') || host.includes('sendinblue'),
          isGmail: host.includes('gmail')
        });
      }
    });

    return transport;
  }

  console.warn(
    'SMTP credentials not configured. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS env vars for production.'
  );
  return nodemailer.createTransport({ jsonTransport: true });
}

// NOTE: Twilio has been removed. For phone verification, use Firebase client-side
// phone authentication. The backend will verify Firebase ID tokens via the
// `/auth/firebase-login` endpoint (requires `FIREBASE_SERVICE_ACCOUNT_KEY` or
// `FIREBASE_SERVICE_ACCOUNT_PATH` to be set). Server-side SMS sending is no
// longer supported in this project.

const CONTACT_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const normalizePhone = (phone) => {
  // Enforce Indian phone numbers only (E.164 +91XXXXXXXXXX)
  if (!phone) return '';
  const raw = String(phone).trim();
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';

  // Remove leading zeros
  const cleaned = digits.replace(/^0+/, '');

  // If user provided national 10-digit number, assume India and prefix 91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // If user provided country code +91 or 91 prefixed number (e.g. 9198... -> 12 digits), accept it
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // Already E.164 with leading '91' (rare case where + included and digits length 12)
  if (raw.startsWith('+') && cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // Otherwise, not an Indian phone number we accept
  return '';
};

const resolveIdentity = (body = {}) => {
  const email = normalizeEmail(body.email);
  if (email) {
    return { field: 'email', value: email, raw: email, channel: CONTACT_TYPES.EMAIL };
  }

  const rawPhone = body.phone !== undefined ? String(body.phone).trim() : '';
  const phone = normalizePhone(rawPhone);
  if (phone || rawPhone) {
    // Keep both normalized and raw to increase chances of matching legacy-stored numbers
    return { field: 'phone', value: phone, raw: rawPhone, channel: CONTACT_TYPES.PHONE };
  }

  return null;
};

async function findUserByIdentity(identity) {
  if (!identity) return null;

  if (identity.channel === CONTACT_TYPES.PHONE) {
    const candidates = new Set();
    
    // Add normalized value (+91XXXXXXXXXX)
    if (identity.value) candidates.add(identity.value);
    
    // Add raw input as-is
    if (identity.raw) candidates.add(identity.raw);
    
    // Extract and add various digit formats
    const allDigits = (identity.raw || identity.value || '').replace(/[^\d]/g, '');
    if (allDigits) {
      // 10-digit format (most common in DB)
      if (allDigits.length === 10) {
        candidates.add(allDigits); // Plain 10 digits
        candidates.add(`+91${allDigits}`); // E.164 format
      }
      // 12-digit with country code (91XXXXXXXXXX)
      else if (allDigits.length === 12 && allDigits.startsWith('91')) {
        const tenDigit = allDigits.substring(2);
        candidates.add(tenDigit); // 10 digits
        candidates.add(allDigits); // 12 digits
        candidates.add(`+${allDigits}`); // +91XXXXXXXXXX
      }
      // Also try the full digits as-is
      candidates.add(allDigits);
    }
    
    const list = Array.from(candidates).filter(Boolean);
    console.log('[AUTH] Searching for user with phone candidates:', list);
    
    if (list.length === 0) return null;
    
    const user = await User.findOne({ phone: { $in: list } });
    console.log('[AUTH] User found:', user ? `Yes (${user.email || user.phone})` : 'No');
    return user;
  }

  return User.findOne({ [identity.field]: identity.value });
}

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const buildOtpExpiry = () =>
  new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

// Curated gallery of high-resolution luxury fine jewelry images for dynamic OTP email header rotation
const DYNAMIC_ATELIER_GALLERY = [
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    title: 'ROYAL KUNDAN HERITAGE',
    tag: '24K GOLD'
  },
  {
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    title: 'VVS SOLITAIRE DIAMOND',
    tag: '18K GOLD'
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    title: 'TEMPLE BRIDAL NECKLACE',
    tag: '22K GOLD'
  },
  {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    title: 'ARTISANAL HASLI CUFF',
    tag: '925 SILVER'
  },
  {
    url: 'https://images.unsplash.com/photo-1611591475140-be38b738eaad?q=80&w=800&auto=format&fit=crop',
    title: 'EMERALD ROYAL DROP',
    tag: 'HIGH JEWELRY'
  },
  {
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    title: 'ROSE GOLD CHRONOGRAPH',
    tag: 'ATELIER WATCH'
  }
];

async function sendOtpEmail(email, otp, context) {
  console.log('[OTP_EMAIL] Attempting to send OTP email...');
  console.log('[OTP_EMAIL] To:', email);
  console.log('[OTP_EMAIL] Context:', context);
  console.log('[OTP_EMAIL] ***** OTP CODE:', otp, '*****'); // Log OTP for development/testing

  const subject = `Your ${context} OTP - Glimmr`;
  const senderEmail = process.env.BREVO_FROM_EMAIL || 'noreply@glimmr.com';
  const senderName = 'Glimmr Jewelry';

  // Dynamically select a distinct fine jewelry hero creation for every email
  const dynamicCover = DYNAMIC_ATELIER_GALLERY[Math.floor(Math.random() * DYNAMIC_ATELIER_GALLERY.length)];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Glimmr Security Passcode</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF9F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #FAF9F7; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E5E2D9; box-shadow: 0 25px 60px rgba(0,0,0,0.08); overflow: hidden;">
                
                <!-- Bulletproof Dynamic High-Jewelry Header Banner -->
                <tr>
                  <td align="center" style="background-color: #111111; padding: 0; text-align: center;">
                    <!-- Dynamically selected luxury jewelry image -->
                    <img src="${dynamicCover.url}" alt="${dynamicCover.title}" width="580" height="180" style="width: 100%; max-width: 580px; height: 180px; object-fit: cover; display: block; border: 0;" />
                    <div style="padding: 24px 20px; background-color: #111111; border-bottom: 3px solid #B59A6C; text-align: center;">
                      <span style="display: inline-block; background-color: #222222; border: 1px solid #B59A6C; color: #B59A6C; font-family: monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; padding: 5px 14px; margin-bottom: 8px;">
                        ${dynamicCover.title} &bull; ${dynamicCover.tag}
                      </span>
                      <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; color: #FAF9F7; letter-spacing: 0.35em; text-transform: uppercase;">
                        GLIMMR
                      </h1>
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 45px 35px; background-color: #FAF9F7; text-align: center;">
                    <span style="display: inline-block; font-size: 10px; font-weight: 700; color: #B59A6C; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 12px;">
                      PATRON SECURITY VERIFICATION
                    </span>
                    <h2 style="margin: 0 0 16px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #111111; line-height: 1.3;">
                      Your Atelier Verification Passcode
                    </h2>
                    <p style="margin: 0 0 28px 0; font-size: 13px; color: #666666; line-height: 1.6;">
                      Use the 6-digit security code below to complete your <strong style="color: #111111;">${context}</strong> access request.
                    </p>

                    <!-- Webflow Gold Framed Passcode Box -->
                    <div style="background-color: #FFFFFF; border: 1px solid #E5E2D9; border-top: 3px solid #B59A6C; border-bottom: 3px solid #B59A6C; padding: 30px 20px; margin: 0 0 28px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                      <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 800; color: #111111; letter-spacing: 16px; padding-left: 16px; text-align: center;">
                        ${otp}
                      </span>
                      <div style="margin-top: 20px;">
                        <span style="display: inline-block; background-color: #FAF9F7; border: 1px solid #E5E2D9; color: #B59A6C; font-family: monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; padding: 6px 16px; border-radius: 20px;">
                          ● VALID FOR ${OTP_EXPIRY_MINUTES} MINUTES
                        </span>
                      </div>
                    </div>

                    <!-- Trust & Guarantee Perks -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px; border-top: 1px solid #E5E2D9; border-bottom: 1px solid #E5E2D9; padding: 15px 0;">
                      <tr>
                        <td align="center" style="font-size: 10px; font-family: monospace; font-weight: 700; color: #888888; text-transform: uppercase; letter-spacing: 0.15em;">
                          100% BIS HALLMARKED &bull; 256-BIT SSL ENCRYPTED &bull; LIFETIME GUARANTEE
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 12px; color: #888888; line-height: 1.5;">
                      If you did not request this security code, no action is required. Your account remains completely secure.
                    </p>
                  </td>
                </tr>

                <!-- Obsidian Footer -->
                <tr>
                  <td align="center" style="background-color: #111111; padding: 30px 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 10px; color: #B59A6C; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 700;">
                      GLIMMR CONCIERGE &amp; ATELIER SERVICES
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #777777; letter-spacing: 0.1em; text-transform: uppercase;">
                      &copy; ${new Date().getFullYear()} GLIMMR JEWELRY. ALL RIGHTS RESERVED.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // Try Brevo API first (bypasses SMTP IP restrictions)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log('[OTP_EMAIL] Sending OTP via Brevo REST API...');
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          to: [{ email, name: 'User' }],
          sender: { email: senderEmail, name: senderName },
          subject,
          htmlContent: html,
          textContent: `Your OTP for ${context} is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, please ignore this message.`,
        },
        {
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('[OTP_EMAIL] ✅ Email sent via Brevo API successfully!');
      console.log('[OTP_EMAIL] Message ID:', response.data.messageId);
      return response.data;
    } catch (brevoError) {
      const errDetail = brevoError.response?.data?.message || brevoError.message;
      console.error('[OTP_EMAIL] ⚠️ Brevo API failed:', errDetail);
      console.log('[OTP_EMAIL] 🔄 Trying SMTP fallback...');
    }
  }

  // Try SMTP fallback
  if (mailTransport && mailTransport.sendMail) {
    const isRealTransport = mailTransport.options && mailTransport.options.host;
    
    if (isRealTransport) {
      try {
        console.log('[OTP_EMAIL] Sending OTP via SMTP (Brevo SMTP)...');
        console.log('[OTP_EMAIL] SMTP Host:', mailTransport.options.host);
        console.log('[OTP_EMAIL] SMTP Port:', mailTransport.options.port);
        
        const result = await mailTransport.sendMail({
          from: process.env.SMTP_USER || `${senderName} <${senderEmail}>`,
          to: email,
          subject,
          html,
          text: `Your OTP for ${context} is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, please ignore this message.`,
        });
        
        console.log('[OTP_EMAIL] ✅ Email sent via SMTP successfully!');
        console.log('[OTP_EMAIL] MessageID:', result.messageId);
        return result;
      } catch (smtpError) {
        console.error('[OTP_EMAIL] ❌ SMTP failed:', smtpError.message);
      }
    }
  }

  // Fallback: If external mail delivery is unconfigured or failed, log OTP to server console so developer & users can proceed cleanly
  console.log('[OTP_EMAIL] ℹ️ Mail transport unavailable or failed. Using fallback OTP mode.');
  console.log(`[OTP_EMAIL] 🔑 DEV OTP FOR ${email}: ${otp}`);
  return { devFallback: true, otp };
}

async function sendOtpSms(phone, otp, context) {
  // Use Fast2SMS to send OTP via SMS
  if (!phone) {
    throw new Error('Phone number is required');
  }

  try {
    console.log('[SMS] Sending OTP via Fast2SMS to:', phone);
    console.log('[SMS] ***** OTP CODE:', otp, '*****'); // Log OTP for development/testing
    const result = await sendOtpViaSms(phone, otp, context);
    console.log('[SMS] ✅ OTP sent successfully via Fast2SMS');
    return result;
  } catch (error) {
    console.error('[SMS] ❌ Failed to send OTP via Fast2SMS:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

async function issueOtp(user, context, channel = CONTACT_TYPES.EMAIL) {
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);

  console.log('[OTP] Generated OTP for user:', user.email || user.phone);
  console.log('[OTP] Context:', context);
  console.log('[OTP] Channel:', channel);

  // Validate user has the required contact method
  if (channel === CONTACT_TYPES.EMAIL && !user.email) {
    throw new Error('User does not have an email address. Please use phone OTP.');
  }
  if (channel === CONTACT_TYPES.PHONE && !user.phone) {
    throw new Error('User does not have a phone number. Please use email OTP.');
  }

  user.otp = hashedOtp;
  user.otpExpiry = buildOtpExpiry();
  user.otpAttempts = 0;
  user.otpLockedUntil = undefined;
  user.lastOtpSentAt = new Date();
  await user.save();

  if (channel === CONTACT_TYPES.PHONE) {
    // Send OTP via Fast2SMS
    try {
      await sendOtpSms(user.phone, otp, context);
      console.log('[OTP] SMS sent successfully to:', user.phone);
    } catch (smsError) {
      console.error('[OTP] Failed to send SMS, falling back to Dev OTP:', smsError.message);
      user.devOtpFallback = true;
      user.lastDevOtp = otp;
      console.log(`[OTP] 🔑 DEV OTP FOR ${user.phone}: ${otp}`);
    }
  } else if (channel === CONTACT_TYPES.EMAIL) {
    // Send OTP via email
    try {
      const emailRes = await sendOtpEmail(user.email, otp, context);
      console.log('[OTP] Email OTP processed for:', user.email);
      if (emailRes && emailRes.devFallback) {
        user.devOtpFallback = true;
        user.lastDevOtp = otp;
      }
    } catch (emailError) {
      console.error('[OTP] Failed to send email:', emailError.message);
      user.devOtpFallback = true;
      user.lastDevOtp = otp;
      console.log(`[OTP] 🔑 DEV OTP FOR ${user.email}: ${otp}`);
    }
  } else {
    // Shouldn't reach here; defensive check
    throw new Error('Unable to deliver OTP: unsupported channel.');
  }
}

router.post('/signup', authLimiter, async (req, res) => {
  try {
    console.log('[AUTH] signup attempt');
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone); // Normalize phone number

    // Email validation: format and disposable domain check
    const emailValidation = validateEmail(normalizedEmail);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: emailValidation.error,
        code: 'INVALID_EMAIL'
      });
    }

    if (!normalizedPhone) {
      return res.status(400).json({ 
        error: 'Invalid phone number',
        message: 'Please provide a valid 10-digit Indian mobile number'
      });
    }

    if (normalizedEmail === 'glimmr05@gmail.com') {
      console.warn('Signup attempt using reserved admin email');
    }

    // Check for existing user by email or phone (check multiple phone formats)
    const phoneDigits = normalizedPhone.replace(/\D/g, '');
    const phoneCandidates = [
      normalizedPhone,
      phoneDigits,
      phoneDigits.length === 12 ? phoneDigits.substring(2) : null
    ].filter(Boolean);

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: { $in: phoneCandidates } }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({ error: 'Email already registered. Please log in.' });
      }
      if (existingUser.phone) {
        return res.status(409).json({ error: 'Phone number already registered. Please log in.' });
      }
      return res.status(409).json({ error: 'User already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Extract IP and device info from request
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone, // Use normalized phone format
      password: hashedPassword,
      role: 'user',
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
      addresses: [],
      signupIp: clientIp,
      signupDeviceInfo: userAgent,
      isActive: true,
      loginCount: 0
    });

    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${normalizedEmail}`;
    const emailHtml = `
      <p>Hello ${user.name},</p>
      <p>Welcome to Glimmr! Please verify your email address to complete your registration.</p>
      <p><a href="${verificationLink}" style="padding: 10px 20px; background-color: #C5A572; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `;

    try {
      await mailTransport.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@glimmr.local',
        to: normalizedEmail,
        subject: 'Verify your Glimmr account',
        text: `Welcome to Glimmr! Please verify your email at ${verificationLink}`,
        html: emailHtml
      });
    } catch (mailErr) {
      console.error('[AUTH] Failed to send verification email:', mailErr.message);
    }

    // Send admin notification about new signup
    try {
      await sendSignupNotificationToAdmin(user, {
        ip: clientIp,
        userAgent: userAgent
      });
    } catch (notifyErr) {
      console.error('[AUTH] Failed to send admin notification:', notifyErr.message);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Account created successfully. Please verify your email.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Signup error:', error && error.message ? error.message : error);
    return res.status(500).json({ error: 'Unable to process signup request' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    if (!identity) {
      return res.status(400).json({ error: 'Phone number or email is required' });
    }
    // Both email and phone are accepted as identity fields. Phone verification
    // is expected to be performed client-side via Firebase when configured.
    const { password, adminKey, twoFACode } = req.body;
    const user = await findUserByIdentity(identity);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // If password provided, try password-login
    if (password) {
      if (!user.password) {
        return res.status(400).json({ error: 'Password login not available for this account' });
      }

      const match = await bcrypt.compare(String(password), user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if this is an admin trying to login
      if (user.role === 'admin') {
        // Admin login requires 2FA
        
        // If twoFACode is provided, verify it
        if (twoFACode) {
          console.log('[AUTH] Verifying 2FA code for admin...');
          
          if (!user.twoFACode || !user.twoFACodeExpiry) {
            return res.status(401).json({ error: 'No 2FA code was sent. Please request a new one.' });
          }
          
          if (new Date() > user.twoFACodeExpiry) {
            user.twoFACode = null;
            user.twoFACodeExpiry = null;
            await user.save();
            return res.status(401).json({ error: '2FA code has expired. Please request a new one.' });
          }
          
          if (String(twoFACode) !== String(user.twoFACode)) {
            return res.status(401).json({ error: 'Invalid 2FA code' });
          }
          
          // Clear 2FA code after successful verification
          user.twoFACode = null;
          user.twoFACodeExpiry = null;
        } else {
          // No 2FA code provided - send one to admin email
          console.log('[AUTH] Sending 2FA code to admin email...');
          
          // Generate random 16-digit code
          const twoFACode = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
          const expiry = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes
          
          user.twoFACode = twoFACode;
          user.twoFACodeExpiry = expiry;
          await user.save();
          
          // Send email with 2FA code
          try {
            const { sendEmail } = require('../utils/adminNotification');
            const htmlContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { padding: 20px; }
                    .code-box { background: #f0f0f0; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                    .code { font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #667eea; font-family: monospace; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2>🔐 Admin 2FA Code</h2>
                    </div>
                    <div class="content">
                      <p>Hello Admin,</p>
                      <p>Your 2FA verification code is:</p>
                      <div class="code-box">
                        <div class="code">${twoFACode}</div>
                      </div>
                      <p><strong>This code will expire in 10 minutes.</strong></p>
                      <p>If you did not request this code, please ignore this email.</p>
                    </div>
                    <div class="footer">
                      <p>Glimmr Admin Panel - Secure Login</p>
                    </div>
                  </div>
                </body>
              </html>
            `;
            
            // Use the sendEmail function from adminNotification
            const { Resend } = require('resend');
            const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
            
            if (resendClient) {
              await resendClient.emails.send({
                from: process.env.RESEND_FROM || 'Glimmr <onboarding@resend.dev>',
                to: user.email,
                subject: '🔐 Admin 2FA Verification Code',
                html: htmlContent
              });
              console.log('[AUTH] 2FA code sent to admin email');
            }
          } catch (emailErr) {
            console.error('[AUTH] Failed to send 2FA code:', emailErr.message);
            return res.status(500).json({ error: 'Failed to send 2FA code. Please try again.' });
          }
          
          return res.status(200).json({
            message: 'A 2FA code has been sent to your email. Please enter it to continue.',
            requiresTwoFA: true,
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
          });
        }
      }

      // Update login tracking
      const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      user.lastLogin = new Date();
      user.lastIp = clientIp;
      user.deviceInfo = userAgent;
      user.loginCount = (user.loginCount || 0) + 1;
      user.isActive = true;
      await user.save();

      // Send admin notification
      await sendLoginNotificationToAdmin(user, {
        ip: clientIp,
        userAgent: userAgent
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, phone: user.phone },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        }
      });
    }

    // Otherwise proceed with OTP flow (passwordless)
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const seconds = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({ error: `Too many attempts. Please wait ${seconds} seconds before requesting another OTP.` });
    }

    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_INTERVAL_MS) {
      const waitTime = Math.ceil((OTP_RESEND_INTERVAL_MS - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      res.setHeader('Retry-After', waitTime);
      return res.status(429).json({ error: `OTP already sent. Please wait ${waitTime} seconds before requesting again.` });
    }

    try {
      await issueOtp(user, 'login', identity.channel);
      return res.json({ message: 'An OTP has been sent to your phone. Enter it to continue.' });
    } catch (otpError) {
      console.error('[AUTH] Failed to send login OTP:', otpError.message);
      return res.status(500).json({ error: 'Unable to deliver OTP at the moment. Please confirm your number or try again later.' });
    }
  } catch (error) {
    console.error('Login OTP error:', error);
    return res.status(500).json({ error: 'Unable to process login request' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (!user.verificationToken || user.verificationToken !== token) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Verification token expired. Please signup again.' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return res.json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Unable to verify email' });
  }
});

router.post('/request-otp-login', async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    if (!identity) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    console.log('[REQUEST_OTP_LOGIN] Identity resolved:', {
      channel: identity.channel,
      field: identity.field,
      value: identity.value ? identity.value.substring(0, 3) + '***' : 'none'
    });

    const user = await findUserByIdentity(identity);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    console.log('[REQUEST_OTP_LOGIN] User found:', {
      id: user._id,
      email: user.email ? user.email.substring(0, 3) + '***' : 'none',
      phone: user.phone ? user.phone.substring(0, 3) + '***' : 'none',
      hasEmail: !!user.email,
      hasPhone: !!user.phone
    });

    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const seconds = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({ error: `Too many attempts. Please wait ${seconds} seconds.` });
    }

    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_INTERVAL_MS) {
      const waitTime = Math.ceil((OTP_RESEND_INTERVAL_MS - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      res.setHeader('Retry-After', waitTime);
      return res.status(429).json({ error: `OTP already sent. Please wait ${waitTime} seconds.` });
    }

    try {
      console.log('[REQUEST_OTP_LOGIN] Issuing OTP via channel:', identity.channel);
      await issueOtp(user, 'login', identity.channel);
      return res.json({ 
        message: `OTP sent to your ${identity.channel}. Enter it to login.`,
        channel: identity.channel
      });
    } catch (otpError) {
      console.error('[AUTH] Failed to send OTP:', otpError.message);
      console.error('[AUTH] OTP Error stack:', otpError.stack);
      // Return more specific error message
      const errorMsg = otpError.message || 'Unable to send OTP. Please try again.';
      return res.status(500).json({ error: errorMsg });
    }
  } catch (error) {
    console.error('OTP request error:', error);
    return res.status(500).json({ error: 'Unable to process OTP request' });
  }
});

router.post('/verify-otp-login', verifyLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    const { otp } = req.body;

    if (!identity || !otp) {
      return res.status(400).json({ error: 'Email/Phone and OTP are required' });
    }

    const user = await findUserByIdentity(identity);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[OTP_VERIFY] Verifying OTP for:', identity.field, identity.value);
    console.log('[OTP_VERIFY] OTP provided:', otp);
    console.log('[OTP_VERIFY] OTP stored in DB:', user.otp ? '(hashed, present)' : '(not present)');
    console.log('[OTP_VERIFY] OTP expiry:', user.otpExpiry);
    console.log('[OTP_VERIFY] OTP attempts:', user.otpAttempts);

    if (!user.otp || !user.otpExpiry) {
      console.warn('[OTP_VERIFY] No OTP found for user');
      return res.status(400).json({ error: 'No OTP request found. Please request a new OTP.' });
    }

    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const seconds = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 1000);
      console.warn('[OTP_VERIFY] Account locked. Wait time:', seconds);
      return res.status(429).json({ error: `Too many attempts. Wait ${seconds} seconds.` });
    }

    const isExpired = user.otpExpiry.getTime() < Date.now();
    const isMatch = await bcrypt.compare(otp, user.otp);

    console.log('[OTP_VERIFY] OTP expired:', isExpired);
    console.log('[OTP_VERIFY] OTP matches:', isMatch);

    if (isExpired || !isMatch) {
      user.otpAttempts += 1;
      console.warn('[OTP_VERIFY] OTP failed. Attempt:', user.otpAttempts);
      if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
        user.otpLockedUntil = new Date(Date.now() + OTP_LOCK_DURATION_MS);
        user.otpAttempts = 0;
        console.warn('[OTP_VERIFY] Account locked due to too many attempts');
      }
      await user.save();
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // OTP is valid - clear all OTP data
    console.log('[OTP_VERIFY] ✅ OTP verified successfully');
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    
    // Update login tracking
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    user.lastLogin = new Date();
    user.lastIp = clientIp;
    user.deviceInfo = userAgent;
    user.loginCount = (user.loginCount || 0) + 1;
    user.isActive = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('[OTP_VERIFY] Token generated for user:', user._id);

    return res.json({
      message: 'OTP verified. Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('[OTP_VERIFY] Error:', error);
    return res.status(500).json({ error: 'Unable to verify OTP' });
  }
});

router.post('/verify', verifyLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    const { otp } = req.body;

    if (!identity || !otp) {
      return res
        .status(400)
        .json({ error: 'Phone number and OTP are both required' });
    }

    const user = await findUserByIdentity(identity);
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found. Please sign up first.' });
    }

    if (!user.otp || !user.otpExpiry) {
      // If using client-side Firebase phone auth we may not have stored OTP locally.
      // Phone verification must be completed via Firebase SDK on the client and
      // then the client should POST the resulting ID token to `/auth/firebase-login`.
      if (identity.channel === CONTACT_TYPES.PHONE) {
        return res.status(400).json({ error: 'Phone verification is handled client-side via Firebase. Complete phone auth with Firebase SDK and POST the ID token to /auth/firebase-login.' });
      }

      return res.status(400).json({ error: 'No OTP request found. Please request a new OTP.' });
    }

    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const seconds = Math.ceil(
        (user.otpLockedUntil.getTime() - Date.now()) / 1000
      );
      return res.status(429).json({
        error: `Too many attempts. Please wait ${seconds} seconds before trying again.`,
      });
    }

    // Phone verification is expected to be done client-side with Firebase.
    if (identity.channel === CONTACT_TYPES.PHONE) {
      return res.status(400).json({ error: 'Phone verification is handled client-side via Firebase. Please POST the ID token to /auth/firebase-login.' });
    } else {
      const isExpired = user.otpExpiry.getTime() < Date.now();
      const isMatch = await bcrypt.compare(otp, user.otp);

      if (isExpired || !isMatch) {
        user.otpAttempts += 1;

        if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
          user.otpLockedUntil = new Date(Date.now() + OTP_LOCK_DURATION_MS);
          user.otpAttempts = 0;
        }

        await user.save();

        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    }

    // mark specific contact as verified
    if (identity.field === 'email') {
      user.emailVerified = true;
    }
    if (identity.field === 'phone') {
      user.phoneVerified = true;
    }

    // overall verified if either contact verified
    user.isVerified = Boolean(user.emailVerified || user.phoneVerified);

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Unable to verify OTP' });
  }
});

router.post('/resend', authLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    if (!identity) {
      return res.status(400).json({ error: 'Phone number or email is required' });
    }

    const user = await findUserByIdentity(identity);
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found. Please sign up first.' });
    }

    if (
      user.lastOtpSentAt &&
      Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_INTERVAL_MS
    ) {
      const waitTime = Math.ceil(
        (OTP_RESEND_INTERVAL_MS -
          (Date.now() - user.lastOtpSentAt.getTime())) /
          1000
      );
      res.setHeader('Retry-After', waitTime);
      return res.status(429).json({
        error: `OTP already sent. Please wait ${waitTime} seconds before requesting again.`,
      });
    }

    try {
      await issueOtp(user, 'verification', identity.channel);
      return res.json({
        message: 'We\'re sending a new OTP. Please check your messages.',
      });
    } catch (otpError) {
      console.error('[AUTH] Failed to resend OTP:', otpError.message);
      return res.status(500).json({ error: 'Unable to deliver OTP at the moment. Please confirm your number or try again later.' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Unable to resend OTP' });
  }
});

const { addToken, isBlacklisted } = require('../middleware/tokenBlacklist');

// Return current user from token
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = auth.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // check blacklist
    if (isBlacklisted(token)) return res.status(401).json({ error: 'Token revoked' });

    const user = await User.findById(payload.id).select('-otp -passwordHash -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user });
  } catch (err) {
    console.error('GET /auth/me error:', err);
    return res.status(500).json({ error: 'Unable to fetch user' });
  }
});

// Firebase login endpoint
router.post('/firebase-login', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token using the server-provided admin instance when available.
    let decodedToken;
    try {
      const firebaseAdminInstance = (req.app && req.app.locals && req.app.locals.firebaseAdmin) || admin;
      if (!firebaseAdminInstance || !firebaseAdminInstance.auth) {
        console.error('Firebase Admin not configured on server');
        return res.status(500).json({ error: 'Server does not have Firebase Admin configured' });
      }
      decodedToken = await firebaseAdminInstance.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification error:', error && error.message ? error.message : error);
      return res.status(401).json({ error: 'Invalid Firebase ID token' });
    }

    // Extract phone number from Firebase token
    const phone = decodedToken.phone_number;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number not found in Firebase token' });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if user exists
    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      // Create new user if not exists
      const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      user = new User({
        phone: normalizedPhone,
        contactMethod: CONTACT_TYPES.PHONE,
        phoneVerified: true,
        isVerified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
        lastIp: clientIp,
        deviceInfo: userAgent,
        loginCount: 1,
        isActive: true,
        signupIp: clientIp,
        signupDeviceInfo: userAgent
      });
      await user.save();
      console.log('[AUTH] New user created via Firebase:', normalizedPhone);
    } else {
      // Update existing user to mark phone as verified
      const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      user.phoneVerified = true;
      user.isVerified = Boolean(user.emailVerified || user.phoneVerified);
      user.lastLogin = new Date();
      user.lastIp = clientIp;
      user.deviceInfo = userAgent;
      user.loginCount = (user.loginCount || 0) + 1;
      user.isActive = true;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Logged in successfully via Firebase',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    return res.status(500).json({ error: 'Unable to process Firebase login' });
  }
});

// NOTE: config endpoint consolidated below. Server exposes Firebase Admin
// state via `app.locals.firebaseEnabled` and `app.locals.firebaseAdmin`.

// Admin login with key verification
router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const { email, password, twoFACode } = req.body;
    console.log('[ADMIN_LOGIN] Request received:', { 
      hasEmail: !!email, 
      hasPassword: !!password, 
      hasTwoFACode: !!twoFACode,
      emailLength: email ? email.length : 0,
      passwordLength: password ? password.length : 0
    });
    
    if (!email || !password) {
      console.error('[ADMIN_LOGIN] Missing required fields:', { email: !!email, password: !!password });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const pwMatch = await bcrypt.compare(String(password), user.password);
    if (!pwMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Admin 2FA verification
    if (twoFACode) {
      console.log('[ADMIN_LOGIN] Verifying 2FA code...');
      
      if (!user.twoFACode || !user.twoFACodeExpiry) {
        return res.status(401).json({ error: 'No 2FA code was sent. Please request a new one.' });
      }
      
      if (new Date() > user.twoFACodeExpiry) {
        user.twoFACode = null;
        user.twoFACodeExpiry = null;
        await user.save();
        return res.status(401).json({ error: '2FA code has expired. Please request a new one.' });
      }
      
      if (String(twoFACode) !== String(user.twoFACode)) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
      
      // Clear 2FA code after successful verification
      user.twoFACode = null;
      user.twoFACodeExpiry = null;
      await user.save();
      
      console.log('[ADMIN_LOGIN] 2FA verified successfully');
    } else {
      // No 2FA code provided - generate and send one
      console.log('[ADMIN_LOGIN] Sending 2FA code to admin email...');
      
      // Generate random 16-digit code
      const twoFACode = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes
      
      user.twoFACode = twoFACode;
      user.twoFACodeExpiry = expiry;
      await user.save();
      
      // Send email with 2FA code
      try {
        const { Resend } = require('resend');
        const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { background: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { padding: 20px; }
                .code-box { background: #f0f0f0; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #667eea; font-family: monospace; }
                .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🔐 Admin 2FA Code</h2>
                </div>
                <div class="content">
                  <p>Hello Admin,</p>
                  <p>Your 2FA verification code is:</p>
                  <div class="code-box">
                    <div class="code">${twoFACode}</div>
                  </div>
                  <p><strong>This code will expire in 10 minutes.</strong></p>
                  <p>If you did not request this code, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>Glimmr Admin Panel - Secure Login</p>
                </div>
              </div>
            </body>
          </html>
        `;
        
        if (resendClient) {
          await resendClient.emails.send({
            from: process.env.RESEND_FROM || 'Glimmr <onboarding@resend.dev>',
            to: user.email,
            subject: '🔐 Admin 2FA Verification Code',
            html: htmlContent
          });
          console.log('[ADMIN_LOGIN] 2FA code sent to admin email');
        } else {
          console.error('[ADMIN_LOGIN] Resend client not configured');
          return res.status(500).json({ error: 'Email service not configured' });
        }
      } catch (emailErr) {
        console.error('[ADMIN_LOGIN] Failed to send 2FA code:', emailErr.message);
        return res.status(500).json({ error: 'Failed to send 2FA code. Please try again.' });
      }
      
      return res.status(200).json({
        message: 'A 2FA code has been sent to your email. Please enter it to continue.',
        requiresTwoFA: true,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint - blacklist token
router.post('/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'Missing Authorization header' });
    }
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000;
      addToken(token, expMs);
      return res.json({ message: 'Logged out successfully' });
    } catch (err) {
      addToken(token, Date.now() + 60 * 60 * 1000);
      return res.json({ message: 'Logged out successfully' });
    }
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

// Logout all devices - invalidate token and log emergency session revocation
router.post('/logout-all-devices', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'Missing Authorization header' });
    }
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000;
      addToken(token, expMs);
      
      const { logAuditEvent } = require('../utils/auditLogger');
      logAuditEvent({
        action: 'LOGOUT_ALL_DEVICES',
        userId: payload.id || payload._id,
        ip: req.ip,
        severity: 'WARNING'
      });

      return res.json({ success: true, message: 'All active sessions terminated across devices.' });
    } catch (err) {
      addToken(token, Date.now() + 24 * 60 * 60 * 1000);
      return res.json({ success: true, message: 'All active sessions terminated.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Unable to revoke active sessions' });
  }
});

// GET logout for convenience (e.g., if user navigates to /api/auth/logout)
router.get('/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(200).json({ message: 'Logged out' }); // no token, just return ok
    }
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000;
      addToken(token, expMs);
      return res.json({ message: 'Logged out' });
    } catch (err) {
      addToken(token, Date.now() + 60 * 60 * 1000);
      return res.json({ message: 'Logged out' });
    }
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

// Simple config endpoint the frontend can poll to decide UI behavior
router.get('/config', async (req, res) => {
  try {
    const firebaseEnabled = Boolean(req.app && req.app.locals && req.app.locals.firebaseEnabled);
    // Email OTP available when SMTP is configured (mailTransport not jsonTransport)
    const emailOtpEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    return res.json({ firebaseEnabled, emailOtpEnabled });
  } catch (err) {
    console.error('GET /auth/config error:', err);
    return res.status(500).json({ error: 'Unable to fetch auth config' });
  }
});

// Test endpoint to verify email configuration
router.get('/test-email-config', async (req, res) => {
  try {
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const resendKeyPreview = process.env.RESEND_API_KEY 
      ? process.env.RESEND_API_KEY.substring(0, 7) + '...' 
      : 'NOT SET';
    const hasResendClient = !!resendClient;
    const canCreateDynamicClient = hasResendKey;
    
    const hasSmtp = !!mailTransport;
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET'
    };
    
    const fromEmail = process.env.RESEND_FROM || process.env.MAIL_FROM || 'Glimmr <onboarding@resend.dev>';
    
    return res.json({
      resend: {
        apiKeySet: hasResendKey,
        apiKeyPreview: resendKeyPreview,
        globalClientInitialized: hasResendClient,
        canCreateDynamicClient
      },
      smtp: {
        configured: hasSmtp,
        config: smtpConfig
      },
      fromEmail,
      status: hasResendKey || hasSmtp ? 'Email service available' : 'No email service configured'
    });
  } catch (err) {
    console.error('Test email config error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

