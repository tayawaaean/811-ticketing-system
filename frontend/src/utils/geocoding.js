/**
 * Geocoding utilities for converting between coordinates and addresses
 */

/**
 * Reverse geocoding service using OpenStreetMap Nominatim API
 * Converts coordinates to a formatted US address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Formatted address object
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }
    
    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error('No address data found for coordinates');
    }
    
    return formatUSAddress(data);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Failed to get address information');
  }
};

/**
 * Formats the address data from Nominatim into a readable US address
 * @param {Object} data - Raw address data from Nominatim
 * @returns {Object} Formatted address object
 */
const formatUSAddress = (data) => {
  const address = data.address;
  
  // Extract address components
  const streetNumber = address.house_number || '';
  const streetName = address.road || address.street || '';
  const city = address.city || address.town || address.village || address.hamlet || '';
  const state = address.state || '';
  const zipCode = address.postcode || '';
  const country = address.country || 'United States';
  
  // Build formatted address
  const streetAddress = [streetNumber, streetName].filter(Boolean).join(' ');
  const cityStateZip = [city, state, zipCode].filter(Boolean).join(', ');
  
  // Create different address formats
  const fullAddress = [streetAddress, cityStateZip, country].filter(Boolean).join(', ');
  const shortAddress = cityStateZip || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  
  return {
    streetAddress: streetAddress || 'Address not available',
    city: city || 'Unknown City',
    state: state || 'Unknown State',
    zipCode: zipCode || '',
    country: country,
    fullAddress: fullAddress,
    shortAddress: shortAddress,
    coordinates: {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon)
    },
    rawAddress: address
  };
};

/**
 * Forward geocoding service using OpenStreetMap Nominatim API
 * Converts address string to coordinates
 * @param {string} query - Address or location query
 * @returns {Promise<Object>} Coordinates and formatted address
 */
export const forwardGeocode = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&accept-language=en`
    );
    
    if (!response.ok) {
      throw new Error('Forward geocoding request failed');
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No results found for the given address');
    }
    
    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Get formatted address using reverse geocoding
    const addressData = await reverseGeocode(lat, lng);
    
    return {
      coordinates: { lat, lng },
      address: addressData
    };
  } catch (error) {
    console.error('Forward geocoding error:', error);
    throw new Error('Failed to find location');
  }
};

/**
 * Check if coordinates are within the United States
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if coordinates are within US bounds
 */
export const isWithinUS = (lat, lng) => {
  // Rough bounding box for the United States
  const US_BOUNDS = {
    north: 71.5,
    south: 18.9,
    east: -66.9,
    west: -179.1
  };
  
  return lat >= US_BOUNDS.south && 
         lat <= US_BOUNDS.north && 
         lng >= US_BOUNDS.west && 
         lng <= US_BOUNDS.east;
};

/**
 * Get a user-friendly location display string
 * @param {Object} location - Location object with coordinates and optional address
 * @returns {string} Formatted location string
 */
export const getLocationDisplayString = (location) => {
  if (!location) return 'No location selected';
  
  // Check for addressData (new format) - highest priority
  if (location.addressData) {
    return location.addressData.shortAddress || location.addressData.fullAddress;
  }
  
  // Check for address (legacy format) - high priority
  if (location.address) {
    return location.address.shortAddress || location.address.fullAddress;
  }
  
  // Check for location string - medium priority (before coordinates)
  if (location.location) {
    return location.location;
  }
  
  // Check for coordinates in new format (latitude/longitude) - lower priority
  if (location.coordinates?.latitude && location.coordinates?.longitude) {
    return `${location.coordinates.latitude.toFixed(4)}, ${location.coordinates.longitude.toFixed(4)}`;
  }
  
  // Check for coordinates in legacy format (lat/lng) - lower priority
  if (location.lat && location.lng) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }
  
  // Check for direct latitude/longitude properties - lowest priority
  if (location.latitude && location.longitude) {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
  
  return 'Invalid location';
};
