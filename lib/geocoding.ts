// ============================================================================
// IMPROVED GEOCODING SYSTEM WITH CACHING, TIMEOUTS, AND BETTER ERROR HANDLING
// ============================================================================

// Types
export type GeocodingResult = {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  source?: string;
};

type CachedResult = {
  data: GeocodingResult[];
  timestamp: number;
};

// Configuration
const API_KEYS = {
  LOCATIONIQ: process.env.NEXT_PUBLIC_LOCATIONIQ_KEY || '',
  MAPBOX: process.env.NEXT_PUBLIC_MAPBOX_KEY || '',
  OPENCAGE: process.env.NEXT_PUBLIC_OPENCAGE_KEY || '',
  MAPMYINDIA: process.env.NEXT_PUBLIC_MAPMYINDIA_KEY || '',
};

const CONFIG = {
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes (increased from 5)
  API_TIMEOUT: 15000, // 15 seconds (increased from 8)
  MAX_RETRIES: 2, // Retry failed requests
  RETRY_DELAY: 1000, // 1 second between retries
  MIN_QUERY_LENGTH: 2,
  USER_AGENT: 'Koffista-Cafe-Discovery/2.0 (contact@koffista.com)',
  DEBOUNCE_DELAY: 500, // Debounce search requests
};

// Simple in-memory cache
const searchCache = new Map<string, CachedResult>();

// Rate limiting tracking
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCachedResults(query: string): GeocodingResult[] | null {
  const normalizedQuery = normalizeQuery(query);
  const cached = searchCache.get(normalizedQuery);
  
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
    console.log(`✨ Using cached results for: "${query}"`);
    return cached.data;
  }
  
  return null;
}

function setCachedResults(query: string, results: GeocodingResult[]): void {
  const normalizedQuery = normalizeQuery(query);
  searchCache.set(normalizedQuery, {
    data: results,
    timestamp: Date.now(),
  });
  
  // Clean old cache entries (keep only last 100)
  if (searchCache.size > 100) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
}

function isRateLimited(apiName: string): boolean {
  const tracker = rateLimitTracker.get(apiName);
  if (!tracker) return false;
  
  if (Date.now() < tracker.resetTime) {
    return tracker.count >= 5; // Max 5 requests per minute per API
  }
  
  // Reset counter
  rateLimitTracker.delete(apiName);
  return false;
}

function incrementRateLimit(apiName: string): void {
  const tracker = rateLimitTracker.get(apiName);
  const now = Date.now();
  
  if (!tracker || now >= tracker.resetTime) {
    rateLimitTracker.set(apiName, {
      count: 1,
      resetTime: now + 60000, // Reset after 1 minute
    });
  } else {
    tracker.count++;
  }
}

async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = CONFIG.API_TIMEOUT,
  retries: number = CONFIG.MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // If we get a rate limit response, throw to trigger retry
      if (response.status === 429) {
        throw new Error('Rate limited');
      }
      
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // If this was the last retry, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying
      console.log(`⚠️ Request failed, retrying (${attempt + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * (attempt + 1)));
    }
  }
  
  throw new Error('All retry attempts failed');
}

// ============================================================================
// REVERSE GEOCODING (Coordinates to City)
// ============================================================================

export async function reverseGeocodeToCity(latitude: number, longitude: number): Promise<string | null> {
  try {
    console.log(`🔄 Reverse geocoding: ${latitude}, ${longitude}`);
    
    // Try multiple services with better error handling
    const services = [
      {
        name: 'Nominatim',
        fetch: async () => {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=12`;
          const res = await fetchWithTimeout(url, {
            headers: { 'User-Agent': CONFIG.USER_AGENT },
          });
          
          if (!res.ok) return null;
          
          const data = await res.json();
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.hamlet;
          const state = address.state || address.county;
          
          if (!city) return null;
          return state && state !== city ? `${city}, ${state}` : city;
        }
      },
      {
        name: 'BigDataCloud',
        fetch: async () => {
          const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const res = await fetchWithTimeout(url);
          
          if (!res.ok) return null;
          
          const data = await res.json();
          const city = data.city || data.locality || data.principalSubdivision || data.localityInfo?.administrative?.[0]?.name;
          
          if (!city) return null;
          
          const region = data.principalSubdivision || data.countryName;
          return region && region !== city ? `${city}, ${region}` : city;
        }
      },
    ];

    // Try services sequentially
    for (const service of services) {
      try {
        console.log(`  🔄 Trying ${service.name}...`);
        const result = await service.fetch();
        if (result) {
          console.log(`  ✅ ${service.name} succeeded: ${result}`);
          return result;
        }
      } catch (error) {
        console.error(`  ❌ ${service.name} failed:`, error);
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ All reverse geocoding services failed:', error);
    return null;
  }
}

