/**
 * Centralized Store Identity & Statutory Configuration
 * 
 * Provides unified store particulars, GSTIN, HSN, BIS licensing,
 * and contact data across the entire customer storefront and POS billing desks.
 */

export const STORE_CONFIG = {
  name: import.meta.env.VITE_STORE_NAME || 'Monika Jewellers',
  tagline: 'Haute Joaillerie & Certified Fine Jewelry',
  gstin: import.meta.env.VITE_STORE_GSTIN || '08AAAAA0000A1Z5',
  hsn: '7113',
  bisLicense: import.meta.env.VITE_STORE_BIS_LICENSE || 'HM-916-84920',
  address: {
    line1: import.meta.env.VITE_STORE_ADDRESS_LINE1 || 'Monika Jewellers Showroom',
    city: import.meta.env.VITE_STORE_CITY || 'Didwana',
    state: import.meta.env.VITE_STORE_STATE || 'Rajasthan',
    pincode: import.meta.env.VITE_STORE_PINCODE || '341303',
    full: 'Monika Jewellers, Didwana, Rajasthan 341303'
  },
  contact: {
    phone: import.meta.env.VITE_STORE_PHONE || '9351214851',
    displayPhone: '+91 9351214851',
    email: import.meta.env.VITE_STORE_EMAIL || 'concierge@monikajewellers.com',
    whatsapp: '919351214851'
  },
  whatsappUrl: 'https://wa.me/919351214851',
  deliveryZone: {
    pincode: '341303',
    city: 'Didwana',
    state: 'Rajasthan',
    restrictionNotice: 'We deliver only in Didwana, Rajasthan (PIN 341303). For deliveries outside Didwana, please discuss with Monika Jewellers on WhatsApp.',
    whatsappUrl: 'https://wa.me/919351214851'
  },
  map: {
    latitude: 27.3995,
    longitude: 74.5762,
    embedUrl: 'https://maps.google.com/maps?q=Monika+Jewellers,+Didwana,+Rajasthan+341303&t=&z=16&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Monika+Jewellers+Didwana+Rajasthan+341303'
  },
  financialYear: '2026-2027',
  counterId: 'Counter #1'
};

export default STORE_CONFIG;
