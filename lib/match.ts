import { getCafes } from "@/lib/cafe-data-service"
import type { Cafe } from "@/lib/types"
import { getDistanceKm } from "@/lib/distance"
import { formatKm } from "@/lib/geocoding"

export type DistanceBucket =
  | "Walking ≤1km"
  | "Short Ride ≤3km"
  | "Nearby ≤6km"
  | "Moderate ≤12km"
  | "Anywhere 12km+"

export interface UserMatchPreferences {
  preferredMood: string
  preferredAmbience: string[]
  preferredAmenities: string[]
  preferredFoodDrinkTypes: string[]
  preferredPriceRange: string
  maxDistance: DistanceBucket
  minRating: number
  userCoords?: { lat: number; lng: number }
  // Mandatory flags for each filter
  purposeMandatory?: boolean
  ambienceMandatory?: boolean
  amenitiesMandatory?: boolean
  foodDrinksMandatory?: boolean
  distanceMandatory?: boolean
  priceMandatory?: boolean
}

const distanceBuckets: { label: DistanceBucket; maxKm: number | null }[] = [
  { label: "Walking ≤1km", maxKm: 1 },
  { label: "Short Ride ≤3km", maxKm: 3 },
  { label: "Nearby ≤6km", maxKm: 6 },
  { label: "Moderate ≤12km", maxKm: 12 },
  { label: "Anywhere 12km+", maxKm: null }, // null means no upper bound
]

const priceOrder = [
  "Budget Friendly – under ₹300",
  "Moderate – ₹300–₹600",
  "Mid-Range – ₹600–₹900",
  "Premium – ₹900+",
]

function bucketIndex<T extends string>(arr: T[], value: T): number {
  const idx = arr.indexOf(value)
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
}

function getDistanceBucketIndex(km: number): number {
  for (let i = 0; i < distanceBuckets.length; i++) {
    const maxKm = distanceBuckets[i].maxKm
    if (maxKm == null) return i
    if (km <= maxKm) return i
  }
  return distanceBuckets.length - 1
}

export interface MatchResultItem {
  name: string
  matchPercentage: number
  distance: string
  rating: number
  priceRange: string
  matchedMood: boolean
  matchedAmbience: string[]
  matchedAmenities: string[]
  matchedFoodDrinkTypes: string[]
  priceProximity: 'exact' | 'one' | 'two' | 'none'
  distanceProximity: 'within' | 'next' | 'beyond' | 'unknown'
}

/**
 * Updated match percentage weights:
 * - Mood: 20%
 * - Ambience: 11%
 * - Amenities: 9%
 * - Food & Drinks: 12%
 * - Price: 12%
 * - Dishes: 12%
 * - Rating: 11%
 * - Promoter Rating: 13%
 * 
 * Two-stage filtering:
 * 1. MANDATORY filters eliminate cafes (hard requirements)
 * 2. OPTIONAL filters contribute to match percentage scoring
 */
