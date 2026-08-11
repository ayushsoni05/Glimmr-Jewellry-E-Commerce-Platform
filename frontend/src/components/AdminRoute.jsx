import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-[#111111] border-t-[#B59A6C] rounded-full"
        />
      </div>
    );
  }

  // Block unauthenticated visitors or non-admin patrons from accessing /admin via direct URL entry
  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
