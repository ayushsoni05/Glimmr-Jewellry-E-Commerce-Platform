/**
 * Patch script to populate missing diamond details and recompute prices
 * for all products that are diamond items or have diamond flags.
 *
 * Usage:
 *   MONGO_URI="mongodb://localhost:27017/glimmrr" node backend/scripts/patch_diamond_products.js
 *
 * Notes:
 * - Uses fallback gold/silver rates (6500/75) to avoid external API dependency.
 * - Only fills missing fields; existing diamond specs are preserved.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const DiamondPricing = require('../models/DiamondPricing');
const { calculateProductPrice } = require('../utils/priceCalculator');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glimmrr';
const GOLD_PER_GRAM = Number(process.env.PATCH_GOLD_PER_GRAM || 6500);
const SILVER_PER_GRAM = Number(process.env.PATCH_SILVER_PER_GRAM || 75);

const CUTS = ['excellent', 'very-good', 'good', 'fair', 'poor'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function defaultCarat() {
  return Number((0.35 + Math.random() * 1.4).toFixed(2)); // 0.35ct - 1.75ct
}

async function main() {
  console.log('Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  const diamondConfig = await DiamondPricing.getSingleton(); // Ensure config exists for calculations
  console.log('Diamond pricing config:', {
    baseRatePerCarat: diamondConfig.baseRatePerCarat,
    makingChargePercent: diamondConfig.makingChargePercent,
    gstPercent: diamondConfig.gstPercent,
  });

  const filter = {
    $or: [
      { material: { $regex: /^diamond$/i } },
      { 'diamond.hasDiamond': true },
    ],
  };

  const products = await Product.find(filter);
  console.log(`Found ${products.length} diamond-related products to inspect.`);

  let updatedCount = 0;
  let pricedCount = 0;
  let zeroPriceCount = 0;

  let debugPrinted = 0;
  for (const product of products) {
    const nextDiamond = {
      ...(product.diamond || {}),
      hasDiamond: true,
    };

    if (!nextDiamond.carat) nextDiamond.carat = defaultCarat();
    if (!nextDiamond.cut) nextDiamond.cut = randomFrom(CUTS);
    if (!nextDiamond.color) nextDiamond.color = randomFrom(COLORS);
    if (!nextDiamond.clarity) nextDiamond.clarity = randomFrom(CLARITIES);

    // Ensure material label matches presence of diamond where appropriate
    if (!product.material || /^\s*$/.test(product.material)) {
      product.material = 'diamond';
    }

    // Keep metalWeight aligned when the product has a weight but no explicit metalWeight
    if (!product.metalWeight && product.weight) {
      product.metalWeight = product.weight;
    }

    const before = JSON.stringify(product.diamond || {});
    product.diamond = nextDiamond;
    const after = JSON.stringify(product.diamond);
    if (before !== after) updatedCount += 1;

    try {
      // Compute price on a plain object to avoid mongoose getters interfering
      const plain = product.toObject();
      const { price, breakdown } = await calculateProductPrice(plain, GOLD_PER_GRAM, SILVER_PER_GRAM);
      const nextPrice = Math.round(Number(price) || 0);
      product.price = nextPrice;
      product.priceBreakdown = breakdown || null;
      product.markModified('priceBreakdown');
      if (nextPrice > 0) pricedCount += 1; else {
        zeroPriceCount += 1;
        if (debugPrinted < 5) {
          console.log('Zero price sample:', {
            _id: product._id.toString(),
            material: product.material,
            diamond: product.diamond,
            metalWeight: product.metalWeight,
            weight: product.weight,
            breakdown,
          });
          debugPrinted += 1;
        }
      }
    } catch (err) {
      console.warn(`Price calc failed for ${product._id}:`, err && err.message ? err.message : err);
    }

    await product.save();
  }

  console.log(`\nPatch complete.`);
  console.log(`Updated diamond field on ${updatedCount} products.`);
  console.log(`Repriced ${pricedCount} products with computed diamond pricing.`);
  if (zeroPriceCount > 0) {
    console.log(`Skipped ${zeroPriceCount} products because calculated price was 0 (check diamond config or inputs).`);
  }

  await mongoose.connection.close();
  console.log('Connection closed.');
}

main().catch((err) => {
  console.error('Patch failed:', err);
  mongoose.connection.close();
  process.exit(1);
});
