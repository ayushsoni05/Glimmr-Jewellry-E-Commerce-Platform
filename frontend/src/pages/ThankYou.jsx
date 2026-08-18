import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../api';
import { getProductImage } from '../utils/productImages';
import { 
  CheckCircleIcon, 
  OrderIcon, 
  MapPinIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  ArrowRightIcon, 
  InfoIcon, 
  EmailIcon 
} from '../components/Icons';

import TaxInvoiceModal from '../components/TaxInvoiceModal';
import OrderTrackingModal from '../components/OrderTrackingModal';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
  }, [authLoading, user, navigate]);

  const handleDownloadInvoice = () => {
    if (!orderData?._id) {
      toastError('Order details unavailable');
      return;
    }
    setIsInvoiceOpen(true);
  };

  if (authLoading) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-10"
      >
        
        {/* Sober Creamish Pink Success Badge & Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          
          {/* Animated Success Badge */}
          <motion.div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 15 }}
              className="relative w-28 h-28 rounded-full bg-[#FDF2F0] border-2 border-[#E8C8C1] shadow-[0_10px_30px_rgba(232,200,193,0.4)] flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-dashed border-[#B59A6C]/40 rounded-full"
              />
              <CheckCircleIcon size={52} className="text-[#B59A6C] z-10" />
            </motion.div>
          </motion.div>

          <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] block">
            ATELIER ACQUISITION CONFIRMED
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-[#111111] tracking-tight">
            Thank You for Your Acquisition
          </h1>
          <p className="text-xs md:text-sm font-body text-gray-500 max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
            Your order has been registered into the Glimmr Atelier portfolio log. Our master jewelers are inspecting your pieces for white-glove dispatch.
          </p>
        </motion.div>

        {/* Order Details Card */}
        {orderData ? (
          <motion.div
            variants={itemVariants}
            className="bg-white border border-[#E5E2D9] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            {/* Gold Top Accent Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#B59A6C] via-[#111111] to-[#B59A6C]" />

            <div className="p-8 md:p-10 space-y-8">
              
              {/* Card Header & Order Metadata Grid */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                    PORTFOLIO SUMMARY
                  </span>
                  <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
                    Acquisition #{orderData._id ? orderData._id.slice(-8).toUpperCase() : 'PORTFOLIO'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-body font-bold uppercase tracking-widest">
                    CONFIRMED
                  </span>
                  <span className="px-3 py-1 bg-[#FAF9F7] text-gray-600 border border-gray-200 text-[10px] font-body font-bold uppercase tracking-widest">
                    {orderData.paymentMethod?.toUpperCase() || 'COD'}
                  </span>
                </div>
              </div>

              {/* Metadata Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#FAF9F7] border border-gray-200">
                <div>
                  <span className="text-[10px] font-body font-bold uppercase tracking-wider text-gray-400 block mb-1">ORDER ID</span>
                  <span className="font-mono text-xs font-bold text-[#111111] break-all">
                    #{orderData._id ? orderData._id.slice(-8).toUpperCase() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-body font-bold uppercase tracking-wider text-gray-400 block mb-1">DATE</span>
                  <span className="text-xs font-body font-bold text-[#111111]">
                    {new Date(orderData.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-body font-bold uppercase tracking-wider text-gray-400 block mb-1">FINANCIAL METHOD</span>
                  <span className="text-xs font-body font-bold text-[#111111] uppercase">
                    {orderData.paymentMethod || 'COD'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-body font-bold uppercase tracking-wider text-[#B59A6C] block mb-1">TOTAL VALUATION</span>
                  <span className="font-mono text-base font-extrabold text-[#111111]">
                    ₹{(orderData.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Purchased Items List */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block">
                    ACQUIRED PIECES ({orderData.items.length})
                  </span>
                  <div className="space-y-3">
                    {orderData.items.map((item, idx) => {
                      const p = item.product || {};
                      return (
                        <div key={idx} className="p-4 bg-white border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <img 
                              src={getProductImage(p)} 
                              alt={p.name} 
                              className="w-14 h-14 object-cover border border-gray-200 shrink-0 bg-[#FAF9F7]" 
                            />
                            <div className="min-w-0">
                              <h4 className="font-heading font-extrabold text-sm text-[#111111] leading-snug break-words">
                                {p.name || 'Jewelry Piece'}
                              </h4>
                              <p className="text-[10px] font-body text-gray-500 mt-0.5 uppercase tracking-wider">
                                Qty: {item.quantity} {p.material && `• ${p.material}`} {p.karat && `• ${p.karat}K`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-extrabold text-[#111111]">
                              ₹{((p.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shipping Address Section */}
              <div className="pt-4 border-t border-gray-200">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block mb-3">
                  DELIVERY DESTINATION
                </span>
                <div className="p-5 bg-[#FAF9F7] border border-gray-200 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shrink-0 mt-0.5">
                    <MapPinIcon size={16} />
                  </div>
                  <div className="text-xs font-body text-gray-600 leading-relaxed">
                    <p className="font-heading font-bold text-sm text-[#111111] mb-1">
                      {orderData.shippingAddress?.name || user?.name}
                    </p>
                    <p>
                      {orderData.shippingAddress?.line1}
                      {orderData.shippingAddress?.line2 && `, ${orderData.shippingAddress.line2}`}
                    </p>
                    <p>
                      {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - <span className="font-mono font-bold text-[#111111]">{orderData.shippingAddress?.pincode}</span>
                    </p>
                    <p className="mt-1 text-gray-500 font-medium">
                       Phone: {orderData.shippingAddress?.phone || 'N/A'}
                     </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <div className="bg-white border border-[#E5E2D9] p-8 text-center">
            <p className="text-xs font-body text-gray-500 uppercase tracking-widest font-bold">Order confirmation details loaded.</p>
          </div>
        )}

        {/* Next Steps White-Glove Timeline */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E5E2D9] shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] mb-4">
              <ShieldCheckIcon size={18} />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111] uppercase tracking-wider mb-2">
              1. BIS Hallmarking
            </h3>
            <p className="text-xs font-body text-gray-500 leading-relaxed">
              Your gold & silver pieces undergo laser hallmarking and purity certification.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E2D9] shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] mb-4">
              <TruckIcon size={18} />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111] uppercase tracking-wider mb-2">
              2. Insured Transit
            </h3>
            <p className="text-xs font-body text-gray-500 leading-relaxed">
              Dispatched via fully insured courier with live SMS tracking updates.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E2D9] shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] mb-4">
              <EmailIcon size={18} />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111] uppercase tracking-wider mb-2">
              3. Dispatch Receipt
            </h3>
            <p className="text-xs font-body text-gray-500 leading-relaxed">
              Electronic invoice and digital warranty certificate delivered to your email.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons Bar */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile?tab=orders')}
            className="flex-1 py-4 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-[#222222] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>View Order Portfolio</span>
            <ArrowRightIcon size={16} className="text-[#B59A6C]" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsTrackingOpen(true)}
            className="flex-1 py-4 bg-[#B59A6C] text-white text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-[#A3885C] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Track Your Order</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadInvoice}
            className="flex-1 py-4 bg-[#FAF9F7] border border-[#E5E2D9] text-[#111111] text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Download Tax Invoice (PDF)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 text-xs font-body font-bold uppercase tracking-[0.2em] hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Collections</span>
          </motion.button>
        </motion.div>

        {/* GST Tax Invoice Modal */}
        <TaxInvoiceModal 
          isOpen={isInvoiceOpen} 
          onClose={() => setIsInvoiceOpen(false)} 
          order={orderData} 
        />

        {/* Order Tracking Modal */}
        <OrderTrackingModal
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
          order={orderData}
        />

      </motion.div>
    </div>
  );
};

export default ThankYou;
