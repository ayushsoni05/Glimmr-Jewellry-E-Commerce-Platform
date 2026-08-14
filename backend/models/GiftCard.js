const mongoose = require('mongoose');
const crypto = require('crypto');

const giftCardSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true, min: 1000, max: 100000 },
  currency: { type: String, default: 'INR' },
  senderName: { type: String, required: true, trim: true },
  senderEmail: { type: String, trim: true },
  recipientName: { type: String, required: true, trim: true },
  recipientEmail: { type: String, required: true, trim: true },
  giftNote: { type: String, maxlength: 200, default: '' },
  deliveryDate: { type: Date },
  status: { type: String, enum: ['created', 'paid', 'dispatched', 'redeemed', 'failed'], default: 'created' },
  redeemCode: { type: String, unique: true },
  paidAt: { type: Date },
  dispatchedAt: { type: Date },
}, { timestamps: true });

// Auto-generate a 12-char alphanumeric redeem code before saving
giftCardSchema.pre('save', function (next) {
  if (!this.redeemCode) {
    this.redeemCode = 'GLM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('GiftCard', giftCardSchema);