export async function computeCafeMatches(preferences: UserMatchPreferences): Promise<MatchResultItem[]> {
  let cafes = await getCafes() as Cafe[]
  const results: MatchResultItem[] = []

  // ============================================================================
  // STAGE 1: MANDATORY FILTERS (Eliminate cafes that don't meet requirements)
  // ============================================================================

  // Purpose (Single select - must match exactly)
  if (preferences.purposeMandatory && preferences.preferredMood) {
    cafes = cafes.filter(cafe => cafe.purpose?.includes(preferences.preferredMood))
  }

  // Ambience (OR logic - must match ANY selected)
  if (preferences.ambienceMandatory && preferences.preferredAmbience?.length > 0) {
    cafes = cafes.filter(cafe => 
      preferences.preferredAmbience.some(amb => cafe.vibe.includes(amb))
    )
  }

  // Amenities (AND logic - must have ALL selected)
  if (preferences.amenitiesMandatory && preferences.preferredAmenities?.length > 0) {
    cafes = cafes.filter(cafe => 
      preferences.preferredAmenities.every(amen => cafe.amenities.includes(amen))
    )
  }

  // Food & Drinks (OR logic - must have ANY selected)
  if (preferences.foodDrinksMandatory && preferences.preferredFoodDrinkTypes?.length > 0) {
    cafes = cafes.filter(cafe => {
      const cafeFdt = cafe.foodDrinkTypes ?? []
      return preferences.preferredFoodDrinkTypes.some(fdt => cafeFdt.includes(fdt))
    })
  }

  // Price (Single select - must match exactly)
  if (preferences.priceMandatory && preferences.preferredPriceRange) {
    cafes = cafes.filter(cafe => cafe.priceRange === preferences.preferredPriceRange)
  }

  // Distance (Will be filtered below with accurate distance calculation)
  // We'll handle this separately since it requires async distance API calls

  // ============================================================================
  // STAGE 2: SCORING (Calculate match % on remaining cafes)
  // ============================================================================

  for (const cafe of cafes) {
    // Rating exclusion
    if (typeof preferences.minRating === "number" && cafe.rating < preferences.minRating) {
      continue
    }

    let total = 0

    // Mood (purpose) — 20%
    const matchedMood = !!(preferences.preferredMood && cafe.purpose?.includes(preferences.preferredMood))
    if (matchedMood) total += 20

    // Ambience (vibe) — 11%
    let matchedAmbience: string[] = []
    if (Array.isArray(preferences.preferredAmbience) && preferences.preferredAmbience.length > 0) {
      matchedAmbience = preferences.preferredAmbience.filter((a) => cafe.vibe.includes(a))
      total += (matchedAmbience.length / preferences.preferredAmbience.length) * 11
    }

    // Amenities — 9%
    let matchedAmenities: string[] = []
    if (Array.isArray(preferences.preferredAmenities) && preferences.preferredAmenities.length > 0) {
      matchedAmenities = preferences.preferredAmenities.filter((a) => cafe.amenities.includes(a))
      total += (matchedAmenities.length / preferences.preferredAmenities.length) * 9
    }

    // Food & Drinks — 12%
    let matchedFoodDrinkTypes: string[] = []
    if (Array.isArray(preferences.preferredFoodDrinkTypes) && preferences.preferredFoodDrinkTypes.length > 0) {
      const cafeFdt = cafe.foodDrinkTypes ?? []
      matchedFoodDrinkTypes = preferences.preferredFoodDrinkTypes.filter((f) => cafeFdt.includes(f))
      total += (matchedFoodDrinkTypes.length / preferences.preferredFoodDrinkTypes.length) * 12
    }

    // Price — 12% using bucket distance
    let priceProximity: 'exact' | 'one' | 'two' | 'none' = 'none'
    if (preferences.preferredPriceRange) {
      const userIdx = bucketIndex(priceOrder, preferences.preferredPriceRange)
      const cafeIdx = bucketIndex(priceOrder, cafe.priceRange)
      const diff = Math.abs(cafeIdx - userIdx)
      if (diff === 0) { total += 12; priceProximity = 'exact' }
      else if (diff === 1) { total += 6; priceProximity = 'one' }
      else if (diff === 2) { total += 3; priceProximity = 'two' }
    }

    // Dishes — 12% (based on best dish match)
    if (cafe.bestDish) {
      total += 12
    }

    // Rating — 11%
    total += (cafe.rating / 5) * 11

    // Promoter Rating — 13%
    if (cafe.promoterRating) {
      total += (cafe.promoterRating / 10) * 13
    }
    
    // Distance calculation and mandatory filtering
    let distanceLabel = "N/A"
    let distanceProximity: 'within' | 'next' | 'beyond' | 'unknown' = 'unknown'
    let skipCafe = false
    
    if (preferences.userCoords) {
      try {
        const km = await getDistanceKm(preferences.userCoords, cafe.location.coordinates)
        distanceLabel = formatKm(km)
        
        const userBucketIdx = bucketIndex(
          distanceBuckets.map((b) => b.label),
          preferences.maxDistance,
        )
        const cafeBucketIdx = getDistanceBucketIndex(km)
        
        if (cafeBucketIdx <= userBucketIdx) { distanceProximity = 'within' }
        else if (cafeBucketIdx === userBucketIdx + 1) { distanceProximity = 'next' }
        else { distanceProximity = 'beyond' }
        
        // MANDATORY DISTANCE CHECK: Skip cafe if beyond max distance
        if (preferences.distanceMandatory && preferences.maxDistance) {
          const maxKm = distanceBuckets[userBucketIdx].maxKm
          if (maxKm !== null && km > maxKm) {
            skipCafe = true
          }
        }
      } catch {
        // If distance calculation fails and distance is mandatory, skip cafe
        if (preferences.distanceMandatory) {
          skipCafe = true
        }
      }
    }
    
    // Skip cafe if it failed mandatory distance check
    if (skipCafe) continue

    // Clamp and push
    const matchPercentage = Math.max(0, Math.min(100, Math.round(total)))
    results.push({
      name: cafe.name,
      matchPercentage,
      distance: distanceLabel,
      rating: cafe.rating,
      priceRange: cafe.priceRange,
      matchedMood,
      matchedAmbience,
      matchedAmenities,
      matchedFoodDrinkTypes,
      priceProximity,
      distanceProximity,
    })
  }

  return results.sort((a, b) => b.matchPercentage - a.matchPercentage)
}
