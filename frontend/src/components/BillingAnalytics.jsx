import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, FileText, CreditCard, AlertTriangle, Users, Download, Send, ChevronDown, Filter, DollarSign, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { downloadGSTR1 } from '../utils/gstrExport';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);
if (ChartJS.defaults && ChartJS.defaults.font) {
  ChartJS.defaults.font.family = '"Playfair Display", Georgia, serif';
}

export default function BillingAnalytics({ api }) {
  // State
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'gst' | 'payments' | 'metals' | 'customers' | 'pending'
  const [fyYear, setFyYear] = useState(() => { const now = new Date(); return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; });
  const [selectedQuarter, setSelectedQuarter] = useState('all'); // 'all' | 'q1' | 'q2' | 'q3' | 'q4'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [periodStats, setPeriodStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [gstSummary, setGstSummary] = useState(null);
  const [paymentModes, setPaymentModes] = useState([]);
  const [metalCategories, setMetalCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [outstandingStats, setOutstandingStats] = useState(null);
  const [pendingBills, setPendingBills] = useState([]);
  const [todayStats, setTodayStats] = useState(null);

  // Payment recording
  const [recordingPayment, setRecordingPayment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');

  // Date Range Computation
  const dateRange = useMemo(() => {
    if (customFrom && customTo) return { from: customFrom, to: customTo };
    const startYear = fyYear;
    const endYear = fyYear + 1;
    switch (selectedQuarter) {
      case 'q1': return { from: `${startYear}-04-01`, to: `${startYear}-06-30` };
      case 'q2': return { from: `${startYear}-07-01`, to: `${startYear}-09-30` };
      case 'q3': return { from: `${startYear}-10-01`, to: `${startYear}-12-31` };
      case 'q4': return { from: `${endYear}-01-01`, to: `${endYear}-03-31` };
      default: return { from: `${startYear}-04-01`, to: `${endYear}-03-31` };
    }
  }, [fyYear, selectedQuarter, customFrom, customTo]);

  // Data Fetching
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { from, to } = dateRange;
      const fyString = `${fyYear}-${(fyYear + 1).toString().slice(2)}`;
      
      const [
        periodRes,
        monthlyRes,
        gstRes,
        paymentRes,
        metalRes,
        customersRes,
        outstandingRes,
        pendingRes,
        todayRes
      ] = await Promise.all([
        api.get(`/api/billing/stats/period?from=${from}&to=${to}`).catch(() => ({ data: {} })),
        api.get(`/api/billing/stats/monthly?fy=${fyString}`).catch(() => ({ data: {} })),
        api.get(`/api/billing/stats/gst-summary?from=${from}&to=${to}`).catch(() => ({ data: {} })),
        api.get(`/api/billing/stats/payment-modes?from=${from}&to=${to}`).catch(() => ({ data: [] })),
        api.get(`/api/billing/stats/metal-categories?from=${from}&to=${to}`).catch(() => ({ data: [] })),
        api.get(`/api/billing/stats/top-customers?from=${from}&to=${to}&limit=20`).catch(() => ({ data: [] })),
        api.get(`/api/billing/stats/outstanding`).catch(() => ({ data: {} })),
        api.get(`/api/billing/pending`).catch(() => ({ data: { bills: [], count: 0 } })),
        api.get(`/api/billing/stats/today`).catch(() => ({ data: {} }))
      ]);

      setPeriodStats(periodRes.data);
      setMonthlyData(monthlyRes.data);
      setGstSummary(gstRes.data);
      setPaymentModes(paymentRes.data);
      setMetalCategories(metalRes.data);
      setTopCustomers(customersRes.data);
      setOutstandingStats(outstandingRes.data);
      setPendingBills(pendingRes.data.bills || []);
      setTodayStats(todayRes.data);
    } catch (error) {
      console.error("Failed to fetch analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [dateRange, fyYear]);

  // Formatting helpers
  const formatMoney = (val) => `Rs.${Number(val || 0).toLocaleString('en-IN')}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  // Handlers
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/billing/${recordingPayment}/payment`, {
        amount: Number(payAmount),
        method: payMethod,
        reference: payRef,
        note: payNote,
        operator: 'Admin'
      });
      setRecordingPayment(null);
      setPayAmount('');
      setPayRef('');
      setPayNote('');
      fetchAllData();
    } catch (err) {
      console.error("Payment recording failed", err);
      alert("Failed to record payment");
    }
  };

  const handleSendReminder = async (bill) => {
    try {
      await api.patch(`/api/billing/${bill._id}/reminder`, { operator: 'Admin' });
      const msg = `Dear ${bill.customerName}, this is a gentle reminder regarding your outstanding bill of ${formatMoney(bill.balance)} at MONIKA JEWELLERS.`;
      const url = `https://wa.me/91${bill.customerPhone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      fetchAllData();
    } catch (err) {
      console.error("Failed to send reminder", err);
    }
  };

  const handleExportGSTR = () => {
    if (typeof downloadGSTR1 === 'function') {
      downloadGSTR1(dateRange.from, dateRange.to);
    } else {
      alert("GSTR Export function not available");
    }
  };

  // Shared classes
  const cardClass = "bg-white border border-gray-100 shadow-sm p-6";
  const headerClass = "font-heading text-[#222222] tracking-wider uppercase mb-4";
  const tableHeaderClass = "text-left text-xs font-heading tracking-wider uppercase text-gray-500 pb-3 border-b border-gray-100";
  const tableCellClass = "py-3 text-sm font-heading border-b border-gray-50";

  const renderOverview = () => {
    const chartData = {
      labels: monthlyData?.months?.map(m => m.label) || [],
      datasets: [
        {
          type: 'bar',
          label: 'Revenue',
          data: monthlyData?.months?.map(m => m.revenue) || [],
          backgroundColor: '#B59A6C',
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Bill Count',
          data: monthlyData?.months?.map(m => m.billCount) || [],
          borderColor: '#222222',
          backgroundColor: '#222222',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Total Revenue</div>
            <div className="font-heading text-2xl font-bold text-[#222222]">{formatMoney(periodStats?.totalRevenue)}</div>
          </div>
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Total Bills</div>
            <div className="font-heading text-2xl font-bold text-[#222222]">{periodStats?.billCount || 0}</div>
          </div>
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">GST Collected</div>
            <div className="font-heading text-2xl font-bold text-[#222222]">{formatMoney(periodStats?.totalGst)}</div>
          </div>
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Avg Ticket Size</div>
            <div className="font-heading text-2xl font-bold text-[#222222]">{formatMoney(periodStats?.avgBillValue)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${cardClass}`}>
            <h3 className={headerClass}>Monthly Performance</h3>
            <div className="h-80">
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: { type: 'linear', position: 'left', title: { display: true, text: 'Revenue' } },
                    y1: { type: 'linear', position: 'right', title: { display: true, text: 'Bills' }, grid: { drawOnChartArea: false } }
                  }
                }} 
              />
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={headerClass}>Today's Snapshot</h3>
            <div className="space-y-4 font-heading">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Revenue</span>
                <span className="font-heading font-bold text-[#222222]">{formatMoney(todayStats?.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bills Generated</span>
                <span className="font-heading font-bold text-[#222222]">{todayStats?.billCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Avg Ticket</span>
                <span className="font-heading font-bold text-[#222222]">{formatMoney(todayStats?.avgBillValue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Top Payment</span>
                <span className="font-heading font-bold text-[#222222] uppercase">{todayStats?.topPaymentMethod || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">GST Collected</span>
                <span className="font-heading font-bold text-[#222222]">{formatMoney(todayStats?.totalGstCollected)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGst = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-heading text-xl text-[#222222] uppercase tracking-wider">GST Analysis</h2>
          <button 
            onClick={handleExportGSTR}
            className="flex items-center space-x-2 bg-[#222222] text-white px-4 py-2 font-heading uppercase text-sm hover:bg-[#B59A6C] transition-colors"
          >
            <Download size={16} />
            <span>Export GSTR-1</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={cardClass}>
            <h3 className={headerClass}>B2B vs B2C Split</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="text-sm font-heading uppercase text-gray-500">B2B Sales</div>
                  <div className="text-lg font-heading font-bold text-[#222222]">{formatMoney(gstSummary?.b2b?.value)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-heading">{gstSummary?.b2b?.count || 0} Bills</div>
                  <div className="text-sm font-heading text-[#B59A6C]">GST: {formatMoney(gstSummary?.b2b?.gst)}</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="text-sm font-heading uppercase text-gray-500">B2C Sales</div>
                  <div className="text-lg font-heading font-bold text-[#222222]">{formatMoney(gstSummary?.b2c?.value)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-heading">{gstSummary?.b2c?.count || 0} Bills</div>
                  <div className="text-sm font-heading text-[#B59A6C]">GST: {formatMoney(gstSummary?.b2c?.gst)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className={headerClass}>Rate-wise Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={tableHeaderClass}>Rate</th>
                  <th className={tableHeaderClass}>Bills</th>
                  <th className={tableHeaderClass}>Taxable Value</th>
                  <th className={tableHeaderClass}>CGST</th>
                  <th className={tableHeaderClass}>SGST</th>
                  <th className={tableHeaderClass}>Total GST</th>
                  <th className={tableHeaderClass}>Invoice Value</th>
                </tr>
              </thead>
              <tbody>
                {gstSummary?.rateWise?.map((item, idx) => (
                  <tr key={idx}>
                    <td className={`${tableCellClass} font-heading`}>{item.gstRate}%</td>
                    <td className={tableCellClass}>{item.billCount}</td>
                    <td className={`${tableCellClass} font-heading`}>{formatMoney(item.taxableValue)}</td>
                    <td className={`${tableCellClass} font-heading`}>{formatMoney(item.cgst)}</td>
                    <td className={`${tableCellClass} font-heading`}>{formatMoney(item.sgst)}</td>
                    <td className={`${tableCellClass} font-heading font-bold text-[#B59A6C]`}>{formatMoney(item.totalGst)}</td>
                    <td className={`${tableCellClass} font-heading`}>{formatMoney(item.totalInvoiceValue)}</td>
                  </tr>
                ))}
                {(!gstSummary?.rateWise || gstSummary.rateWise.length === 0) && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 font-heading">No GST data found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPayments = () => {
    const chartData = {
      labels: paymentModes?.map(p => p.method) || [],
      datasets: [
        {
          label: 'Revenue',
          data: paymentModes?.map(p => p.totalRevenue) || [],
          backgroundColor: '#B59A6C',
        }
      ]
    };

    const totalRev = paymentModes?.reduce((acc, curr) => acc + curr.totalRevenue, 0) || 1;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cardClass}>
            <h3 className={headerClass}>Payment Methods Collection</h3>
            <div className="h-64">
              <Bar 
                data={chartData} 
                options={{ 
                  indexAxis: 'y',
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={headerClass}>Method Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={tableHeaderClass}>Method</th>
                    <th className={tableHeaderClass}>Bills</th>
                    <th className={tableHeaderClass}>Revenue</th>
                    <th className={tableHeaderClass}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentModes?.map((mode, idx) => (
                    <tr key={idx}>
                      <td className={`${tableCellClass} uppercase`}>{mode.method}</td>
                      <td className={tableCellClass}>{mode.billCount}</td>
                      <td className={`${tableCellClass} font-heading font-bold`}>{formatMoney(mode.totalRevenue)}</td>
                      <td className={`${tableCellClass} font-heading`}>
                        {((mode.totalRevenue / totalRev) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMetals = () => {
    const chartData = {
      labels: metalCategories?.map(m => `${m.material} ${m.karat}`) || [],
      datasets: [{
        data: metalCategories?.map(m => m.revenue) || [],
        backgroundColor: ['#B59A6C', '#222222', '#808080', '#D97706', '#FAF9F7']
      }]
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cardClass}>
            <h3 className={headerClass}>Material Revenue Split</h3>
            <div className="h-64 flex items-center justify-center">
              {metalCategories?.length > 0 ? (
                <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <div className="text-gray-400 font-heading">No metal data available</div>
              )}
            </div>
          </div>
          <div className={`lg:col-span-2 ${cardClass}`}>
            <h3 className={headerClass}>Karat-wise Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={tableHeaderClass}>Material</th>
                    <th className={tableHeaderClass}>Karat</th>
                    <th className={tableHeaderClass}>Pieces</th>
                    <th className={tableHeaderClass}>Weight (g)</th>
                    <th className={tableHeaderClass}>Revenue</th>
                    <th className={tableHeaderClass}>Metal Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {metalCategories?.map((cat, idx) => (
                    <tr key={idx}>
                      <td className={`${tableCellClass} capitalize`}>{cat.material}</td>
                      <td className={`${tableCellClass} font-heading`}>{cat.karat}</td>
                      <td className={tableCellClass}>{cat.piecesSold}</td>
                      <td className={`${tableCellClass} font-heading`}>{Number(cat.totalWeight).toFixed(3)}</td>
                      <td className={`${tableCellClass} font-heading font-bold text-[#B59A6C]`}>{formatMoney(cat.revenue)}</td>
                      <td className={`${tableCellClass} font-heading`}>{formatMoney(cat.metalCost)}</td>
                    </tr>
                  ))}
                  {(!metalCategories || metalCategories.length === 0) && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500 font-heading">No metal categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCustomers = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
        <h3 className={headerClass}>Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Name</th>
                <th className={tableHeaderClass}>Phone</th>
                <th className={tableHeaderClass}>Visits</th>
                <th className={tableHeaderClass}>Total Spent</th>
                <th className={tableHeaderClass}>Total Paid</th>
                <th className={tableHeaderClass}>Outstanding</th>
                <th className={tableHeaderClass}>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers?.map((c, idx) => (
                <tr key={idx}>
                  <td className={`${tableCellClass} font-medium`}>{c.name}</td>
                  <td className={`${tableCellClass} font-heading`}>{c.phone}</td>
                  <td className={tableCellClass}>{c.visits}</td>
                  <td className={`${tableCellClass} font-heading`}>{formatMoney(c.totalSpent)}</td>
                  <td className={`${tableCellClass} font-heading`}>{formatMoney(c.totalPaid)}</td>
                  <td className={`${tableCellClass} font-heading font-bold ${c.totalOutstanding > 0 ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                    {formatMoney(c.totalOutstanding)}
                  </td>
                  <td className={tableCellClass}>{formatDate(c.lastVisit)}</td>
                </tr>
              ))}
              {(!topCustomers || topCustomers.length === 0) && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 font-heading">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderPending = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Total Outstanding</div>
            <div className="font-heading text-2xl font-bold text-[#DC2626]">{formatMoney(outstandingStats?.totalOutstanding)}</div>
          </div>
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Overdue Amount</div>
            <div className="font-heading text-2xl font-bold text-[#DC2626]">{formatMoney(outstandingStats?.overdueAmount)}</div>
          </div>
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Pending Bills</div>
            <div className="font-heading text-2xl font-bold text-[#222222]">{outstandingStats?.billCount || 0}</div>
          </div>
          <div className={cardClass}>
            <div className="text-gray-500 text-sm font-heading uppercase mb-1">Overdue Bills</div>
            <div className="font-heading text-2xl font-bold text-[#222222]">{outstandingStats?.overdueCount || 0}</div>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className={headerClass}>Pending & Overdue Bills</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={tableHeaderClass}>Bill #</th>
                  <th className={tableHeaderClass}>Customer</th>
                  <th className={tableHeaderClass}>Phone</th>
                  <th className={tableHeaderClass}>Total</th>
                  <th className={tableHeaderClass}>Balance</th>
                  <th className={tableHeaderClass}>Due Date</th>
                  <th className={tableHeaderClass}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills?.map((bill) => {
                  const isOverdue = new Date(bill.dueDate) < new Date();
                  const rowColor = isOverdue ? 'bg-red-50/30' : '';
                  return (
                    <tr key={bill._id} className={rowColor}>
                      <td className={`${tableCellClass} font-heading`}>{bill.invoiceNumber}</td>
                      <td className={tableCellClass}>{bill.customerName}</td>
                      <td className={`${tableCellClass} font-heading`}>{bill.customerPhone}</td>
                      <td className={`${tableCellClass} font-heading`}>{formatMoney(bill.totalAmount)}</td>
                      <td className={`${tableCellClass} font-heading font-bold text-[#DC2626]`}>{formatMoney(bill.balance)}</td>
                      <td className={`${tableCellClass} ${isOverdue ? 'text-[#DC2626]' : ''}`}>{formatDate(bill.dueDate)}</td>
                      <td className={tableCellClass}>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setRecordingPayment(bill._id)}
                            className="px-3 py-1 bg-[#222222] text-white text-xs font-heading uppercase hover:bg-[#B59A6C] transition-colors"
                          >
                            Pay
                          </button>
                          <button 
                            onClick={() => handleSendReminder(bill)}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-heading uppercase hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <Send size={12} />
                            <span>Remind</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!pendingBills || pendingBills.length === 0) && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 font-heading">No pending bills found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {recordingPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 max-w-md w-full border border-[#222222]">
              <h3 className="font-heading text-lg uppercase tracking-wider mb-4">Record Payment</h3>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-heading uppercase text-gray-600 mb-1">Amount</label>
                  <input 
                    type="number" 
                    required 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full border border-gray-300 p-2 font-heading focus:border-[#B59A6C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading uppercase text-gray-600 mb-1">Method</label>
                  <select 
                    value={payMethod} 
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full border border-gray-300 p-2 font-heading focus:border-[#B59A6C] focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-heading uppercase text-gray-600 mb-1">Reference No.</label>
                  <input 
                    type="text" 
                    value={payRef} 
                    onChange={e => setPayRef(e.target.value)}
                    className="w-full border border-gray-300 p-2 font-heading focus:border-[#B59A6C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading uppercase text-gray-600 mb-1">Note</label>
                  <textarea 
                    value={payNote} 
                    onChange={e => setPayNote(e.target.value)}
                    className="w-full border border-gray-300 p-2 font-heading focus:border-[#B59A6C] focus:outline-none"
                    rows="2"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setRecordingPayment(null)}
                    className="px-4 py-2 font-heading uppercase text-sm text-gray-500 hover:text-[#222222]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#222222] text-white font-heading uppercase text-sm hover:bg-[#B59A6C] transition-colors"
                  >
                    Save Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading && !periodStats) {
    return <div className="p-8 text-center font-heading text-[#B59A6C] uppercase tracking-widest">Loading Analytics Data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] p-6 font-heading text-[#222222]">
      {/* Header Toolbar */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="font-heading text-2xl uppercase tracking-wider text-[#222222]">Billing Analytics</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-gray-200">
            <Calendar size={16} className="text-[#B59A6C]" />
            <select 
              value={fyYear} 
              onChange={e => setFyYear(Number(e.target.value))}
              className="bg-transparent font-heading uppercase text-sm focus:outline-none"
            >
              <option value={2024}>FY 2024-25</option>
              <option value={2025}>FY 2025-26</option>
              <option value={2026}>FY 2026-27</option>
            </select>
          </div>

          <div className="flex bg-white border border-gray-200 text-sm font-heading uppercase">
            {['all', 'q1', 'q2', 'q3', 'q4'].map((q) => (
              <button
                key={q}
                onClick={() => { setSelectedQuarter(q); setCustomFrom(''); setCustomTo(''); }}
                className={`px-4 py-2 border-r border-gray-200 last:border-r-0 ${selectedQuarter === q && !customFrom ? 'bg-[#B59A6C] text-white' : 'hover:bg-gray-50'}`}
              >
                {q === 'all' ? 'Full Year' : q.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-gray-200 text-sm font-heading">
            <span className="font-heading uppercase text-gray-500">Custom</span>
            <input 
              type="date" 
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="font-heading text-xs focus:outline-none" 
            />
            <span>-</span>
            <input 
              type="date" 
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="font-heading text-xs focus:outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'gst', label: 'GST Analysis', icon: FileText },
          { id: 'payments', label: 'Payment Modes', icon: CreditCard },
          { id: 'metals', label: 'Metal Categories', icon: PieIcon },
          { id: 'customers', label: 'Top Customers', icon: Users },
          { id: 'pending', label: 'Pending Dues', icon: AlertTriangle }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center space-x-2 px-6 py-3 font-heading uppercase text-sm tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeSection === sec.id ? 'border-[#B59A6C] text-[#B59A6C]' : 'border-transparent text-gray-500 hover:text-[#222222]'
            }`}
          >
            <sec.icon size={16} />
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'gst' && renderGst()}
        {activeSection === 'payments' && renderPayments()}
        {activeSection === 'metals' && renderMetals()}
        {activeSection === 'customers' && renderCustomers()}
        {activeSection === 'pending' && renderPending()}
      </div>
    </div>
  );
}
