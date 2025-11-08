// ============================================================================
// MAPPLS (MapMyIndia) API INTEGRATION - FIXED
// Comprehensive location services for India
// ============================================================================

// Configuration
const MAPPLS_CONFIG = {
  API_KEY: 'dbsomdpdvapmmxivbiaiebuehatqkylcivew',
  // Correct base URLs for Mappls APIs
  AUTOSUGGEST_URL: 'https://atlas.mappls.com/api/places/search/json',
  GEOCODE_URL: 'https://apis.mappls.com/advancedmaps/v1',
  DISTANCE_URL: 'https://apis.mappls.com/advancedmaps/v1',
  TIMEOUT: 10000,
  MAX_RESULTS: 10,
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  INDIA_BOUNDS: {
    minLat: 6,
    maxLat: 35,
    minLng: 68,
    maxLng: 97,
  },
};

// Types
export interface MapplsLocation {
  placeName: string;
  placeAddress: string;
  type: string;
  latitude: number;
  longitude: number;
  eLoc: string;
  placeId?: string;
  addressTokens?: {
    city?: string;
    district?: string;
    locality?: string;
    pincode?: string;
    poi?: string;
    state?: string;
    street?: string;
    subDistrict?: string;
    subLocality?: string;
    subSubLocality?: string;
    village?: string;
  };
}

export interface MapplsAutosuggestResult {
  suggestedLocations: MapplsLocation[];
}

export interface MapplsGeocodeResult {
  copResults: Array<{
    formatted_address: string;
    latitude: number;
    longitude: number;
    locality: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    area: string;
    subDistrict: string;
    subLocality: string;
    subSubLocality: string;
    village: string;
  }>;
}

export interface MapplsReverseGeocodeResult {
  results: Array<{
    formatted_address: string;
    latitude: number;
    longitude: number;
    locality: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    area: string;
  }>;
}

