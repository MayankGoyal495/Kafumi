export interface Cafe {
  id: string
  name: string
  type?: "Veg"
  description: string
  shortDescription: string
  rating: number
  reviewCount: number
  image: string
  images: string[]
  vibe: string[]
  purpose: string[]
  amenities: string[]
  bestDish: string
  priceRange: string
  pricePerPerson: number
  foodDrinkTypes?: string[]
  menuCategories: {
    name: string
    items: { name: string; price: number; description?: string; dietaryType?: "veg" | "non-veg" | "egg" }[]
  }[]
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  contact: {
    phone: string
    email?: string
    website?: string
    social?: {
      instagram?: string
      facebook?: string
    }
  }
  reviews: {
    userName: string
    rating: number
    text: string
    date: string
  }[]
}

export interface UserPreferences {
  purpose?: string
  ambience?: string[]
  amenities?: string[]
  foodDrinks?: string[]
  distance?: string
  priceRange?: string
}
