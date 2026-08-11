/**
 * Dynamic Product Pricing Utility for Glimmr Atelier Platform
 * Calculates real-time jewelry pricing based on weight, karat purity, 
 * live IBJA metal rates, making charges per gram, and 3% GST.
 */

export const KARAT_PURITY = {
  24: 1.0,
  22: 22 / 24, // ~0.9167
  18: 18 / 24, // ~0.7500
  14: 14 / 24, // ~0.5833
  999: 1.0,
  925: 0.925
};

/**
 * Calculates complete live price breakdown for a given product
 * @param {Object} product Product object containing weight, karat, material, etc.
 * @param {Object} liveRates Live rates payload from /api/prices API
 * @returns {Object} Full breakdown including rawMetalCost, makingCharges, subtotal, gst, totalLivePrice
 */
export const calculateProductLivePrice = (product, liveRates) => {
  if (!product) return { totalLivePrice: 0, breakdown: null };

  const weight = Number(product.weight) || Number(product.metalWeight) || 5.0; // default 5g
  const material = String(product.material || 'gold').toLowerCase();
  
  // Determine base rate per gram from live API rates
  const gold24kPerGram = liveRates?.gold?.price 
    ? Number(liveRates.gold.price) 
    : (liveRates?.gold_10g_24k ? liveRates.gold_10g_24k / 10 : 15064);

  const silverPerGram = liveRates?.silver?.price 
    ? Number(liveRates.silver.price) 
    : 231.3;

  let baseRatePerGram = material.includes('silver') ? silverPerGram : gold24kPerGram;
  
  // Karat / Purity Multiplier
  let karatNum = Number(product.karat) || (material.includes('silver') ? 925 : 22);
  let purityMultiplier = KARAT_PURITY[karatNum] || (karatNum <= 24 ? karatNum / 24 : 0.9167);

  if (material.includes('silver')) {
    purityMultiplier = karatNum === 999 ? 1.0 : 0.925;
  }

  // 1. Raw Metal Cost
  const ratePerGramForPurity = baseRatePerGram * purityMultiplier;
  const rawMetalCost = Math.round(weight * ratePerGramForPurity);

  // 2. Making Charges (per gram or flat default ₹450/g)
  const makingChargeRate = Number(product.makingChargePerGram) || 450;
  const makingCharges = Math.round(weight * makingChargeRate);

  // 3. Diamond / Gemstone Valuation (if applicable)
  let gemstoneCost = 0;
  if (product.diamond?.hasDiamond && product.diamond?.carat) {
    const caratWeight = Number(product.diamond.carat) || 0.5;
    // Estimated premium diamond valuation: ₹65,000 per carat for VVS1/VS1
    gemstoneCost = Math.round(caratWeight * 65000);
  }

  // 4. Subtotal & GST (3% Tax)
  const subtotal = rawMetalCost + makingCharges + gemstoneCost;
  const gstTax = Math.round(subtotal * 0.03); // 3% GST on fine jewelry in India
  const totalLivePrice = subtotal + gstTax;

  return {
    weight,
    karat: karatNum,
    material,
    baseRatePerGram: Math.round(baseRatePerGram),
    ratePerGramForPurity: Math.round(ratePerGramForPurity),
    rawMetalCost,
    makingChargeRate,
    makingCharges,
    gemstoneCost,
    subtotal,
    gstTaxRate: '3%',
    gstTax,
    totalLivePrice: Math.max(totalLivePrice, product.price || 0), // Fallback to base price if set higher
  };
};
