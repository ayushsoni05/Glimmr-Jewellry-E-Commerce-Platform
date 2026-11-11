/**
 * Centralized Store Identity & Statutory Configuration
 * 
 * Provides unified store particulars, GSTIN, HSN, BIS licensing,
 * and contact data across the entire customer storefront and POS billing desks.
 */

export const STORE_CONFIG = {
  name: import.meta.env.VITE_STORE_NAME || 'New Monika Jewellers',
  tagline: 'Haute Joaillerie & Certified Fine Jewelry',
  gstin: import.meta.env.VITE_STORE_GSTIN || '07AAAAA0000A1Z5',
  hsn: '7113',
  bisLicense: import.meta.env.VITE_STORE_BIS_LICENSE || 'HM-916-84920',
  address: {
    line1: import.meta.env.VITE_STORE_ADDRESS_LINE1 || 'Atelier Tower, Bandra Kurla Complex',
    city: import.meta.env.VITE_STORE_CITY || 'Mumbai',
    state: import.meta.env.VITE_STORE_STATE || 'Maharashtra',
    pincode: import.meta.env.VITE_STORE_PINCODE || '400051',
    full: 'Atelier Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051'
  },
  contact: {
    phone: import.meta.env.VITE_STORE_PHONE || '9876543210',
    email: import.meta.env.VITE_STORE_EMAIL || 'concierge@monikajewellers.com',
    whatsapp: import.meta.env.VITE_STORE_WHATSAPP || '919876543210'
  },
  financialYear: '2026-2027',
  counterId: 'Counter #1'
};

export default STORE_CONFIG;
