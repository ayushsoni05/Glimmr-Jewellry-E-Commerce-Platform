const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  material:       { type: String, default: 'gold' },
  karat:          { type: Number, default: 22 },
  weight:         { type: Number, default: 0 },
  metalCost:      { type: Number, default: 0 },
  makingCharges:  { type: Number, default: 0 },
  gemstoneCost:   { type: Number, default: 0 },
  subtotal:       { type: Number, default: 0 },
  gstTax:         { type: Number, default: 0 },
  totalPrice:     { type: Number, default: 0 },
  quantity:       { type: Number, default: 1 },
  image:          { type: String, default: '' },
  productId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  isCustomItem:   { type: Boolean, default: false }
});

const offlineBillSchema = new mongoose.Schema({
  billNumber:     { type: String, required: true, unique: true },
  customer:       {
    name:    { type: String, default: '' },
    phone:   { type: String, default: '' },
    address: { type: String, default: '' },
    gstin:   { type: String, default: '' }
  },
  items:          [billItemSchema],
  totalMetal:     { type: Number, default: 0 },
  totalMaking:    { type: Number, default: 0 },
  totalDiamond:   { type: Number, default: 0 },
  subtotal:       { type: Number, default: 0 },
  cgst:           { type: Number, default: 0 },
  sgst:           { type: Number, default: 0 },
  igst:           { type: Number, default: 0 },
  totalGst:       { type: Number, default: 0 },
  gstRate:        { type: Number, default: 3 },
  taxSplitMode:   { type: String, enum: ['split', 'single'], default: 'split' },
  discountAmount: { type: Number, default: 0 },
  couponCode:     { type: String, default: '' },
  oldGoldDeduction: { type: Number, default: 0 },
  oldGoldDetails: {
    weight: { type: Number, default: 0 },
    purity: { type: String, default: '' },
    rate:   { type: Number, default: 0 }
  },
  totalPayable:   { type: Number, required: true },
  paymentMethod:  { type: String, enum: ['cash', 'card', 'upi', 'mixed'], default: 'cash' },
  cashReceived:   { type: Number, default: 0 },
  changeReturned: { type: Number, default: 0 },
  goldRateUsed:   { type: Number, default: 0 },
  silverRateUsed: { type: Number, default: 0 },
  operator:       { type: String, default: 'Owner' },
  notes:          { type: String, default: '' },
  status:         { type: String, enum: ['completed', 'cancelled', 'refunded'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('OfflineBill', offlineBillSchema);
