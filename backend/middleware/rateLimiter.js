const rateLimit = require('express-rate-limit');

// General limiter for auth endpoints to prevent abuse
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

// Limiter specifically for OTP request endpoints
const otpRequestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 OTP requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait before requesting another.' },
});

// Stricter limiter for OTP verification attempts
const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // limit each IP to 30 verification attempts per window (increased)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts. Please try again later.' },
});

// Rate limiter for POS billing endpoints (120 req/min for fast checkout counter)
const billingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Billing transaction rate limit reached. Please wait a moment.' },
});

// Rate limiter for Customer CRM queries to prevent bulk data scraping
const crmLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Customer directory query limit reached. Please try again shortly.' },
});

module.exports = {
  authLimiter,
  otpRequestLimiter,
  verifyLimiter,
  billingLimiter,
  crmLimiter,
};

