const mongoose = require('mongoose');

// -- Payment Entry sub-schema (Phase 6: Partial Payment Ledger) --
const paymentEntrySchema = new mongoose.Schema({
  amount:    { type: Number, required: true },
  method:    { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
  reference: { type: String, default: '' },
  date:      { type: Date, default: Date.now },
  operator:  { type: String, default: 'Owner' },
  note:      { type: String, default: '' }
}, { _id: true });

// -- Audit Log sub-schema (Phase 5: Data Integrity) --
const auditEntrySchema = new mongoose.Schema({
  action:    { type: String, enum: ['created', 'cancelled', 'refunded', 'reprinted', 'payment_recorded'], required: true },
  timestamp: { type: Date, default: Date.now },
  operator:  { type: String, default: 'Owner' },
  reason:    { type: String, default: '' }
}, { _id: false });

// -- Bill Item sub-schema (Phase 1: Enhanced Breakdown) --
const billItemSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  material:       { type: String, default: 'gold' },
  karat:          { type: Number, default: 22 },
  weight:         { type: Number, default: 0 },
  netWeight:      { type: Number, default: 0 },
  ratePerGram:    { type: Number, default: 0 },
  purityPercent:  { type: Number, default: 91.67 },
  metalCost:      { type: Number, default: 0 },
  makingChargeType:  { type: String, enum: ['percent', 'per_gram', 'flat'], default: 'percent' },
  makingChargeValue: { type: Number, default: 12 },
  makingCharges:  { type: Number, default: 0 },
  gemstoneCost:   { type: Number, default: 0 },
  subtotal:       { type: Number, default: 0 },
  gstTax:         { type: Number, default: 0 },
  totalPrice:     { type: Number, default: 0 },
  quantity:       { type: Number, default: 1 },
  image:          { type: String, default: '' },
  productId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  isCustomItem:   { type: Boolean, default: false },
  huid:           { type: String, default: '' }
});

// -- Main Bill schema --
const offlineBillSchema = new mongoose.Schema({
  billNumber:     { type: String, required: true, unique: true },
  customer:       {
    name:    { type: String, default: '' },
    phone:   { type: String, default: '' },
    address: { type: String, default: '' },
    gstin:   { type: String, default: '' },
    panNumber: { type: String, default: '' }
  },
  items:          [billItemSchema],

  // -- Cost Aggregates --
  totalMetal:     { type: Number, default: 0 },
  totalMaking:    { type: Number, default: 0 },
  totalDiamond:   { type: Number, default: 0 },
  subtotal:       { type: Number, default: 0 },

  // -- Tax --
  cgst:           { type: Number, default: 0 },
  sgst:           { type: Number, default: 0 },
  igst:           { type: Number, default: 0 },
  totalGst:       { type: Number, default: 0 },
  gstRate:        { type: Number, default: 3 },
  taxSplitMode:   { type: String, enum: ['split', 'single'], default: 'split' },

  // -- Bill Type Classification (Phase 1C) --
  billType:       { type: String, enum: ['gst', 'non_gst'], default: 'gst' },

  // -- Discounts --
  discountAmount: { type: Number, default: 0 },
  couponCode:     { type: String, default: '' },

  // -- Old Gold --
  oldGoldDeduction: { type: Number, default: 0 },
  oldGoldDetails: {
    weight: { type: Number, default: 0 },
    purity: { type: String, default: '' },
    rate:   { type: Number, default: 0 }
  },

  // -- Total --
  totalPayable:   { type: Number, required: true },

  // -- Payment (original fields) --
  paymentMethod:  { type: String, enum: ['cash', 'card', 'upi', 'mixed'], default: 'cash' },
  cashReceived:   { type: Number, default: 0 },
  changeReturned: { type: Number, default: 0 },
  paymentReference: { type: String, default: '' },

  // -- Phase 6: Partial Payment & Balance Tracking --
  paymentStatus:  { type: String, enum: ['paid', 'partially_paid', 'pending', 'settled'], default: 'paid' },
  amountPaid:     { type: Number, default: 0 },
  balanceRemaining: { type: Number, default: 0 },
  dueDate:        { type: Date },
  paymentEntries: [paymentEntrySchema],
  lastReminderSent: { type: Date },
  reminderCount:  { type: Number, default: 0 },

  // -- Rates --
  goldRateUsed:   { type: Number, default: 0 },
  silverRateUsed: { type: Number, default: 0 },

  // -- Metadata --
  operator:       { type: String, default: 'Owner' },
  notes:          { type: String, default: '' },
  status:         { type: String, enum: ['completed', 'cancelled', 'refunded'], default: 'completed' },

  // -- Phase 5: Audit Trail --
  auditLog:       [auditEntrySchema]
}, { timestamps: true });

// Indexes for analytics queries
offlineBillSchema.index({ createdAt: -1 });
offlineBillSchema.index({ 'customer.phone': 1 });
offlineBillSchema.index({ paymentStatus: 1 });
offlineBillSchema.index({ billType: 1 });
offlineBillSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('OfflineBill', offlineBillSchema);
