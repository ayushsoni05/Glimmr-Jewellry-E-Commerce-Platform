const axios = require('axios');

/**
 * Validates a Cloudflare Turnstile response token with Cloudflare's verification API.
 * 
 * @param {string} token - The client response token from the Turnstile widget
 * @param {string} remoteip - The client's IP address (from CF-Connecting-IP)
 * @returns {Promise<{ success: boolean, hostname?: string, error?: string, bypass?: boolean }>}
 */
async function verifyTurnstileToken(token, remoteip) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Development / Offline Fallback: If no secret key is configured, allow request
  if (!secretKey) {
    return {
      success: true,
      bypass: true,
      message: 'Cloudflare Turnstile secret key not set in environment; allowing bypass for local development.'
    };
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      error: 'Turnstile verification token is missing or empty.'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 6000
      }
    );

    const data = response.data;
    if (data.success) {
      return {
        success: true,
        hostname: data.hostname,
        action: data.action,
        cdata: data.cdata
      };
    }

    console.warn('[SECURITY] Cloudflare Turnstile verification rejected:', data['error-codes']);
    return {
      success: false,
      error: 'Cloudflare Turnstile bot detection challenge failed.',
      codes: data['error-codes']
    };
  } catch (err) {
    console.error('[SECURITY] Error contacting Cloudflare Turnstile verification service:', err.message);
    // Fail closed if configured, or return false
    return {
      success: false,
      error: 'Security challenge verification service unavailable. Please retry.'
    };
  }
}

module.exports = {
  verifyTurnstileToken
};
