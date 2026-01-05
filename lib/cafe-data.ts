import type { Cafe } from "./types"

export const cafes: Cafe[] = [
  {
    id: "1",
    name: "The Big Tree Cafe",
    type: "Veg",
    description:
      "A cozy corner café with artisanal coffee and homemade pastries. Perfect for quiet work sessions or intimate conversations.",
    shortDescription: "Artisanal coffee & homemade pastries",
    rating: 4.5,
    reviewCount: 342,
    image: "/cozy-modern-cafe-interior-with-plants.jpg",
    images: ["/cozy-modern-cafe-interior-with-plants.jpg", "/cafe-latte-art-coffee.jpg", "/cafe-pastries-display.jpg"],
    vibe: ["Quiet & Peaceful", "Aesthetic & Photogenic", "Green & Serene"],
    purpose: ["Me-Time & Relax", "Hangout with Friends"],
    amenities: ["Free Wi-Fi", "Charging Ports", "Games"],
    bestDish: "Caramel Macchiato & Blueberry Scone",
    priceRange: "Moderate – ₹300–₹600",
    pricePerPerson: 350,
    foodDrinkTypes: ["Breakfast & Brunch", "Coffee & Beverages", "Desserts & Bakery"],
    menuCategories: [
      {
        name: "Coffee & Beverages",
        items: [
          { name: "Caramel Macchiato", price: 180, description: "Espresso with vanilla and caramel", dietaryType: "veg" },
          { name: "Cold Brew", price: 160, dietaryType: "veg" },
          { name: "Matcha Latte", price: 200, dietaryType: "veg" },
        ],
      },
      {
        name: "Desserts & Bakery",
        items: [
          { name: "Blueberry Scone", price: 120, dietaryType: "veg" },
          { name: "Chocolate Croissant", price: 140, dietaryType: "egg" },
        ],
      },
    ],
    location: {
      address: "Hawa Mahal, Badi Choupad, Jaipur, Rajasthan",
      coordinates: { lat: 26.841513, lng: 75.769266 },
    },
    contact: {
      phone: "+91 98765 43210",
      email: "hello@brewhaven.com",
      social: {
        instagram: "@brewhaven",
      },
    },
    reviews: [
      {
        userName: "Priya S.",
        rating: 5,
        text: "Perfect spot for working remotely. Great coffee and peaceful ambiance!",
        date: "2025-09-15",
      },
      {
        userName: "Rahul M.",
        rating: 4,
        text: "Love the pastries here. A bit crowded on weekends though.",
        date: "2025-09-10",
      },
    ],
  },
  {
    id: "2",
    name: "Rooftop Vibes",
    
    description:
      "Open-air rooftop café with stunning city views, live music on weekends, and a diverse menu featuring global cuisines.",
    shortDescription: "Rooftop dining with city views",
    rating: 4.5,
    reviewCount: 567,
    image: "/rooftop-cafe-restaurant-city-view-evening.jpg",
    images: ["/rooftop-cafe-restaurant-city-view-evening.jpg", "/rooftop-dining-table-setup.jpg", "/live-music-performance-cafe.jpg"],
    vibe: ["Rooftop & Outdoor", "Musical & Soulful", "Nightlife & Dancing"],
    purpose: ["Date & Dine", "Music & Night Out"],
    amenities: ["Games", "Parking", "Free Wi-Fi"],
    bestDish: "Grilled Chicken Platter & Mojito",
    priceRange: "Premium – ₹900+",
    pricePerPerson: 750,
    foodDrinkTypes: ["Global Café Bites", "Cocktails & Spirits", "Indian & Comfort Meals", "Desserts & Bakery", "Coffee & Beverages"],
    menuCategories: [
      {
        name: "Global Café Bites",
        items: [
          { name: "Grilled Chicken Platter", price: 450, dietaryType: "non-veg" },
          { name: "Margherita Pizza", price: 380, dietaryType: "veg" },
          { name: "Caesar Salad", price: 280, dietaryType: "non-veg" },
        ],
      },
      {
        name: "Cocktails & Spirits",
        items: [
          { name: "Mojito", price: 250, dietaryType: "veg" },
          { name: "Beer", price: 300, dietaryType: "veg" },
          { name: "Wine", price: 400, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "City Palace, Jaleb Chowk, Jaipur, Rajasthan",
      coordinates: { lat: 26.9258, lng: 75.8237 },
    },
    contact: {
      phone: "+91 98765 43211",
      website: "www.rooftopvibes.com",
      social: {
        instagram: "@rooftopvibes",
        facebook: "rooftopvibes",
      },
    },
    reviews: [
      {
        userName: "Ananya K.",
        rating: 5,
        text: "Amazing ambiance! Perfect for a Music & Night Out with friends.",
        date: "2025-09-20",
      },
    ],
  },
  {
    id: "3",
    name: "Green Leaf Café",
    type: "Veg",
    description:
      "Surrounded by lush greenery, this café offers organic food and beverages in a tranquil garden setting.",
    shortDescription: "Organic café in garden setting",
    rating: 4.8,
    reviewCount: 289,
    image: "/garden-cafe-with-plants-outdoor-seating.jpg",
    images: ["/garden-cafe-with-plants-outdoor-seating.jpg", "/organic-healthy-food-bowl.jpg"],
    vibe: ["Green & Serene", "Quiet & Peaceful", "Aesthetic & Photogenic"],
    purpose: ["Hangout with Friends", "Family Outing"],
    amenities: ["Games", "Pet-Friendly", "Free Wi-Fi","Charging Ports"],
    bestDish: "Avocado Toast & Green Smoothie",
    priceRange: "Moderate – ₹300–₹600",
    pricePerPerson: 400,
    foodDrinkTypes: ["Breakfast & Brunch", "Coffee & Beverages"],
    menuCategories: [
      {
        name: "Breakfast & Brunch",
        items: [
          { name: "Avocado Toast", price: 280, dietaryType: "veg" },
          { name: "Pancakes", price: 220, dietaryType: "egg" },
          { name: "Granola Bowl", price: 250, dietaryType: "veg" },
        ],
      },
      {
        name: "Coffee & Beverages",
        items: [
          { name: "Green Smoothie", price: 180, dietaryType: "veg" },
          { name: "Herbal Tea", price: 120, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "Jal Mahal, Amer Road, Jaipur, Rajasthan",
      coordinates: { lat: 26.9533, lng: 75.8469 },
    },
    contact: {
      phone: "+91 98765 43212",
      social: {
        instagram: "@greenleafcafe",
      },
    },
    reviews: [
      {
        userName: "Sneha R.",
        rating: 5,
        text: "Love the peaceful vibe and healthy food options!",
        date: "2025-09-18",
      },
    ],
  },
  {
    id: "4",
    name: "The Study Spot",
    type: "Veg",
    description:
      "Designed for students and professionals, with ample seating, charging points, and a quiet atmosphere.",
    shortDescription: "Perfect for work and study",
    rating: 4.6,
    reviewCount: 421,
    image: "/modern-study-cafe-with-laptops.jpg",
    images: ["/modern-study-cafe-with-laptops.jpg"],
    vibe: ["Quiet & Peaceful", "Nightlife & Dancing", "Aesthetic & Photogenic"],
    purpose: ["Me-Time & Relax", "Work & Unwind"],
    amenities: ["Free Wi-Fi", "Charging Ports"],
    bestDish: "Cappuccino & Sandwich",
    priceRange: "Budget Friendly – under ₹300",
    pricePerPerson: 180,
    foodDrinkTypes: ["Coffee & Beverages", "Global Café Bites", "Desserts & Bakery", "Breakfast & Brunch", "Indian & Comfort Meals", "Cocktails & Spirits"],
    menuCategories: [
      {
        name: "Coffee & Beverages",
        items: [
          { name: "Cappuccino", price: 100, dietaryType: "veg" },
          { name: "Espresso", price: 80, dietaryType: "veg" },
        ],
      },
      {
        name: "Global Café Bites",
        items: [
          { name: "Veg Sandwich", price: 120, dietaryType: "veg" },
          { name: "Pasta", price: 150, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "Albert Hall Museum, Ram Niwas Garden, Jaipur, Rajasthan",
      coordinates: { lat: 26.9118, lng: 75.8195 },
    },
    contact: {
      phone: "+91 98765 43213",
    },
    reviews: [
      {
        userName: "Arjun P.",
        rating: 5,
        text: "Best place to study! Quiet and affordable.",
        date: "2025-09-22",
      },
    ],
  },
  {
    id: "5",
    name: "Romantic Rendezvous",
    
    description: "Intimate setting with dim lighting, soft music, and a curated menu perfect for Date & Dines.",
    shortDescription: "Intimate dining for couples",
    rating: 4.9,
    reviewCount: 198,
    image: "/romantic-restaurant-dim-lighting-candles.jpg",
    images: ["/romantic-restaurant-dim-lighting-candles.jpg", "/fine-dining-plated-food.jpg"],
    vibe: ["Quiet & Peaceful", "Aesthetic & Photogenic", "Nightlife & Dancing"],
    purpose: ["Date & Dine", "Music & Night Out"],
    amenities: ["Parking", "Games", "Free Wi-Fi"],
    bestDish: "Lobster Thermidor & Red Wine",
    priceRange: "Premium – ₹900+",
    pricePerPerson: 1200,
    foodDrinkTypes: ["Indian & Comfort Meals", "Cocktails & Spirits", "Desserts & Bakery"],
    menuCategories: [
      {
        name: "Indian & Comfort Meals",
        items: [
          { name: "Lobster Thermidor", price: 1800, dietaryType: "non-veg" },
          { name: "Filet Mignon", price: 1500, dietaryType: "non-veg" },
          { name: "Truffle Risotto", price: 900, dietaryType: "veg" },
        ],
      },
      {
        name: "Cocktails & Spirits",
        items: [
          { name: "Red Wine", price: 600, dietaryType: "veg" },
          { name: "Champagne", price: 1200, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "Amer Fort, Devisinghpura, Jaipur, Rajasthan",
      coordinates: { lat: 26.9855, lng: 75.8513 },
    },
    contact: {
      phone: "+91 98765 43214",
      website: "www.romanticrendezvous.com",
    },
    reviews: [
      {
        userName: "Vikram & Meera",
        rating: 5,
        text: "Perfect anniversary dinner! Highly recommend.",
        date: "2025-09-25",
      },
    ],
  },
  {
    id: "6",
    name: "Family Feast",
    type: "Veg",
    description: "Spacious café with a kids play area and a diverse menu that caters to all age groups.",
    shortDescription: "Family-friendly with kids area",
    rating: 4.4,
    reviewCount: 512,
    image: "/family-restaurant-spacious-bright.jpg",
    images: ["/family-restaurant-spacious-bright.jpg"],
    vibe: ["Nightlife & Dancing", "Green & Serene", "Quiet & Peaceful"],
    purpose: ["Family Outing", "Hangout with Friends"],
    amenities: ["Parking", "Games", "Pet-Friendly"],
    bestDish: "Paneer Tikka & Mango Lassi",
    priceRange: "Moderate – ₹300–₹600",
    pricePerPerson: 450,
    foodDrinkTypes: ["Global Café Bites", "Coffee & Beverages", "Desserts & Bakery", "Breakfast & Brunch"],
    menuCategories: [
      {
        name: "Global Café Bites",
        items: [
          { name: "Paneer Tikka", price: 320, dietaryType: "veg" },
          { name: "Veg Biryani", price: 280, dietaryType: "veg" },
          { name: "Dal Makhani", price: 240, dietaryType: "veg" },
        ],
      },
      {
        name: "Coffee & Beverages",
        items: [
          { name: "Mango Lassi", price: 120, dietaryType: "veg" },
          { name: "Fresh Juice", price: 100, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "Bapu Bazaar, Pink City, Jaipur, Rajasthan",
      coordinates: { lat: 26.9147, lng: 75.8226 },
    },
    contact: {
      phone: "+91 98765 43215",
    },
    reviews: [
      {
        userName: "Kavita S.",
        rating: 4,
        text: "Great for family outings. Kids loved it!",
        date: "2025-09-19",
      },
    ],
  },
  {
    id: "7",
    name: "Business Hub Café",
    type: "Veg",
    description: "Professional setting ideal for business meetings, with private booths and conference facilities.",
    shortDescription: "Professional meeting space",
    rating: 4.5,
    reviewCount: 234,
    image: "/modern-business-cafe-professional.jpg",
    images: ["/modern-business-cafe-professional.jpg"],
    vibe: ["Nightlife & Dancing", "Quiet & Peaceful", "Aesthetic & Photogenic"],
    purpose: ["Work & Unwind", "Me-Time & Relax"],
    amenities: ["Free Wi-Fi", "Charging Ports", "Parking"],
    bestDish: "Espresso & Club Sandwich",
    priceRange: "Mid-Range – ₹600–₹900",
    pricePerPerson: 500,
    foodDrinkTypes: ["Coffee & Beverages", "Global Café Bites"],
    menuCategories: [
      {
        name: "Coffee & Beverages",
        items: [
          { name: "Espresso", price: 120, dietaryType: "veg" },
          { name: "Americano", price: 140, dietaryType: "veg" },
        ],
      },
      {
        name: "Global Café Bites",
        items: [
          { name: "Club Sandwich", price: 280, dietaryType: "non-veg" },
          { name: "Caesar Wrap", price: 250, dietaryType: "non-veg" },
        ],
      },
    ],
    location: {
      address: "MI Road, Ashok Nagar, Jaipur, Rajasthan",
      coordinates: { lat: 26.9158, lng: 75.8156 },
    },
    contact: {
      phone: "+91 98765 43216",
      email: "contact@businesshubcafe.com",
    },
    reviews: [
      {
        userName: "Rajesh K.",
        rating: 5,
        text: "Perfect for client meetings. Professional atmosphere.",
        date: "2025-09-21",
      },
    ],
  },
  {
    id: "8",
    name: "Night Owl Lounge",
    
    description: "Late-night café and bar with DJ nights, cocktails, and a vibrant party atmosphere.",
    shortDescription: "Late-night bar & lounge",
    rating: 4.3,
    reviewCount: 678,
    image: "/nightclub-lounge-bar-neon-lights.jpg",
    images: ["/nightclub-lounge-bar-neon-lights.jpg", "/cocktails-bar-drinks.jpg"],
    vibe: ["Musical & Soulful", "Nightlife & Dancing", "Rooftop & Outdoor"],
    purpose: ["Music & Night Out", "Hangout with Friends"],
    amenities: ["Parking", "Games", "Free Wi-Fi"],
    bestDish: "Chicken Wings & Cocktails",
    priceRange: "Premium – ₹900+",
    pricePerPerson: 900,
    foodDrinkTypes: ["Global Café Bites", "Cocktails & Spirits"],
    menuCategories: [
      {
        name: "Global Café Bites",
        items: [
          { name: "Chicken Wings", price: 380, dietaryType: "non-veg" },
          { name: "Nachos", price: 320, dietaryType: "veg" },
        ],
      },
      {
        name: "Cocktails & Spirits",
        items: [
          { name: "Signature Cocktail", price: 450, dietaryType: "veg" },
          { name: "Whiskey", price: 500, dietaryType: "veg" },
          { name: "Beer Bucket", price: 800, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "Jawahar Circle, Malviya Nagar, Jaipur, Rajasthan",
      coordinates: { lat: 26.8229, lng: 75.8026 },
    },
    contact: {
      phone: "+91 98765 43217",
      website: "www.nightowllounge.com",
      social: {
        instagram: "@nightowllounge",
      },
    },
    reviews: [
      {
        userName: "Aditya M.",
        rating: 4,
        text: "Great party spot! Music is amazing.",
        date: "2025-09-23",
      },
    ],
  },
  {
    id: "9",
    name: "Dhaba Bazaar",
    
    description: "Dhaba Bazaar is a popular street food destination in Jaipur, known for its delicious and affordable food.",
    shortDescription: "Popular street food destination",
    rating: 4.9,
    reviewCount: 198,
    image: "/romantic-restaurant-dim-lighting-candles.jpg",
    images: ["/romantic-restaurant-dim-lighting-candles.jpg", "/fine-dining-plated-food.jpg"],
    vibe: ["Quiet & Peaceful", "Aesthetic & Photogenic", "Nightlife & Dancing"],
    purpose: ["Date & Dine", "Music & Night Out"],
    amenities: ["Parking", "Games", "Free Wi-Fi"],
    bestDish: "Lobster Thermidor & Red Wine",
    priceRange: "Budget Friendly – under ₹300",
    pricePerPerson: 1200,
    foodDrinkTypes: ["Indian & Comfort Meals", "Cocktails & Spirits", "Desserts & Bakery"],
    menuCategories: [
      {
        name: "Indian & Comfort Meals",
        items: [
          { name: "Lobster Thermidor", price: 1800, dietaryType: "non-veg" },
          { name: "Filet Mignon", price: 1500, dietaryType: "non-veg" },
          { name: "Truffle Risotto", price: 900, dietaryType: "veg" },
        ],
      },
      {
        name: "Cocktails & Spirits",
        items: [
          { name: "Red Wine", price: 600, dietaryType: "veg" },
          { name: "Champagne", price: 1200, dietaryType: "veg" },
        ],
      },
    ],
    location: {
      address: "Amer Fort, Devisinghpura, Jaipur, Rajasthan",
      coordinates: { lat: 26.9855, lng: 75.8513 },
    },
    contact: {
      phone: "+91 98765 43214",
      website: "www.romanticrendezvous.com",
    },
    reviews: [
      {
        userName: "Vikram & Meera",
        rating: 5,
        text: "Perfect anniversary dinner! Highly recommend.",
        date: "2025-09-25",
      },
    ],
  }
]

export function getRandomCafe(): Cafe {
  return cafes[Math.floor(Math.random() * cafes.length)]
}

export function filterCafes(preferences: any): Cafe[] {
  // Simple filtering logic - in real app would be more sophisticated
  return cafes.filter((cafe) => {
    if (preferences.priceRange) {
      if (cafe.priceRange !== preferences.priceRange) return false
    }
    if (preferences.amenities && preferences.amenities.length > 0) {
      const hasAmenity = preferences.amenities.some((a: string) => cafe.amenities.includes(a))
      if (!hasAmenity) return false
    }
    return true
  })
}
