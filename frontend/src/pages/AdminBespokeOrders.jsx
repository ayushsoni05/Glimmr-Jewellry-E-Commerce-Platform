import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const AdminBespokeOrders = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  // Approval Form State
  const [completionDate, setCompletionDate] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchCustomOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/custom-orders');
      if (res.data.success) {
        setCustomOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error loading custom orders:', err);
      toastError('Failed loading bespoke ring requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, date = null, note = '') => {
    setUpdating(true);
    try {
      const res = await axios.patch(`/api/custom-orders/${orderId}/status`, {
        status: newStatus,
        estimatedCompletionDate: date,
        adminNotes: note,
        notifyCustomer: true,
      });

      if (res.data.success) {
        success(`Status updated to ${newStatus}. Customer email dispatched!`);
        fetchCustomOrders();
        setApprovalModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toastError('Failed updating order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = customOrders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case 'pending_approval':
        return <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase">Pending Approval</span>;
      case 'approved':
        return <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 uppercase">Approved</span>;
      case 'in_production':
        return <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 uppercase">In Production</span>;
      case 'completed':
        return <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">Completed</span>;
      case 'rejected':
        return <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 uppercase">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading text-[#222222]">Bespoke 3D Ring Requests</h2>
          <p className="text-xs font-body text-[#808080] mt-1">
            Review custom 3D creations, contact customers directly, and set estimated crafting completion times.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending_approval', 'approved', 'in_production', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                filter === f ? 'bg-[#222222] text-white' : 'bg-white border border-gray-200 text-[#808080] hover:text-[#222222]'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm font-mono text-[#808080]">Loading bespoke requests...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 bg-[#FAF9F7] rounded-[20px] text-center border border-gray-100">
          <p className="text-sm font-body text-[#808080]">No bespoke requests found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[20px] p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-6 justify-between items-start"
            >
              {/* Left Column: Customer & Contact Info */}
              <div className="space-y-3 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 pb-4 lg:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#B59A6C]">
                    {order.customOrderId}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                <div>
                  <h3 className="text-lg font-heading text-[#222222] font-bold">{order.customerName}</h3>
                  <p className="text-xs text-[#808080] font-body">{order.customerEmail}</p>
                  <p className="text-xs font-mono text-[#222222] mt-0.5">{order.customerPhone}</p>
                </div>

                <div className="text-[11px] font-body text-[#808080] bg-[#FAF9F7] p-3 rounded-[12px] space-y-1">
                  <div><strong>Preferred Contact:</strong> {order.preferredContactMethod?.toUpperCase()}</div>
                  {order.notes && <div><strong>Customer Note:</strong> "{order.notes}"</div>}
                  <div><strong>Submitted:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                </div>

                {/* Contact Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex-1 text-center py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-mono font-bold rounded-[8px] transition-colors"
                  >
                    📞 Call Customer
                  </a>
                  <a
                    href={`mailto:${order.customerEmail}?subject=Regarding Your Glimmr Bespoke Ring Request (${order.customOrderId})`}
                    className="flex-1 text-center py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-mono font-bold rounded-[8px] transition-colors"
                  >
                    ✉️ Email Customer
                  </a>
                </div>
              </div>

              {/* Middle Column: Full Ring Specifications */}
              <div className="space-y-2 lg:w-1/3 text-xs font-body text-[#808080]">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] block">
                  FULL RING SPECIFICATIONS
                </span>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Precious Metal</span>
                  <strong className="text-[#222222]">{order.metal?.name} ({order.metal?.weightGrams}g)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Band Profile</span>
                  <strong className="text-[#222222]">{order.bandProfile?.name || 'Comfort Fit'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Band Width</span>
                  <strong className="text-[#222222]">{order.bandWidthMm || 4}mm</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Band Pattern</span>
                  <strong className="text-[#222222]">{order.bandPattern?.name || 'Plain Polished'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Surface Finish</span>
                  <strong className="text-[#222222]">{order.bandFinish?.name || 'High Polish'}</strong>
                </div>
                {order.twoToneMetal && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Two-Tone Inner</span>
                    <strong className="text-[#222222]">{order.twoToneMetal.name}</strong>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Gemstone & Cut</span>
                  <strong className="text-[#222222]">{order.gemstone?.name} ({order.caratWeight}ct {order.cut?.name})</strong>
                </div>
                {order.diamondGrading?.color && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Diamond 4C Grade</span>
                    <strong className="text-[#222222]">{order.diamondGrading.color} / {order.diamondGrading.clarity} / {order.diamondGrading.cutGrade}</strong>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Setting Style</span>
                  <strong className="text-[#222222]">{order.settingStyle?.name || 'Classic Prong'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Side Stones</span>
                  <strong className="text-[#222222]">{order.sideStones?.name || 'None'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>3D Art Motif</span>
                  <strong className="text-[#222222]">{order.personalization?.artEmblemName || 'None'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Laser Inscription</span>
                  <strong className="text-[#222222] italic">"{order.personalization?.engravingText || 'None'}"</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Ring Size</span>
                  <strong className="text-[#222222]">US {order.personalization?.ringSize}</strong>
                </div>

                {/* Reference Images */}
                {order.referenceImages && order.referenceImages.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono font-bold text-[#B59A6C] block mb-2">REFERENCE IMAGES:</span>
                    <div className="flex gap-2">
                      {order.referenceImages.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-[8px] overflow-hidden border border-gray-200 hover:border-[#B59A6C] transition-colors">
                          <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {order.estimatedCompletionDate && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-[12px] border border-amber-200/60 text-amber-900">
                    <span className="text-[10px] font-mono font-bold block">ASSIGNED COMPLETION DATE:</span>
                    <strong className="text-sm">
                      {new Date(order.estimatedCompletionDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </strong>
                    {order.adminNotes && <p className="text-[11px] font-body mt-1 italic">"{order.adminNotes}"</p>}
                  </div>
                )}
              </div>

              {/* Right Column: Pricing Valuation & Actions */}
              <div className="space-y-4 lg:w-1/4 flex flex-col justify-between self-stretch">
                <div className="bg-[#FAF9F7] p-4 rounded-[16px] text-right border border-gray-100">
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#808080] block">
                    Bespoke Valuation
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#222222]">
                    ₹{(order.pricing?.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Status Update Action Controls */}
                <div className="space-y-2">
                  {order.status === 'pending_approval' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setApprovalModalOpen(true);
                      }}
                      className="w-full py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#B59A6C] transition-colors rounded-none cursor-pointer"
                    >
                      Approve & Set Time
                    </button>
                  )}

                  {order.status !== 'pending_approval' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'in_production')}
                        className="flex-1 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px] font-mono font-bold rounded-[8px] transition-colors"
                      >
                        In Production
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'completed')}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-mono font-bold rounded-[8px] transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  )}

                  {order.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'rejected')}
                      className="w-full py-2 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 text-[10px] font-mono font-bold rounded-[8px] transition-colors cursor-pointer"
                    >
                      Reject Request
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Approval & Time Assignment Modal */}
      <AnimatePresence>
        {approvalModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] p-8 max-w-lg w-full shadow-2xl border border-gray-100"
            >
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#B59A6C] block mb-1">
                MASTER GOLDSMITH APPROVAL
              </span>
              <h3 className="text-2xl font-heading text-[#222222] mb-2">
                Approve Request ({selectedOrder.customOrderId})
              </h3>
              <p className="font-body text-xs text-[#808080] mb-6">
                Assign an estimated completion date and custom note. The customer will automatically receive an approval email notification.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateStatus(selectedOrder._id, 'approved', completionDate, adminNote);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-body font-bold text-[#222222] mb-1.5 block">
                    Estimated Completion & Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-[12px] text-sm font-mono text-[#222222]"
                  />
                </div>

                <div>
                  <label className="text-xs font-body font-bold text-[#222222] mb-1.5 block">
                    Message / Note to Customer
                  </label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Your 24K Gold Solitaire Ring has entered crafting. Our client advisor will phone you 2 days prior to delivery."
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-[12px] text-xs font-body text-[#222222]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-3 bg-[#222222] text-white font-body text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] transition-colors rounded-none cursor-pointer"
                  >
                    {updating ? 'Approving & Emailing...' : 'Approve & Send Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalModalOpen(false);
                      setSelectedOrder(null);
                    }}
                    className="px-5 py-3 bg-[#FAF9F7] text-[#222222] font-body text-xs font-bold uppercase tracking-[0.15em] border border-gray-200 hover:bg-gray-100 transition-colors rounded-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBespokeOrders;
