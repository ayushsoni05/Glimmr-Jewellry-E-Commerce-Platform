const DiamondPricing = require('../models/DiamondPricing');
const Product = require('../models/Product');

/**
 * Calculate dynamic price for a product
 * Handles gold, silver, and diamond pricing
 */
async function calculateProductPrice(product, goldPricePerGram, silverPricePerGram) {
  try {
    let totalPrice = 0;
    let priceBreakdown = {
      metalCost: 0,
      diamondCost: 0,
      makingCharges: 0,
      gst: 0,
      finalPrice: 0,
    };

    // Get diamond pricing config if product has diamonds
    const diamondConfig = product.diamond?.hasDiamond ? await DiamondPricing.getSingleton() : null;

    // 1. Calculate Metal Cost (Gold or Silver)
    if (product.material === 'gold' && goldPricePerGram) {
      const weight = product.metalWeight || product.weight || 0;
      const karatMultiplier = product.karat ? product.karat / 24 : 1;
      priceBreakdown.metalCost = weight * goldPricePerGram * karatMultiplier;
    } else if (product.material === 'silver' && silverPricePerGram) {
      const weight = product.metalWeight || product.weight || 0;
      priceBreakdown.metalCost = weight * silverPricePerGram;
    } else if (product.material === 'diamond' && !product.diamond?.hasDiamond) {
      // Pure diamond product with no gold/silver base
      priceBreakdown.metalCost = 0;
    }

    // 2. Calculate Diamond Cost (if applicable)
    if (product.diamond?.hasDiamond && diamondConfig) {
      const { carat, cut, color, clarity } = product.diamond;
      
      if (carat && cut && color && clarity) {
        const diamondCalc = diamondConfig.calculateDiamondPrice(carat, cut, color, clarity);
        priceBreakdown.diamondCost = diamondCalc.withMultipliers;
        priceBreakdown.diamondDetails = {
          carat,
          cut,
          color,
          clarity,
          baseRatePerCarat: diamondConfig.baseRatePerCarat,
          ...diamondCalc,
        };
      }
    }

    // 3. Calculate Making Charges
    const baseCost = priceBreakdown.metalCost + priceBreakdown.diamondCost;
    
    if (diamondConfig && product.diamond?.hasDiamond) {
      // Use diamond config making charge percentage
      priceBreakdown.makingCharges = (baseCost * diamondConfig.makingChargePercent) / 100;
    } else {
      // Default making charges for non-diamond products (10%)
      priceBreakdown.makingCharges = baseCost * 0.10;
    }

    // 4. Calculate GST
    const priceBeforeGST = baseCost + priceBreakdown.makingCharges;
    
    if (diamondConfig && product.diamond?.hasDiamond) {
      // Use diamond config GST percentage
      priceBreakdown.gst = (priceBeforeGST * diamondConfig.gstPercent) / 100;
    } else {
      // Default GST for non-diamond products (3%)
      priceBreakdown.gst = priceBeforeGST * 0.03;
    }

    // 5. Calculate Final Price
    priceBreakdown.finalPrice = priceBeforeGST + priceBreakdown.gst;
    totalPrice = Math.round(priceBreakdown.finalPrice);

    return {
      price: totalPrice,
      breakdown: priceBreakdown,
    };
  } catch (error) {
    console.error('Error calculating product price:', error);
    return {
      price: product.price || 0,
      breakdown: null,
    };
  }
}

/**
 * Get current market prices for gold and silver from IBJA API
 */
async function getCurrentMetalPrices() {
  try {
    const axios = require('axios');
    const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5002;
    const base = `http://localhost:${backendPort}/api/prices`;
    const resp = await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => null);

    if (resp?.data?.gold?.price) {
      return {
        gold: Number(resp.data.gold.price),
        silver: Number(resp.data.silver?.price || 231.3),
      };
    }

    return {
      gold: 15064, // Fallback IBJA INR per gram
      silver: 231.3, // Fallback IBJA INR per gram
    };
  } catch (error) {
    console.error('Error fetching metal prices:', error);
    return {
      gold: 15064,
      silver: 231.3,
    };
  }
}

module.exports = {
  calculateProductPrice,
  getCurrentMetalPrices,
};
