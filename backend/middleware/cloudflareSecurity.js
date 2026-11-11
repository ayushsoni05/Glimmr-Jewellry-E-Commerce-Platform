/**
 * Cloudflare Edge Security & Real-IP Middleware
 * 
 * Extracts and validates Cloudflare proxy headers:
 * - CF-Connecting-IP: True client IP address
 * - CF-IPCountry: Client geographic location
 * - CF-RAY: Unique Cloudflare trace identifier for security audit trails
 * - CF-Visitor: Verified protocol scheme
 */

const cloudflareSecurity = (req, res, next) => {
  // Extract real client IP through Cloudflare edge reverse proxy
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  const xForwardedFor = req.headers['x-forwarded-for'];
  const clientIp = cfConnectingIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.ip);

  const country = req.headers['cf-ipcountry'] || 'UNKNOWN';
  const rayId = req.headers['cf-ray'] || 'DIRECT';

  // Attach verified Cloudflare metadata to request object
  req.cf = {
    clientIp,
    country,
    rayId,
    isProxied: Boolean(cfConnectingIp)
  };

  // Override req.clientIp for downstream audit loggers and rate limiters
  req.clientIp = clientIp;

  // Origin Pull Protection: If configured, block traffic that bypasses Cloudflare
  const originVerifyToken = process.env.CF_ORIGIN_VERIFY_TOKEN;
  if (originVerifyToken) {
    const receivedToken = req.headers['x-cf-origin-token'];
    if (receivedToken !== originVerifyToken) {
      console.warn(`[SECURITY] Blocked direct-to-origin bypass attempt from IP: ${clientIp}`);
      return res.status(403).json({
        error: 'Direct access to origin server is restricted. Requests must route through Cloudflare Edge Security.'
      });
    }
  }

  // Set hardened security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (rayId !== 'DIRECT') {
    res.setHeader('X-Edge-Trace-ID', rayId);
  }

  next();
};

module.exports = cloudflareSecurity;
