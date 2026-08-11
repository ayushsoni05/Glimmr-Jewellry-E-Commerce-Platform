// List of all Indian states and union territories
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

// Pincode database with common cities/towns and their states
// This is a sample database - can be extended
const PINCODE_DATABASE = {
  // Delhi
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110002': { city: 'New Delhi', state: 'Delhi' },
  '110003': { city: 'New Delhi', state: 'Delhi' },
  '110005': { city: 'New Delhi', state: 'Delhi' },
  '110006': { city: 'New Delhi', state: 'Delhi' },
  '110007': { city: 'New Delhi', state: 'Delhi' },
  '110008': { city: 'New Delhi', state: 'Delhi' },
  '110009': { city: 'New Delhi', state: 'Delhi' },
  '110011': { city: 'New Delhi', state: 'Delhi' },
  '110012': { city: 'New Delhi', state: 'Delhi' },
  
  // Mumbai
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400002': { city: 'Mumbai', state: 'Maharashtra' },
  '400003': { city: 'Mumbai', state: 'Maharashtra' },
  '400004': { city: 'Mumbai', state: 'Maharashtra' },
  '400005': { city: 'Mumbai', state: 'Maharashtra' },
  '400006': { city: 'Mumbai', state: 'Maharashtra' },
  '400007': { city: 'Mumbai', state: 'Maharashtra' },
  '400008': { city: 'Mumbai', state: 'Maharashtra' },
  '400009': { city: 'Mumbai', state: 'Maharashtra' },
  '400010': { city: 'Mumbai', state: 'Maharashtra' },
  
  // Bangalore
  '560001': { city: 'Bangalore', state: 'Karnataka' },
  '560002': { city: 'Bangalore', state: 'Karnataka' },
  '560003': { city: 'Bangalore', state: 'Karnataka' },
  '560004': { city: 'Bangalore', state: 'Karnataka' },
  '560005': { city: 'Bangalore', state: 'Karnataka' },
  '560009': { city: 'Bangalore', state: 'Karnataka' },
  '560010': { city: 'Bangalore', state: 'Karnataka' },
  '560011': { city: 'Bangalore', state: 'Karnataka' },
  '560012': { city: 'Bangalore', state: 'Karnataka' },
  '560070': { city: 'Bangalore', state: 'Karnataka' },
  
  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500002': { city: 'Hyderabad', state: 'Telangana' },
  '500003': { city: 'Hyderabad', state: 'Telangana' },
  '500004': { city: 'Hyderabad', state: 'Telangana' },
  '500005': { city: 'Hyderabad', state: 'Telangana' },
  '500006': { city: 'Hyderabad', state: 'Telangana' },
  '500007': { city: 'Hyderabad', state: 'Telangana' },
  '500008': { city: 'Hyderabad', state: 'Telangana' },
  '500009': { city: 'Hyderabad', state: 'Telangana' },
  '500010': { city: 'Hyderabad', state: 'Telangana' },
  
  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu' },
  '600003': { city: 'Chennai', state: 'Tamil Nadu' },
  '600004': { city: 'Chennai', state: 'Tamil Nadu' },
  '600005': { city: 'Chennai', state: 'Tamil Nadu' },
  '600006': { city: 'Chennai', state: 'Tamil Nadu' },
  '600007': { city: 'Chennai', state: 'Tamil Nadu' },
  '600008': { city: 'Chennai', state: 'Tamil Nadu' },
  '600009': { city: 'Chennai', state: 'Tamil Nadu' },
  '600010': { city: 'Chennai', state: 'Tamil Nadu' },
  
  // Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700002': { city: 'Kolkata', state: 'West Bengal' },
  '700003': { city: 'Kolkata', state: 'West Bengal' },
  '700004': { city: 'Kolkata', state: 'West Bengal' },
  '700005': { city: 'Kolkata', state: 'West Bengal' },
  '700006': { city: 'Kolkata', state: 'West Bengal' },
  '700007': { city: 'Kolkata', state: 'West Bengal' },
  '700008': { city: 'Kolkata', state: 'West Bengal' },
  '700009': { city: 'Kolkata', state: 'West Bengal' },
  '700010': { city: 'Kolkata', state: 'West Bengal' },
  
  // Pune
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '411002': { city: 'Pune', state: 'Maharashtra' },
  '411003': { city: 'Pune', state: 'Maharashtra' },
  '411004': { city: 'Pune', state: 'Maharashtra' },
  '411005': { city: 'Pune', state: 'Maharashtra' },
  '411006': { city: 'Pune', state: 'Maharashtra' },
  '411007': { city: 'Pune', state: 'Maharashtra' },
  
  // Ahmedabad
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '380002': { city: 'Ahmedabad', state: 'Gujarat' },
  '380003': { city: 'Ahmedabad', state: 'Gujarat' },
  '380004': { city: 'Ahmedabad', state: 'Gujarat' },
  '380005': { city: 'Ahmedabad', state: 'Gujarat' },
  '380006': { city: 'Ahmedabad', state: 'Gujarat' },
  '380007': { city: 'Ahmedabad', state: 'Gujarat' },
  '380008': { city: 'Ahmedabad', state: 'Gujarat' },
  '380009': { city: 'Ahmedabad', state: 'Gujarat' },
  '380010': { city: 'Ahmedabad', state: 'Gujarat' },
  
  // Jaipur
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '302002': { city: 'Jaipur', state: 'Rajasthan' },
  '302003': { city: 'Jaipur', state: 'Rajasthan' },
  '302004': { city: 'Jaipur', state: 'Rajasthan' },
  '302005': { city: 'Jaipur', state: 'Rajasthan' },
  '302006': { city: 'Jaipur', state: 'Rajasthan' },
  
  // Lucknow
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226002': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226003': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226004': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226005': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226006': { city: 'Lucknow', state: 'Uttar Pradesh' },
  
  // Kanpur
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh' },
  '208002': { city: 'Kanpur', state: 'Uttar Pradesh' },
  '208003': { city: 'Kanpur', state: 'Uttar Pradesh' },
  
  // Kochi
  '682001': { city: 'Kochi', state: 'Kerala' },
  '682002': { city: 'Kochi', state: 'Kerala' },
  '682003': { city: 'Kochi', state: 'Kerala' },
  '682004': { city: 'Kochi', state: 'Kerala' },
  '682005': { city: 'Kochi', state: 'Kerala' },
  
  // Surat
  '395001': { city: 'Surat', state: 'Gujarat' },
  '395002': { city: 'Surat', state: 'Gujarat' },
  '395003': { city: 'Surat', state: 'Gujarat' },
  
  // Nagpur
  '440001': { city: 'Nagpur', state: 'Maharashtra' },
  '440002': { city: 'Nagpur', state: 'Maharashtra' },
  '440003': { city: 'Nagpur', state: 'Maharashtra' },
};

