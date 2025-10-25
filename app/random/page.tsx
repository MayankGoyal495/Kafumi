"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getRandomCafe } from "@/lib/cafe-data"
import type { Cafe } from "@/lib/types"
import { Sparkles, MapPin, Star, Heart, RotateCcw, ArrowRight } from "lucide-react"
import { formatKm } from "@/lib/geocoding"
import { getDistanceKm } from "@/lib/distance"

export default function RandomCafePage() {
  const router = useRouter()
  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [location, setLocation] = useState("Bangalore")
  const [isAnimating, setIsAnimating] = useState(false)
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null)

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) setLocation(savedLocation)

    loadRandomCafe()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const saved = localStorage.getItem("userCoords")
        if (!saved || !cafe) return
        const coords = JSON.parse(saved) as { lat: number; lng: number }
        const km = await getDistanceKm(coords, cafe.location.coordinates)
        if (!cancelled) setDistanceLabel(formatKm(km))
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [cafe])

  const loadRandomCafe = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const randomCafe = getRandomCafe()
      setCafe(randomCafe)

      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites)
        setIsFavorite(favorites.includes(randomCafe.id))
      }
      setIsAnimating(false)
    }, 500)
  }

  const toggleFavorite = () => {
    if (!cafe) return

    const savedFavorites = localStorage.getItem("favorites")
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : []

    const newFavorites = isFavorite ? favorites.filter((id: string) => id !== cafe.id) : [...favorites, cafe.id]

    localStorage.setItem("favorites", JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Finding your surprise café...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header location={location} />
      <Navigation />

      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground text-balance">
                Your Surprise Café
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Discover something new and exciting</p>
            </div>
          </div>

          {/* Café Card */}
          <Card
            className={`overflow-hidden transition-opacity duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}
          >
            <div className="relative h-64 sm:h-80 w-full">
              <Image src={cafe.image || "/placeholder.svg"} alt={cafe.name} fill className="object-cover" />
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                {cafe.type}
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              {/* Title and Favorite */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2 text-balance">
                    {cafe.name}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">{cafe.shortDescription}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleFavorite} className="flex-shrink-0">
                  <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{cafe.rating}</span>
                  <span className="text-muted-foreground">({cafe.reviewCount})</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{cafe.location.address}{distanceLabel ? ` • ${distanceLabel}` : ""}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{cafe.description}</p>

              {/* Vibe Tags */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">VIBE</h3>
                <div className="flex flex-wrap gap-2">
                  {cafe.vibe.map((v) => (
                    <span
                      key={v}
                      className="text-xs sm:text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">AMENITIES</h3>
                <div className="flex flex-wrap gap-2">
                  {cafe.amenities.map((a) => (
                    <span key={a} className="text-xs sm:text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Dish & Price */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Best Dish</p>
                  <p className="font-semibold text-foreground">{cafe.bestDish}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                  <p className="font-semibold text-primary">₹{cafe.pricePerPerson}/person</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={() => router.push(`/cafe/${cafe.id}`)} className="flex-1 gap-2">
                  <span className="hidden xs:inline">View Full Details</span>
                  <span className="xs:hidden">View Details</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={loadRandomCafe} className="gap-2 bg-transparent sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  Try Another
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Other Options */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => router.push("/browse")} className="w-full sm:w-auto">
              Browse All Cafés
            </Button>
            <Button variant="outline" onClick={() => router.push("/guided")} className="w-full sm:w-auto">
              Guided Search
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
