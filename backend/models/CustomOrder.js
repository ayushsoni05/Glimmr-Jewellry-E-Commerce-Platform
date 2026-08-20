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
    bandProfile: {
      id: String,
      name: String,
    },
    bandWidthMm: {
      type: Number,
      default: 4,
    },
    bandPattern: {
      id: String,
      name: String,
      price: { type: Number, default: 0 },
    },
    bandFinish: {
      id: String,
      name: String,
    },
    twoToneMetal: {
      id: String,
      name: String,
      color: String,
      pricePerGram: Number,
    },
    diamondGrading: {
      color: String,
      clarity: String,
      cutGrade: String,
    },
    settingStyle: {
      id: String,
      name: String,
      price: { type: Number, default: 0 },
    },
    sideStones: {
      id: String,
      name: String,
      price: { type: Number, default: 0 },
    },
    referenceImages: [String],
    designMode: {
      type: String,
      enum: ['photo_reference', 'ai_prompt', 'manual_studio'],
      default: 'manual_studio',
    },
    aiPrompt: {
      type: String,
      default: '',
    },
    diamondTier: {
      type: String,
      enum: ['natural_certified', 'lab_grown', 'commercial_grade'],
      default: 'natural_certified',
    },
    diamondPlacement: {
      centerStone: {
        carat: Number,
        cut: String,
        color: String,
        clarity: String,
        tier: String,
      },
      shoulderStones: {
        type: { type: String, default: 'none' },
        count: { type: Number, default: 0 },
        totalCarat: Number,
        tier: String,
      },
      haloStones: {
        type: { type: String, default: 'none' },
        count: { type: Number, default: 0 },
        tier: String,
      },
      hiddenHalo: { type: Boolean, default: false },
      innerSecretStone: {
        enabled: { type: Boolean, default: false },
        gemType: { type: String, default: 'diamond' },
      },
    },
    threadedDesign: {
      style: { type: String, default: 'none' },
      pitch: { type: Number, default: 1.0 },
      twistCount: { type: Number, default: 3 },
    },
    pricing: {
      metalCost: Number,
      gemCost: Number,
      twoToneSurcharge: Number,
      patternCost: Number,
      settingCost: Number,
      sideStoneCost: Number,
      makingCharges: Number,
      gst: Number,
      total: Number,
      diamondTierMultiplier: Number,
      totalDiamondCost: Number,
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
