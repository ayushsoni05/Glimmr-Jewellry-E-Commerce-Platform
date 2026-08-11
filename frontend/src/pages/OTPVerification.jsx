import { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { sendPhoneOTP, verifyPhoneOTP } from '../utils/authHelpers';
import LoadingOverlay from '../components/LoadingOverlay';

/**
 * OTP Verification Component
 * 
 * Handles phone number verification via SMS OTP
 * Features:
 * - Sends OTP to phone number
 * - 6-digit OTP input
 * - Resend OTP functionality
 * - Auto-focus on input fields
 * - Error handling
 */
const OTPVerification = ({ phoneNumber, email, onVerificationComplete, onCancel }) => {
  const toast = useToast();
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Refs for OTP inputs
  const inputRefs = useRef([]);

  /**
   * Send OTP on component mount
   */
  useEffect(() => {
    handleSendOTP();
  }, []);

  /**
   * Resend timer countdown
   */
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  /**
   * Send OTP to phone number
   */
  const handleSendOTP = async () => {
    setLoading(true);
    
    try {
      const result = await sendPhoneOTP(phoneNumber, 'recaptcha-container');
      
      if (result.success) {
        setVerificationId(result.verificationId);
        setOtpSent(true);
        setResendTimer(60); // 60 second cooldown
        toast.success(result.message);
        
        // Focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all 6 digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  /**
   * Handle backspace key
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle paste event
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Auto-verify
      handleVerifyOTP(newOtp.join(''));
    }
  };

  /**
   * Verify OTP code
   */
  const handleVerifyOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await verifyPhoneOTP(verificationId, otpCode);
      
      if (result.success) {
        toast.success('✅ Phone number verified successfully!');
        
        // Call completion callback after short delay
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Verify OTP error:', error);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    
    setOtp(['', '', '', '', '', '']);
    handleSendOTP();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-rose-50 px-4 py-12">
      {loading && <LoadingOverlay />}
      
      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container"></div>
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Phone</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="text-amber-600 font-semibold mt-1">{phoneNumber}</p>
          </div>

          {/* Progress indicator */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Email verification sent ✓</span>
            </div>
            <p className="text-sm text-green-600 mt-1 ml-7">{email}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter OTP Code
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  disabled={loading || !otpSent}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerifyOTP()}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center mb-4">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-semibold text-amber-600">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Skip for now */}
          <div className="text-center">
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Verify phone later
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Testing Tips:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Use Firebase test numbers for localhost</li>
              <li>+1 650-555-3434 (OTP: 123456)</li>
              <li>Check Firebase Console for test numbers</li>
              <li>OTP expires after 5 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
