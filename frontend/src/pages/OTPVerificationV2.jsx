import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { sendPhoneOTP, verifyPhoneOTP, getErrorMessage } from '../utils/authHelpers';

/**
 * OTP Verification Component with Firebase Phone Auth + reCAPTCHA
 * 
 * Features:
 * - Automatic reCAPTCHA initialization
 * - Phone OTP send & verify flow
 * - Error handling with user-friendly messages
 * - Countdown timer for OTP retry
 * - Loading states and validation
 * 
 * Integration:
 * - Uses Firebase Phone Authentication
 * - Leverages reCAPTCHA for security
 * - Backend API for non-Firebase OTP (email, legacy)
 */
const OTPVerificationV2 = ({
  phoneNumber = '',
  email = '',
  onVerificationComplete = () => {},
  onCancel = () => {},
}) => {
  // State management
  const [step, setStep] = useState('request'); // request, verify, complete
  const [phoneInput, setPhoneInput] = useState(phoneNumber);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  const [usePhoneAuth, setUsePhoneAuth] = useState(!!phoneNumber);

  const { success, error: showError } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * Handle phone number format
   */
  const formatPhoneForFirebase = (phone) => {
    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[\s()-]/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('+')) {
      // Assume India (+91) if no country code
      cleaned = cleaned.replace(/^0+/, ''); // Remove leading zeros
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  };

  /**
   * Step 1: Request OTP via Firebase Phone Auth
   */
  const handleRequestPhoneOTP = async (e) => {
    e?.preventDefault();
    
    if (!phoneInput.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneForFirebase(phoneInput);
      console.log('📱 Requesting OTP for:', formattedPhone);

      // Ensure reCAPTCHA container exists
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        throw new Error('reCAPTCHA container not found in DOM');
      }

      // Call Firebase OTP send function
      const result = await sendPhoneOTP(formattedPhone, 'recaptcha-container');
      
      setVerificationId(result.verificationId);
      setStep('verify');
      setCountdown(60);
      
      success(`✅ OTP sent to ${formattedPhone}`);
      console.log('✅ OTP request successful');
    } catch (err) {
      console.error('❌ OTP request failed:', err);
      
      // Parse error message
      let errorMsg = 'Failed to send OTP';
      
      if (err.code === 'auth/invalid-phone-number') {
        errorMsg = 'Invalid phone number format. Use +91XXXXXXXXXX format.';
      } else if (err.code === 'auth/missing-recaptcha-token') {
        errorMsg = 'reCAPTCHA verification failed. Please try again.';
      } else if (err.code === 'auth/invalid-app-credential') {
        errorMsg = 'Server configuration error. Contact support.';
      } else if (err.code === 'auth/captcha-check-failed') {
        errorMsg = 'reCAPTCHA check failed. Please try again.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Phone authentication is not enabled. Using email OTP instead.';
        setUsePhoneAuth(false);
        setStep('request');
        return;
      } else if (err.message) {
        errorMsg = getErrorMessage(err);
      }
      
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    if (!verificationId) {
      setError('Verification ID not found. Please request OTP again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('✓ Verifying OTP...');
      
      await verifyPhoneOTP(verificationId, otp);
      
      setStep('complete');
      success('✅ Phone number verified successfully!');
      console.log('✅ Phone verification complete');

      // Call completion callback
      setTimeout(onVerificationComplete, 1500);
    } catch (err) {
      console.error('❌ OTP verification failed:', err);
      
      let errorMsg = 'OTP verification failed';
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMsg = 'Invalid OTP. Please check and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMsg = 'OTP has expired. Please request a new one.';
      } else if (err.message) {
        errorMsg = getErrorMessage(err);
      }
      
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleRequestPhoneOTP();
  };

  /**
   * Render OTP request step
   */
  if (step === 'request') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Verification</h2>
            <p className="text-gray-600 text-sm">Enter your phone number to receive OTP</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleRequestPhoneOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: +91 followed by 10-digit number
              </p>
            </div>

            {/* reCAPTCHA Container - IMPORTANT: Must be in DOM */}
            <div id="recaptcha-container" className="my-4" />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Secured by Firebase & reCAPTCHA
          </p>
        </motion.div>
      </div>
    );
  }

  /**
   * Render OTP verification step
   */
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to your phone
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                disabled={loading}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || loading}
              className="w-full py-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors text-sm"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request');
                setOtp('');
                setError('');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Change Phone Number
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  /**
   * Render success step
   */
  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-block p-4 bg-green-100 rounded-full">
              <span className="text-4xl">✅</span>
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your phone number has been verified successfully.
          </p>

          <p className="text-sm text-gray-500">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default OTPVerificationV2;
