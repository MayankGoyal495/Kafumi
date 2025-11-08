import { Cafe } from './types';
import { CafeFilterService, CafeWithDistance } from './cafe-filter-service';

let cachedCafes: Cafe[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCafes(): Promise<Cafe[]> {
  // Return cached data if still valid
  if (cachedCafes && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedCafes;
  }

  try {
    // Determine the base URL based on environment
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/get-cafes`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cafes');
    }

    const data = await response.json();
    cachedCafes = data.cafes || [];
    lastFetchTime = Date.now();
    
    return cachedCafes;
  } catch (error) {
    console.error('Error fetching cafes:', error);
    
    // Return cached data even if expired, or empty array
    return cachedCafes || [];
  }
}

/**
 * Get cafes filtered by 20km radius from user location
 */
export async function getCafesFiltered(): Promise<CafeWithDistance[]> {
  try {
    // Get all cafes
    const cafes = await getCafes();
    
    // Get user location from localStorage
    if (typeof window === 'undefined') {
      return [];
    }
    
    const coordsStr = localStorage.getItem('userCoords');
    if (!coordsStr) {
      console.warn('No user coordinates found, returning all cafes');
      // Return all cafes with distance = 0
      return cafes.map(cafe => ({
        ...cafe,
        distanceKm: 0,
        distanceLabel: '0 km',
      }));
    }
    
    const userCoords = JSON.parse(coordsStr) as { lat: number; lng: number };
    
    // Filter cafes within 20km radius
    console.log('🔍 Filtering cafes within 20km of user location');
    const filteredCafes = await CafeFilterService.filterByRadius(cafes, userCoords, 20);
    
    console.log(`✅ Returning ${filteredCafes.length} cafes within 20km`);
    return filteredCafes;
    
  } catch (error) {
    console.error('Error filtering cafes:', error);
    // Fallback: return all cafes
    const cafes = await getCafes();
    return cafes.map(cafe => ({
      ...cafe,
      distanceKm: 0,
      distanceLabel: '0 km',
    }));
  }
}

export async function getCafeById(id: string): Promise<Cafe | undefined> {
  const cafes = await getCafes();
  return cafes.find((cafe) => cafe.id === id);
}

export async function searchCafes(query: string): Promise<Cafe[]> {
  const cafes = await getCafes();
  const lowerQuery = query.toLowerCase();
  
  return cafes.filter((cafe) => {
    return (
      cafe.name.toLowerCase().includes(lowerQuery) ||
      cafe.description.toLowerCase().includes(lowerQuery) ||
      cafe.location.address.toLowerCase().includes(lowerQuery) ||
      cafe.menuCategories.some((category) =>
        category.items.some((item) =>
          item.name.toLowerCase().includes(lowerQuery)
        )
      )
    );
  });
}

// Force refresh cache
export function refreshCafeCache() {
  cachedCafes = null;
  lastFetchTime = 0;
}
