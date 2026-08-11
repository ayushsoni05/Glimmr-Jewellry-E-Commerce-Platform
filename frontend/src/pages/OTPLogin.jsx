import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { EmailIcon, PhoneIcon } from '../components/Icons';
import { FRAMER_IMAGES } from '../utils/framerAssets';

const OTPLogin = () => {
  const [step, setStep] = useState('contact'); // 'contact' or 'otp'
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactType, setContactType] = useState('email'); // 'email' or 'phone'
  const [countdown, setCountdown] = useState(0);
  const [isPhoneOTP, setIsPhoneOTP] = useState(false);
  const [devModeOtp, setDevModeOtp] = useState('');
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { setUser } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!contact.trim()) {
      setError(`Please enter your ${contactType}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = contactType === 'phone' 
        ? { phone: contact }
        : { email: contact };
      
      await api.post('/auth/request-otp-login', payload);
      
      setIsPhoneOTP(contactType === 'phone');
      setStep('otp');
      setCountdown(60);
      success(`OTP sent to your ${contactType}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);
    setError('');

    try {
      const payload = isPhoneOTP
        ? { phone: contact, otp }
        : { email: contact, otp };
      
      const response = await api.post('/auth/verify-otp-login', payload);
      
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user.id);
      
      success('Login successful!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid OTP code';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] w-full mx-auto bg-white rounded-none shadow-xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* Left Showcase Column */}
        <div className="hidden lg:block lg:col-span-6 relative bg-[#222222] overflow-hidden">
          <img
            src={FRAMER_IMAGES.minimalMeBanner}
            alt="GLIMMR OTP Verification"
            className="w-full h-full object-cover object-center opacity-80 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute inset-0 p-12 flex flex-col justify-between z-10 text-white">
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl tracking-[0.25em] font-normal uppercase text-white">
                G L I M M R
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
            </div>

            <div className="max-w-md">
              <span className="font-body text-[11px] font-semibold tracking-[0.3em] uppercase text-[#B59A6C] block mb-3">
                SECURE AUTHENTICATION
              </span>
              <h2 className="font-heading text-3xl xl:text-4xl text-white font-normal leading-tight mb-4">
                Instant Passwordless Access
              </h2>
              <p className="font-body text-gray-300 text-xs xl:text-sm leading-relaxed font-light">
                Sign in seamlessly using a direct multi-factor one-time verification passcode sent to your registered email or phone.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center sm:text-left">
            <Link to="/" className="inline-block lg:hidden font-heading text-2xl tracking-[0.2em] font-normal uppercase text-[#222222] mb-6">
              GLIMMR
            </Link>

            <span className="font-body text-[11px] font-semibold tracking-[0.25em] uppercase text-[#B59A6C] mb-2 block">
              ONE-TIME PASSCODE
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl text-[#222222] font-normal tracking-tight mb-2">
              OTP Sign In
            </h1>
            <p className="font-body text-xs text-[#808080] uppercase tracking-wider">
              {step === 'contact' ? 'Request a passcode sent directly to you' : `Enter the passcode sent to ${contact}`}
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-6 p-4 bg-red-50/80 border border-red-200/80 text-red-700 text-xs font-body leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'contact' ? (
              /* Step 1: Select Contact & Request OTP */
              <motion.form
                key="step-contact"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRequestOTP}
                className="space-y-6"
              >
                {/* Method Selector Tabs */}
                <div>
                  <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-2">
                    Contact Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setContactType('email')}
                      className={`py-3 px-4 text-xs font-body font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-none border ${
                        contactType === 'email'
                          ? 'border-[#222222] bg-[#222222] text-white shadow-sm'
                          : 'border-gray-200 bg-[#FAF9F7] text-[#808080] hover:text-[#222222]'
                      }`}
                    >
                      <EmailIcon size={16} /> Email
                    </button>
                    <button
                      type="button"
                      disabled
                      className="py-3 px-4 text-xs font-body font-bold uppercase tracking-wider border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 relative rounded-none opacity-60"
                    >
                      <PhoneIcon size={16} /> Phone
                      <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-[#B59A6C]/20 text-[#B59A6C] text-[9px] uppercase tracking-widest font-bold">
                        Soon
                      </span>
                    </button>
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-1.5">
                    {contactType === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'name@example.com' : '9876543210'}
                    required
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors"
                  />
                  {contactType === 'phone' && (
                    <p className="text-[11px] font-body text-[#808080] mt-1.5">
                      10-digit mobile number (Indian numbers only)
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#222222] hover:bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all rounded-none disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'SENDING OTP...' : 'SEND OTP PASSCODE →'}
                </motion.button>
              </motion.form>
            ) : (
              /* Step 2: Enter & Verify OTP */
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-2 text-center">
                    Enter 6-Digit Passcode
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                    className="w-full px-4 py-4 text-center text-3xl tracking-[0.4em] font-mono bg-[#FAF9F7] border border-gray-200 rounded-none text-[#222222] placeholder-gray-300 focus:outline-none focus:border-[#222222] transition-colors"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#222222] hover:bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all rounded-none disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY & SIGN IN →'}
                </motion.button>

                <div className="pt-2 flex flex-col items-center gap-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('contact');
                      setOtp('');
                      setCountdown(0);
                    }}
                    className="font-body text-xs text-[#808080] hover:text-[#222222] font-semibold uppercase tracking-wider transition-colors"
                  >
                    Change Contact Info
                  </button>

                  {countdown > 0 ? (
                    <p className="font-body text-xs text-[#808080] uppercase tracking-wider">
                      Resend code in <strong className="text-[#222222] font-mono">{countdown}s</strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestOTP()}
                      className="font-body text-xs text-[#B59A6C] hover:text-[#222222] font-bold uppercase tracking-wider transition-colors"
                    >
                      Resend Passcode
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Password Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="font-body text-xs text-[#808080] uppercase tracking-wider">
              Prefer password sign in?{' '}
              <Link to="/auth" className="text-[#222222] font-bold hover:text-[#B59A6C] transition-colors underline ml-1">
                Sign In With Password
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
