/**
 * Official Glimmr Atelier Luxury Vouchers Configuration
 */

export const AVAILABLE_VOUCHERS = [
  {
    code: 'WELCOME10',
    name: 'Connoisseur Welcome Voucher',
    discountPercent: 10,
    maxDiscount: 10000,
    minSpend: 0,
    description: '10% concession on your fine jewelry acquisition (Up to ₹10,000)',
    badge: 'Popular'
  },
  {
    code: 'GLIMMR500',
    name: 'VIP Direct Privilege',
    discountAmount: 500,
    minSpend: 2500,
    description: 'Instant ₹500 concession on acquisitions above ₹2,500',
    badge: 'Instant'
  },
  {
    code: 'ROYAL20',
    name: 'Haute Joaillerie Privilege',
    discountPercent: 20,
    maxDiscount: 25000,
    minSpend: 50000,
    description: '20% off royal heritage acquisitions exceeding ₹50,000 (Up to ₹25,000)',
    badge: 'Luxury'
  },
  {
    code: 'GOLD5000',
    name: 'Atelier Festive Celebration',
    discountAmount: 5000,
    minSpend: 100000,
    description: 'Flat ₹5,000 festive concession on master creations above ₹1,00,000',
    badge: 'Festive'
  },
  {
    code: 'FIRSTBRIDE',
    name: 'Bridal Solitaire Privilege',
    discountPercent: 15,
    maxDiscount: 30000,
    minSpend: 40000,
    description: '15% dedicated concession on bridal solitaires above ₹40,000',
    badge: 'Bridal'
  }
];

/**
 * Validate and calculate discount for a given voucher code and cart subtotal
 * @param {string} inputCode Voucher code
 * @param {number} subtotal Current pre-discount portfolio subtotal
 * @returns {Object} Validation result with voucher details and discount amount
 */
export const validateVoucher = (inputCode, subtotal = 0) => {
  if (!inputCode || typeof inputCode !== 'string' || !inputCode.trim()) {
    return { valid: false, message: 'Please enter an atelier voucher code' };
  }

  const cleanCode = inputCode.trim().toUpperCase();
  const voucher = AVAILABLE_VOUCHERS.find((v) => v.code === cleanCode);

  if (!voucher) {
    return { valid: false, message: 'Invalid or expired voucher code' };
  }

  if (voucher.minSpend && subtotal < voucher.minSpend) {
    return {
      valid: false,
      message: `Minimum portfolio value of ₹${voucher.minSpend.toLocaleString('en-IN')} required for ${voucher.code}`
    };
  }

  let discount = 0;
  if (voucher.discountPercent) {
    discount = Math.round((subtotal * voucher.discountPercent) / 100);
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else if (voucher.discountAmount) {
    discount = Math.min(subtotal, voucher.discountAmount);
  }

  return {
    valid: true,
    voucher: {
      ...voucher,
      calculatedDiscount: discount
    },
    message: `Voucher ${voucher.code} applied successfully! (-₹${discount.toLocaleString('en-IN')})`
  };
};