export interface MapplsDistanceResult {
  results: {
    distances: number[][]; // Distance in meters
    durations: number[][]; // Duration in seconds
  };
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getCacheKey(method: string, params: any): string {
  return `${method}_${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > MAPPLS_CONFIG.CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  
  // Clean old entries
  if (cache.size > 100) {
    const sortedEntries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20 entries
    sortedEntries.slice(0, 20).forEach(([key]) => cache.delete(key));
  }
}

// ============================================================================
// AUTOSUGGEST API - Search locations as user types
// ============================================================================

export async function mapplsAutosuggest(query: string): Promise<MapplsLocation[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cacheKey = getCacheKey('autosuggest', { query });
  const cached = getFromCache<MapplsLocation[]>(cacheKey);
  if (cached) {
    console.log('✨ Using cached Mappls autosuggest results');
    return cached;
  }

  try {
    console.log(`🔍 Mappls Autosuggest: "${query}"`);
    
    // Build URL with query parameters
    const url = new URL(MAPPLS_CONFIG.AUTOSUGGEST_URL);
    url.searchParams.append('query', query.trim());
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAPPLS_CONFIG.TIMEOUT);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Mappls API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log('🔍 Mappls API Response:', data);

    const locations = data.suggestedLocations || [];
    
    // Validate coordinates are within India
    const validLocations = locations.filter((loc: MapplsLocation) => {
      const { latitude, longitude } = loc;
      return (
        latitude >= MAPPLS_CONFIG.INDIA_BOUNDS.minLat &&
        latitude <= MAPPLS_CONFIG.INDIA_BOUNDS.maxLat &&
        longitude >= MAPPLS_CONFIG.INDIA_BOUNDS.minLng &&
        longitude <= MAPPLS_CONFIG.INDIA_BOUNDS.maxLng
      );
    });

    setCache(cacheKey, validLocations);
    console.log(`✅ Found ${validLocations.length} locations in India`);
    
    return validLocations.slice(0, MAPPLS_CONFIG.MAX_RESULTS);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mappls Autosuggest timeout');
    } else {
      console.error('Mappls Autosuggest error:', error);
    }
    return [];
  }
}

// ============================================================================
// TEXT SEARCH API - Comprehensive place search
// ============================================================================

export async function mapplsTextSearch(query: string): Promise<MapplsLocation[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cacheKey = getCacheKey('textsearch', { query });
  const cached = getFromCache<MapplsLocation[]>(cacheKey);
  if (cached) {
    console.log('✨ Using cached Mappls text search results');
    return cached;
  }

  try {
    console.log(`🔍 Mappls Text Search: "${query}"`);
    
    const url = new URL(MAPPLS_CONFIG.AUTOSUGGEST_URL);
    url.searchParams.append('query', query.trim());
    url.searchParams.append('region', 'ind');
    url.searchParams.append('tokenizeAddress', 'true');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAPPLS_CONFIG.TIMEOUT);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Mappls API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    const locations = data.suggestedLocations || [];
    
    const validLocations = locations.filter((loc: MapplsLocation) => {
      const { latitude, longitude } = loc;
      return (
        latitude >= MAPPLS_CONFIG.INDIA_BOUNDS.minLat &&
        latitude <= MAPPLS_CONFIG.INDIA_BOUNDS.maxLat &&
        longitude >= MAPPLS_CONFIG.INDIA_BOUNDS.minLng &&
        longitude <= MAPPLS_CONFIG.INDIA_BOUNDS.maxLng
      );
    });

    setCache(cacheKey, validLocations);
    console.log(`✅ Found ${validLocations.length} locations`);
    
    return validLocations;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mappls Text Search timeout');
    } else {
      console.error('Mappls Text Search error:', error);
    }
    return [];
  }
}

// ============================================================================
// GEOCODE API - Convert address to coordinates
// ============================================================================

export async function mapplsGeocode(address: string): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  state: string;
} | null> {
  if (!address || address.trim().length < 3) {
    return null;
  }

  const cacheKey = getCacheKey('geocode', { address });
  const cached = getFromCache<any>(cacheKey);
  if (cached) {
    console.log('✨ Using cached Mappls geocode result');
    return cached;
  }

  try {
    console.log(`📍 Mappls Geocode: "${address}"`);
    
    const url = `${MAPPLS_CONFIG.GEOCODE_URL}/${MAPPLS_CONFIG.API_KEY}/geo_code?addr=${encodeURIComponent(address.trim())}&itemCount=1`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAPPLS_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Mappls Geocode API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.copResults || data.copResults.length === 0) {
      console.log('⚠️ No geocode results found');
      return null;
    }

    const result = data.copResults[0];
    
    // Validate coordinates
    if (
      result.latitude < MAPPLS_CONFIG.INDIA_BOUNDS.minLat ||
      result.latitude > MAPPLS_CONFIG.INDIA_BOUNDS.maxLat ||
      result.longitude < MAPPLS_CONFIG.INDIA_BOUNDS.minLng ||
      result.longitude > MAPPLS_CONFIG.INDIA_BOUNDS.maxLng
    ) {
      console.warn('⚠️ Coordinates outside India bounds');
      return null;
    }

    const geocodeResult = {
      lat: result.latitude,
      lng: result.longitude,
      formattedAddress: result.formatted_address,
      city: result.city || result.district || result.locality || '',
      state: result.state || '',
    };

    setCache(cacheKey, geocodeResult);
    console.log(`✅ Geocoded to: ${result.formatted_address}`);
    
    return geocodeResult;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mappls Geocode timeout');
    } else {
      console.error('Mappls Geocode error:', error);
    }
    return null;
  }
}

// ============================================================================
// REVERSE GEOCODE API - Convert coordinates to address
// ============================================================================

export async function mapplsReverseGeocode(lat: number, lng: number): Promise<{
  formattedAddress: string;
  city: string;
  state: string;
  locality: string;
} | null> {
  // Validate coordinates
  if (
    lat < MAPPLS_CONFIG.INDIA_BOUNDS.minLat ||
    lat > MAPPLS_CONFIG.INDIA_BOUNDS.maxLat ||
    lng < MAPPLS_CONFIG.INDIA_BOUNDS.minLng ||
    lng > MAPPLS_CONFIG.INDIA_BOUNDS.maxLng
  ) {
    console.warn('⚠️ Coordinates outside India bounds');
    return null;
  }

  const cacheKey = getCacheKey('reverse_geocode', { lat, lng });
  const cached = getFromCache<any>(cacheKey);
  if (cached) {
    console.log('✨ Using cached Mappls reverse geocode result');
    return cached;
  }

  try {
    console.log(`🔄 Mappls Reverse Geocode: ${lat}, ${lng}`);
    
    const url = `${MAPPLS_CONFIG.GEOCODE_URL}/${MAPPLS_CONFIG.API_KEY}/rev_geocode?lat=${lat}&lng=${lng}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAPPLS_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Mappls Reverse Geocode API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log('⚠️ No reverse geocode results found');
      return null;
    }

