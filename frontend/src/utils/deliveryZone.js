/**
 * Didwana Delivery Zone & Geolocation Verification Utility
 * 
 * Enforces strict doorstep delivery exclusively within Didwana, Rajasthan (PIN: 341303).
 * Customers located outside Didwana are directed to discuss special insured delivery
 * directly with Monika Jewellers via WhatsApp (+91 9351214851).
 */

export const DIDWANA_ZONE = {
  name: 'Monika Jewellers Showroom',
  town: 'Didwana',
  district: 'Didwana-Kuchaman',
  state: 'Rajasthan',
  pincode: '341303',
  country: 'India',
  latitude: 27.3995,
  longitude: 74.5762,
  maxRadiusKm: 18,
  whatsappNumber: '919351214851',
  whatsappUrl: 'https://wa.me/919351214851',
  phoneDisplay: '+91 9351214851',
  mapsEmbedUrl: 'https://maps.google.com/maps?q=Monika+Jewellers,+Didwana,+Rajasthan+341303&t=&z=16&ie=UTF8&iwloc=&output=embed',
  mapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Monika+Jewellers+Didwana+Rajasthan+341303'
};

/**
 * Calculate Great-Circle distance using Haversine formula (km)
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Check if a location/pincode is within the Didwana delivery zone
 * 
 * @param {Object} location
 * @param {string} [location.pincode]
 * @param {string} [location.city]
 * @param {number} [location.latitude]
 * @param {number} [location.longitude]
 * @returns {Object} verification result
 */
export function checkDeliveryEligibility(location = {}) {
  const rawPin = String(location.pincode || '').replace(/\D/g, '');
  const city = String(location.city || '').trim().toLowerCase();
  const hasCoordinates = typeof location.latitude === 'number' && typeof location.longitude === 'number';

  let distanceKm = null;
  if (hasCoordinates) {
    distanceKm = calculateHaversineDistanceKm(
      location.latitude,
      location.longitude,
      DIDWANA_ZONE.latitude,
      DIDWANA_ZONE.longitude
    );
  }

  // Exact Didwana Pincode Match
  if (rawPin === DIDWANA_ZONE.pincode) {
    return {
      isEligible: true,
      zone: 'DIDWANA_LOCAL',
      pincode: rawPin,
      distanceKm,
      title: 'Didwana Delivery Zone Verified',
      message: 'Complimentary doorstep delivery is available for Didwana, Rajasthan (PIN 341303).',
      whatsappUrl: DIDWANA_ZONE.whatsappUrl
    };
  }

  // Check by GPS coordinates distance
  if (distanceKm !== null && distanceKm <= DIDWANA_ZONE.maxRadiusKm) {
    return {
      isEligible: true,
      zone: 'DIDWANA_LOCAL',
      pincode: rawPin || DIDWANA_ZONE.pincode,
      distanceKm,
      title: 'High-Precision GPS Verified (Didwana)',
      message: `Your location is within ${distanceKm} km of our Didwana showroom. Eligible for doorstep delivery.`,
      whatsappUrl: DIDWANA_ZONE.whatsappUrl
    };
  }

  // City match fallback
  if (city && (city === 'didwana' || city.includes('didwana'))) {
    return {
      isEligible: true,
      zone: 'DIDWANA_LOCAL',
      pincode: rawPin || DIDWANA_ZONE.pincode,
      distanceKm,
      title: 'Didwana Locality Confirmed',
      message: 'Complimentary doorstep delivery is available in Didwana.',
      whatsappUrl: DIDWANA_ZONE.whatsappUrl
    };
  }

  // If outside Didwana:
  const outsidePinText = rawPin ? ` (PIN ${rawPin})` : '';
  const distanceText = distanceKm !== null ? ` (approx. ${distanceKm} km away)` : '';

  return {
    isEligible: false,
    zone: 'OUTSIDE_DIDWANA',
    pincode: rawPin,
    distanceKm,
    title: 'Delivery Outside Didwana Restricted',
    message: `Online doorstep delivery is available exclusively within Didwana, Rajasthan (PIN 341303). Your location${outsidePinText}${distanceText} is outside our local delivery zone.`,
    inquiryMessage: 'To arrange insured delivery outside Didwana, please discuss with Monika Jewellers directly on WhatsApp.',
    whatsappUrl: createWhatsAppDeliveryInquiry({
      pincode: rawPin,
      city: location.city || '',
      distanceKm
    })
  };
}

/**
 * Generate a prefilled WhatsApp inquiry URL
 */
export function createWhatsAppDeliveryInquiry({ pincode = '', city = '', itemsSummary = '', orderTotal = 0 } = {}) {
  const lines = [
    'Hello Monika Jewellers,',
    'I would like to inquire about delivery outside Didwana.',
    pincode ? `Destination Pincode: ${pincode}` : '',
    city ? `City/Town: ${city}` : '',
    orderTotal > 0 ? `Order Total: Rs. ${Number(orderTotal).toLocaleString('en-IN')}` : '',
    itemsSummary ? `Items: ${itemsSummary}` : '',
    'Please let me know if special insured shipping can be arranged.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}
