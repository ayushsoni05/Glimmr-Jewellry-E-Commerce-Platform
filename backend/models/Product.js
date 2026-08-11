const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., rings, necklaces, etc.
  material: { type: String, required: true }, // gold, silver, diamond, etc.
  price: { type: Number, required: false, default: 0 },
  weight: { type: Number, required: true }, // in grams (for gold/silver)
  karat: { type: Number, required: false, default: 22 }, // gold purity: 24, 22, 18, 14
  purityPercentage: { type: Number, required: false, default: 91.6 }, // 99.9, 91.6, 75.0, 58.5 for Gold; 99.9, 92.5, 90.0 for Silver
  hallmarkDetails: { type: String, required: false, default: 'BIS Hallmarked' }, // e.g., BIS 916 Hallmarked, 925 Silver Stamped
  makingChargePerGram: { type: Number, required: false, default: 450 },
  
  // Diamond-specific fields
  diamond: {
    hasDiamond: { type: Boolean, default: false },
    carat: { type: Number }, // Diamond weight in carats
    cut: { 
      type: String, 
      enum: ['excellent', 'very-good', 'good', 'fair', 'poor'],
    },
    color: { 
      type: String, 
      enum: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
    },
    clarity: { 
      type: String, 
      enum: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'],
    },
  },
  
  // For composite products (gold + diamond)
  metalWeight: { type: Number }, // Weight of gold/silver component
  
  images: [{ type: String, required: true }], // array of image URLs
  variants: [{ type: String }], // e.g., sizes, colors
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  stock: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  // Stored price breakdown for transparency (computed server-side)
  priceBreakdown: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
