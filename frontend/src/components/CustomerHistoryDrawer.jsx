import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  Clock,
  Sparkles,
  AlertTriangle,
  Receipt,
  Download,
  Eye,
  CheckCircle2,
  RefreshCw,
  Scale
} from 'lucide-react';
import api from '../api';

/**
 * Format Indian currency with rupee symbol
 */
function formatRupees(amount) {
  const num = Number(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Format full timestamp
 */
function formatDateTime(rawDate) {
  if (!rawDate) return 'N/A';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
}

/**
 * CustomerHistoryDrawer
 * Side slide-over drawer displaying 360-degree purchase timeline,
 * lifetime bullion accumulation, past invoices, itemized ornaments, and payment ledger.
 *
 * Strictly zero emojis in code and comments.
 */
export default function CustomerHistoryDrawer({
  isOpen,
  onClose,
  phone = '',
  customer = null,
  onViewInvoice = null
}) {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState('');

  const targetPhone = phone || customer?.phone || '';

  // Fetch full patron ledger history
  const fetchCustomerHistory = async () => {
    if (!targetPhone) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/billing/customers/${encodeURIComponent(targetPhone)}/history`);
      setHistoryData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer purchase history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetPhone) {
      fetchCustomerHistory();
    } else {
      setHistoryData(null);
      setError('');
    }
  }, [isOpen, targetPhone]);

  if (!isOpen) return null;

  const patron = historyData?.customer || customer || {};
  const summary = historyData?.summary || {
    totalBills: patron.totalBillsCount || 0,
    totalSpent: patron.totalSpent || 0,
    totalPaid: patron.totalPaid || 0,
    totalOutstanding: patron.totalOutstanding || 0,
    totalGoldGrams: patron.totalGoldGramsPurchased || 0,
    totalSilverGrams: patron.totalSilverGramsPurchased || 0
  };
  const bills = historyData?.bills || [];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex justify-end bg-black/75 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-full max-w-2xl bg-[#091523] text-white border-l border-[#B59A6C]/40 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col h-full font-mono"
        >
          {/* Header */}
          <div className="p-4 bg-[#050C17] border-b border-[#1A2E47] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B59A6C] animate-pulse" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <span>Showroom Patron Dossier</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-amber-950/80 border border-amber-600/60 text-amber-300 font-bold">
                    {patron.patronTier || 'Bronze'}
                  </span>
                </h2>
                <p className="text-[10px] text-[#B59A6C]">
                  Complete Purchase Timeline, Bullion Accumulation & Ledger
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchCustomerHistory}
                disabled={loading}
                className="p-1.5 bg-[#0F2238] hover:bg-[#1A385C] rounded border border-[#1A2E47] text-slate-300 hover:text-white transition-colors"
                title="Refresh Customer Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 bg-[#0F2238] hover:bg-rose-900 rounded border border-[#1A2E47] text-slate-300 hover:text-white transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Patron Profile Card */}
            <div className="p-4 bg-[#050D18] border border-[#1A2E47] rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#B59A6C]" />
                    <span className="text-base font-bold text-slate-100">{patron.name || 'Walk-in Patron'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{patron.phone || targetPhone}</span>
                    </span>
                    {patron.panNumber && (
                      <span className="text-amber-300">
                        <span className="text-slate-400">PAN: </span>
                        {patron.panNumber}
                      </span>
                    )}
                    {patron.gstin && (
                      <span className="text-sky-300">
                        <span className="text-slate-400">GSTIN: </span>
                        {patron.gstin}
                      </span>
                    )}
                  </div>
                  {patron.address && (
                    <p className="text-[11px] text-slate-400 pt-1">{patron.address}</p>
                  )}
                </div>
              </div>

              {/* KPI Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1A2E47] text-center">
                <div className="p-2 bg-[#091523] rounded-lg border border-[#1A2E47]">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Total Lifetime Spend</span>
                  <span className="block text-sm font-bold text-emerald-400">{formatRupees(summary.totalSpent)}</span>
                </div>
                <div className="p-2 bg-[#091523] rounded-lg border border-[#1A2E47]">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Invoices Count</span>
                  <span className="block text-sm font-bold text-slate-100">{summary.totalBills} Bills</span>
                </div>
                <div className="p-2 bg-[#091523] rounded-lg border border-[#1A2E47]">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Gold Bought</span>
                  <span className="block text-sm font-bold text-amber-300">{(summary.totalGoldGrams || 0).toFixed(3)}g</span>
                </div>
                <div className="p-2 bg-[#091523] rounded-lg border border-[#1A2E47]">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Pending Dues</span>
                  <span className={`block text-sm font-bold ${summary.totalOutstanding > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {formatRupees(summary.totalOutstanding)}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="py-12 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-[#B59A6C] animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading verified customer invoice ledger from MongoDB...</p>
              </div>
            )}

            {/* Timeline of Invoices */}
            {!loading && bills.length === 0 && (
              <div className="py-12 text-center space-y-2 border border-dashed border-[#1A2E47] rounded-xl p-6">
                <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No Past Invoices Recorded</p>
                <p className="text-xs text-slate-400">
                  This is either a new customer or their previous purchases were recorded under a different phone number.
                </p>
              </div>
            )}

            {!loading && bills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-bold text-[#B59A6C] tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Purchase History Timeline ({bills.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Latest First</span>
                </div>

                <div className="space-y-3">
                  {bills.map((bill, bIdx) => {
                    const isCancelled = bill.status === 'cancelled';
                    return (
                      <div
                        key={bill._id || bill.billNumber || bIdx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCancelled
                            ? 'bg-rose-950/20 border-rose-900/50 opacity-70'
                            : 'bg-[#050D18] border-[#1A2E47] hover:border-[#B59A6C]/60'
                        }`}
                      >
                        {/* Bill Header */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#1A2E47]">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs tracking-wider">{bill.billNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isCancelled
                                  ? 'bg-rose-900 text-rose-200'
                                  : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                              }`}>
                                {isCancelled ? 'Cancelled' : (bill.paymentMethod || 'Cash').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{formatDateTime(bill.createdAt || bill.date)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-white block">
                              {formatRupees(bill.totalPayable)}
                            </span>
                            {bill.balanceRemaining > 0 && (
                              <span className="text-[9px] text-rose-400 font-bold block">
                                Due: {formatRupees(bill.balanceRemaining)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Itemized List */}
                        <div className="pt-2 space-y-1.5">
                          {(bill.items || []).map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded bg-[#091523]/80 border border-[#142336]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-7 h-7 rounded object-cover border border-[#1A2E47] shrink-0"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded bg-[#050C17] border border-[#1A2E47] flex items-center justify-center text-slate-500 shrink-0">
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-200 block truncate">{item.name}</span>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span>{item.karat ? `${item.karat}K ` : ''}{item.material || 'Gold'}</span>
                                    <span>Wt: {item.netWeight || item.weight || 0}g</span>
                                    {item.huid && <span className="text-amber-400 font-mono">HUID: {item.huid}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-slate-200 text-xs">
                                  {formatRupees(item.totalPrice || item.subtotal)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bill Actions */}
                        {onViewInvoice && (
                          <div className="mt-2.5 pt-2 border-t border-[#142336] flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                onViewInvoice(bill);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-[#0F2238] hover:bg-[#1C3E69] text-[#B59A6C] rounded text-[10px] font-bold border border-[#1A2E47] flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View / Reprint Bill</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#050C17] border-t border-[#1A2E47] flex items-center justify-between text-xs text-slate-400">
            <span>Official Monika Jewellers CRM Ledger</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0F2238] hover:bg-slate-700 text-slate-200 rounded font-bold"
            >
              Close Dossier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
