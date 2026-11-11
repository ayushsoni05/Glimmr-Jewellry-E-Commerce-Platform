/**
 * Server-side Luxury Vouchers Verification & Price Tampering Defense
 */

const AVAILABLE_VOUCHERS = [
  {
    code: 'WELCOME10',
    name: 'Connoisseur Welcome Voucher',
    discountPercent: 10,
    maxDiscount: 10000,
    minSpend: 0
  },
  {
    code: 'MJ500',
    name: 'VIP Direct Privilege',
    discountAmount: 500,
    minSpend: 2500
  },
  {
    code: 'ROYAL20',
    name: 'Haute Joaillerie Privilege',
    discountPercent: 20,
    maxDiscount: 25000,
    minSpend: 50000
  },
  {
    code: 'GOLD5000',
    name: 'Atelier Festive Celebration',
    discountAmount: 5000,
    minSpend: 100000
  },
  {
    code: 'FIRSTBRIDE',
    name: 'Bridal Solitaire Privilege',
    discountPercent: 15,
    maxDiscount: 30000,
    minSpend: 40000
  }
];

function calculateValidatedDiscount(couponCode, subtotal = 0, requestedDiscount = 0) {
  if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
    return 0; // No coupon code provided, no discount allowed
  }

  const cleanCode = couponCode.trim().toUpperCase();
  const voucher = AVAILABLE_VOUCHERS.find(v => v.code === cleanCode);

  if (!voucher) {
    console.warn(`[SECURITY] Rejected invalid or spoofed coupon code: ${cleanCode}`);
    return 0;
  }

  if (voucher.minSpend && subtotal < voucher.minSpend) {
    console.warn(`[SECURITY] Coupon ${cleanCode} rejected: subtotal ₹${subtotal} < minSpend ₹${voucher.minSpend}`);
    return 0;
  }

  let authorizedDiscount = 0;
  if (voucher.discountPercent) {
    authorizedDiscount = Math.round((subtotal * voucher.discountPercent) / 100);
    if (voucher.maxDiscount && authorizedDiscount > voucher.maxDiscount) {
      authorizedDiscount = voucher.maxDiscount;
    }
  } else if (voucher.discountAmount) {
    authorizedDiscount = Math.min(subtotal, voucher.discountAmount);
  }

  // Ensure requested discount cannot exceed authorized ceiling
  return Math.min(authorizedDiscount, subtotal);
}

module.exports = {
  calculateValidatedDiscount,
  AVAILABLE_VOUCHERS
};
