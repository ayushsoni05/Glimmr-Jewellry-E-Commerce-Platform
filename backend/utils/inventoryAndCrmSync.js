const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const Customer = require('../models/Customer');

/**
 * Standardize 10-digit Indian phone number
 */
function cleanPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Deduct inventory for all items in a committed bill
 */
async function deductInventoryForBill(bill) {
  if (!bill || !bill.items || !Array.isArray(bill.items)) return;

  for (const item of bill.items) {
    try {
      if (!item.productId) continue;

      const product = await Product.findById(item.productId);
      if (!product) continue;

      const qty = item.quantity || 1;
      const prevQty = product.stock || 0;
      const newQty = Math.max(0, prevQty - qty);

      product.stock = newQty;
      await product.save();

      await StockLog.create({
        productId: product._id,
        sku: product.sku || '',
        productName: product.name,
        action: 'pos_sale',
        quantityDelta: -qty,
        previousQuantity: prevQty,
        newQuantity: newQty,
        weightDelta: -((item.netWeight || item.weight || 0) * qty),
        billNumber: bill.billNumber || bill.id,
        operator: bill.operator || 'Owner',
        notes: `Sold via Bill ${bill.billNumber || bill.id}`,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(`[STOCK_SYNC_ERROR] Failed to deduct stock for item ${item.name}:`, err.message);
    }
  }
}

/**
 * Restore inventory when a bill is cancelled or refunded
 */
async function restoreInventoryForBill(bill, reason = 'Bill Cancelled', operator = 'Owner') {
  if (!bill || !bill.items || !Array.isArray(bill.items)) return;

  for (const item of bill.items) {
    try {
      if (!item.productId) continue;

      const product = await Product.findById(item.productId);
      if (!product) continue;

      const qty = item.quantity || 1;
      const prevQty = product.stock || 0;
      const newQty = prevQty + qty;

      product.stock = newQty;
      await product.save();

      await StockLog.create({
        productId: product._id,
        sku: product.sku || '',
        productName: product.name,
        action: 'bill_cancelled',
        quantityDelta: qty,
        previousQuantity: prevQty,
        newQuantity: newQty,
        weightDelta: (item.netWeight || item.weight || 0) * qty,
        billNumber: bill.billNumber || bill.id,
        operator: operator || 'Owner',
        notes: reason || 'Inventory restored due to bill cancellation',
        createdAt: new Date()
      });
    } catch (err) {
      console.error(`[STOCK_RESTORE_ERROR] Failed to restore stock for item ${item.name}:`, err.message);
    }
  }
}

/**
 * Synchronize and update Customer profile from a bill
 */
async function syncCustomerFromBill(bill) {
  try {
    if (!bill || !bill.customer) return null;
    const phone = cleanPhone(bill.customer.phone);
    if (!phone || phone.length < 10) return null;

    let customer = await Customer.findOne({ phone });

    // Compute metal grams from items
    let goldGrams = 0;
    let silverGrams = 0;
    let diamondCarats = 0;

    (bill.items || []).forEach(item => {
      const mat = String(item.material || 'gold').toLowerCase();
      const wt = (Number(item.netWeight || item.weight) || 0) * (item.quantity || 1);
      if (mat === 'gold') goldGrams += wt;
      else if (mat === 'silver') silverGrams += wt;
      
      if (item.diamond && item.diamond.carat) {
        diamondCarats += (Number(item.diamond.carat) || 0) * (item.quantity || 1);
      }
    });

    const billDate = bill.date ? new Date(bill.date) : new Date();

    if (!customer) {
      customer = new Customer({
        phone,
        name: bill.customer.name || 'Walk-in Patron',
        address: bill.customer.address || '',
        gstin: bill.customer.gstin || '',
        panNumber: bill.customer.panNumber || '',
        totalBillsCount: 1,
        totalSpent: bill.totalPayable || 0,
        totalPaid: bill.amountPaid || 0,
        totalOutstanding: bill.balanceRemaining || 0,
        totalGoldGramsPurchased: Math.round(goldGrams * 1000) / 1000,
        totalSilverGramsPurchased: Math.round(silverGrams * 1000) / 1000,
        totalDiamondCaratsPurchased: Math.round(diamondCarats * 100) / 100,
        firstPurchaseDate: billDate,
        lastPurchaseDate: billDate
      });
    } else {
      if (bill.customer.name && bill.customer.name !== 'Walk-in Patron' && bill.customer.name !== 'Walk-in Customer') {
        customer.name = bill.customer.name;
      }
      if (bill.customer.address) customer.address = bill.customer.address;
      if (bill.customer.gstin) customer.gstin = bill.customer.gstin;
      if (bill.customer.panNumber) customer.panNumber = bill.customer.panNumber;

      customer.totalBillsCount = (customer.totalBillsCount || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + (bill.totalPayable || 0);
      customer.totalPaid = (customer.totalPaid || 0) + (bill.amountPaid || 0);
      customer.totalOutstanding = (customer.totalOutstanding || 0) + (bill.balanceRemaining || 0);
      customer.totalGoldGramsPurchased = Math.round(((customer.totalGoldGramsPurchased || 0) + goldGrams) * 1000) / 1000;
      customer.totalSilverGramsPurchased = Math.round(((customer.totalSilverGramsPurchased || 0) + silverGrams) * 1000) / 1000;
      customer.totalDiamondCaratsPurchased = Math.round(((customer.totalDiamondCaratsPurchased || 0) + diamondCarats) * 100) / 100;
      
      if (!customer.firstPurchaseDate) customer.firstPurchaseDate = billDate;
      if (!customer.lastPurchaseDate || billDate > customer.lastPurchaseDate) {
        customer.lastPurchaseDate = billDate;
      }
    }

    await customer.save();
    return customer;
  } catch (err) {
    console.error('[CRM_SYNC_ERROR] Failed to sync customer:', err.message);
    return null;
  }
}

/**
 * Update customer dues when a partial payment is recorded
 */
async function updateCustomerOnPayment(phoneRaw, paymentAmount) {
  try {
    const phone = cleanPhone(phoneRaw);
    if (!phone) return;

    const customer = await Customer.findOne({ phone });
    if (!customer) return;

    const amt = Number(paymentAmount) || 0;
    customer.totalPaid = (customer.totalPaid || 0) + amt;
    customer.totalOutstanding = Math.max(0, (customer.totalOutstanding || 0) - amt);
    await customer.save();
  } catch (err) {
    console.error('[CRM_PAYMENT_SYNC_ERROR]:', err.message);
  }
}

/**
 * Backfill all customer records from historical OfflineBill documents
 */
async function backfillCustomersFromBills() {
  const OfflineBill = require('../models/OfflineBill');
  const bills = await OfflineBill.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: 1 });

  // Group bills by 10-digit phone
  const customerMap = {};

  for (const b of bills) {
    const phone = cleanPhone(b.customer?.phone);
    if (!phone || phone.length < 10) continue;

    if (!customerMap[phone]) {
      customerMap[phone] = {
        phone,
        name: b.customer?.name || 'Walk-in Customer',
        address: b.customer?.address || '',
        gstin: b.customer?.gstin || '',
        panNumber: b.customer?.panNumber || '',
        totalBillsCount: 0,
        totalSpent: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalGoldGramsPurchased: 0,
        totalSilverGramsPurchased: 0,
        totalDiamondCaratsPurchased: 0,
        firstPurchaseDate: b.date ? new Date(b.date) : new Date(b.createdAt),
        lastPurchaseDate: b.date ? new Date(b.date) : new Date(b.createdAt)
      };
    }

    const c = customerMap[phone];
    if (b.customer?.name && b.customer.name !== 'Walk-in Customer' && b.customer.name !== 'Walk-in Patron') {
      c.name = b.customer.name;
    }
    if (b.customer?.address) c.address = b.customer.address;
    if (b.customer?.gstin) c.gstin = b.customer.gstin;
    if (b.customer?.panNumber) c.panNumber = b.customer.panNumber;

    c.totalBillsCount += 1;
    c.totalSpent += (b.totalPayable || 0);
    c.totalPaid += (b.amountPaid || 0);
    c.totalOutstanding += (b.balanceRemaining || 0);

    const bDate = b.date ? new Date(b.date) : new Date(b.createdAt);
    if (bDate > c.lastPurchaseDate) c.lastPurchaseDate = bDate;
    if (bDate < c.firstPurchaseDate) c.firstPurchaseDate = bDate;

    (b.items || []).forEach(item => {
      const mat = String(item.material || 'gold').toLowerCase();
      const wt = (Number(item.netWeight || item.weight) || 0) * (item.quantity || 1);
      if (mat === 'gold') c.totalGoldGramsPurchased += wt;
      else if (mat === 'silver') c.totalSilverGramsPurchased += wt;
      if (item.diamond?.carat) c.totalDiamondCaratsPurchased += (Number(item.diamond.carat) || 0) * (item.quantity || 1);
    });
  }

  let upsertedCount = 0;
  for (const phone of Object.keys(customerMap)) {
    const data = customerMap[phone];
    data.totalGoldGramsPurchased = Math.round(data.totalGoldGramsPurchased * 1000) / 1000;
    data.totalSilverGramsPurchased = Math.round(data.totalSilverGramsPurchased * 1000) / 1000;
    data.totalDiamondCaratsPurchased = Math.round(data.totalDiamondCaratsPurchased * 100) / 100;

    let cust = await Customer.findOne({ phone });
    if (!cust) {
      cust = new Customer(data);
    } else {
      Object.assign(cust, data);
    }
    await cust.save();
    upsertedCount++;
  }

  return { totalBillsProcessed: bills.length, uniqueCustomersSaved: upsertedCount };
}

module.exports = {
  cleanPhone,
  deductInventoryForBill,
  restoreInventoryForBill,
  syncCustomerFromBill,
  updateCustomerOnPayment,
  backfillCustomersFromBills
};
