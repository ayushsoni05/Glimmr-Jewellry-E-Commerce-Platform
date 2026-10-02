import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Send, MessageCircle, FileText, CheckCircle } from 'lucide-react';

const RecordPaymentDrawer = ({ bill, onClose, onPaymentRecorded, api }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState(null);

  if (!bill) return null;

  const balanceDue = bill.balanceRemaining || (bill.totalPayable - bill.amountPaid);

  const handlePayFullBalance = () => {
    setAmount(balanceDue.toString());
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    
    if (numAmount > balanceDue) {
      setError(`Amount cannot exceed balance due (Rs.${balanceDue.toLocaleString('en-IN')}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        amount: numAmount,
        method,
        reference,
        note,
        operator: 'Owner',
        date: new Date().toISOString()
      };

      if (api) {
        // Attempt API call if api prop is provided
        await api.patch(`/billing/${bill._id || bill.id}/payment`, paymentData);
      }

      const updatedBill = {
        ...bill,
        amountPaid: (bill.amountPaid || 0) + numAmount,
        balanceRemaining: balanceDue - numAmount,
        paymentEntries: [...(bill.paymentEntries || []), paymentData]
      };

      setNewPaymentData(paymentData);
      setSuccess(true);
      
      if (onPaymentRecorded) {
        onPaymentRecorded(updatedBill, paymentData);
      }

    } catch (err) {
      console.error('Payment recording failed:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReceipt = () => {
    if (!newPaymentData) return;
    
    const newTotalPaid = (bill.amountPaid || 0) + newPaymentData.amount;
    const newBalance = balanceDue - newPaymentData.amount;
    const dateStr = new Date(newPaymentData.date).toLocaleDateString('en-IN');
    
    const message = `*MONIKA JEWELLERS*
Payment Received - Thank You!

Bill: ${bill.billNumber}
Customer: ${bill.customer?.name || 'Customer'}

Payment Received: Rs.${newPaymentData.amount.toLocaleString('en-IN')} (${newPaymentData.method})
Date: ${dateStr}

Total Paid So Far: Rs.${newTotalPaid.toLocaleString('en-IN')}
*Remaining Balance: Rs.${newBalance.toLocaleString('en-IN')}*

Thank you, Monika Jewellers.`;

    const encodedMessage = encodeURIComponent(message);
    const phone = bill.customer?.phone || '';
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const handleSendReminder = () => {
    const dateStr = new Date(bill.date || Date.now()).toLocaleDateString('en-IN');
    const message = `*MONIKA JEWELLERS*
Payment Reminder

Dear ${bill.customer?.name || 'Customer'},

This is a gentle reminder that your balance of *Rs.${balanceDue.toLocaleString('en-IN')}* for Bill ${bill.billNumber} (dated ${dateStr}) is pending.

Total Bill: Rs.${bill.totalPayable.toLocaleString('en-IN')}
Paid: Rs.${(bill.amountPaid || 0).toLocaleString('en-IN')}
*Balance: Rs.${balanceDue.toLocaleString('en-IN')}*

Please visit our store or contact us to arrange payment.

Monika Jewellers`;

    const encodedMessage = encodeURIComponent(message);
    const phone = bill.customer?.phone || '';
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#FAF9F7] px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-heading text-[#222222]">Record Payment</h2>
              <p className="text-sm font-body text-gray-500">Bill #{bill.billNumber}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-[#222222] hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 font-body">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-heading text-[#222222] mb-2">Payment Recorded</h3>
                <p className="text-gray-600 mb-8">Successfully recorded Rs.{newPaymentData?.amount.toLocaleString('en-IN')} via {newPaymentData?.method}.</p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSendReceipt}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-4 rounded font-medium hover:bg-[#128C7E] transition-colors"
                  >
                    <MessageCircle size={18} />
                    Send WhatsApp Receipt
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded font-medium border border-gray-300 text-[#222222] hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-[#FAF9F7] border border-[#B59A6C]/20 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium text-[#222222]">{bill.customer?.name || 'Walk-in Customer'}</p>
                      <p className="text-sm text-gray-500">{bill.customer?.phone || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Bill</p>
                      <p className="font-mono text-[#222222]">Rs.{bill.totalPayable?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-200 pt-2">
                    <div>
                      <p className="text-sm text-gray-500">Previously Paid</p>
                      <p className="font-mono text-gray-600">Rs.{(bill.amountPaid || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#B59A6C] font-medium">Balance Due</p>
                      <p className="font-mono text-xl text-[#B59A6C] font-bold">Rs.{balanceDue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Reminder Button */}
                {balanceDue > 0 && (
                  <button
                    onClick={handleSendReminder}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-[#25D366] text-[#25D366] py-2 px-4 rounded font-medium hover:bg-[#25D366] hover:text-white transition-colors mb-6"
                  >
                    <MessageCircle size={18} />
                    Send Payment Reminder
                  </button>
                )}

                {/* Payment History */}
                {bill.paymentEntries && bill.paymentEntries.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-heading text-lg text-[#222222] mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-[#B59A6C]" />
                      Payment History
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#FAF9F7] text-gray-600 text-left">
                          <tr>
                            <th className="py-2 px-3 font-medium">Date</th>
                            <th className="py-2 px-3 font-medium">Method</th>
                            <th className="py-2 px-3 font-medium text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bill.paymentEntries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2 px-3 text-gray-600">
                                {new Date(entry.date).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {entry.method} {entry.reference && <span className="text-xs text-gray-400">({entry.reference})</span>}
                              </td>
                              <td className="py-2 px-3 text-[#222222] font-mono text-right">
                                Rs.{entry.amount.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment Form */}
                {balanceDue > 0 && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-heading text-lg text-[#222222] mb-2 flex items-center gap-2">
                      <CreditCard size={18} className="text-[#B59A6C]" />
                      New Payment
                    </h3>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">Amount (Rs.)</label>
                        <button
                          type="button"
                          onClick={handlePayFullBalance}
                          className="text-xs text-[#B59A6C] hover:underline focus:outline-none"
                        >
                          Pay Full Balance
                        </button>
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#B59A6C] font-mono"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={balanceDue}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                        <select
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#B59A6C]"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#B59A6C]"
                          placeholder="Txn ID, Cheque No."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#B59A6C]"
                        placeholder="Optional note"
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

                    <div className="pt-4 mt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isSubmitting || balanceDue <= 0}
                        className="w-full bg-[#222222] text-white py-3 px-4 rounded font-medium hover:bg-[#B59A6C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? 'Recording...' : 'Record Payment'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecordPaymentDrawer;
