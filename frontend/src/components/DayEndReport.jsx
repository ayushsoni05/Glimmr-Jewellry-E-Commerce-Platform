import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSavedBills } from '../utils/billingStorage';
import { downloadGSTR1, generateHSNSummary } from '../utils/gstrExport';

const DayEndReport = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const allBills = useMemo(() => getSavedBills(), [isOpen]);

  const dayBills = useMemo(() => {
    return allBills.filter(b => {
      const billDate = new Date(b.date).toISOString().split('T')[0];
      return billDate === selectedDate;
    });
  }, [allBills, selectedDate]);

  const monthBills = useMemo(() => {
    return allBills.filter(b => {
      const d = new Date(b.date);
      const billMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return billMonth === selectedMonth;
    });
  }, [allBills, selectedMonth]);

  const computeStats = (bills) => {
    const totalRevenue = bills.reduce((sum, b) => sum + (b.totalPayable || 0), 0);
    const totalMetal = bills.reduce((sum, b) => sum + (b.totalMetal || 0), 0);
    const totalMaking = bills.reduce((sum, b) => sum + (b.totalMaking || 0), 0);
    const totalDiamond = bills.reduce((sum, b) => sum + (b.totalDiamond || 0), 0);
    const totalGst = bills.reduce((sum, b) => sum + (b.totalGst || 0), 0);
    const totalDiscount = bills.reduce((sum, b) => sum + (b.discountAmount || 0), 0);
    const totalOldGold = bills.reduce((sum, b) => sum + (b.oldGoldDeduction || 0), 0);
    const totalItems = bills.reduce((sum, b) => sum + (b.items || []).reduce((is, i) => is + (i.quantity || 1), 0), 0);

    // Payment method breakdown
    const paymentBreakdown = { cash: 0, card: 0, upi: 0, mixed: 0 };
    bills.forEach(b => {
      const method = b.paymentMethod || 'cash';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + (b.totalPayable || 0);
    });

    // Category breakdown
    const categoryBreakdown = {};
    bills.forEach(b => {
      (b.items || []).forEach(item => {
        const cat = (item.material || 'gold').charAt(0).toUpperCase() + (item.material || 'gold').slice(1);
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, revenue: 0 };
        categoryBreakdown[cat].count += item.quantity || 1;
        categoryBreakdown[cat].revenue += (item.totalPrice || 0) * (item.quantity || 1);
      });
    });

    return {
      billCount: bills.length,
      totalRevenue,
      totalMetal,
      totalMaking,
      totalDiamond,
      totalGst,
      totalDiscount,
      totalOldGold,
      totalItems,
      paymentBreakdown,
      categoryBreakdown,
      avgTicketSize: bills.length > 0 ? Math.round(totalRevenue / bills.length) : 0
    };
  };

  const dayStats = useMemo(() => computeStats(dayBills), [dayBills]);
  const monthStats = useMemo(() => computeStats(monthBills), [monthBills]);

  const handleExportGSTR1 = () => {
    downloadGSTR1(monthBills, selectedMonth);
  };

  const hsnSummary = useMemo(() => generateHSNSummary(monthBills), [monthBills]);

  if (!isOpen) return null;

  const StatRow = ({ label, value, highlight, sub }) => (
    <div className={`flex justify-between items-center py-1.5 ${sub ? 'pl-3 text-[10px]' : 'text-xs'}`}>
      <span className={`font-body ${sub ? 'text-gray-500' : 'text-gray-700'}`}>{label}</span>
      <span className={`font-mono font-bold ${highlight ? 'text-[#B59A6C]' : sub ? 'text-gray-600' : 'text-[#111111]'}`}>
        Rs.{Number(value || 0).toLocaleString('en-IN')}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-2xl bg-white border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.2)] my-auto max-h-[95vh] overflow-y-auto"
        >
          <div className="h-1 bg-[#B59A6C] w-full" />
          <div className="p-6 sm:p-8 space-y-6">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-body font-bold text-[#B59A6C] uppercase tracking-[0.15em] block">Glimmr Atelier POS</span>
                <h2 className="font-heading text-xl font-bold text-[#111111] tracking-wider">Day-End Z-Report</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#111111] transition-colors cursor-pointer text-lg font-bold"
              >
                X
              </button>
            </div>

            {/* Date Selector */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-[8px] font-mono text-gray-500 uppercase mb-1">Daily Report Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[8px] font-mono text-gray-500 uppercase mb-1">Monthly Period</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F7] border border-gray-200 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>
            </div>

            {/* DAILY Z-REPORT */}
            <div className="border border-gray-200 bg-[#FAF9F7] p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-[9px] font-body font-bold uppercase tracking-widest text-[#B59A6C]">Daily Summary</span>
                <span className="text-[10px] font-mono font-bold text-gray-600">{dayStats.billCount} Bill{dayStats.billCount !== 1 ? 's' : ''} | {dayStats.totalItems} Pieces</span>
              </div>
              <StatRow label="Total Revenue" value={dayStats.totalRevenue} highlight />
              <StatRow label="Metal Value" value={dayStats.totalMetal} sub />
              <StatRow label="Making Charges" value={dayStats.totalMaking} sub />
              {dayStats.totalDiamond > 0 && <StatRow label="Diamond / Gemstones" value={dayStats.totalDiamond} sub />}
              <StatRow label="GST Collected" value={dayStats.totalGst} sub />
              {dayStats.totalDiscount > 0 && <StatRow label="Discounts Given" value={dayStats.totalDiscount} sub />}
              {dayStats.totalOldGold > 0 && <StatRow label="Old Gold Exchange" value={dayStats.totalOldGold} sub />}
              <div className="border-t border-gray-200 pt-2">
                <StatRow label="Avg. Ticket Size" value={dayStats.avgTicketSize} />
              </div>

              {/* Payment Breakdown */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Payment Mode Breakdown</span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(dayStats.paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="bg-white p-2 border border-gray-200 text-center">
                      <span className="text-[8px] font-mono uppercase text-gray-500 block">{method}</span>
                      <span className="text-[11px] font-mono font-bold text-[#111111] block">Rs.{Number(amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              {Object.keys(dayStats.categoryBreakdown).length > 0 && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Metal Category Breakdown</span>
                  {Object.entries(dayStats.categoryBreakdown).map(([cat, data]) => (
                    <div key={cat} className="flex justify-between text-[10px] py-0.5">
                      <span className="font-body text-gray-700">{cat} ({data.count} pcs)</span>
                      <span className="font-mono font-bold text-[#111111]">Rs.{Number(data.revenue).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MONTHLY SUMMARY */}
            <div className="border border-gray-200 p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-[9px] font-body font-bold uppercase tracking-widest text-gray-700">Monthly Summary ({selectedMonth})</span>
                <span className="text-[10px] font-mono font-bold text-gray-600">{monthStats.billCount} Bills</span>
              </div>
              <StatRow label="Monthly Revenue" value={monthStats.totalRevenue} highlight />
              <StatRow label="Monthly GST" value={monthStats.totalGst} />
              <StatRow label="Monthly Discounts" value={monthStats.totalDiscount} />
              <StatRow label="Avg. Ticket Size" value={monthStats.avgTicketSize} />
            </div>

            {/* HSN Summary for GSTR-1 */}
            {hsnSummary.length > 0 && (
              <div className="border border-gray-200 p-4">
                <span className="text-[9px] font-body font-bold uppercase tracking-widest text-gray-700 block mb-2">HSN Summary (For GSTR-1)</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-mono">
                    <thead>
                      <tr className="bg-[#111111] text-white">
                        <th className="py-1.5 px-2 text-left">HSN</th>
                        <th className="py-1.5 px-2 text-left">Description</th>
                        <th className="py-1.5 px-2 text-center">Qty</th>
                        <th className="py-1.5 px-2 text-right">Taxable</th>
                        <th className="py-1.5 px-2 text-right">CGST</th>
                        <th className="py-1.5 px-2 text-right">SGST</th>
                        <th className="py-1.5 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hsnSummary.map(row => (
                        <tr key={row.hsnCode} className="border-b border-gray-100">
                          <td className="py-1.5 px-2 font-bold">{row.hsnCode}</td>
                          <td className="py-1.5 px-2 text-gray-600 text-[9px]">{row.description}</td>
                          <td className="py-1.5 px-2 text-center">{row.totalQuantity}</td>
                          <td className="py-1.5 px-2 text-right">Rs.{row.totalTaxableValue.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2 text-right">Rs.{row.cgst.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2 text-right">Rs.{row.sgst.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2 text-right font-bold">Rs.{row.totalInvoiceValue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={handleExportGSTR1}
                disabled={monthBills.length === 0}
                className="flex-1 py-3 bg-[#222222] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Export GSTR-1 CSV ({selectedMonth})
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-600 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#FAF9F7] transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DayEndReport;
