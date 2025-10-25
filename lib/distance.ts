import { haversineDistanceKm } from "@/lib/geocoding"

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Returns driving distance in km using OpenRouteService when NEXT_PUBLIC_ORS_API_KEY is set,
 * otherwise falls back to straight-line haversine distance.
 */
export async function getDistanceKm(origin: Coordinates, destination: Coordinates): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY
  if (!apiKey) {
    return haversineDistanceKm(origin, destination)
  }

  try {
    const url = "https://api.openrouteservice.org/v2/matrix/driving-car"
    const body = {
      locations: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
      metrics: ["distance"],
      units: "km",
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error("ORS request failed")
    const data = await res.json()
    const distanceKm = data?.distances?.[0]?.[1]
    if (typeof distanceKm === "number") {
      return distanceKm
    }
    return haversineDistanceKm(origin, destination)
  } catch {
    return haversineDistanceKm(origin, destination)
  }
}


