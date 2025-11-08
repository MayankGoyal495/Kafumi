// ============================================================================
// CAFE FILTERING SERVICE
// Handles 20km radius filtering and distance calculations
// ============================================================================

import { Cafe } from './types';
import { MapplsAPI } from './mappls-api';
import { haversineDistanceKm } from './geocoding';

// Configuration
const FILTER_CONFIG = {
  DEFAULT_RADIUS_KM: 20,
  MAX_BATCH_SIZE: 25, // Mappls API limit for distance matrix
  USE_MAPPLS_DISTANCE: true, // Use Mappls for accurate driving distance
  FALLBACK_TO_HAVERSINE: true,
};

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

export interface CafeWithDistance extends Cafe {
  distanceKm: number;
  durationMinutes?: number;
  distanceLabel: string;
}

// ============================================================================
// CORE FILTERING FUNCTION
// ============================================================================

/**
 * Filter cafes within specified radius from user location
 * Uses Mappls Distance Matrix API for accurate driving distances
 * Falls back to haversine (straight-line) distance if API fails
 */
export async function filterCafesByRadius(
  cafes: Cafe[],
  userLocation: UserLocation,
  radiusKm: number = FILTER_CONFIG.DEFAULT_RADIUS_KM
): Promise<CafeWithDistance[]> {
  if (cafes.length === 0) {
    console.log('⚠️ No cafes to filter');
    return [];
  }

  console.log(`🔍 Filtering ${cafes.length} cafes within ${radiusKm}km of user location`);
  console.log(`📍 User location: ${userLocation.lat}, ${userLocation.lng}`);

  // First pass: Filter by haversine distance (quick pre-filter)
  // Use slightly larger radius to account for roads vs straight-line distance
  const preFilterRadiusKm = radiusKm * 1.5;
  
  const preFilteredCafes = cafes.filter(cafe => {
    const distance = haversineDistanceKm(
      { lat: userLocation.lat, lng: userLocation.lng },
      { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
    );
    return distance <= preFilterRadiusKm;
  });

  console.log(`✅ Pre-filtered to ${preFilteredCafes.length} cafes (straight-line < ${preFilterRadiusKm.toFixed(1)}km)`);

  if (preFilteredCafes.length === 0) {
    return [];
  }

  // Second pass: Get accurate driving distances using Mappls
  let cafesWithDistance: CafeWithDistance[];

  if (FILTER_CONFIG.USE_MAPPLS_DISTANCE) {
    cafesWithDistance = await calculateAccurateDistances(preFilteredCafes, userLocation);
  } else {
    // Use haversine only
    cafesWithDistance = preFilteredCafes.map(cafe => {
      const distanceKm = haversineDistanceKm(
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
      );
      return {
        ...cafe,
        distanceKm,
        distanceLabel: formatDistance(distanceKm),
      };
    });
  }

  // Final filter: Keep only cafes within actual radius
  const filteredCafes = cafesWithDistance.filter(cafe => cafe.distanceKm <= radiusKm);

  // Sort by distance (closest first)
  filteredCafes.sort((a, b) => a.distanceKm - b.distanceKm);

  console.log(`✅ Final result: ${filteredCafes.length} cafes within ${radiusKm}km`);
  
  if (filteredCafes.length > 0) {
    console.log(`📍 Closest cafe: ${filteredCafes[0].name} (${filteredCafes[0].distanceLabel})`);
    console.log(`📍 Farthest cafe: ${filteredCafes[filteredCafes.length - 1].name} (${filteredCafes[filteredCafes.length - 1].distanceLabel})`);
  }

  return filteredCafes;
}

// ============================================================================
// ACCURATE DISTANCE CALCULATION
// ============================================================================

async function calculateAccurateDistances(
  cafes: Cafe[],
  userLocation: UserLocation
): Promise<CafeWithDistance[]> {
  console.log(`🚗 Calculating accurate driving distances for ${cafes.length} cafes...`);

  // Process in batches to respect API limits
  const batches: Cafe[][] = [];
  for (let i = 0; i < cafes.length; i += FILTER_CONFIG.MAX_BATCH_SIZE) {
    batches.push(cafes.slice(i, i + FILTER_CONFIG.MAX_BATCH_SIZE));
  }

  const allResults: CafeWithDistance[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`  Processing batch ${i + 1}/${batches.length} (${batch.length} cafes)`);

    try {
      // Prepare origins (user location) and destinations (cafe locations)
      const origins = [{ lat: userLocation.lat, lng: userLocation.lng }];
      const destinations = batch.map(cafe => ({
        lat: cafe.location.coordinates.lat,
        lng: cafe.location.coordinates.lng,
      }));

      // Call Mappls Distance Matrix API
      const distanceResult = await MapplsAPI.distanceMatrix(origins, destinations);

      if (distanceResult && distanceResult.distances[0]) {
        // Success: Use Mappls distances
        const distances = distanceResult.distances[0];
        const durations = distanceResult.durations[0];

        batch.forEach((cafe, index) => {
          allResults.push({
            ...cafe,
            distanceKm: distances[index],
            durationMinutes: durations[index],
            distanceLabel: formatDistance(distances[index]),
          });
        });

        console.log(`  ✅ Batch ${i + 1} complete (Mappls distances)`);
      } else {
        // Fallback to haversine
        console.log(`  ⚠️ Mappls API failed for batch ${i + 1}, using haversine`);
        batch.forEach(cafe => {
          const distanceKm = haversineDistanceKm(
            { lat: userLocation.lat, lng: userLocation.lng },
            { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
          );
          allResults.push({
            ...cafe,
            distanceKm,
            distanceLabel: formatDistance(distanceKm),
          });
        });
      }
    } catch (error) {
      console.error(`  ❌ Error in batch ${i + 1}:`, error);
      
      // Fallback to haversine for this batch
      batch.forEach(cafe => {
        const distanceKm = haversineDistanceKm(
          { lat: userLocation.lat, lng: userLocation.lng },
          { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
        );
        allResults.push({
          ...cafe,
          distanceKm,
          distanceLabel: formatDistance(distanceKm),
        });
      });
    }

    // Add small delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return allResults;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Quick check if cafe is within radius (haversine only)
 * Useful for fast filtering without API calls
 */
export function isCafeWithinRadius(
  cafe: Cafe,
  userLocation: UserLocation,
  radiusKm: number = FILTER_CONFIG.DEFAULT_RADIUS_KM
): boolean {
  const distance = haversineDistanceKm(
    { lat: userLocation.lat, lng: userLocation.lng },
    { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
  );
  return distance <= radiusKm;
}

/**
 * Get distance to cafe (haversine only)
 */
export function getCafeDistance(
  cafe: Cafe,
  userLocation: UserLocation
): number {
  return haversineDistanceKm(
    { lat: userLocation.lat, lng: userLocation.lng },
    { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
  );
}

/**
 * Calculate distance to a single cafe with Mappls
 */
export async function getCafeDistanceAccurate(
  cafe: Cafe,
  userLocation: UserLocation
): Promise<{
  distanceKm: number;
  durationMinutes?: number;
  distanceLabel: string;
}> {
  try {
    const result = await MapplsAPI.calculateDistance(
      { lat: userLocation.lat, lng: userLocation.lng },
      { lat: cafe.location.coordinates.lat, lng: cafe.location.coordinates.lng }
    );

    if (result) {
      return {
        distanceKm: result.distanceKm,
        durationMinutes: result.durationMinutes,
        distanceLabel: formatDistance(result.distanceKm),
      };
    }
  } catch (error) {
    console.error('Mappls distance calculation failed, using haversine:', error);
  }

  // Fallback
  const distanceKm = getCafeDistance(cafe, userLocation);
  return {
    distanceKm,
    distanceLabel: formatDistance(distanceKm),
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

export function getCafeDistanceStats(cafesWithDistance: CafeWithDistance[]): {
  total: number;
  closest: CafeWithDistance | null;
  farthest: CafeWithDistance | null;
  averageDistanceKm: number;
  within5km: number;
  within10km: number;
  within15km: number;
  within20km: number;
} {
  if (cafesWithDistance.length === 0) {
    return {
      total: 0,
      closest: null,
      farthest: null,
      averageDistanceKm: 0,
      within5km: 0,
      within10km: 0,
      within15km: 0,
      within20km: 0,
    };
  }

  const sorted = [...cafesWithDistance].sort((a, b) => a.distanceKm - b.distanceKm);
  const totalDistance = cafesWithDistance.reduce((sum, cafe) => sum + cafe.distanceKm, 0);

  return {
    total: cafesWithDistance.length,
    closest: sorted[0],
    farthest: sorted[sorted.length - 1],
    averageDistanceKm: totalDistance / cafesWithDistance.length,
    within5km: cafesWithDistance.filter(c => c.distanceKm <= 5).length,
    within10km: cafesWithDistance.filter(c => c.distanceKm <= 10).length,
    within15km: cafesWithDistance.filter(c => c.distanceKm <= 15).length,
    within20km: cafesWithDistance.filter(c => c.distanceKm <= 20).length,
  };
}

export const CafeFilterService = {
  filterByRadius: filterCafesByRadius,
  isCafeWithinRadius,
  getCafeDistance,
  getCafeDistanceAccurate,
  getStats: getCafeDistanceStats,
  DEFAULT_RADIUS_KM: FILTER_CONFIG.DEFAULT_RADIUS_KM,
};

export default CafeFilterService;