// ============================================================================
// FORWARD GEOCODING (City to Coordinates) - Legacy Support
// ============================================================================

export async function geocodeCityToCoords(cityName: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(cityName)}&localityLanguage=en`;
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.latitude,
        lng: result.longitude,
      };
    }
    
    return null;
  } catch (error) {
    console.error('BigDataCloud geocoding error:', error);
    return null;
  }
}

// ============================================================================
// INDIVIDUAL API IMPLEMENTATIONS
// ============================================================================

export async function geocodeWithPhoton(query: string): Promise<GeocodingResult[]> {
  if (isRateLimited('Photon')) {
    console.log('⚠️ Photon rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('Photon');
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.features || data.features.length === 0) return [];
    
    return data.features.map((feature: any) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [];
      
      const city = props.city || props.locality || props.county || props.district || '';
      const state = props.state || props.county || '';
      const country = props.country || 'India';
      const name = props.name || city || state || 'Unknown';
      
      const addressParts = [props.housenumber, props.street, props.name, city, state, country].filter(Boolean);
      
      return {
        name,
        address: addressParts.join(', '),
        city,
        state,
        country,
        lat: coords[1] || 0,
        lng: coords[0] || 0,
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('Photon API error:', error);
    return [];
  }
}

export async function geocodeWithNominatim(query: string): Promise<{ lat: number; lng: number; address: string } | null> {
  if (isRateLimited('Nominatim')) {
    console.log('⚠️ Nominatim rate limited, skipping');
    return null;
  }
  
  try {
    incrementRateLimit('Nominatim');
    // Add delay to respect Nominatim's 1 request per second rule
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': CONFIG.USER_AGENT },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Nominatim API error:', error);
    return null;
  }
}

async function geocodeWithNominatimMultiple(query: string): Promise<GeocodingResult[]> {
  if (isRateLimited('Nominatim')) {
    console.log('⚠️ Nominatim rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('Nominatim');
    // Add delay to respect Nominatim's 1 request per second rule
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': CONFIG.USER_AGENT },
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data || data.length === 0) return [];
    
    return data.map((result: any) => {
      const address = result.address || {};
      const city = address.city || address.town || address.village || address.hamlet || '';
      const state = address.state || address.county || '';
      const country = address.country || 'India';
      
      return {
        name: result.display_name?.split(',')[0] || city || state || 'Unknown',
        address: result.display_name,
        city,
        state,
        country,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('Nominatim multiple API error:', error);
    return [];
  }
}

export async function geocodeWithLocationIQ(query: string): Promise<GeocodingResult[]> {
  if (!API_KEYS.LOCATIONIQ) {
    console.log('⚠️ LocationIQ API key not configured');
    return [];
  }
  
  if (isRateLimited('LocationIQ')) {
    console.log('⚠️ LocationIQ rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('LocationIQ');
    const url = `https://us1.locationiq.com/v1/search?key=${API_KEYS.LOCATIONIQ}&q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&normalizecity=1`;
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('⚠️ LocationIQ rate limit reached');
      } else if (res.status === 401) {
        console.error('❌ LocationIQ API key invalid');
      }
      return [];
    }
    
    const data = await res.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    return data.map((result: any) => {
      const address = result.address || {};
      const city = address.city || address.town || address.village || address.hamlet || '';
      const state = address.state || address.county || '';
      const country = address.country || 'India';
      
      return {
        name: result.display_name?.split(',')[0] || city || state || 'Unknown',
        address: result.display_name,
        city,
        state,
        country,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('LocationIQ API error:', error);
    return [];
  }
}

export async function geocodeWithMapbox(query: string): Promise<GeocodingResult[]> {
  if (!API_KEYS.MAPBOX) {
    console.log('⚠️ Mapbox API key not configured');
    return [];
  }
  
  if (isRateLimited('Mapbox')) {
    console.log('⚠️ Mapbox rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('Mapbox');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${API_KEYS.MAPBOX}&limit=10&country=IN`;
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.features || data.features.length === 0) return [];
    
    return data.features.map((feature: any) => {
      const coords = feature.geometry?.coordinates || [];
      const context = feature.context || [];
      
      const city = context.find((c: any) => c.id?.includes('place'))?.text || '';
      const state = context.find((c: any) => c.id?.includes('region'))?.text || '';
      const country = context.find((c: any) => c.id?.includes('country'))?.text || 'India';
      
      return {
        name: feature.text || feature.place_name?.split(',')[0] || city || 'Unknown',
        address: feature.place_name,
        city,
        state,
        country,
        lat: coords[1] || 0,
        lng: coords[0] || 0,
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('Mapbox API error:', error);
    return [];
  }
}

export async function geocodeWithOpenCage(query: string): Promise<GeocodingResult[]> {
  if (!API_KEYS.OPENCAGE) {
    console.log('⚠️ OpenCage API key not configured');
    return [];
  }
  
  if (isRateLimited('OpenCage')) {
    console.log('⚠️ OpenCage rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('OpenCage');
    const url = `https://api.opencagedata.com/geocode/v1/json?key=${API_KEYS.OPENCAGE}&q=${encodeURIComponent(query)}&limit=10&no_annotations=1&countrycode=in`;
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('⚠️ OpenCage rate limit reached');
      } else if (res.status === 402 || res.status === 403) {
        console.error('❌ OpenCage API key invalid or quota exceeded');
      }
      return [];
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) return [];
    
    return data.results.map((result: any) => {
      const components = result.components || {};
      const city = components.city || components.town || components.village || components.hamlet || '';
      const state = components.state || components.county || '';
      const country = components.country || 'India';
      
      return {
        name: components.building || components.road || city || state || 'Unknown',
        address: result.formatted,
        city,
        state,
        country,
        lat: result.geometry?.lat || 0,
        lng: result.geometry?.lng || 0,
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('OpenCage API error:', error);
    return [];
  }
}

export async function geocodeWithMapMyIndia(query: string): Promise<GeocodingResult[]> {
  if (!API_KEYS.MAPMYINDIA) {
    console.log('⚠️ MapMyIndia API key not configured');
    return [];
  }
  
  if (isRateLimited('MapMyIndia')) {
    console.log('⚠️ MapMyIndia rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('MapMyIndia');
    const url = `https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}&region=ind&tokenizeAddress=true&pod=SLC,LC,CITY,VLG,SDIST,DIST,STATE`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.MAPMYINDIA}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.suggestedLocations || data.suggestedLocations.length === 0) return [];
    
    return data.suggestedLocations.map((result: any) => {
      const city = result.city || result.district || '';
      const state = result.state || '';
      const country = 'India';
      
      return {
        name: result.placeName || city || state || 'Unknown',
        address: result.placeAddress || `${city}, ${state}, India`,
        city,
        state,
        country,
        lat: parseFloat(result.latitude) || 0,
        lng: parseFloat(result.longitude) || 0,
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('MapMyIndia API error:', error);
    return [];
  }
}

async function geocodeWithBigDataCloud(query: string): Promise<GeocodingResult[]> {
  if (isRateLimited('BigDataCloud')) {
    console.log('⚠️ BigDataCloud rate limited, skipping');
    return [];
  }
  
  try {
    incrementRateLimit('BigDataCloud');
    const url = `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(query)}&localityLanguage=en&limit=10`;
    const res = await fetchWithTimeout(url);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) return [];
    
    return data.results.map((result: any) => {
      const city = result.city || result.locality || result.principalSubdivision || '';
      const state = result.principalSubdivision || '';
      const country = result.countryName || 'India';
      
      return {
        name: result.locality || result.city || result.principalSubdivision || result.countryName || 'Unknown',
        address: result.formattedAddress || `${city}, ${state}, ${country}`,
        city,
        state,
        country,
        lat: result.latitude,
        lng: result.longitude,
      };
    }).filter((location: any) => location.lat && location.lng);
    
  } catch (error) {
    console.error('BigDataCloud API error:', error);
    return [];
  }
}

// ============================================================================
// ENHANCED SEARCH WITH SMART SEQUENCING
// ============================================================================

export async function searchLocationsEnhanced(query: string): Promise<GeocodingResult[]> {
  // Validate query
  if (!query || query.trim().length < CONFIG.MIN_QUERY_LENGTH) {
    console.log('❌ Query too short or empty');
    return [];
  }

  const trimmedQuery = query.trim();
  
  // Check cache first
  const cachedResults = getCachedResults(trimmedQuery);
  if (cachedResults) {
    return cachedResults;
  }

  console.log(`🔍 Starting enhanced location search for: "${trimmedQuery}"`);

  // Try APIs in priority order (one at a time to avoid rate limits)
  const apiOrder = [
    // Premium APIs first (if available)
    {
      name: 'LocationIQ',
      enabled: !!API_KEYS.LOCATIONIQ,
      fetch: () => geocodeWithLocationIQ(trimmedQuery),
      priority: 1,
    },
    {
      name: 'OpenCage',
      enabled: !!API_KEYS.OPENCAGE,
      fetch: () => geocodeWithOpenCage(trimmedQuery),
      priority: 2,
    },
    {
      name: 'MapMyIndia',
      enabled: !!API_KEYS.MAPMYINDIA,
      fetch: () => geocodeWithMapMyIndia(trimmedQuery),
      priority: 3,
    },
    {
      name: 'Mapbox',
      enabled: !!API_KEYS.MAPBOX,
      fetch: () => geocodeWithMapbox(trimmedQuery),
      priority: 4,
    },
    // Free APIs
    {
      name: 'Photon',
      enabled: true,
      fetch: () => geocodeWithPhoton(trimmedQuery),
      priority: 5,
    },
    {
      name: 'Nominatim',
      enabled: true,
      fetch: () => geocodeWithNominatimMultiple(trimmedQuery),
      priority: 6,
    },
    {
      name: 'BigDataCloud',
      enabled: true,
      fetch: () => geocodeWithBigDataCloud(trimmedQuery),
      priority: 7,
    },
  ];

  // Filter and sort by priority
  const enabledAPIs = apiOrder
    .filter(api => api.enabled)
    .sort((a, b) => a.priority - b.priority);

  console.log(`📡 Will try ${enabledAPIs.length} APIs: ${enabledAPIs.map(a => a.name).join(', ')}`);

  // Try each API sequentially until we get results
  for (const api of enabledAPIs) {
    try {
      console.log(`🔄 [${api.priority}/${enabledAPIs.length}] Trying ${api.name}...`);
      const startTime = Date.now();
      
      const results = await api.fetch();
      const duration = Date.now() - startTime;
      
      if (results && results.length > 0) {
        console.log(`✅ ${api.name} SUCCESS: ${results.length} results in ${duration}ms`);
        
        const resultsWithSource = results.map(r => ({ 
          ...r, 
          source: api.name 
        }));
        
        // Cache the results
        setCachedResults(trimmedQuery, resultsWithSource);
        
        return resultsWithSource;
      }
      
      console.log(`⚠️ ${api.name} returned no results in ${duration}ms`);
      
    } catch (error) {
      console.error(`❌ ${api.name} failed:`, error);
    }
  }

  console.log(`🚫 All geocoding services failed for: "${trimmedQuery}"`);
  return [];
}

// Legacy compatibility
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  return searchLocationsEnhanced(query);
}

// ============================================================================
// DISTANCE CALCULATION UTILITIES
// ============================================================================

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  
  const aVal = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  
  return R * c;
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
