const { seedIndianJewelry } = require('./indianJewelrySeeder');

async function ensureSeed() {
  const Product = require('../models/Product');
  const count = await Product.countDocuments();
  if (count < 100) {
    console.log('[SEED] Populating database with 700 authentic Indian Gold & Silver products...');
    await seedIndianJewelry();
  }
}

module.exports = { ensureSeed };
