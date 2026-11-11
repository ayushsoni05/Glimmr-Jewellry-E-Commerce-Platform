/**
 * Backend Store Configuration & Statutory Defaults
 */

const STORE_CONFIG = {
  name: process.env.STORE_NAME || 'New Monika Jewellers',
  gstin: process.env.STORE_GSTIN || '07AAAAA0000A1Z5',
  hsn: '7113',
  bisLicense: process.env.STORE_BIS_LICENSE || 'HM-916-84920',
  address: process.env.STORE_ADDRESS || 'Atelier Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
  phone: process.env.STORE_PHONE || '9876543210',
  email: process.env.STORE_EMAIL || 'support@monikajewellers.com',
  financialYear: '2026-2027'
};

module.exports = STORE_CONFIG;
