import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Firebase verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      if (firebaseUserData) {
        setFirebaseUser(firebaseUserData);
        
        // Update verification status
        setEmailVerified(firebaseUserData.emailVerified);
        
        // Check if phone is verified
        const hasPhone = firebaseUserData.providerData.some(
          provider => provider.providerId === 'phone'
        );
        setPhoneVerified(hasPhone);

        console.log('🔥 Firebase User State:', {
          email: firebaseUserData.email,
          emailVerified: firebaseUserData.emailVerified,
          phoneVerified: hasPhone,
        });
      } else {
        setFirebaseUser(null);
        setEmailVerified(false);
        setPhoneVerified(false);
      }
    });

    // Validate persisted token with backend to avoid stale/auto-login issues
    (async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (!token || !storedUser) {
        setLoading(false);
        return;
      }
      try {
        const parsedUser = JSON.parse(storedUser);
        // Hit /auth/me to confirm token validity
        const res = await api.get('/auth/me');
        const freshUser = res.data.user;
        // Prevent implicit admin role from stale data: require role verification via admin-login
        if (parsedUser.role === 'admin' && freshUser.role !== 'admin') {
          // downgrade if mismatch
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          setUser(null);
        } else {
          setUser(freshUser);
          // Ensure userId is in localStorage
          if (freshUser.id || freshUser._id) {
            localStorage.setItem('userId', freshUser.id || freshUser._id);
            window.dispatchEvent(new Event('auth-change'));
          }
        }
      } catch (err) {
        // Invalid token — clear
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      setUser(userData);

      // Dispatch event to notify cart context
      window.dispatchEvent(new Event('auth-change'));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const signup = async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, phone, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      setUser(userData);

      // Dispatch event to notify cart context
      window.dispatchEvent(new Event('auth-change'));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Signup failed' };
    }
  };

  const logout = useCallback(() => {
    // Call logout endpoint
    const token = localStorage.getItem('token');
    if (token) {
      api.post('/auth/logout').catch(() => {
        // Ignore logout errors
      });
    }

    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);

    // Dispatch event to notify cart context
    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    signup,
    logout,
    loading,
    // Firebase verification states
    emailVerified,
    phoneVerified,
    firebaseUser,
    isFullyVerified: emailVerified && phoneVerified,
  }), [user, login, signup, logout, loading, emailVerified, phoneVerified, firebaseUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
