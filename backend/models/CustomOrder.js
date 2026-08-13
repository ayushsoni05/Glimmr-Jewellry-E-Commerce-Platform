const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    customOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'whatsapp'],
      default: 'phone',
    },
    notes: {
      type: String,
      default: '',
    },
    metal: {
      id: String,
      name: String,
      purity: String,
      color: String,
      pricePerGram: Number,
      weightGrams: Number,
    },
    gemstone: {
      id: String,
      name: String,
      color: String,
      pricePerCarat: Number,
    },
    cut: {
      id: String,
      name: String,
    },
    caratWeight: {
      type: Number,
      default: 1.0,
    },
    personalization: {
      engravingText: { type: String, default: '' },
      artEmblem: { type: String, default: 'none' },
      artEmblemName: { type: String, default: 'None' },
      ringSize: { type: String, default: '7' },
    },
    pricing: {
      metalCost: Number,
      gemCost: Number,
      makingCharges: Number,
      gst: Number,
      total: Number,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'in_production', 'completed', 'rejected'],
      default: 'pending_approval',
    },
    estimatedCompletionDate: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomOrder', customOrderSchema);
