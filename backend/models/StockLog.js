const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    index: true 
  },
  sku: { 
    type: String, 
    default: '' 
  },
  productName: { 
    type: String, 
    required: true 
  },
  action: { 
    type: String, 
    enum: [
      'initial_stock', 
      'manual_adjustment', 
      'pos_sale', 
      'online_order', 
      'bill_cancelled', 
      'return_restock', 
      'damage_scrap'
    ], 
    required: true 
  },
  quantityDelta: { 
    type: Number, 
    required: true 
  },
  previousQuantity: { 
    type: Number, 
    required: true 
  },
  newQuantity: { 
    type: Number, 
    required: true 
  },
  weightDelta: { 
    type: Number, 
    default: 0 
  },
  billNumber: { 
    type: String, 
    default: null,
    index: true 
  },
  operator: { 
    type: String, 
    default: 'Owner' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
});

module.exports = mongoose.model('StockLog', stockLogSchema);
