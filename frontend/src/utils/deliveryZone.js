/**
 * Didwana Delivery Zone, Showroom Status & Geolocation Verification Utility
 * 
 * Enforces strict doorstep delivery exclusively within Didwana, Rajasthan (PIN: 341303).
 * Customers located outside Didwana are directed to discuss special insured delivery
 * directly with Monika Jewellers via WhatsApp (+91 9351214851).
 * 
 * Strictly ZERO EMOJIS in code, logs, comments, and strings.
 */

export const DIDWANA_ZONE = {
  name: 'Monika Jewellers Flagship Showroom',
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

export const DIDWANA_LANDMARKS = [
  {
    name: 'Subhash Chowk & Fort Area',
    distance: '400 meters',
    approxTime: '2 min walk',
    description: 'Heart of traditional Didwana bazaar, adjacent to the historic gateway.'
  },
  {
    name: 'Station Road & Railway Junction',
    distance: '1.5 km',
    approxTime: '5 min drive',
    description: 'Direct route from Didwana Railway Station with dedicated auto connectivity.'
  },
  {
    name: 'Bangur College & Salt Lake Road',
    distance: '2.0 km',
    approxTime: '6 min drive',
    description: 'Prominent educational and administrative boulevard.'
  },
  {
    name: 'Gada Baas & Singhi Mohalla',
    distance: '600 meters',
    approxTime: '3 min walk',
    description: 'Historic heritage residential quarter in central Didwana.'
  },
  {
    name: 'Ladnun Bypass Crossing',
    distance: '1.8 km',
    approxTime: '5 min drive',
    description: 'State Highway junction connecting Didwana and Ladnun.'
  }
];

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
      message: 'Complimentary doorstep delivery is available for Didwana, Rajasthan (PIN 341303). Hand-delivered by showroom staff with sealed packaging and hallmark card.',
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
      message: `Your location is within ${distanceKm} km of our Didwana showroom. Eligible for complimentary doorstep delivery.`,
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
 * Evaluates live showroom operating status based on Indian Standard Time (IST, UTC+5:30)
 * Mon-Sat: 10:00 AM - 8:30 PM (20:30)
 * Sun: 11:00 AM - 6:00 PM (18:00)
 */
export function getShowroomLiveStatus() {
  try {
    const now = new Date();
    // Convert to IST
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);

    const day = istDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    let openMinutes = 10 * 60; // 10:00 AM
    let closeMinutes = 20 * 60 + 30; // 8:30 PM
    let scheduleText = 'Mon - Sat: 10:00 AM - 8:30 PM IST';

    if (day === 0) {
      // Sunday
      openMinutes = 11 * 60; // 11:00 AM
      closeMinutes = 18 * 60; // 6:00 PM
      scheduleText = 'Sunday: 11:00 AM - 6:00 PM IST';
    }

    const isOpen = currentTimeInMinutes >= openMinutes && currentTimeInMinutes < closeMinutes;

    if (isOpen) {
      const remainingMinutes = closeMinutes - currentTimeInMinutes;
      const remHours = Math.floor(remainingMinutes / 60);
      const remMins = remainingMinutes % 60;
      let closeCountdown = '';
      if (remHours > 0) {
        closeCountdown = ` (closing in ${remHours}h ${remMins}m)`;
      } else {
        closeCountdown = ` (closing in ${remMins}m)`;
      }

      const closingTimeStr = day === 0 ? '6:00 PM IST' : '8:30 PM IST';
      return {
        isOpen: true,
        badgeText: 'OPEN NOW',
        statusText: `Showroom welcoming patrons today until ${closingTimeStr}${closeCountdown}`,
        schedule: scheduleText,
        istTimeString: istDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      const nextOpenText = day === 6 ? 'Opens Sunday at 11:00 AM IST' : 'Opens tomorrow at 10:00 AM IST';
      return {
        isOpen: false,
        badgeText: 'CLOSED NOW',
        statusText: `Showroom closed for the evening. ${nextOpenText}`,
        schedule: scheduleText,
        istTimeString: istDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
    }
  } catch (e) {
    return {
      isOpen: true,
      badgeText: 'SHOWROOM OPEN',
      statusText: 'Showroom open for consultations (Mon-Sat 10:00 AM - 8:30 PM IST)',
      schedule: 'Mon - Sat: 10:00 AM - 8:30 PM IST',
      istTimeString: ''
    };
  }
}

/**
 * Generate a prefilled WhatsApp delivery inquiry URL for general delivery
 */
export function createWhatsAppDeliveryInquiry({ pincode = '', city = '', distanceKm = null, itemsSummary = '', orderTotal = 0 } = {}) {
  const lines = [
    'Namaste Monika Jewellers,',
    'I would like to inquire about delivery outside Didwana.',
    pincode ? `Destination Pincode: ${pincode}` : '',
    city ? `City or Town: ${city}` : '',
    distanceKm !== null ? `Estimated Distance: approx. ${distanceKm} km from Didwana` : '',
    orderTotal > 0 ? `Order Total: Rs. ${Number(orderTotal).toLocaleString('en-IN')}` : '',
    itemsSummary ? `Items: ${itemsSummary}` : '',
    'Please let me know if special insured shipping can be arranged to my address.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate a structured WhatsApp design inquiry message
 */
export function formatDesignInquiryMessage({
  product = {},
  purity = '',
  size = '',
  targetWeight = '',
  deliveryPreference = 'Didwana Doorstep Handover (PIN 341303)',
  inquiryType = 'Availability Check',
  appointmentDate = '',
  appointmentTime = '',
  oldGoldGrams = '',
  oldGoldPurity = '',
  oldGoldEstimate = 0,
  userNote = '',
  quickChip = ''
} = {}) {
  const productName = product.name || product.title || 'Jewellery Design';
  const sku = product.sku || product._id || product.id || 'MJ-ATELIER';
  const price = product.price ? `Rs. ${Number(product.price).toLocaleString('en-IN')}` : 'Current IBJA Rate';
  const weight = product.weight ? `${product.weight}g` : '';
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const lines = [
    'Namaste Monika Jewellers Didwana,',
    '',
    `I would like to inquire about this design from your atelier:`,
    `Design: ${productName}`,
    `SKU or Code: ${sku}`,
    price ? `Reference Price: ${price}` : '',
    weight ? `Gross Weight: ${weight}` : '',
    purity ? `Selected Metal Purity: ${purity}` : '',
    size ? `Selected Size: ${size}` : '',
    targetWeight ? `Target Weight Preference: ${targetWeight}` : '',
    '',
    `Inquiry Type: ${inquiryType}`,
    `Fulfillment Preference: ${deliveryPreference}`,
    quickChip ? `Question: ${quickChip}` : '',
    appointmentDate ? `Appointment Date: ${appointmentDate}` : '',
    appointmentTime ? `Appointment Time Slot: ${appointmentTime}` : '',
    oldGoldGrams ? `Old Gold Exchange: ${oldGoldGrams}g of ${oldGoldPurity} (Est. Value: Rs. ${Number(oldGoldEstimate).toLocaleString('en-IN')})` : '',
    userNote ? `Additional Note: ${userNote}` : '',
    '',
    `Showroom Destination: Didwana, Rajasthan (PIN: 341303)`,
    url ? `Reference Link: ${url}` : ''
  ].filter((line) => line !== undefined && line !== null);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate a multi-item WhatsApp cart portfolio inquiry
 */
export function formatMultiItemCartInquiry({
  items = [],
  totalPrice = 0,
  totalWeight = 0,
  deliveryPreference = 'Didwana Doorstep Handover (PIN 341303)',
  customerName = '',
  customerPhone = '',
  customerAddress = ''
} = {}) {
  const lines = [
    'Namaste Monika Jewellers Didwana,',
    '',
    'I would like to verify the immediate availability of these designs from my cart:',
    ''
  ];

  items.slice(0, 10).forEach((item, index) => {
    const name = item.name || item.title || 'Jewellery Item';
    const qty = item.quantity || 1;
    const price = item.price ? `Rs. ${Number(item.price * qty).toLocaleString('en-IN')}` : '';
    const weight = item.weight ? `${item.weight}g` : '';
    const details = [qty > 1 ? `Qty: ${qty}` : '', weight, price].filter(Boolean).join(' | ');
    lines.push(`${index + 1}. ${name} (${details})`);
  });

  if (items.length > 10) {
    lines.push(`... and ${items.length - 10} additional items in cart.`);
  }

  lines.push('');
  if (totalWeight > 0) {
    lines.push(`Estimated Total Gold Weight: ${totalWeight.toFixed(2)}g`);
  }
  if (totalPrice > 0) {
    lines.push(`Total Portfolio Value: Rs. ${Number(totalPrice).toLocaleString('en-IN')}`);
  }
  lines.push(`Delivery Destination: ${deliveryPreference}`);

  if (customerName) lines.push(`Patron Name: ${customerName}`);
  if (customerPhone) lines.push(`Contact: ${customerPhone}`);
  if (customerAddress) lines.push(`Address: ${customerAddress}`);

  lines.push('');
  lines.push('Please confirm if these pieces are ready in your Didwana showroom or can be prepared for delivery.');

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate a Wishlist WhatsApp inquiry
 */
export function formatWishlistInquiry({ items = [] } = {}) {
  const lines = [
    'Namaste Monika Jewellers Didwana,',
    '',
    'I am sharing my saved wishlist designs to check their showroom availability:',
    ''
  ];

  items.slice(0, 10).forEach((item, index) => {
    const name = item.name || item.title || 'Jewellery Design';
    const price = item.price ? `Rs. ${Number(item.price).toLocaleString('en-IN')}` : '';
    lines.push(`${index + 1}. ${name} ${price ? `(${price})` : ''}`);
  });

  lines.push('');
  lines.push('Please let me know which of these designs can be viewed at the Didwana showroom or delivered locally (PIN 341303).');

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate a live video inspection request WhatsApp link
 */
export function formatVideoInspectionRequest({
  product = {},
  preferredDate = '',
  preferredTime = '',
  customerName = ''
} = {}) {
  const productName = product.name || product.title || 'Jewellery Design';
  const sku = product.sku || product._id || product.id || '';
  const lines = [
    'Namaste Monika Jewellers Didwana,',
    '',
    'I would like to request a 1-on-1 Live WhatsApp Video Consultation for this design:',
    `Design: ${productName}`,
    sku ? `SKU: ${sku}` : '',
    preferredDate ? `Preferred Date: ${preferredDate}` : '',
    preferredTime ? `Preferred Time: ${preferredTime}` : '',
    customerName ? `Patron Name: ${customerName}` : '',
    '',
    'Please schedule a brief video call so I can inspect the craftsmanship, luster, and hallmark live from your showroom.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate VIP Concierge Stylist & Curation Inquiry for WhatsApp
 */
export function formatConciergeStylistInquiry({
  occasion = '',
  metal = '',
  budget = '',
  estimatedGrams = '',
  recommendation = '',
  patronName = '',
  patronPhone = '',
  userNote = ''
} = {}) {
  const lines = [
    'Namaste Monika Jewellers Didwana Atelier,',
    '',
    'I am seeking personal styling advice from your VIP Atelier Concierge:',
    occasion ? `Selected Occasion: ${occasion}` : '',
    metal ? `Preferred Metal / Purity: ${metal}` : '',
    budget ? `Target Budget Range: ${budget}` : '',
    estimatedGrams ? `Estimated Gold Equivalent: approx. ${estimatedGrams}` : '',
    recommendation ? `Stylist Recommendation: ${recommendation}` : '',
    userNote ? `Specific Preferences: ${userNote}` : '',
    patronName ? `Patron Name: ${patronName}` : '',
    patronPhone ? `Contact Phone: ${patronPhone}` : '',
    '',
    'Showroom Destination: Didwana Flagship Atelier (PIN 341303)',
    'Please connect me with a senior stylist to discuss custom selections and availability.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate VIP Concierge Private Showroom / Video Appointment Inquiry for WhatsApp
 */
export function formatConciergeAppointmentInquiry({
  consultationType = 'In-Person Showroom Visit',
  agenda = 'Bridal Trousseau Consultation',
  preferredDate = '',
  preferredTime = '',
  patronName = '',
  patronPhone = '',
  userNote = ''
} = {}) {
  const lines = [
    'Namaste Monika Jewellers Didwana Atelier,',
    '',
    'I would like to schedule a private VIP consultation:',
    `Consultation Type: ${consultationType}`,
    `Purpose: ${agenda}`,
    preferredDate ? `Preferred Date: ${preferredDate}` : '',
    preferredTime ? `Preferred Time Slot: ${preferredTime}` : '',
    patronName ? `Patron Name: ${patronName}` : '',
    patronPhone ? `Contact Phone: ${patronPhone}` : '',
    userNote ? `Special Requests / Questions: ${userNote}` : '',
    '',
    consultationType.includes('Showroom')
      ? 'Location: Monika Jewellers Flagship Showroom, Station Road, Didwana (PIN 341303)'
      : 'Modality: Virtual HD WhatsApp Video Consultation',
    'Please confirm the appointment slot and stylist availability.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate VIP Concierge Live Bullion Rate Lock Inquiry for WhatsApp
 */
export function formatConciergeBullionRateLock({
  metalType = '22K Hallmark Gold',
  weightGrams = 0,
  targetBudget = 0,
  ratePer10g = 0,
  estimatedTotal = 0,
  patronName = '',
  patronPhone = '',
  referenceHub = ''
} = {}) {
  const lines = [
    'Namaste Monika Jewellers Didwana Atelier,',
    '',
    'I would like to consult on live bullion rates and lock-in terms:',
    `Selected Metal: ${metalType}`,
    referenceHub ? `Trading Benchmark Hub: ${referenceHub}` : '',
    ratePer10g > 0 ? `Current Live Benchmark: Rs. ${Number(ratePer10g).toLocaleString('en-IN')} per 10g` : '',
    weightGrams > 0 ? `Target Grammage: ${weightGrams}g` : '',
    targetBudget > 0 ? `Target Investment Budget: Rs. ${Number(targetBudget).toLocaleString('en-IN')}` : '',
    estimatedTotal > 0 ? `Estimated Metal Value: Rs. ${Number(estimatedTotal).toLocaleString('en-IN')} (+ 3% GST)` : '',
    patronName ? `Patron Name: ${patronName}` : '',
    patronPhone ? `Contact Phone: ${patronPhone}` : '',
    '',
    'Please confirm immediate availability and booking procedures at the Didwana showroom.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}

/**
 * Generate VIP Concierge Bespoke Design & Heirloom Revival Inquiry for WhatsApp
 */
export function formatConciergeBespokeInquiry({
  designTitle = '',
  metalPreference = '',
  targetWeight = '',
  targetBudget = '',
  notes = '',
  patronName = '',
  patronPhone = ''
} = {}) {
  const lines = [
    'Namaste Monika Jewellers Didwana Atelier,',
    '',
    'I would like to commission a custom bespoke design / heirloom revival:',
    designTitle ? `Design Concept: ${designTitle}` : 'Custom Jewellery Commission',
    metalPreference ? `Metal Karatage: ${metalPreference}` : '',
    targetWeight ? `Target Weight: ${targetWeight}` : '',
    targetBudget ? `Target Budget: ${targetBudget}` : '',
    notes ? `Design Details / Instructions: ${notes}` : '',
    patronName ? `Patron Name: ${patronName}` : '',
    patronPhone ? `Contact Phone: ${patronPhone}` : '',
    '',
    'I can share reference sketches/photos here. Please connect me with your Master Karigar.'
  ].filter(Boolean);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`;
}
