/**
 * Dynamic Product Pricing Utility for Glimmr Atelier Platform
 * Calculates real-time jewelry pricing based on weight, karat purity, 
 * live IBJA metal rates, 4Cs diamond valuation, making charges, and 3% GST.
 */

export const KARAT_PURITY = {
  24: 1.0,
  22: 22 / 24, // ~0.9167 (91.67%)
  18: 18 / 24, // ~0.7500 (75.00%)
  14: 14 / 24, // ~0.5833 (58.33%)
  999: 1.0,    // 99.9% Pure Silver/Gold
  925: 0.925   // 92.5% Sterling Silver
};

export const DIAMOND_CUT_MULTIPLIERS = {
  'excellent': 1.30,
  'very-good': 1.15,
  'good': 1.00,
  'fair': 0.85,
  'poor': 0.70
};

export const DIAMOND_COLOR_MULTIPLIERS = {
  'D': 1.50, 'E': 1.40, 'F': 1.30,
  'G': 1.20, 'H': 1.10, 'I': 1.00,
  'J': 0.90, 'K': 0.80, 'L': 0.70, 'M': 0.60
};

export const DIAMOND_CLARITY_MULTIPLIERS = {
  'FL': 1.50, 'IF': 1.40,
  'VVS1': 1.30, 'VVS2': 1.20,
  'VS1': 1.10, 'VS2': 1.00,
  'SI1': 0.90, 'SI2': 0.80,
  'I1': 0.70, 'I2': 0.60, 'I3': 0.50
};

/**
 * Formats purity multiplier into a clean percentage string (e.g. 75.0%)
 */
export const getPurityPercentageString = (karatNum, material = 'gold') => {
  const isSilver = String(material).toLowerCase().includes('silver');
  if (isSilver) {
    return karatNum === 999 ? '99.9%' : '92.5%';
  }
  const purityMap = {
    24: '99.9%',
    22: '91.67%',
    18: '75.00%',
    14: '58.33%'
  };
  if (purityMap[karatNum]) return purityMap[karatNum];
  const mult = KARAT_PURITY[karatNum] || (karatNum <= 24 ? karatNum / 24 : 0.9167);
  return `${(mult * 100).toFixed(1)}%`;
};

/**
 * Calculates complete live price breakdown for a given product
 * @param {Object} product Product object containing weight, karat, material, diamond specs, etc.
 * @param {Object} liveRates Live rates payload from /api/prices API
 * @returns {Object} Full breakdown including rawMetalCost, diamondCost, makingCharges, subtotal, gst, totalLivePrice
 */
export const calculateProductLivePrice = (product, liveRates) => {
  if (!product) return { totalLivePrice: 0, breakdown: null };

  const weight = Number(product.metalWeight) || Number(product.weight) || 5.0; // default 5g
  const material = String(product.material || 'gold').toLowerCase();
  
  // 1. Determine base rate per gram from live API rates
  const gold24kPerGram = liveRates?.gold?.price 
    ? Number(liveRates.gold.price) 
    : (liveRates?.gold_10g_24k ? liveRates.gold_10g_24k / 10 : 15600);

  const silverPerGram = liveRates?.silver?.price 
    ? Number(liveRates.silver.price) 
    : 235.0;

  let baseRatePerGram = material.includes('silver') ? silverPerGram : gold24kPerGram;
  
  // 2. Karat & Purity Percentage Calculation
  let karatNum = Number(product.karat) || (material.includes('silver') ? 925 : 22);
  let purityMultiplier = KARAT_PURITY[karatNum] || (karatNum <= 24 ? karatNum / 24 : 0.9167);

  if (material.includes('silver')) {
    purityMultiplier = karatNum === 999 ? 1.0 : 0.925;
  }

  const purityPercentageStr = getPurityPercentageString(karatNum, material);

  // 3. Raw Metal Cost
  const ratePerGramForPurity = baseRatePerGram * purityMultiplier;
  const rawMetalCost = Math.round(weight * ratePerGramForPurity);

  // 4. Artisan Making & Setting Charges (per gram or flat default ₹450/g)
  const makingChargeRate = Number(product.makingChargePerGram) || 450;
  const makingCharges = Math.round(weight * makingChargeRate);

  // 5. 4Cs Certified Diamond Valuation (if applicable)
  let gemstoneCost = 0;
  let diamondDetails = null;

  const hasDiamond = Boolean(
    product.diamond?.hasDiamond || 
    product.diamondCarat || 
    product.diamondWeight || 
    String(product.category || '').toLowerCase().includes('diamond') ||
    String(product.material || '').toLowerCase().includes('diamond') ||
    String(product.name || '').toLowerCase().includes('diamond')
  );

  if (hasDiamond) {
    const carat = Number(product.diamond?.carat) || Number(product.diamondCarat) || Number(product.diamondWeight) || 0.50;
    const cut = String(product.diamond?.cut || product.diamondCut || 'excellent').toLowerCase();
    const color = String(product.diamond?.color || product.diamondColor || 'G').toUpperCase();
    const clarity = String(product.diamond?.clarity || product.diamondClarity || 'VVS1').toUpperCase();
    const count = Number(product.diamond?.count || product.diamondCount || 1);

    const baseCaratRate = 65000; // Base rate per carat (INR)
    const cutMult = DIAMOND_CUT_MULTIPLIERS[cut] || 1.15;
    const colorMult = DIAMOND_COLOR_MULTIPLIERS[color] || 1.20;
    const clarityMult = DIAMOND_CLARITY_MULTIPLIERS[clarity] || 1.30;

    const ratePerCarat = Math.round(baseCaratRate * cutMult * colorMult * clarityMult);
    gemstoneCost = Math.round(carat * ratePerCarat);

    diamondDetails = {
      hasDiamond: true,
      carat,
      cut,
      color,
      clarity,
      count,
      ratePerCarat,
      totalDiamondCost: gemstoneCost
    };
  }

  // 6. Subtotal & 3% GST Tax (100% Mathematically Justified Addition)
  const subtotal = rawMetalCost + makingCharges + gemstoneCost;
  const gstTax = Math.round(subtotal * 0.03); // 3% GST statutory rate
  const totalLivePrice = subtotal + gstTax;

  return {
    weight,
    karat: karatNum,
    material,
    baseRatePerGram: Math.round(baseRatePerGram),
    ratePerGramForPurity: Math.round(ratePerGramForPurity),
    purityPercentageStr,
    purityMultiplier,
    rawMetalCost,
    makingChargeRate,
    makingCharges,
    gemstoneCost,
    diamondDetails,
    subtotal,
    gstTaxRate: '3%',
    gstTax,
    totalLivePrice,
  };
};
