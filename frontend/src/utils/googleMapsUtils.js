/**
 * Google Maps utilities for precise location search
 * Provides better accuracy than OpenStreetMap for Indian locations
 */

/**
 * Search locations using Google Maps Places API (Text Search)
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of location results
 */
export const searchGooglePlaces = async (query) => {
  try {
    // Using Google Maps Geocoding API (free tier available)
    // This works without API key for basic functionality
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query + ', India')}&region=in&language=en`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results) {
      return data.results.map(result => ({
        display_name: result.formatted_address,
        address: parseGoogleAddress(result.address_components),
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        place_id: result.place_id,
        type: result.types[0] || 'location',
        source: 'google'
      }));
    }
    
    return null;
  } catch (error) {
    console.warn('Google Maps API error:', error);
    return null;
  }
};

/**
 * Parse Google Maps address components into our format
 */
function parseGoogleAddress(components) {
  const address = {
    house_number: '',
    road: '',
    neighbourhood: '',
    suburb: '',
    village: '',
    town: '',
    city: '',
    district: '',
    state: '',
    postcode: '',
    country: 'India'
  };
  
  components.forEach(component => {
    const type = component.types[0];
    
    switch (type) {
      case 'street_number':
        address.house_number = component.long_name;
        break;
      case 'route':
      case 'street_address':
        address.road = component.long_name;
        break;
      case 'sublocality_level_1':
      case 'sublocality':
        address.neighbourhood = component.long_name;
        break;
      case 'sublocality_level_2':
        address.suburb = component.long_name;
        break;
      case 'locality':
        address.city = component.long_name;
        break;
      case 'administrative_area_level_3':
        address.town = component.long_name;
        break;
      case 'administrative_area_level_2':
        address.district = component.long_name;
        break;
      case 'administrative_area_level_1':
        address.state = component.long_name;
        break;
      case 'postal_code':
        address.postcode = component.long_name;
        break;
      case 'country':
        address.country = component.long_name;
        break;
    }
  });
  
  // Fallback: if no city, try town or district
  if (!address.city) {
    address.city = address.town || address.district;
  }
  
  return address;
}

/**
 * Enhanced search combining Google Maps and OpenStreetMap
 */
export const searchPreciseLocation = async (query) => {
  // Try Google Maps first (more accurate for India)
  const googleResults = await searchGooglePlaces(query);
  
  if (googleResults && googleResults.length > 0) {
    console.log('Using Google Maps results');
    return googleResults;
  }
  
  // Fallback to OpenStreetMap Nominatim
  console.log('Falling back to OpenStreetMap');
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=10&dedupe=0`
    );
    
    const data = await response.json();
    
    return data
      .filter(result => result.address && (result.address.city || result.address.town || result.address.village))
      .sort((a, b) => b.importance - a.importance)
      .map(result => ({
        display_name: result.display_name,
        address: result.address,
        latitude: result.lat,
        longitude: result.lon,
        place_id: result.place_id,
        type: result.type,
        source: 'osm'
      }));
  } catch (error) {
    console.error('OpenStreetMap error:', error);
    return [];
  }
};

/**
 * Reverse geocode using Google Maps (most accurate)
 */
export const reverseGeocodeGoogle = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&region=in`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        display_name: result.formatted_address,
        address: parseGoogleAddress(result.address_components),
        source: 'google'
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Google reverse geocoding failed:', error);
    return null;
  }
};
