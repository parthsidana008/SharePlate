/**
 * Location Service
 * Handles geolocation and reverse geocoding
 */

/**
 * Reverse geocode coordinates to human-readable address
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Location string (e.g., "New York, NY")
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SharePlate Food Donation App' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract city and state/country from response
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.county;
    const state = address.state;
    const country = address.country;

    // Build location string
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city && country) {
      return `${city}, ${country}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    } else {
      return 'Location detected';
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{latitude: number, longitude: number, locationString: string}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const locationString = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            locationString
          });
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          resolve({
            latitude,
            longitude,
            locationString: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
          });
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  });
};
