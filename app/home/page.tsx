"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CafeCard } from "@/components/cafe-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCafes } from "@/lib/cafe-data-service"
import type { Cafe } from "@/lib/types"
import { Search, Sparkles, MapIcon, HelpCircle, Coffee, Heart, Filter } from "@/components/icons"
import { Utensils } from "lucide-react"
import { PageLoading } from "@/components/loading"

export default function HomePage() {
  const router = useRouter()
  const [location, setLocation] = useState("Bangalore")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cafes, setCafes] = useState<Cafe[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedLocation = localStorage.getItem("userLocation")
        if (savedLocation) setLocation(savedLocation)

        const savedFavorites = localStorage.getItem("favorites")
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites))

        // Fetch cafes from Google Sheets
        const fetchedCafes = await getCafes()
        setCafes(fetchedCafes)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const toggleFavorite = (cafeId: string) => {
    const newFavorites = favorites.includes(cafeId) ? favorites.filter((id) => id !== cafeId) : [...favorites, cafeId]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const topCafes = cafes.slice(0, 8)

  if (isLoading) {
    return <PageLoading message="Loading your café recommendations..." />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header location={location} onLocationClick={() => router.push("/location")} />
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-8 sm:space-y-12 md:space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-3 sm:space-y-4 md:space-y-6 py-4 sm:py-8 md:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground text-balance px-2">
            Find Your Perfect <span className="text-primary">Cafe Experience</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-balance px-3 sm:px-4">
            Discover cafés that match your mood, vibe, budget, and preferences. From cozy corners to bustling spaces,
            find your ideal spot.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-2 sm:px-3">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search cafes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-12 pr-16 sm:pr-20 md:pr-24 h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery) {
                    router.push(`/browse?q=${searchQuery}`)
                  }
                }}
              />
              <Button
                className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                onClick={() => searchQuery && router.push(`/browse?q=${searchQuery}`)}
              >
                Search
              </Button>
            </div>
          </div>
        </section>

        {/* Cafés of the Day */}
        <section className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground truncate">Cafés of the Day</h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">Handpicked selections just for you</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/browse")} className="h-9 sm:h-10 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              View All
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {topCafes.map((cafe) => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(cafe.id)}
              />
            ))}
          </div>
        </section>

        {/* Discovery Options */}
        <section className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="text-center px-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">How Do You Want to Explore?</h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">Choose your discovery method</p>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Surprise Me */}
            <div
              className="bg-card border border-border rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => router.push("/random")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold mb-1.5 sm:mb-2">Surprise Me!</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                Feeling adventurous? Let us pick a random café that might become your new favorite.
              </p>
              <Button variant="outline" className="w-full bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
                Try Random
              </Button>
            </div>

            {/* Browse */}
            <div
              className="bg-card border border-border rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => router.push("/browse")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold mb-1.5 sm:mb-2">Find on My Own</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                Browse through all cafés with filters for mood, vibe, budget, and more.
              </p>
              <Button variant="outline" className="w-full bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
                Browse Cafés
              </Button>
            </div>

            {/* Guided Search */}
            <div
              className="bg-card border border-border rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => router.push("/guided")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold mb-1.5 sm:mb-2">Help Me Search</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                Answer a few questions and we'll find cafés that perfectly match your needs.
              </p>
              <Button variant="outline" className="w-full bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
                Start Guided Search
              </Button>
            </div>

            {/* Search by Dish */}
            <div
              className="bg-card border border-border rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => router.push("/search-dish")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold mb-1.5 sm:mb-2">Search by Dish</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                Find cafés serving your favorite dishes with intelligent search and filtering.
              </p>
              <Button variant="outline" className="w-full bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
                Search Dishes
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-secondary/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-12 space-y-4 sm:space-y-6 md:space-y-8">
          <div className="text-center max-w-3xl mx-auto px-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground mb-2 sm:mb-3 md:mb-4">About Kafumi</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-balance">
              Kafumi is your personal café discovery companion. We help you find the perfect spot based on your mood,
              preferences, and what you're looking for in a café experience.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Mood-Based Matching</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Find cafés that match your current vibe, whether you want quiet focus or lively energy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Filter className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Smart Filtering</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Filter by amenities, distance, price range, and dietary preferences to find exactly what you need.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Coffee className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">Curated Selection</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Every café is carefully reviewed and categorized to ensure you get the best recommendations.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 sm:mt-12 md:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 text-center text-muted-foreground text-xs md:text-sm">
          <p>&copy; 2025 Kafumi. The Essence of Every Cafe.</p>
        </div>
      </footer>
    </div>
  )
}
