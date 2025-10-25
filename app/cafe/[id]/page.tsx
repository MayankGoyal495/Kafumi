"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cafes } from "@/lib/cafe-data"
import type { Cafe } from "@/lib/types"
import {
  Star,
  MapPin,
  Heart,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Sparkles,
  Search,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import { VegMark, NonVegMark, EggMark } from "@/components/icons"
import { formatKm } from "@/lib/geocoding"
import { getDistanceKm } from "@/lib/distance"

export default function CafeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const cafeId = params.id as string

  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [location, setLocation] = useState("Bangalore")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null)

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) setLocation(savedLocation)

    const foundCafe = cafes.find((c) => c.id === cafeId)
    if (foundCafe) {
      setCafe(foundCafe)

      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites)
        setIsFavorite(favorites.includes(foundCafe.id))
      }
    }
  }, [cafeId])

  useEffect(() => {
    if (!cafe) return
    ;(async () => {
      try {
        const saved = localStorage.getItem("userCoords")
        if (!saved) return
        const coords = JSON.parse(saved) as { lat: number; lng: number }
        const km = await getDistanceKm(coords, cafe.location.coordinates)
        setDistanceLabel(formatKm(km))
      } catch {}
    })()
  }, [cafe])

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
          <p className="text-muted-foreground">Café not found</p>
          <Button onClick={() => router.push("/browse")}>Browse Cafés</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header location={location} />
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="space-y-6 md:space-y-8">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 h-10 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Image Gallery */}
          <div className="relative h-64 md:h-96 lg:h-[500px] rounded-xl md:rounded-2xl overflow-hidden">
            <Image src={cafe.images[currentImageIndex] || cafe.image} alt={cafe.name} fill className="object-cover" />
            {cafe.type === 'Veg' && (
              <div className="absolute top-3 md:top-4 right-3 md:right-4 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 bg-white text-emerald-700 border border-emerald-300 shadow-sm">
                <VegMark className="h-4 w-4" />
                Veg
              </div>
            )}

            {/* Image Navigation */}
            {cafe.images.length > 1 && (
              <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
                {cafe.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-primary w-6 md:w-8" : "bg-background/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Header Section */}
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-2 md:mb-3">
                {cafe.name}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4">{cafe.description}</p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold text-lg">{cafe.rating}</span>
                  <span className="text-muted-foreground">({cafe.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{cafe.location.address}{distanceLabel ? ` • ${distanceLabel} away` : ""}</span>
                </div>
                <div className="text-primary font-semibold">₹{cafe.pricePerPerson}/person</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleFavorite}
              className="flex-shrink-0 h-11 w-11 md:h-12 md:w-12 bg-transparent"
            >
              <Heart
                className={`h-5 md:h-6 w-5 md:w-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
              />
            </Button>
          </div>

          {/* Quick Info Cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-5 md:pt-6">
                <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 md:mb-3">BEST DISH</h3>
                <p className="font-semibold text-foreground">{cafe.bestDish}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 md:pt-6">
                <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 md:mb-3">PRICE RANGE</h3>
                <p className="font-semibold text-foreground">{cafe.priceRange}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 md:pt-6">
                <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 md:mb-3">ADDRESS</h3>
                <p className="font-semibold text-foreground">{cafe.location.address}{distanceLabel ? ` • ${distanceLabel}` : ""}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="menu" className="text-xs md:text-sm py-2.5">
                Menu
              </TabsTrigger>
              <TabsTrigger value="vibe" className="text-xs md:text-sm py-2.5">
                Vibe
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs md:text-sm py-2.5">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs md:text-sm py-2.5">
                Contact
              </TabsTrigger>
            </TabsList>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
              {cafe.foodDrinkTypes && cafe.foodDrinkTypes.length > 0 && (
                <Card>
                  <CardContent className="pt-5 md:pt-6">
                    <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mb-3 md:mb-4">Available Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {cafe.foodDrinkTypes.map((t) => (
                        <span key={t} className="text-xs md:text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {cafe.menuCategories.map((category) => (
                <Card key={category.name}>
                  <CardContent className="pt-5 md:pt-6">
                    <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mb-3 md:mb-4">
                      {category.name}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start justify-between gap-3 md:gap-4 pb-3 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground text-sm md:text-base">{item.name}</p>
                              {item.dietaryType === "veg" && (
                                <div className="flex items-center gap-1">
                                  <VegMark className="h-4 w-4" />
                                  <span className="text-xs text-emerald-600 font-medium">Veg</span>
                                </div>
                              )}
                              {item.dietaryType === "non-veg" && (
                                <div className="flex items-center gap-1">
                                  <NonVegMark className="h-4 w-4" />
                                  <span className="text-xs text-red-600 font-medium">Non-Veg</span>
                                </div>
                              )}
                              {item.dietaryType === "egg" && (
                                <div className="flex items-center gap-1">
                                  <EggMark className="h-4 w-4" />
                                  <span className="text-xs text-orange-600 font-medium">Egg</span>
                                </div>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs md:text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                          <span className="font-semibold text-primary whitespace-nowrap text-sm md:text-base">
                            ₹{item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Vibe & Amenities Tab */}
            <TabsContent value="vibe" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-4">Purpose</h3>
                    <div className="flex flex-wrap gap-2">
                      {cafe.purpose.map((p) => (
                        <span key={p} className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-4">Vibe & Ambience</h3>
                    <div className="flex flex-wrap gap-2">
                      {cafe.vibe.map((v) => (
                        <span key={v} className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {cafe.amenities.map((a) => (
                        <span key={a} className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4 mt-6">
              {cafe.reviews.map((review, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{review.userName}</p>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Location */}
                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-4">Location & Directions</h3>
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground">{cafe.location.address}</p>
                        <Button variant="link" className="h-auto p-0 text-primary" asChild>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${cafe.location.coordinates.lat},${cafe.location.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            Get Directions
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <a href={`tel:${cafe.contact.phone}`} className="text-foreground hover:text-primary">
                          {cafe.contact.phone}
                        </a>
                      </div>

                      {cafe.contact.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <a href={`mailto:${cafe.contact.email}`} className="text-foreground hover:text-primary">
                            {cafe.contact.email}
                          </a>
                        </div>
                      )}

                      {cafe.contact.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-primary" />
                          <a
                            href={cafe.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-primary flex items-center gap-1"
                          >
                            {cafe.contact.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Media */}
                  {cafe.contact.social && (
                    <div>
                      <h3 className="text-xl font-serif font-bold text-foreground mb-4">Follow Us</h3>
                      <div className="flex gap-3">
                        {cafe.contact.social.instagram && (
                          <Button variant="outline" size="icon" asChild>
                            <a
                              href={`https://instagram.com/${cafe.contact.social.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {cafe.contact.social.facebook && (
                          <Button variant="outline" size="icon" asChild>
                            <a
                              href={`https://facebook.com/${cafe.contact.social.facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Facebook className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center pt-6 md:pt-8">
            <Button
              onClick={() => router.push("/guided")}
              variant="outline"
              className="gap-2 bg-transparent h-11 w-full sm:w-auto"
            >
              <Search className="h-4 w-4" />
              Start Guided Search
            </Button>
            <Button
              onClick={() => router.push("/random")}
              variant="outline"
              className="gap-2 bg-transparent h-11 w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Surprise Me
            </Button>
            <Button onClick={() => router.push("/browse")} className="h-11 w-full sm:w-auto">
              Browse All Cafés
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