/**
 * Fetch city and state details from pincode
 * @param {string} pincode - The 6-digit pincode
 * @returns {Promise<{city: string, state: string} | null>}
 */
export const fetchAddressFromPincode = async (pincode) => {
  // First check local database
  if (PINCODE_DATABASE[pincode]) {
    return PINCODE_DATABASE[pincode];
  }

  // If not found in local DB, try external API (optional)
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].Status === 'Success') {
      const details = data[0].PostOffice[0];
      return {
        city: details.District || details.Block || '',
        state: details.State || ''
      };
    }
  } catch (error) {
    console.error('Error fetching pincode details:', error);
  }

  return null;
};

/**
 * Validate Indian pincode format
 * @param {string} pincode - The pincode to validate
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
  return /^[0-9]{6}$/.test(pincode);
};

/**
 * Get user's current location using Geolocation API and reverse geocode
 * @returns {Promise<{line1: string, city: string, state: string, pincode: string, country: string} | null>}
 */
/**
 * Get user's current location using Geolocation API with improved accuracy tracking
 * @returns {Promise<{line1: string, city: string, state: string, pincode: string, country: string} | null>}
 */
export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    let bestPosition = null;
    let watchId = null;
    let attempts = 0;
    const maxAttempts = 3;
    const acceptableAccuracy = 100; // 100 meters
    
    // Use watchPosition to continuously improve accuracy
    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          attempts++;
          const accuracy = position.coords.accuracy;
          
          console.log(`GPS Attempt ${attempts}/${maxAttempts}: Accuracy ${accuracy.toFixed(0)}m`);
          console.log(`Coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          
          // Keep the position with best (lowest) accuracy
          if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }
          
          // If we got good accuracy or reached max attempts, proceed
          if (accuracy <= acceptableAccuracy || attempts >= maxAttempts) {
            if (watchId) {
              navigator.geolocation.clearWatch(watchId);
            }
            
            console.log(`Using best position with accuracy: ${bestPosition.coords.accuracy.toFixed(0)}m`);
            await processPosition(bestPosition, resolve, reject);
          }
        },
        (error) => {
          if (watchId) {
            navigator.geolocation.clearWatch(watchId);
          }
          handleGeolocationError(error, reject);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 30000
        }
      );
      
      // Set a timeout to use best available position after 15 seconds
      setTimeout(() => {
        if (watchId && bestPosition) {
          navigator.geolocation.clearWatch(watchId);
          console.log(`Timeout reached. Using best available position: ${bestPosition.coords.accuracy.toFixed(0)}m`);
          processPosition(bestPosition, resolve, reject);
        }
      }, 15000);
    };

    startWatching();
  });
};

/**
 * Process geolocation position and reverse geocode it with multiple fallback services
 */
async function processPosition(position, resolve, reject) {
  const { latitude, longitude, accuracy } = position.coords;
  
  console.log(`Processing location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(0)}m)`);
  console.log(`Google Maps Link: https://www.google.com/maps?q=${latitude},${longitude}`);
  
  try {
    // Try multiple reverse geocoding services for better accuracy
    let addressData = null;
    
    // First attempt: Google Maps Geocoding (best accuracy for India)
    addressData = await reverseGeocodeGoogle(latitude, longitude);
    
    // If Google fails, try Nominatim
    if (!addressData) {
      console.log('Google geocoding failed, trying Nominatim...');
      addressData = await reverseGeocodeNominatim(latitude, longitude);
    }
    
    // If Nominatim fails or is inaccurate, try OpenCage
    if (!addressData || !isAccurateAddress(addressData)) {
      console.log('Nominatim inaccurate or failed, trying OpenCage...');
      addressData = await reverseGeocodeOpenCage(latitude, longitude);
    }
    
    if (!addressData) {
      reject(new Error('Could not determine address from location. Please enter manually or check GPS accuracy.'));
      return;
    }

    const address = addressData.address || {};

    // Extract address components with improved precision
    const line1 = buildAddressLine1(address);
    const line2 = buildAddressLine2(address);
    const city = buildCity(address);
    const state = address.state || '';
    const pincode = address.postcode || '';
    const country = address.country || 'India';

    console.log(`Geocoded result: ${city}, ${state}, ${pincode}`);

    resolve({
      line1: line1 || 'Current Location',
      line2: line2,
      city: city,
      state: state,
      pincode: pincode,
      country: country,
      latitude,
      longitude,
      accuracy: accuracy,
      displayName: addressData.display_name || ''
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    reject(new Error('Could not determine address from location. Please enter manually.'));
  }
}

/**
 * Reverse geocode using Google Maps API (free tier available)
 * Falls back gracefully if not available
 */
async function reverseGeocodeGoogle(latitude, longitude) {
  try {
    // Using Google Maps Reverse Geocoding API (free tier: 25,000 requests/day)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Validate that we have good data with both locality and state
    const address = data.address || {};
    if (!address.state) return null;
    
    return {
      address: address,
      display_name: data.display_name || '',
      source: 'nominatim-strict'
    };
  } catch (error) {
    console.warn('Google-like geocoding failed:', error.message);
    return null;
  }
}

/**
 * Reverse geocode using Nominatim (OpenStreetMap)
 */
async function reverseGeocodeNominatim(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&language=en`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Ensure we have state information
    if (!data.address || !data.address.state) {
      return null;
    }
    
    return {
      address: data.address || {},
      display_name: data.display_name || '',
      source: 'nominatim'
    };
  } catch (error) {
    console.warn('Nominatim reverse geocoding failed:', error.message);
    return null;
  }
}

/**
 * Reverse geocode using OpenCage (more accurate for India)
 */
async function reverseGeocodeOpenCage(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/reverse?q=${latitude}+${longitude}&pretty=1&no_annotations=1&language=en`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) return null;
    
    const result = data.results[0];
    const components = result.components || {};
    
    // Validate result has state
    if (!components.state) {
      return null;
    }
    
    return {
      address: {
        house_number: components.house_number || '',
        road: components.road || components.street || '',
        village: components.village || '',
        hamlet: components.hamlet || '',
        suburb: components.suburb || '',
        district: components.state_district || components.county || '',
        city: components.city || components.town || '',
        town: components.town || '',
        county: components.county || '',
        state: components.state || '',
        postcode: components.postcode || '',
        country: components.country || 'India'
      },
      display_name: result.formatted || '',
      source: 'opencage'
    };
  } catch (error) {
    console.warn('OpenCage reverse geocoding failed:', error.message);
    return null;
  }
}

