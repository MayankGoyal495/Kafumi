import { haversineDistanceKm } from "@/lib/geocoding"
import { MapplsAPI } from "@/lib/mappls-api"

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Returns driving distance in km using Mappls Distance Matrix API,
 * otherwise falls back to straight-line haversine distance.
 */
export async function getDistanceKm(origin: Coordinates, destination: Coordinates): Promise<number> {
  try {
    console.log(`🚗 Calculating distance from ${origin.lat},${origin.lng} to ${destination.lat},${destination.lng}`);
    
    // Try Mappls Distance Matrix API first
    const result = await MapplsAPI.calculateDistance(origin, destination);
    
    if (result && result.distanceKm) {
      console.log(`✅ Mappls distance: ${result.distanceKm.toFixed(2)} km`);
      return result.distanceKm;
    }
    
    // Fallback to haversine
    console.log('⚠️ Mappls failed, using haversine fallback');
    return haversineDistanceKm(origin, destination);
    
  } catch (error) {
    console.error('Error calculating distance:', error);
    // Fallback to haversine on error
    return haversineDistanceKm(origin, destination);
  }
}
