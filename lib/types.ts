// Food & Drink Category Types
export type FoodDrinkCategory = 
  | "Breakfast & Brunch"
  | "Coffee & Beverages"
  | "Desserts & Bakery"
  | "Cocktails & Spirits";

export type CuisineType = 
  | "Indian"
  | "Italian"
  | "Mexican"
  | "Pan-Asian"
  | "Continental"
  | "Middle Eastern"
  | "Global";

export type FoodDrinkType = FoodDrinkCategory | CuisineType;

export interface Cafe {
  id: string
  name: string
  type?: "Veg"
  description: string
  shortDescription: string
  rating: number
  reviewCount: number
  promoterRating?: number // 0-10 scale, added for new matching system
  image: string
  images: string[]
  vibe: string[]
  purpose: string[]
  amenities: string[]
  bestDish: string
  priceRange: string
  pricePerPerson: number
  foodDrinkTypes?: FoodDrinkType[]
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
    googleMapsLink?: string
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
  foodDrinkTypes?: FoodDrinkType[]
  distance?: string
  priceRange?: string
}
