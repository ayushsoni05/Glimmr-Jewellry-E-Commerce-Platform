/**
 * Firebase Authentication Helper Functions
 * 
 * This module provides comprehensive authentication utilities including:
 * - Email/Password signup with verification
 * - Phone number verification via OTP
 * - Login with verification checks
 * - User state management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  PhoneAuthProvider,
  signInWithCredential,
  linkWithCredential,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth, getRecaptchaVerifier, recaptchaManager } from '../firebase';


const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'This email is already registered. Please login instead.',
  'auth/invalid-email': 'Invalid email address format.',
  'auth/operation-not-allowed': 'Email/password authentication is not enabled.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/invalid-verification-code': 'Invalid OTP code. Please check and try again.',
  'auth/code-expired': 'OTP code has expired. Please request a new one.',
  'auth/invalid-phone-number': 'Invalid phone number format. Use international format (e.g., +1234567890).',
  'auth/missing-phone-number': 'Please provide a phone number.',
  'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
  'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
  'auth/billing-not-enabled': 'Phone OTP requires billing enabled on Firebase (Blaze plan) or use the Auth emulator for testing.',
  'auth/network-request-failed': 'Cannot reach Firebase Auth. If using the emulator, ensure it is running on the configured host/port.'
};

/**
 * Get user-friendly error message
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  return ERROR_MESSAGES[error.code] || error.message || 'An unexpected error occurred.';
};

/**
 * Step 1: Create user account with email and password
 * Automatically sends email verification link
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} displayName - User's display name (optional)
 * @returns {Promise<Object>} User credential object
 */
export const signupWithEmail = async (email, password, displayName = '') => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Send email verification link
    await sendEmailVerification(user, {
      url: window.location.origin + '/verify-email', // Redirect URL after verification
      handleCodeInApp: false,
    });

    console.log('✅ Email verification sent to:', email);

    return {
      success: true,
      user,
      message: 'Account created! Please check your email for verification link.',
    };
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Step 2: Send OTP to phone number using Firebase
 * Initializes reCAPTCHA and sends OTP via SMS
 * 
 * How it works:
 * 1. Validates phone number format
 * 2. Initializes reCAPTCHA (only once per session)
 * 3. Creates PhoneAuthProvider and sends OTP
 * 4. Returns verificationId for OTP verification
 * 
 * Error handling:
 * - auth/invalid-phone-number: Phone format validation
 * - auth/missing-recaptcha-token: reCAPTCHA verification failed
 * - auth/invalid-app-credential: Firebase configuration issue
 * - auth/operation-not-allowed: Phone auth not enabled in Firebase
 * 
 * @param {string} phoneNumber - Phone number in international format (e.g., +91-98765-43210)
 * @param {string} recaptchaContainerId - DOM element ID for reCAPTCHA widget
 * @returns {Promise<Object>} { success, verificationId, message }
 */
