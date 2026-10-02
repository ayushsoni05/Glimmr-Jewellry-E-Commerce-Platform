const mongoose = require('mongoose');

// Atomic bill counter to prevent duplicate bill numbers across devices/sessions.
// Uses findOneAndUpdate with $inc for safe concurrent increments.
const billCounterSchema = new mongoose.Schema({
  prefix:   { type: String, default: 'BILL' },
  year:     { type: Number, required: true },
  sequence: { type: Number, default: 0 }
});

billCounterSchema.index({ prefix: 1, year: 1 }, { unique: true });

// Static method: atomically increment and return the next bill number
billCounterSchema.statics.getNext = async function (prefix = 'BILL') {
  const year = new Date().getFullYear();
  const counter = await this.findOneAndUpdate(
    { prefix, year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true }
  );
  const seq = String(counter.sequence).padStart(4, '0');
  return `${prefix}-${year}-${seq}`;
};

module.exports = mongoose.model('BillCounter', billCounterSchema);
