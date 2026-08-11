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

module.exports = {
  authLimiter,
  otpRequestLimiter,
  verifyLimiter,
};