    const result = data.results[0];
    
    const reverseResult = {
      formattedAddress: result.formatted_address,
      city: result.city || result.district || '',
      state: result.state || '',
      locality: result.locality || result.area || '',
    };

    setCache(cacheKey, reverseResult);
    console.log(`✅ Reverse geocoded to: ${result.formatted_address}`);
    
    return reverseResult;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mappls Reverse Geocode timeout');
    } else {
      console.error('Mappls Reverse Geocode error:', error);
    }
    return null;
  }
}

// ============================================================================
// DISTANCE MATRIX API - Calculate distances between multiple points
// ============================================================================

export async function mapplsDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>
): Promise<{
  distances: number[][]; // in km
  durations: number[][]; // in minutes
} | null> {
  if (origins.length === 0 || destinations.length === 0) {
    return null;
  }

  try {
    console.log(`🚗 Mappls Distance Matrix: ${origins.length} origins × ${destinations.length} destinations`);
    
    // Format coordinates as "lat,lng" strings
    const originStr = origins.map(o => `${o.lat},${o.lng}`).join(';');
    const destStr = destinations.map(d => `${d.lat},${d.lng}`).join(';');
    
    const url = `${MAPPLS_CONFIG.DISTANCE_URL}/${MAPPLS_CONFIG.API_KEY}/distance_matrix/driving/${originStr}?destinations=${destStr}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAPPLS_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Mappls Distance Matrix API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.results || !data.results.distances) {
      console.log('⚠️ No distance matrix results');
      return null;
    }

    // Convert meters to km and seconds to minutes
    const distances = data.results.distances.map((row: number[]) => 
      row.map((dist: number) => dist / 1000)
    );
    
    const durations = data.results.durations.map((row: number[]) => 
      row.map((dur: number) => dur / 60)
    );

    console.log(`✅ Distance matrix calculated`);
    
    return { distances, durations };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mappls Distance Matrix timeout');
    } else {
      console.error('Mappls Distance Matrix error:', error);
    }
    return null;
  }
}

// ============================================================================
// HELPER: Calculate distance to single destination
// ============================================================================

export async function mapplsCalculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{
  distanceKm: number;
  durationMinutes: number;
} | null> {
  const result = await mapplsDistanceMatrix([origin], [destination]);
  
  if (!result || !result.distances[0] || !result.durations[0]) {
    return null;
  }

  return {
    distanceKm: result.distances[0][0],
    durationMinutes: result.durations[0][0],
  };
}

// ============================================================================
// HELPER: Get current user location with high accuracy
// ============================================================================

export async function getCurrentLocationMappls(): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  state: string;
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log(`📍 Current location: ${latitude}, ${longitude}`);
        
        // Reverse geocode to get address
        const address = await mapplsReverseGeocode(latitude, longitude);
        
        if (address) {
          resolve({
            lat: latitude,
            lng: longitude,
            formattedAddress: address.formattedAddress,
            city: address.city,
            state: address.state,
          });
        } else {
          resolve({
            lat: latitude,
            lng: longitude,
            formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: '',
            state: '',
          });
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  });
}

// ============================================================================
// EXPORT UNIFIED INTERFACE
// ============================================================================

export const MapplsAPI = {
  autosuggest: mapplsAutosuggest,
  textSearch: mapplsTextSearch,
  geocode: mapplsGeocode,
  reverseGeocode: mapplsReverseGeocode,
  distanceMatrix: mapplsDistanceMatrix,
  calculateDistance: mapplsCalculateDistance,
  getCurrentLocation: getCurrentLocationMappls,
};

export default MapplsAPI;