/**
 * Check if the address data is accurate enough (has at least city and state)
 */
function isAccurateAddress(addressData) {
  const address = addressData.address || {};
  // Consider accurate if we have village/town/city and state
  const hasLocality = address.village || address.hamlet || address.town || address.city;
  const hasState = address.state;
  return hasLocality && hasState;
}

/**
 * Build precise address line 1 from address components
 */
function buildAddressLine1(address) {
  // Try to get the most specific street-level address
  if (address.house_number && address.road) {
    return `${address.house_number} ${address.road}`;
  }
  
  if (address.road) {
    return address.road;
  }
  
  // If no road, try other specific location markers
  if (address.footway || address.path || address.lane || address.alley) {
    return address.footway || address.path || address.lane || address.alley;
  }
  
  // Fallback to neighbourhood/hamlet
  if (address.neighbourhood) {
    return address.neighbourhood;
  }
  
  if (address.hamlet) {
    return address.hamlet;
  }
  
  if (address.village) {
    return address.village;
  }
  
  return '';
}

/**
 * Build address line 2 from more specific locality information
 */
function buildAddressLine2(address) {
  // Try to get specific area/locality information
  if (address.suburb) {
    return address.suburb;
  }
  
  if (address.village && !address.road) {
    return address.village;
  }
  
  if (address.hamlet && !address.road) {
    return address.hamlet;
  }
  
  // Fallback to district
  if (address.district) {
    return address.district;
  }
  
  return '';
}

