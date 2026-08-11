import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import api from '../api';
import { CheckCircleIcon, AlertCircleIcon } from '../components/Icons';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post('/auth/verify-email', { token, email });
        setVerified(true);
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-soft p-12 max-w-md w-full text-center"
      >
        {loading ? (
          <>
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full"
              />
            </div>
            <p className="text-muted font-body text-lg">Verifying your email...</p>
          </>
        ) : verified ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gold mb-6 flex justify-center"
            >
              <CheckCircleIcon size={60} />
            </motion.div>
            <h2 className="text-3xl font-heading text-dark mb-4">Email Verified</h2>
            <p className="text-muted font-body mb-8">
              Your email has been successfully verified. Welcome to Glimmr!
            </p>
            <Link to="/" className="btn-primary w-full block">
              Return to Home
            </Link>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-red-500 mb-6 flex justify-center"
            >
              <AlertCircleIcon size={60} />
            </motion.div>
            <h2 className="text-3xl font-heading text-dark mb-4">Verification Failed</h2>
            <p className="text-muted font-body mb-8">{error}</p>
            <div className="flex flex-col gap-4">
              <Link to="/" className="btn-primary w-full block">
                Return to Home
              </Link>
              <Link to="/auth" className="text-gold hover:text-dark font-body transition-colors">
                Back to Authentication
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
