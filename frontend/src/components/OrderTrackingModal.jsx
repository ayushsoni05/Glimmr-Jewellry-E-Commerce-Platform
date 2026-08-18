import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, Truck, Package, ShieldCheck, Gem } from 'lucide-react';

const TRACKING_STAGES = [
  { key: 'pending', label: 'Order Placed', description: 'Your order has been received and registered.' },
  { key: 'confirmed', label: 'Order Confirmed', description: 'Payment verified and order confirmed.' },
  { key: 'processing', label: 'Artisan Crafting', description: 'Master jewelers are preparing your piece.' },
  { key: 'hallmarking', label: 'BIS Hallmarking', description: 'Purity certification and laser hallmarking.' },
  { key: 'shipped', label: 'Shipped', description: 'Dispatched via insured courier.' },
  { key: 'delivered', label: 'Delivered', description: 'Successfully delivered to your address.' },
];

const STATUS_RANK = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  hallmarking: 3,
  shipped: 4,
  delivered: 5,
};

const STAGE_ICONS = {
  pending: Package,
  confirmed: Check,
  processing: Gem,
  hallmarking: ShieldCheck,
  shipped: Truck,
  delivered: Check,
};

const OrderTrackingModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const currentStatus = order.orderStatus || order.status || 'pending';
  const currentRank = STATUS_RANK[currentStatus] ?? 0;

  // Build timeline from statusHistory if available, otherwise from current status
  const statusHistory = order.statusHistory || [];
  const getTimestamp = (stageKey) => {
    const entry = statusHistory.find(
      (h) => h.status === stageKey || h.status?.toLowerCase() === stageKey
    );
    if (entry?.timestamp || entry?.date || entry?.updatedAt) {
      const d = new Date(entry.timestamp || entry.date || entry.updatedAt);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return null;
  };

  const orderId = order._id || order.orderId || order.id || '';
  const shortId = orderId ? orderId.slice(-8).toUpperCase() : 'N/A';

  // Estimated delivery (7 days from order date if not shipped/delivered)
  const orderDate = new Date(order.createdAt || Date.now());
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg bg-white border border-[#E5E2D9] shadow-[0_30px_80px_rgba(0,0,0,0.12)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gold Top Accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#B59A6C] via-[#111111] to-[#B59A6C]" />

          {/* Header */}
          <div className="p-6 pb-4 border-b border-[#E5E2D9]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                  ORDER TRACKING
                </span>
                <h2 className="text-xl font-heading font-extrabold text-[#111111]">
                  Order #{shortId}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#FAF9F7] border border-[#E5E2D9] flex items-center justify-center text-gray-400 hover:text-[#111111] hover:border-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`px-3 py-1 text-[10px] font-body font-bold uppercase tracking-widest border ${
                  currentStatus === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentStatus === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : currentStatus === 'shipped'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {currentStatus.toUpperCase()}
              </span>
              {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <span className="text-[10px] font-body text-gray-400 uppercase tracking-wider">
                  Est. delivery:{' '}
                  {estimatedDelivery.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="relative">
              {TRACKING_STAGES.map((stage, idx) => {
                const stageRank = STATUS_RANK[stage.key];
                const isCompleted = stageRank <= currentRank;
                const isCurrent = stageRank === currentRank;
                const isPending = stageRank > currentRank;
                const timestamp = getTimestamp(stage.key);
                const isLast = idx === TRACKING_STAGES.length - 1;
                const IconComponent = STAGE_ICONS[stage.key] || Package;

                return (
                  <div key={stage.key} className="flex gap-4">
                    {/* Timeline Column */}
                    <div className="flex flex-col items-center">
                      {/* Node */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-[#B59A6C] text-white shadow-[0_4px_16px_rgba(181,154,108,0.4)]'
                            : isCompleted
                            ? 'bg-[#B59A6C] text-white'
                            : 'bg-[#FAF9F7] border-2 border-[#E5E2D9] text-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      {/* Connector Line */}
                      {!isLast && (
                        <div
                          className={`w-[2px] flex-1 min-h-[32px] my-1 ${
                            isCompleted && stageRank < currentRank
                              ? 'bg-[#B59A6C]'
                              : 'bg-[#E5E2D9]'
                          } ${isPending ? 'border-l border-dashed border-[#E5E2D9] w-0' : ''}`}
                        />
                      )}
                    </div>

                    {/* Content Column */}
                    <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                      <h4
                        className={`text-sm font-heading font-bold ${
                          isCompleted ? 'text-[#111111]' : 'text-gray-400'
                        }`}
                      >
                        {stage.label}
                      </h4>
                      <p
                        className={`text-xs font-body mt-0.5 leading-relaxed ${
                          isCompleted ? 'text-gray-500' : 'text-gray-300'
                        }`}
                      >
                        {stage.description}
                      </p>
                      {timestamp && (
                        <span className="text-[10px] font-mono text-[#B59A6C] mt-1 block">
                          {timestamp}
                        </span>
                      )}
                      {isCurrent && !timestamp && (
                        <span className="text-[10px] font-body font-bold text-[#B59A6C] uppercase tracking-wider mt-1 block">
                          In Progress
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-body text-gray-300 uppercase tracking-wider mt-1 block">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-[#E5E2D9] bg-[#FAF9F7]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-body text-gray-400">
                <span className="block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                  Order placed on
                </span>
                <span className="font-mono text-[#111111]">
                  {orderDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#111111] text-[#FAF9F7] text-[10px] font-body font-bold uppercase tracking-[0.2em] hover:bg-[#222222] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderTrackingModal;
