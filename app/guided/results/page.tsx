"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CafeCard } from "@/components/cafe-card"
import { Logo } from "@/components/logo"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCafes } from "@/lib/cafe-data-service"
import type { Cafe } from "@/lib/types"
import { computeCafeMatches, type UserMatchPreferences } from "@/lib/match"
import { Sparkles, RotateCcw, Star, MapPin, Lock, ArrowRight } from "lucide-react"

export default function GuidedResultsPage() {
  const router = useRouter()
  const [recommendedCafes, setRecommendedCafes] = useState<Cafe[]>([])
  const [matchesCount, setMatchesCount] = useState(0)
  const [matchMap, setMatchMap] = useState<Record<string, number>>({})
  const [featuresMap, setFeaturesMap] = useState<Record<string, { ambience: string[]; amenities: string[]; fdt: string[]; mood: boolean }>>({})
  const [favorites, setFavorites] = useState<string[]>([])
  const [location, setLocation] = useState("Bangalore")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const initData = async () => {
      const savedLocation = localStorage.getItem("userLocation")
      if (savedLocation) setLocation(savedLocation)

      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
      
      const authToken = localStorage.getItem("authToken")
      const user = localStorage.getItem("user")
      setIsLoggedIn(!!(authToken || user))

      // Fetch cafes from Google Sheets
      const cafes = await getCafes()

      // In a real app, would filter based on preferences
      const preferences = localStorage.getItem("guidedSearchPreferences")
      const savedCoords = localStorage.getItem("userCoords")
      if (preferences) {
        const parsed = JSON.parse(preferences)
        const userPrefs: UserMatchPreferences = {
          preferredMood: parsed[1] || "",
          preferredAmbience: parsed[2] || [],
          preferredAmenities: parsed[3] || [],
          preferredFoodDrinkTypes: parsed[4] || [],
          // Map price range (question 6 in guided) to our price buckets if present
          preferredPriceRange: parsed[6] || "",
          // Distance bucket (question 5)
          maxDistance: parsed[5] || "Anywhere 12km+",
          minRating: 0,
          userCoords: savedCoords ? JSON.parse(savedCoords) : undefined,
        }
        computeCafeMatches(userPrefs).then((results) => {
          // Merge match % into cafe cards by ordering cafe list accordingly
          const ordered = [...cafes].sort((a, b) => {
            const aScore = results.find((r) => r.name === a.name)?.matchPercentage ?? 0
            const bScore = results.find((r) => r.name === b.name)?.matchPercentage ?? 0
            return bScore - aScore
          })
          setMatchesCount(results.length)
          setMatchMap(Object.fromEntries(results.map((r) => [r.name, r.matchPercentage])))
          setFeaturesMap(
            Object.fromEntries(
              results.map((r) => [r.name, { ambience: r.matchedAmbience, amenities: r.matchedAmenities, fdt: r.matchedFoodDrinkTypes, mood: r.matchedMood }]),
            ),
          )
          setRecommendedCafes(ordered)
        })
      } else {
        setRecommendedCafes(cafes)
      }
    }
    initData()
  }, [])

  const toggleFavorite = (cafeId: string) => {
    const newFavorites = favorites.includes(cafeId) ? favorites.filter((id) => id !== cafeId) : [...favorites, cafeId]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const handleRedoSearch = () => {
    localStorage.removeItem("guidedSearchPreferences")
    router.push("/guided")
  }

  // Get featured café and other cafés
  const featuredCafe = recommendedCafes[0]
  const topThreeCafes = recommendedCafes.slice(1, 4)
  const moreCafes = recommendedCafes.slice(4, 8)

  // Show loading state while cafes are being fetched
  if (recommendedCafes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Finding perfect cafés for you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {location && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Location:</span> {location}
              </div>
            )}
            {!isLoggedIn && (
              <Button variant="outline" size="sm" onClick={() => router.push("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">We Found Perfect Matches for You! ✨</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Based on your preferences, we found {matchesCount || recommendedCafes.length} amazing cafés
              </p>
            </div>
            <Button variant="outline" onClick={handleRedoSearch} className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Try Different Preferences
            </Button>
          </div>

          {/* Featured Café - Full Width Banner */}
          {featuredCafe && (
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              Our Top Pick for You
            </h2>

            <Card className="overflow-hidden hover:shadow-xl transition-all border-primary/30">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 md:h-96 bg-muted">
                  {(() => {
                    let imageSrc = !featuredCafe.image || featuredCafe.image.trim() === '' || featuredCafe.image.includes('placeholder')
                      ? '/placeholder.jpg'
                      : featuredCafe.image;
                    
                    // Use proxy for Google Drive URLs
                    if (imageSrc.includes('drive.google.com') && imageSrc !== '/placeholder.jpg') {
                      imageSrc = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
                    }
                    
                    return (
                      <img
                        src={imageSrc}
                        alt={featuredCafe.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          if (e.currentTarget.src !== window.location.origin + '/placeholder.jpg') {
                            e.currentTarget.src = '/placeholder.jpg';
                          }
                        }}
                      />
                    );
                  })()}
                  {featuredCafe.type === "Veg" && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold bg-white text-emerald-700 border border-emerald-300 shadow-sm">
                      Pure Veg
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-foreground mb-2">
                      {featuredCafe.name}
                    </h3>
                    <p className="text-muted-foreground">{featuredCafe.description}</p>
                  </div>

                  {matchMap[featuredCafe.name] && (
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-primary">Match Score</span>
                        <span className="text-xl font-bold text-primary">{matchMap[featuredCafe.name]}%</span>
                      </div>
                      <Progress value={matchMap[featuredCafe.name]} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-lg">{featuredCafe.rating}</span>
                      <span className="text-muted-foreground">({featuredCafe.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>{featuredCafe.location.address.split(",")[0]}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {featuredCafe.vibe.slice(0, 3).map((v) => (
                      <span
                        key={v}
                        className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Best Dish</p>
                        <p className="font-semibold text-primary">{featuredCafe.bestDish}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">₹{featuredCafe.pricePerPerson}/person</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => router.push(`/cafe/${featuredCafe.id}`)}
                  >
                    View Full Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </section>
          )}

          {/* Top 3 Recommendations */}
          {topThreeCafes.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-foreground">More Great Matches</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {topThreeCafes.map((cafe) => {
              const score = matchMap[cafe.name]
              const f = featuresMap[cafe.name]
              return (
                <div key={cafe.id} className="flex flex-col">
                  <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col flex-1">
                    {typeof score === 'number' && (
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Match Score</span>
                        <span className="text-2xl font-bold">{score}%</span>
                      </div>
                    )}
                    <Link href={`/cafe/${cafe.id}`}>
                      <div className="relative h-48 md:h-52 w-full overflow-hidden -mb-2 bg-muted">
                        {(() => {
                          let imageSrc = !cafe.image || cafe.image.trim() === '' || cafe.image.includes('placeholder')
                            ? '/placeholder.jpg'
                            : cafe.image;
                          
                          // Use proxy for Google Drive URLs
                          if (imageSrc.includes('drive.google.com') && imageSrc !== '/placeholder.jpg') {
                            imageSrc = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
                          }
                          
                          return (
                            <img
                              src={imageSrc}
                              alt={cafe.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                if (e.currentTarget.src !== window.location.origin + '/placeholder.jpg') {
                                  e.currentTarget.src = '/placeholder.jpg';
                                }
                              }}
                            />
                          );
                        })()}
                        {cafe.type === 'Veg' && (
                          <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-white text-emerald-700 border border-emerald-300 shadow-md">
                            <span className="text-emerald-600">●</span>
                            Veg
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <Link href={`/cafe/${cafe.id}`} className="flex-1 min-w-0">
                          <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {cafe.name}
                          </h3>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(cafe.id)}
                          className="h-9 w-9 flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          <Heart className={`h-5 w-5 transition-all ${favorites.includes(cafe.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"}`} />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{cafe.shortDescription}</p>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-bold text-yellow-900">{cafe.rating}</span>
                          <span className="text-yellow-700 text-xs">({cafe.reviewCount})</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {cafe.vibe.slice(0, 2).map((v) => (
                          <span key={v} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                            {v}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Best Dish</p>
                          <p className="text-sm font-semibold text-primary truncate">{cafe.bestDish}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-0.5">Price</p>
                          <p className="text-sm font-bold text-foreground whitespace-nowrap">₹{cafe.pricePerPerson}</p>
                        </div>
                      </div>
                      
                      {f && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <Accordion type="single" collapsible>
                            <AccordionItem value="details" className="border-0">
                              <AccordionTrigger className="text-xs py-2 hover:no-underline">
                                <span className="flex items-center gap-2">
                                  <span className="font-medium">Match Details</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(() => {
                                      const parts: string[] = []
                                      if (f.mood) parts.push('Mood')
                                      if (f.ambience?.length) parts.push(...f.ambience)
                                      if (f.amenities?.length) parts.push(...f.amenities)
                                      if (f.fdt?.length) parts.push(...f.fdt)
                                      return parts.length
                                    })()} matched)
                                  </span>
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="text-xs text-muted-foreground space-y-2 pt-2">
                                  <div>
                                    <span className="font-medium text-foreground">Purpose: </span>
                                    <span>{f.mood ? '✓ Matched' : '✗ Not matched'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">Ambience: </span>
                                    <span>{f.ambience?.length ? f.ambience.join(', ') : 'None'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">Amenities: </span>
                                    <span>{f.amenities?.length ? f.amenities.join(', ') : 'None'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">Food & Drinks: </span>
                                    <span>{f.fdt?.length ? f.fdt.join(', ') : 'None'}</span>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                )
              })}
            </div>
          </section>
          )}

          {/* Locked Content for Non-Logged In Users */}
          {!isLoggedIn && moreCafes.length > 0 && (
            <section className="relative space-y-4">
              <h2 className="text-2xl font-serif font-bold text-foreground">Discover Even More Cafés</h2>
              
              {/* Blurred Content */}
              <div className="relative">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-4 blur-sm pointer-events-none select-none">
                  {moreCafes.map((cafe) => (
                    <CafeCard key={cafe.id} cafe={cafe} />
                  ))}
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Card className="max-w-md border-primary/30 shadow-xl">
                    <CardContent className="pt-8 pb-8 text-center space-y-6">
                      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-serif font-bold">Login to Unlock Full Experience ☕</h3>
                        <p className="text-muted-foreground">
                          Sign in to access complete café information, menus, contact details, reviews, and personalized
                          recommendations
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Button
                          size="lg"
                          onClick={() => router.push("/auth")}
                          className="w-full gap-2"
                        >
                          Sign In to Continue
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/home")}
                          className="w-full"
                        >
                          Browse Without Login
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {/* Logged In: Show All Cafés with Match Scores */}
          {isLoggedIn && moreCafes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-foreground">More Recommendations</h2>
                <Button variant="outline" onClick={() => router.push("/home")}>
                  View All Cafés
                </Button>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
                {moreCafes.map((cafe) => {
                  const score = matchMap[cafe.name]
                  const f = featuresMap[cafe.name]
                  return (
                    <div key={cafe.id} className="flex flex-col">
                      <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col flex-1">
                        {typeof score === 'number' && (
                          <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-2 flex items-center justify-between">
                            <span className="text-xs font-medium">Match Score</span>
                            <span className="text-xl font-bold">{score}%</span>
                          </div>
                        )}
                        <Link href={`/cafe/${cafe.id}`}>
                          <div className="relative h-48 md:h-52 w-full overflow-hidden -mb-2 bg-muted">
                            {(() => {
                              let imageSrc = !cafe.image || cafe.image.trim() === '' || cafe.image.includes('placeholder')
                                ? '/placeholder.jpg'
                                : cafe.image;
                              
                              // Use proxy for Google Drive URLs
                              if (imageSrc.includes('drive.google.com') && imageSrc !== '/placeholder.jpg') {
                                imageSrc = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
                              }
                              
                              return (
                                <img
                                  src={imageSrc}
                                  alt={cafe.name}
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    if (e.currentTarget.src !== window.location.origin + '/placeholder.jpg') {
                                      e.currentTarget.src = '/placeholder.jpg';
                                    }
                                  }}
                                />
                              );
                            })()}
                            {cafe.type === 'Veg' && (
                              <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-white text-emerald-700 border border-emerald-300 shadow-md">
                                <span className="text-emerald-600">●</span>
                                Veg
                              </div>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <Link href={`/cafe/${cafe.id}`} className="flex-1 min-w-0">
                              <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {cafe.name}
                              </h3>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(cafe.id)}
                              className="h-9 w-9 flex-shrink-0 hover:scale-110 transition-transform"
                            >
                              <Heart className={`h-5 w-5 transition-all ${favorites.includes(cafe.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"}`} />
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{cafe.shortDescription}</p>

                          <div className="flex items-center gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="font-bold text-yellow-900">{cafe.rating}</span>
                              <span className="text-yellow-700 text-xs">({cafe.reviewCount})</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {cafe.vibe.slice(0, 2).map((v) => (
                              <span key={v} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                                {v}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">Best Dish</p>
                              <p className="text-sm font-semibold text-primary truncate">{cafe.bestDish}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-0.5">Price</p>
                              <p className="text-sm font-bold text-foreground whitespace-nowrap">₹{cafe.pricePerPerson}</p>
                            </div>
                          </div>
                          
                          {f && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <Accordion type="single" collapsible>
                                <AccordionItem value="details" className="border-0">
                                  <AccordionTrigger className="text-xs py-2 hover:no-underline">
                                    <span className="flex items-center gap-2">
                                      <span className="font-medium">Match Details</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({(() => {
                                          const parts: string[] = []
                                          if (f.mood) parts.push('Mood')
                                          if (f.ambience?.length) parts.push(...f.ambience)
                                          if (f.amenities?.length) parts.push(...f.amenities)
                                          if (f.fdt?.length) parts.push(...f.fdt)
                                          return parts.length
                                        })()} matched)
                                      </span>
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="text-xs text-muted-foreground space-y-2 pt-2">
                                      <div>
                                        <span className="font-medium text-foreground">Purpose: </span>
                                        <span>{f.mood ? '✓ Matched' : '✗ Not matched'}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-foreground">Ambience: </span>
                                        <span>{f.ambience?.length ? f.ambience.join(', ') : 'None'}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-foreground">Amenities: </span>
                                        <span>{f.amenities?.length ? f.amenities.join(', ') : 'None'}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-foreground">Food & Drinks: </span>
                                        <span>{f.fdt?.length ? f.fdt.join(', ') : 'None'}</span>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <section className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button variant="outline" size="lg" onClick={handleRedoSearch}>
              Try Different Preferences
            </Button>
            <Button size="lg" onClick={() => router.push("/home")}>
              Explore All Cafés
            </Button>
          </section>
        </div>
      </main>
    </div>
  )
}
