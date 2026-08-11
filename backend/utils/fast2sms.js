/**
 * Fast2SMS Integration for Phone OTP
 * 
 * Setup Instructions:
 * 1. Go to https://www.fast2sms.com/
 * 2. Sign up for a free account
 * 3. Get FREE credits (₹50 credit on signup)
 * 4. Go to Dev API section: https://www.fast2sms.com/dashboard/dev-api
 * 5. Copy your API Key
 * 6. Add FAST2SMS_API_KEY to backend/.env
 * 
 * Pricing:
 * - Free: ₹50 credit (~50 SMS) on signup
 * - Paid: ₹10 per SMS for testing, ₹0.10-0.15 per SMS for bulk
 * 
 * Rate Limits:
 * - Test mode: 10 SMS/day for free tier
 * - Paid: Higher limits based on plan
 */

const axios = require('axios');

const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

/**
 * Send OTP via Fast2SMS
 * @param {string} phoneNumber - Phone number in format: 9876543210 (10 digits, no +91)
 * @param {string} otp - 6-digit OTP code
 * @param {string} context - Context for the OTP (signup, login, etc.)
 * @returns {Promise<Object>} Response from Fast2SMS
 */
async function sendOtpViaSms(phoneNumber, otp, context = 'verification') {
  if (!FAST2SMS_API_KEY) {
    console.error('❌ [FAST2SMS] API key not configured');
    throw new Error('SMS service not configured. Add FAST2SMS_API_KEY to .env');
  }

  // Normalize phone: Fast2SMS expects 10-digit Indian number without +91
  let normalizedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
  if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
    normalizedPhone = normalizedPhone.substring(2); // Remove 91 prefix
  }
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = normalizedPhone.substring(1); // Remove leading zero
  }

  if (normalizedPhone.length !== 10) {
    console.error('❌ [FAST2SMS] Invalid phone number format:', phoneNumber);
    throw new Error('Invalid phone number. Must be 10-digit Indian number.');
  }

  const message = `Your Glimmr ${context} OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

  const payload = {
    route: 'v3',
    sender_id: 'FSTSMS', // Default Fast2SMS sender ID
    message: message,
    language: 'english',
    flash: 0,
    numbers: normalizedPhone, // Single number or comma-separated for multiple
  };

  try {
    console.log('📱 [FAST2SMS] Sending OTP to:', normalizedPhone);
    
    const response = await axios.post(FAST2SMS_API_URL, payload, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.data && response.data.return === true) {
      console.log('✅ [FAST2SMS] OTP sent successfully');
      console.log('📊 [FAST2SMS] Message ID:', response.data.message_id);
      console.log('📊 [FAST2SMS] Request ID:', response.data.request_id);
      
      return {
        success: true,
        messageId: response.data.message_id,
        requestId: response.data.request_id,
        message: 'OTP sent successfully',
      };
    } else {
      console.error('❌ [FAST2SMS] Failed to send OTP:', response.data);
      throw new Error(response.data.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('❌ [FAST2SMS] Error sending SMS:', error.message);
    
    if (error.response) {
      // Fast2SMS API error
      const errorData = error.response.data;
      console.error('❌ [FAST2SMS] API Error:', errorData);
      
      if (errorData.message) {
        throw new Error(`SMS service error: ${errorData.message}`);
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('SMS service timeout. Please try again.');
    }
    
    throw new Error('Failed to send OTP. Please try again.');
  }
}

/**
 * Check Fast2SMS balance
 * @returns {Promise<Object>} Balance information
 */
async function checkBalance() {
  if (!FAST2SMS_API_KEY) {
    throw new Error('Fast2SMS API key not configured');
  }

  try {
    const response = await axios.get('https://www.fast2sms.com/dev/wallet', {
      headers: {
        'authorization': FAST2SMS_API_KEY,
      },
    });

    if (response.data && response.data.return === true) {
      console.log('💰 [FAST2SMS] Current Balance:', response.data.wallet);
      return {
        success: true,
        balance: response.data.wallet,
      };
    }
    
    throw new Error('Failed to fetch balance');
  } catch (error) {
    console.error('❌ [FAST2SMS] Error checking balance:', error.message);
    throw error;
  }
}

module.exports = {
  sendOtpViaSms,
  checkBalance,
};
