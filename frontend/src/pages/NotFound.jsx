import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream">
      <div className="container-narrow text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Large 404 */}
          <h1 className="text-[8rem] sm:text-[12rem] font-heading text-gold-200 leading-none select-none">
            404
          </h1>

          {/* Decorative divider */}
          <div className="divider-gold my-6" />

          {/* Heading */}
          <h2 className="text-display-sm md:text-display font-heading text-textPrimary mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-lg text-muted max-w-md mx-auto mb-10 font-body">
            The page you're looking for doesn't exist or has been moved. 
            Let us help you find what you need.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
            <Link to="/products" className="btn-secondary">
              Browse Products
            </Link>
          </div>
        </motion.div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-gold-100"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-gold-50"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
