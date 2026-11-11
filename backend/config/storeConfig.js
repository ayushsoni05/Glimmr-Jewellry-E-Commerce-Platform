/**
 * Backend Store Configuration & Statutory Defaults
 */

const STORE_CONFIG = {
  name: process.env.STORE_NAME || 'Monika Jewellers',
  gstin: process.env.STORE_GSTIN || '08AAAAA0000A1Z5',
  hsn: '7113',
  bisLicense: process.env.STORE_BIS_LICENSE || 'HM-916-84920',
  address: process.env.STORE_ADDRESS || 'Monika Jewellers, Didwana, Rajasthan 341303',
  city: 'Didwana',
  state: 'Rajasthan',
  pincode: '341303',
  phone: process.env.STORE_PHONE || '9351214851',
  whatsapp: '919351214851',
  whatsappUrl: 'https://wa.me/919351214851',
  deliveryZone: {
    pincode: '341303',
    city: 'Didwana',
    state: 'Rajasthan'
  },
  email: process.env.STORE_EMAIL || 'support@monikajewellers.com',
  financialYear: '2026-2027'
};

module.exports = STORE_CONFIG;
