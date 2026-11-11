const { verifyTurnstileToken } = require('../utils/cloudflareTurnstile');

/**
 * Cloudflare Turnstile Verification Middleware
 * 
 * Intercepts requests to high-risk auth and checkout endpoints and validates
 * that a human is completing the interaction rather than an automated botnet.
 */
const requireTurnstile = async (req, res, next) => {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Skip verification if Turnstile secret key is not set in development
  if (!secretKey) {
    return next();
  }

  const token = req.body?.turnstileToken ||
    req.body?.['cf-turnstile-response'] ||
    req.headers['cf-turnstile-token'];

  const remoteip = req.cf?.clientIp || req.headers['cf-connecting-ip'] || req.ip;

  const result = await verifyTurnstileToken(token, remoteip);

  if (!result.success) {
    return res.status(403).json({
      error: 'Security verification failed: Cloudflare Turnstile challenge was not completed successfully. Please refresh and try again.',
      details: result.codes || []
    });
  }

  next();
};

module.exports = requireTurnstile;
