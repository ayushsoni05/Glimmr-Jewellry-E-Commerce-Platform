const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] },
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi'], default: 'cod' },
  paymentIntentId: { type: String },
  shippingAddress: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String
  },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  notificationsSent: {
    confirmed: { type: Boolean, default: false },
    shipped: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false }
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
