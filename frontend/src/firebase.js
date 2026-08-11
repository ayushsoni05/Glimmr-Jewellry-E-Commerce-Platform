/**
 * Firebase Configuration & reCAPTCHA Setup
 * 
 * Why reCAPTCHA is Required:
 * - Prevents automated SMS/OTP abuse and bot attacks
 * - Firebase Phone Auth requires reCAPTCHA verification
 * - Works on localhost (test mode) and production
 * - Invisible reCAPTCHA v2 is used for seamless UX
 * 
 * How it works:
 * 1. User requests OTP → reCAPTCHA widget loads (invisible by default)
 * 2. User interaction triggers reCAPTCHA validation
 * 3. Once verified, OTP is sent to phone/email
 * 4. User receives OTP and enters it to complete authentication
 */

import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration (prefer environment, fallback to legacy keys)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDYZnLUZG0yuVXDFilqBNGFZayyX3B_55I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "glimmr-14cf2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "glimmr-14cf2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "glimmr-14cf2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "266965358292",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:266965358292:web:66c5b9f00248313bda0d41",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-53Q8XY77YH"
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('AIzaSyDYZnLUZG0yuVXDFilqBNGFZayyX3B_55I')) {
  console.warn('⚠️ Firebase API key missing or using default. Set VITE_FIREBASE_API_KEY in .env');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (only if custom API key is provided)
let analyticsInstance = null;
if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    analyticsInstance = getAnalytics(app);
  } catch (e) {
    // Ignore analytics initialization failure in dev
  }
}
export const analytics = analyticsInstance;

// Optional: use local Auth emulator for development to avoid billing requirements
const useAuthEmulator = import.meta.env.VITE_FIREBASE_USE_AUTH_EMULATOR === 'true';
const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9100';

if (useAuthEmulator && typeof window !== 'undefined') {
  connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
  // Disable app verification when using the emulator so phone auth works without billing
  // Do NOT enable this in production
  auth.settings.appVerificationDisabledForTesting = true;
  console.log(`✅ Auth emulator connected: ${authEmulatorUrl}`);
}

/**
 * Global reCAPTCHA Verifier Manager
 * Prevents multiple instances and handles lifecycle
 */
class RecaptchaManager {
  constructor() {
    this.verifier = null;
    this.isInitializing = false;
  }

  /**
   * Initialize reCAPTCHA verifier (only once)
   * Clears container DOM element before rendering to prevent "already rendered" errors
   * @param {string} containerId - DOM element ID for reCAPTCHA
   * @param {Object} options - Configuration options
   * @returns {Promise<RecaptchaVerifier>} Initialized verifier
   */
  async initialize(containerId = 'recaptcha-container', options = {}) {
    // Prevent duplicate initialization attempts
    if (this.isInitializing) {
      console.log('⏳ reCAPTCHA initialization in progress...');
      // Wait for initialization to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.verifier) {
            clearInterval(checkInterval);
            resolve(this.verifier);
          }
        }, 100);
      });
    }

    this.isInitializing = true;

    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`⚠️ reCAPTCHA container not found: ${containerId}`);
      } else {
        // CRITICAL: Clear container innerHTML to prevent "already rendered" error
        // This fixes: "reCAPTCHA has already been rendered in this element"
        container.innerHTML = '';
      }

      // If verifier already exists, clear and recreate it
      if (this.verifier) {
        try {
          this.verifier.clear();
        } catch (e) {
          console.log('Previous verifier cleanup completed');
        }
        this.verifier = null;
      }

      const defaultOptions = {
        size: 'invisible',
        callback: options.callback || (() => console.log('✅ reCAPTCHA verified')),
        'expired-callback': options['expired-callback'] || (() => {
          console.warn('⚠️ reCAPTCHA expired, clearing instance');
          this.clear();
        }),
        ...options
      };

      this.verifier = new RecaptchaVerifier(auth, containerId, defaultOptions);
      console.log('✅ reCAPTCHA initialized successfully');
      return this.verifier;
    } catch (error) {
      console.error('❌ reCAPTCHA initialization error:', error);
      this.verifier = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get current verifier or initialize if needed
   * @param {string} containerId - DOM element ID
   * @param {Object} options - Configuration options
   * @returns {Promise<RecaptchaVerifier>}
   */
  async getOrInitialize(containerId = 'recaptcha-container', options = {}) {
    if (this.verifier) {
      return this.verifier;
    }
    return this.initialize(containerId, options);
  }

  /**
   * Clear and reset reCAPTCHA
   */
  clear() {
    if (this.verifier) {
      try {
        this.verifier.clear();
        console.log('✅ reCAPTCHA cleared');
      } catch (error) {
        console.warn('⚠️ Error clearing reCAPTCHA:', error);
      }
      this.verifier = null;
    }
  }

  /**
   * Reset reCAPTCHA for retry
   */
  reset() {
    this.clear();
  }
}

// Create global manager instance
export const recaptchaManager = new RecaptchaManager();

/**
 * Legacy function for backward compatibility
 * @param {string} containerId - DOM element ID
 * @param {Object} options - Configuration options
 * @returns {Promise<RecaptchaVerifier>}
 */
export const setupRecaptcha = async (containerId = 'recaptcha-container', options = {}) => {
  return recaptchaManager.initialize(containerId, options);
};

/**
 * Get reCAPTCHA verifier
 * @param {string} containerId - DOM element ID
 * @param {Object} options - Configuration options
 * @returns {Promise<RecaptchaVerifier>}
 */
export const getRecaptchaVerifier = async (containerId = 'recaptcha-container', options = {}) => {
  return recaptchaManager.getOrInitialize(containerId, options);
};

export default app;