/**
 * Build city name from address components with priority
 * Prefers smaller/more specific localities over larger cities
 */
function buildCity(address) {
  // Priority order for city name (from most specific to general):
  // 1. village - for places like Didwana
  // 2. hamlet - for small localities
  // 3. town - for town-level settlements
  // 4. city - for actual cities
  // 5. county/district - fallback
  
  // Check for smaller settlements first (more specific)
  if (address.village) {
    return address.village;
  }
  
  if (address.hamlet) {
    return address.hamlet;
  }
  
  if (address.town) {
    return address.town;
  }
  
  if (address.city) {
    return address.city;
  }
  
  if (address.county) {
    return address.county;
  }
  
  if (address.district) {
    return address.district;
  }
  
  return '';
}

/**
 * Handle geolocation errors with appropriate messages
 */
function handleGeolocationError(error, reject) {
  console.error('Geolocation error:', error);
  let errorMessage = 'Unable to access your location';
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
      break;
    case error.POSITION_UNAVAILABLE:
      errorMessage = 'Location information is unavailable. Please ensure you have a strong internet connection.';
      break;
    case error.TIMEOUT:
      errorMessage = 'Location request timed out. Please check your internet connection and try again.';
      break;
    default:
      errorMessage = 'Unable to get your location. Please try again or enter address manually.';
  }
  
  reject(new Error(errorMessage));
}
