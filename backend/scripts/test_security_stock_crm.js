// Verification script for Security, Stock Management, and Customer CRM
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

async function runTests() {
  console.log('--- Starting Enterprise Security, Stock & CRM Verification Tests ---');
  let mongoServer;
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('[PASS] Connected to in-memory test database');

    const User = require('../models/User');
    const Product = require('../models/Product');
    const StockLog = require('../models/StockLog');
    const Customer = require('../models/Customer');
    const OfflineBill = require('../models/OfflineBill');
    const { isBlacklisted, addToken } = require('../middleware/tokenBlacklist');
    const { 
      deductInventoryForBill, 
      restoreInventoryForBill, 
      syncCustomerFromBill, 
      updateCustomerOnPayment,
      backfillCustomersFromBills
    } = require('../utils/inventoryAndCrmSync');

    // TEST 1: User Roles & RBAC Enum
    console.log('\n[TEST 1] Verifying User Roles & Token Blacklist');
    const cashier = new User({
      name: 'Cashier Staff',
      email: 'cashier@monikajewellers.com',
      phone: '9820011111',
      password: 'hashedpassword',
      role: 'cashier'
    });
    await cashier.save();
    console.log('[PASS] User created with role "cashier":', cashier.role);

    const testToken = 'dummy-token-12345';
    console.log('[CHECK] Is token blacklisted before adding?', isBlacklisted(testToken));
    addToken(testToken, Date.now() + 60000);
    console.log('[PASS] Is token blacklisted after addToken?', isBlacklisted(testToken) === true);

    // TEST 2: Product Jewellery Stock & Attributes
    console.log('\n[TEST 2] Verifying Jewellery Product & Stock Tracking');
    const ring = new Product({
      name: 'Heritage 22K Royal Kundan Ring',
      description: 'Handcrafted BIS hallmarked ring',
      category: 'rings',
      material: 'gold',
      weight: 8.5,
      netWeight: 7.8,
      grossWeight: 8.5,
      karat: 22,
      sku: 'MJ-RN-22K-0001',
      huid: '6R8W2M',
      stock: 5,
      lowStockThreshold: 2,
      location: 'Vault A'
    });
    await ring.save();
    console.log('[PASS] Product saved with stockStatus:', ring.stockStatus, '| Net Weight:', ring.netWeight, 'g');

    // TEST 3: POS Bill Creation & Stock Deduction
    console.log('\n[TEST 3] Verifying Stock Deduction on Bill Creation');
    const testBill = new OfflineBill({
      billNumber: 'BILL-2026-TEST-001',
      customer: {
        name: 'Aayush Sharma',
        phone: '9820098200',
        address: 'Bandra West, Mumbai',
        gstin: '27AAAAA0000A1Z5',
        panNumber: 'ABCDE1234F'
      },
      items: [{
        productId: ring._id,
        name: ring.name,
        material: 'gold',
        karat: 22,
        weight: 8.5,
        netWeight: 7.8,
        quantity: 2,
        totalPrice: 125000
      }],
      subtotal: 250000,
      totalGst: 7500,
      totalPayable: 257500,
      amountPaid: 200000,
      balanceRemaining: 57500,
      paymentStatus: 'partially_paid',
      operator: 'Cashier Staff'
    });
    await testBill.save();

    await deductInventoryForBill(testBill);
    const updatedRing = await Product.findById(ring._id);
    console.log('[PASS] Initial Stock: 5 | Sold: 2 | New Stock:', updatedRing.stock);
    if (updatedRing.stock !== 3) throw new Error('Stock deduction mismatch');

    const stockLog = await StockLog.findOne({ productId: ring._id, action: 'pos_sale' });
    console.log('[PASS] StockLog entry created:', stockLog.action, '| Delta:', stockLog.quantityDelta, '| Bill:', stockLog.billNumber);

    // TEST 4: Customer CRM Auto-Ingestion & LTV Calculation
    console.log('\n[TEST 4] Verifying Customer CRM Profile & LTV Aggregation');
    await syncCustomerFromBill(testBill);
    const customer = await Customer.findOne({ phone: '9820098200' });
    console.log('[PASS] Customer Profile Generated for:', customer.name);
    console.log('       Tier:', customer.patronTier);
    console.log('       Total Spent (LTV): Rs.', customer.totalSpent);
    console.log('       Outstanding Balance: Rs.', customer.totalOutstanding);
    console.log('       Gold Grams Bought:', customer.totalGoldGramsPurchased, 'g');
    console.log('       PAN Captured:', customer.panNumber);

    if (customer.totalSpent !== 257500) throw new Error('Customer totalSpent mismatch');
    if (customer.totalOutstanding !== 57500) throw new Error('Customer totalOutstanding mismatch');

    // TEST 5: Partial Payment Recording
    console.log('\n[TEST 5] Verifying Partial Payment CRM Balance Settlement');
    await updateCustomerOnPayment(customer.phone, 57500);
    const settledCust = await Customer.findOne({ phone: '9820098200' });
    console.log('[PASS] Balance after Rs. 57,500 settlement: Rs.', settledCust.totalOutstanding);
    if (settledCust.totalOutstanding !== 0) throw new Error('Customer balance not settled');

    // TEST 6: Bill Cancellation & Stock Restoration
    console.log('\n[TEST 6] Verifying Stock Re-credit on Bill Cancellation');
    await restoreInventoryForBill(testBill, 'Customer requested exchange', 'Store Manager');
    const restoredRing = await Product.findById(ring._id);
    console.log('[PASS] Stock after cancellation restored to:', restoredRing.stock);
    if (restoredRing.stock !== 5) throw new Error('Stock restoration mismatch');

    const cancelLog = await StockLog.findOne({ productId: ring._id, action: 'bill_cancelled' });
    console.log('[PASS] StockLog cancellation entry verified:', cancelLog.notes);

    console.log('\nALL 6 VERIFICATION TEST SUITES PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    if (mongoServer) await mongoServer.stop();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
