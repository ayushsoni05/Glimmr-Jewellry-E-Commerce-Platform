/**
 * Centralized External Services & Bullion API Configuration
 * 
 * Safely accesses environment variables with documented fallbacks.
 */

module.exports = {
  goldApi: {
    key: process.env.GOLDAPI_KEY || process.env.GOLDAPI_TOKEN || '',
    baseUrl: 'https://www.goldapi.io/api'
  },
  metalPriceApi: {
    key: process.env.METALPRICEAPI_KEY || '',
    baseUrl: 'https://api.metalpriceapi.com/v1'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || ''
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM || 'Monika Jewellers <onboarding@resend.dev>'
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || ''
  },
  fast2sms: {
    authorization: process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_AUTHORIZATION || ''
  }
};
