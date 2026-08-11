const mongoose = require('mongoose');

const diamondPricingSchema = new mongoose.Schema({
  baseRatePerCarat: {
    type: Number,
    required: true,
    default: 300000, // Base rate in INR per carat
  },
  // Cut multipliers
  cutMultipliers: {
    excellent: { type: Number, default: 1.3 },
    'very-good': { type: Number, default: 1.15 },
    good: { type: Number, default: 1.0 },
    fair: { type: Number, default: 0.85 },
    poor: { type: Number, default: 0.7 },
  },
  // Color multipliers (D is best, Z is worst)
  colorMultipliers: {
    D: { type: Number, default: 1.5 },
    E: { type: Number, default: 1.4 },
    F: { type: Number, default: 1.3 },
    G: { type: Number, default: 1.2 },
    H: { type: Number, default: 1.1 },
    I: { type: Number, default: 1.0 },
    J: { type: Number, default: 0.9 },
    K: { type: Number, default: 0.8 },
    L: { type: Number, default: 0.7 },
    M: { type: Number, default: 0.6 },
  },
  // Clarity multipliers
  clarityMultipliers: {
    FL: { type: Number, default: 1.5 },  // Flawless
    IF: { type: Number, default: 1.4 },  // Internally Flawless
    VVS1: { type: Number, default: 1.3 }, // Very Very Slightly Included 1
    VVS2: { type: Number, default: 1.2 }, // Very Very Slightly Included 2
    VS1: { type: Number, default: 1.1 },  // Very Slightly Included 1
    VS2: { type: Number, default: 1.0 },  // Very Slightly Included 2
    SI1: { type: Number, default: 0.9 },  // Slightly Included 1
    SI2: { type: Number, default: 0.8 },  // Slightly Included 2
    I1: { type: Number, default: 0.7 },   // Included 1
    I2: { type: Number, default: 0.6 },   // Included 2
    I3: { type: Number, default: 0.5 },   // Included 3
  },
  // Making charges and GST
  makingChargePercent: {
    type: Number,
    default: 15, // 15% of diamond cost
  },
  gstPercent: {
    type: Number,
    default: 3, // 3% GST
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Singleton pattern - only one document should exist
diamondPricingSchema.statics.getSingleton = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

// Method to calculate diamond price
diamondPricingSchema.methods.calculateDiamondPrice = function(carat, cut, color, clarity) {
  const cutMult = this.cutMultipliers[cut] || 1.0;
  const colorMult = this.colorMultipliers[color] || 1.0;
  const clarityMult = this.clarityMultipliers[clarity] || 1.0;
  
  const basePrice = carat * this.baseRatePerCarat;
  const diamondPrice = basePrice * cutMult * colorMult * clarityMult;
  
  return {
    baseCost: basePrice,
    withMultipliers: diamondPrice,
    cutMultiplier: cutMult,
    colorMultiplier: colorMult,
    clarityMultiplier: clarityMult,
  };
};

module.exports = mongoose.model('DiamondPricing', diamondPricingSchema);
