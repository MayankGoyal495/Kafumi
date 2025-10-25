import { cafes } from "@/lib/cafe-data"
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

export async function computeCafeMatches(preferences: UserMatchPreferences): Promise<MatchResultItem[]> {
  const results: MatchResultItem[] = []

  for (const cafe of cafes as Cafe[]) {
    // Rating exclusion
    if (typeof preferences.minRating === "number" && cafe.rating < preferences.minRating) {
      continue
    }

    let total = 0

    // Mood (purpose) — 20%
    const matchedMood = !!(preferences.preferredMood && cafe.purpose?.includes(preferences.preferredMood))
    if (matchedMood) total += 20

    // Ambience (vibe) — 12%
    let matchedAmbience: string[] = []
    if (Array.isArray(preferences.preferredAmbience) && preferences.preferredAmbience.length > 0) {
      matchedAmbience = preferences.preferredAmbience.filter((a) => cafe.vibe.includes(a))
      total += (matchedAmbience.length / preferences.preferredAmbience.length) * 12
    }

    // Amenities — 10%
    let matchedAmenities: string[] = []
    if (Array.isArray(preferences.preferredAmenities) && preferences.preferredAmenities.length > 0) {
      matchedAmenities = preferences.preferredAmenities.filter((a) => cafe.amenities.includes(a))
      total += (matchedAmenities.length / preferences.preferredAmenities.length) * 10
    }

    // Food & Drinks — 15%
    let matchedFoodDrinkTypes: string[] = []
    if (Array.isArray(preferences.preferredFoodDrinkTypes) && preferences.preferredFoodDrinkTypes.length > 0) {
      const cafeFdt = cafe.foodDrinkTypes ?? []
      matchedFoodDrinkTypes = preferences.preferredFoodDrinkTypes.filter((f) => cafeFdt.includes(f))
      total += (matchedFoodDrinkTypes.length / preferences.preferredFoodDrinkTypes.length) * 15
    }

    // Price — 15% using bucket distance
    let priceProximity: 'exact' | 'one' | 'two' | 'none' = 'none'
    if (preferences.preferredPriceRange) {
      const userIdx = bucketIndex(priceOrder, preferences.preferredPriceRange)
      const cafeIdx = bucketIndex(priceOrder, cafe.priceRange)
      const diff = Math.abs(cafeIdx - userIdx)
      if (diff === 0) { total += 15; priceProximity = 'exact' }
      else if (diff === 1) { total += 7.5; priceProximity = 'one' }
      else if (diff === 2) { total += 3.75; priceProximity = 'two' }
    }

    // Distance — 15%
    let distanceLabel = "N/A"
    let distanceProximity: 'within' | 'next' | 'beyond' | 'unknown' = 'unknown'
    if (preferences.userCoords) {
      try {
        const km = await getDistanceKm(preferences.userCoords, cafe.location.coordinates)
        distanceLabel = formatKm(km)
        const userBucketIdx = bucketIndex(
          distanceBuckets.map((b) => b.label),
          preferences.maxDistance,
        )
        const cafeBucketIdx = getDistanceBucketIndex(km)
        if (cafeBucketIdx <= userBucketIdx) { total += 15; distanceProximity = 'within' }
        else if (cafeBucketIdx === userBucketIdx + 1) { total += 7.5; distanceProximity = 'next' }
        else { distanceProximity = 'beyond' }
      } catch {
        // ignore
      }
    }

    // Rating — 13%
    total += (cafe.rating / 5) * 13

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


