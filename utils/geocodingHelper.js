/**
 * Geocoding Helper
 * Converts address text to GPS coordinates using Nominatim (OpenStreetMap)
 * 100% Free, no API key required
 */

/**
 * Geocode an address to get GPS coordinates
 * @param {string} address - The delivery address to geocode
 * @returns {Promise<{latitude: number, longitude: number, displayName: string}>}
 */
export const geocodeAddress = async (address) => {
  try {
    if (!address || address.trim().length === 0) {
      throw new Error('Address is required for geocoding');
    }

    // Add "Ghana" to improve accuracy for Ghana addresses
    const searchQuery = address.includes('Ghana') ? address : `${address}, Ghana`;
    
    // Nominatim API endpoint (free, no API key needed)
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=gh`; // Restrict to Ghana for better results

    console.log('🗺️ Geocoding address:', searchQuery);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Osebo-Shoes-App/1.0', // Nominatim requires User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('⚠️ No geocoding results found for:', address);
      // Return default coordinates for Accra, Ghana as fallback
      return {
        latitude: 5.6037,
        longitude: -0.1870,
        displayName: address,
        isDefault: true,
      };
    }

    const result = data[0];
    
    console.log('✅ Geocoding successful:', {
      address: result.display_name,
      lat: result.lat,
      lon: result.lon,
    });

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      isDefault: false,
    };
  } catch (error) {
    console.error('❌ Geocoding error:', error.message);
    
    // Return default coordinates for Accra as fallback
    return {
      latitude: 5.6037,
      longitude: -0.1870,
      displayName: address,
      isDefault: true,
      error: error.message,
    };
  }
};

/**
 * Validate GPS coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export const isValidCoordinates = (latitude, longitude) => {
  return (
    latitude !== null &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Create Google Maps navigation link
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string}
 */
export const createMapsLink = (latitude, longitude) => {
  if (!isValidCoordinates(latitude, longitude)) {
    return 'https://www.google.com/maps?q=Accra,Ghana';
  }
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * Format coordinates for display
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string}
 */
export const formatCoordinates = (latitude, longitude) => {
  if (!isValidCoordinates(latitude, longitude)) {
    return 'Coordinates not available';
  }
  return `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
};
