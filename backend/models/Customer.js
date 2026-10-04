const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    default: '', 
    lowercase: true, 
    trim: true 
  },
  address: { 
    type: String, 
    default: '' 
  },
  city: { 
    type: String, 
    default: 'Mumbai' 
  },
  state: { 
    type: String, 
    default: 'Maharashtra' 
  },
  pincode: { 
    type: String, 
    default: '' 
  },
  gstin: { 
    type: String, 
    default: '',
    uppercase: true,
    trim: true 
  },
  panNumber: { 
    type: String, 
    default: '',
    uppercase: true,
    trim: true 
  },
  
  // Patron Relationship & Key Milestones
  anniversaryDate: { 
    type: Date,
    default: null 
  },
  birthdayDate: { 
    type: Date,
    default: null 
  },
  relationshipManager: { 
    type: String, 
    default: 'Atelier Concierge' 
  },
  preferredCategory: { 
    type: String, 
    default: 'All' 
  },
  notes: { 
    type: String, 
    default: '' 
  },

  // Financial & Purchases Intelligence (Updated on Billing)
  totalBillsCount: { 
    type: Number, 
    default: 0 
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  totalPaid: { 
    type: Number, 
    default: 0 
  },
  totalOutstanding: { 
    type: Number, 
    default: 0 
  },
  totalGoldGramsPurchased: { 
    type: Number, 
    default: 0 
  },
  totalSilverGramsPurchased: { 
    type: Number, 
    default: 0 
  },
  totalDiamondCaratsPurchased: { 
    type: Number, 
    default: 0 
  },

  // Patron Tiering
  patronTier: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold', 'Royal Patron'], 
    default: 'Bronze' 
  },

  firstPurchaseDate: { 
    type: Date,
    default: null 
  },
  lastPurchaseDate: { 
    type: Date,
    default: null 
  },
  lastContactedDate: { 
    type: Date,
    default: null 
  }
}, { timestamps: true });

// Auto-calculate Patron Tier before save
customerSchema.pre('save', function(next) {
  const spend = this.totalSpent || 0;
  if (spend >= 1500000) {
    this.patronTier = 'Royal Patron';
  } else if (spend >= 500000) {
    this.patronTier = 'Gold';
  } else if (spend >= 100000) {
    this.patronTier = 'Silver';
  } else {
    this.patronTier = 'Bronze';
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
