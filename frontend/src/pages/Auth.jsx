import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { validateEmailFrontend } from '../utils/emailValidator';
import InvalidEmailModal from '../components/InvalidEmailModal';
import api from '../api';
import { FRAMER_IMAGES } from '../utils/framerAssets';

const Auth = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [invalidEmailModal, setInvalidEmailModal] = useState({
    isOpen: false,
    error: '',
    message: '',
    suggestion: null
  });

  const { login, signup, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (isAdminLogin) {
          if (!email || !password) {
            setError('Email and password are required for Admin access');
            setLoading(false);
            return;
          }

          const payload = {
            email: email.toLowerCase().trim(),
            password
          };

          if (requiresTwoFA && twoFACode) {
            payload.twoFACode = twoFACode;
          }

          const response = await api.post('/auth/admin-login', payload);

          if (response.data.requiresTwoFA) {
            setRequiresTwoFA(true);
            setMessage(response.data.message);
            setLoading(false);
            return;
          }

          const { token, user: userData } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(userData);
          navigate('/admin');
        } else {
          // Regular login
          const result = await login(email, password);
          if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          } else {
            setError(result.error || 'Invalid credentials');
          }
        }
      } else {
        // Signup - validate email first
        const emailValidation = validateEmailFrontend(email);
        if (!emailValidation.isValid) {
          setInvalidEmailModal({
            isOpen: true,
            error: emailValidation.error,
            message: emailValidation.error,
            suggestion: emailValidation.suggestion,
            validationType: emailValidation.type
          });
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const result = await signup(name, email, phone, password);
        if (result.success) {
          setMessage('Account created successfully! You can now sign in.');
          setMode('login');
          setName('');
          setEmail('');
          setPhone('');
          setPassword('');
          setConfirmPassword('');
        } else {
          if (result.error && result.error.includes('email')) {
            setInvalidEmailModal({
              isOpen: true,
              error: result.error,
              message: result.error,
              suggestion: null,
              validationType: 'backend'
            });
          } else {
            setError(result.error || 'Failed to create account');
          }
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'An unexpected error occurred';
      
      if (err.response?.data?.code === 'INVALID_EMAIL') {
        setInvalidEmailModal({
          isOpen: true,
          error: errorMsg,
          message: errorMsg,
          suggestion: null,
          validationType: 'backend'
        });
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEmailModal = () => {
    setInvalidEmailModal({ isOpen: false, error: '', message: '', suggestion: null });
  };

  const handleAcceptSuggestion = () => {
    if (invalidEmailModal.suggestion) {
      setEmail(invalidEmailModal.suggestion);
      setInvalidEmailModal({ isOpen: false, error: '', message: '', suggestion: null });
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setIsAdminLogin(false);
    setRequiresTwoFA(false);
    setTwoFACode('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Container Wrapper */}
      <div className="max-w-[1240px] w-full mx-auto bg-white rounded-none shadow-xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Editorial Image Showcase Column (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-6 relative bg-[#222222] overflow-hidden">
          <img
            src={FRAMER_IMAGES.minimalMeBanner}
            alt="GLIMMR Fine Jewelry"
            className="w-full h-full object-cover object-center opacity-85 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Editorial Overlay Content */}
          <div className="absolute inset-0 p-12 flex flex-col justify-between z-10 text-white">
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl tracking-[0.25em] font-normal uppercase text-white">
                G L I M M R
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
            </div>

            <div className="max-w-md">
              <span className="font-body text-[11px] font-semibold tracking-[0.3em] uppercase text-[#B59A6C] block mb-3">
                FINE JEWELRY & CRAFTSMANSHIP
              </span>
              <h2 className="font-heading text-3xl xl:text-4xl text-white font-normal leading-tight mb-4">
                Embrace the timeless beauty of handcrafted luxury.
              </h2>
              <p className="font-body text-gray-300 text-xs xl:text-sm leading-relaxed font-light">
                Sign in to manage your orders, curate your personal wishlist, and explore exclusive bespoke collections.
              </p>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
          {/* Header Title & Subtitle */}
          <div className="mb-8 text-center sm:text-left">
            <Link to="/" className="inline-block lg:hidden font-heading text-2xl tracking-[0.2em] font-normal uppercase text-[#222222] mb-6">
              GLIMMR
            </Link>

            {/* Mode Switch Tabs (SIGN IN / CREATE ACCOUNT) */}
            <div className="flex items-center gap-6 border-b border-gray-100 pb-4 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`font-body text-xs font-bold uppercase tracking-[0.2em] transition-all pb-1 relative ${
                  mode === 'login' ? 'text-[#222222]' : 'text-[#808080] hover:text-[#222222]'
                }`}
              >
                SIGN IN
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#222222]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`font-body text-xs font-bold uppercase tracking-[0.2em] transition-all pb-1 relative ${
                  mode === 'signup' ? 'text-[#222222]' : 'text-[#808080] hover:text-[#222222]'
                }`}
              >
                CREATE ACCOUNT
                {mode === 'signup' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#222222]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>

            <p className="font-body text-xs text-[#808080] uppercase tracking-wider">
              {mode === 'login' ? 'Enter your details to access your account' : 'Register to unlock exclusive privileges'}
            </p>
          </div>

          {/* Feedback Messages */}
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

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-6 p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-body leading-relaxed"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors"
                required
              />
            </div>

            {/* Password Field with Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#222222] transition-colors text-xs font-body uppercase tracking-wider"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password Field for Signup */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkbox Options (Admin & 2FA) */}
            {mode === 'login' && (
              <div className="pt-1 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdminLogin}
                    onChange={(e) => setIsAdminLogin(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#222222] rounded-none cursor-pointer"
                  />
                  <span className="font-body text-xs text-[#555555] uppercase tracking-wider font-medium">
                    Admin Sign In
                  </span>
                </label>
              </div>
            )}

            {/* 2FA Input for Admin */}
            {isAdminLogin && requiresTwoFA && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <label className="block text-[11px] font-body font-bold text-[#222222] uppercase tracking-widest mb-1.5">
                  2FA Code (Sent to Email)
                </label>
                <input
                  type="text"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="Enter 16-digit code"
                  maxLength="16"
                  className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-none text-xs text-[#222222] font-body placeholder-gray-400 focus:outline-none focus:border-[#222222] transition-colors font-mono"
                  required
                />
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#222222] hover:bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all rounded-none disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </motion.button>
          </form>

          {/* Footer Options */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
            {mode === 'login' && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link
                  to="/otp-login"
                  className="inline-block border border-gray-200 hover:border-[#222222] px-6 py-2.5 text-[#222222] hover:bg-[#FAF9F7] font-body text-xs font-bold uppercase tracking-[0.15em] transition-colors rounded-none"
                >
                  Sign In with Phone OTP →
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Invalid Email Modal */}
      <InvalidEmailModal
        isOpen={invalidEmailModal.isOpen}
        error={invalidEmailModal.error}
        message={invalidEmailModal.message}
        suggestion={invalidEmailModal.suggestion}
        onClose={handleCloseEmailModal}
        onAcceptSuggestion={handleAcceptSuggestion}
      />
    </div>
  );
};

export default Auth;