export const sendPhoneOTP = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  try {
    // Normalize phone number to E.164 (auto-add +91 for 10-digit inputs)
    const trimmed = (phoneNumber || '').trim();
    const digitsOnly = trimmed.replace(/[^0-9+]/g, '');
    let normalizedPhone = digitsOnly;

    if (!digitsOnly.startsWith('+')) {
      const justDigits = digitsOnly.replace(/\D/g, '');
      if (justDigits.length === 10) {
        normalizedPhone = `+91${justDigits}`; // default to India if user omitted country code
      } else {
        throw new Error('auth/invalid-phone-number');
      }
    }

    if (normalizedPhone.length < 10) {
      throw new Error('auth/invalid-phone-number');
    }

    console.log('📱 Sending OTP to:', normalizedPhone);

    // Clear container element before initializing reCAPTCHA
    // This prevents: "reCAPTCHA has already been rendered in this element"
    const container = document.getElementById(recaptchaContainerId);
    if (container) {
      container.innerHTML = '';
      console.log('🧹 Cleared reCAPTCHA container');
    }

    // Initialize/get reCAPTCHA verifier
    let recaptchaVerifier;
    try {
      recaptchaVerifier = await getRecaptchaVerifier(recaptchaContainerId);
    } catch (error) {
      console.error('❌ reCAPTCHA initialization failed:', error);
      throw new Error('auth/missing-recaptcha-token');
    }

    // Create phone auth provider
    const phoneProvider = new PhoneAuthProvider(auth);

    // Send OTP (reCAPTCHA verification happens automatically)
    let verificationId;
    try {
      verificationId = await phoneProvider.verifyPhoneNumber(
        normalizedPhone,
        recaptchaVerifier
      );
    } catch (error) {
      console.error('❌ Phone OTP send error:', error);
      
      // Clear verifier on error
      recaptchaManager.clear();
      
      if (error.code === 'auth/captcha-check-failed') {
        throw new Error('auth/captcha-check-failed');
      }
      throw error;
    }

    console.log('✅ OTP sent successfully to:', normalizedPhone);

    return {
      success: true,
      verificationId,
      normalizedPhone,
      message: 'OTP sent successfully! Check your phone for the 6-digit code.',
    };
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    throw error;
  }
};

/**
 * Step 3: Verify OTP and link phone number to user account
 * @param {string} verificationId - Verification ID from sendPhoneOTP
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<Object>} { success, message }
 */
export const verifyPhoneOTP = async (verificationId, otpCode) => {
  try {
    // Validate OTP code
    if (!otpCode || otpCode.length !== 6) {
      throw new Error('auth/invalid-verification-code');
    }

    // Create phone credential
    const credential = PhoneAuthProvider.credential(verificationId, otpCode);

    const currentUser = auth.currentUser;

    if (currentUser) {
      // Link phone number to existing user
      await linkWithCredential(currentUser, credential);
      console.log('✅ Phone number linked to user account');
    } else {
      // Sign in with phone credential (if no user is logged in)
      await signInWithCredential(auth, credential);
      console.log('✅ Signed in with phone number');
    }

    // Clear reCAPTCHA after successful verification
    recaptchaManager.clear();

    return {
      success: true,
      message: 'Phone number verified successfully!',
    };
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    throw error;
  }
};

/**
 * Login with email and password
 * Checks email verification status before allowing login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object with verification status
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      // Sign out unverified user
      await signOut(auth);
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    // Check if phone is verified (providerData includes phone)
    const phoneVerified = user.providerData.some(
      provider => provider.providerId === 'phone'
    );

    console.log('✅ Login successful');
    console.log('📧 Email verified:', user.emailVerified);
    console.log('📱 Phone verified:', phoneVerified);

    return {
      success: true,
      user,
      emailVerified: user.emailVerified,
      phoneVerified,
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Resend email verification link
 * @returns {Promise<Object>} Result object
 */
export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in.');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified.');
    }

    await sendEmailVerification(user, {
      url: window.location.origin + '/verify-email',
      handleCodeInApp: false,
    });

    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    };
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Check current user's verification status
 * @returns {Object} Verification status
 */
export const getVerificationStatus = () => {
  const user = auth.currentUser;

  if (!user) {
    return {
      isLoggedIn: false,
      emailVerified: false,
      phoneVerified: false,
    };
  }

  // Reload user to get fresh verification status
  user.reload().catch(err => console.error('Error reloading user:', err));

  const phoneVerified = user.providerData.some(
    provider => provider.providerId === 'phone'
  );

  return {
    isLoggedIn: true,
    emailVerified: user.emailVerified,
    phoneVerified,
    user,
  };
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    
    // Clear reCAPTCHA
    recaptchaManager.clear();
    
    console.log('✅ User logged out');
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Format phone number to international format
 * @param {string} phone - Phone number
 * @param {string} countryCode - Default country code (e.g., '+1')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, countryCode = '+1') => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (!phone.startsWith('+')) {
    return countryCode + cleaned;
  }
  
  return '+' + cleaned;
};
