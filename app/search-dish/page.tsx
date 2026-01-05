"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CafeCard } from "@/components/cafe-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { getCafes } from "@/lib/cafe-data-service"
import type { Cafe } from "@/lib/types"
import { getDistanceKm } from "@/lib/distance"
import { Search, SlidersHorizontal, X, Utensils, MapPin, DollarSign, Star } from "lucide-react"
import { PageLoading, CardLoading } from "@/components/loading"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DishSearchResult {
  cafe: Cafe
  matchingItems: Array<{
    category: string
    item: {
      name: string
      price: number
      description?: string
      dietaryType?: "veg" | "non-veg" | "egg"
    }
  }>
  distance?: number | null
}

function fuzzySearch(query: string, text: string): number {
  if (!query || !text) return 0
  
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return 100 - (textLower.indexOf(queryLower) * 2) // Earlier matches get higher scores
  }
  
  // Fuzzy matching with character sequence
  let score = 0
  let queryIndex = 0
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10
      queryIndex++
    }
  }
  
  // Bonus for consecutive matches
  if (queryIndex === queryLower.length) {
    score += 20
  }
  
  return score
}

function generateDishSuggestions(cafes: Cafe[]): string[] {
  const suggestions = new Set<string>()
  
  cafes.forEach(cafe => {
    cafe.menuCategories.forEach(category => {
      category.items.forEach(item => {
        suggestions.add(item.name)
      })
    })
  })
  
  return Array.from(suggestions).sort()
}

export default function SearchDishPage() {
  const router = useRouter()
  
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [dishQuery, setDishQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<DishSearchResult[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [location, setLocation] = useState("Bangalore")
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Refs
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  // Filters
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedDistance, setSelectedDistance] = useState<string>("")
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("relevance")
  
  const allDishSuggestions = useMemo(() => generateDishSuggestions(cafes), [cafes])
  
  const priceRangeOptions = [
    { value: "budget", label: "₹ (Budget)" },
    { value: "moderate", label: "₹₹ (Moderate)" },
    { value: "premium", label: "₹₹₹ (Premium)" },
  ]
  
  const distanceOptions = [
    { value: "1", label: "Nearby (≤1km)" },
    { value: "5", label: "Within 5km" },
    { value: "999", label: "Citywide" },
  ]
  
  const vibeOptions = [
    "Aesthetic & Photogenic",
    "Green & Serene", 
    "Nightlife & Dancing",
    "Musical & Soulful",
    "Quiet & Peaceful",
    "Rooftop & Outdoor",
  ]
  
  const sortOptions = [
    { value: "relevance", label: "Relevance", icon: Search },
    { value: "distance", label: "Distance", icon: MapPin },
    { value: "price", label: "Price", icon: DollarSign },
    { value: "rating", label: "Rating", icon: Star },
  ]
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedLocation = localStorage.getItem("userLocation")
        if (savedLocation) setLocation(savedLocation)
        const savedCoords = localStorage.getItem("userCoords")
        if (savedCoords) {
          try {
            setUserCoords(JSON.parse(savedCoords))
          } catch (error) {
            console.error("Error parsing user coordinates:", error)
          }
        }
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
  
  useEffect(() => {
    if (dishQuery.length >= 2) {
      const filtered = allDishSuggestions
        .map(dish => ({ dish, score: fuzzySearch(dishQuery, dish) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(({ dish }) => dish)
      
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [dishQuery, allDishSuggestions])
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSuggestions([])
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  const searchDishes = async () => {
    if (!dishQuery.trim()) return
    
    setIsSearching(true)
    const results: DishSearchResult[] = []
    
    for (const cafe of cafes) {
      const matchingItems: DishSearchResult['matchingItems'] = []
      
      cafe.menuCategories.forEach(category => {
        category.items.forEach(item => {
          const score = fuzzySearch(dishQuery, item.name)
          if (score > 30) { // Threshold for matching
            matchingItems.push({
              category: category.name,
              item
            })
          }
        })
      })
      
      if (matchingItems.length > 0) {
        let distance: number | null = null
        if (userCoords) {
          distance = await getDistanceKm(userCoords, cafe.location.coordinates)
        }
        
        results.push({
          cafe,
          matchingItems,
          distance
        })
      }
    }
    
    // Sort by relevance (number of matches and match quality)
    results.sort((a, b) => {
      const aScore = a.matchingItems.length + (a.matchingItems.some(item => 
        fuzzySearch(dishQuery, item.item.name) > 70
      ) ? 10 : 0)
      const bScore = b.matchingItems.length + (b.matchingItems.some(item => 
        fuzzySearch(dishQuery, item.item.name) > 70
      ) ? 10 : 0)
      return bScore - aScore
    })
    
    setSearchResults(results)
    setIsSearching(false)
  }
  
  const filteredResults = useMemo(() => {
    let filtered = searchResults
    
    // Price filter
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(result => {
        const cafe = result.cafe
        const priceRange = cafe.priceRange
        return selectedPriceRanges.some(range => {
          if (range === "budget") return priceRange.includes("Budget Friendly")
          if (range === "moderate") return priceRange.includes("Moderate") || priceRange.includes("Mid-Range")
          if (range === "premium") return priceRange.includes("Premium")
          return false
        })
      })
    }
    
    // Distance filter
    if (selectedDistance && userCoords) {
      const maxDistance = parseFloat(selectedDistance)
      filtered = filtered.filter(result => {
        if (!result.distance) return false
        return result.distance <= maxDistance
      })
    }
    
    // Vibe filter
    if (selectedVibes.length > 0) {
      filtered = filtered.filter(result => {
        return selectedVibes.some(vibe => result.cafe.vibe.includes(vibe))
      })
    }
    
    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (!a.distance || !b.distance) return 0
          return a.distance - b.distance
        case "price":
          return a.cafe.pricePerPerson - b.cafe.pricePerPerson
        case "rating":
          return b.cafe.rating - a.cafe.rating
        case "relevance":
        default:
          return b.matchingItems.length - a.matchingItems.length
      }
    })
    
    return filtered
  }, [searchResults, selectedPriceRanges, selectedDistance, selectedVibes, sortBy, userCoords])
  
  const toggleFavorite = (cafeId: string) => {
    const newFavorites = favorites.includes(cafeId) 
      ? favorites.filter((id) => id !== cafeId) 
      : [...favorites, cafeId]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }
  
  const clearFilters = () => {
    setSelectedPriceRanges([])
    setSelectedDistance("")
    setSelectedVibes([])
  }
  
  const activeFiltersCount = selectedPriceRanges.length + (selectedDistance ? 1 : 0) + selectedVibes.length
  
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Price Range</Label>
            <div className="space-y-2">
              {priceRangeOptions.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${range.value}`}
                    checked={selectedPriceRanges.includes(range.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPriceRanges([...selectedPriceRanges, range.value])
                      } else {
                        setSelectedPriceRanges(selectedPriceRanges.filter((p) => p !== range.value))
                      }
                    }}
                  />
                  <label htmlFor={`price-${range.value}`} className="text-sm cursor-pointer text-foreground">
                    {range.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Distance Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Distance</Label>
            <div className="space-y-2">
              {distanceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`distance-${option.value}`}
                    name="distance"
                    value={option.value}
                    checked={selectedDistance === option.value}
                    onChange={(e) => setSelectedDistance(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor={`distance-${option.value}`} className="text-sm cursor-pointer text-foreground">
                    {option.label}
                  </label>
                </div>
              ))}
              {selectedDistance && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedDistance("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear distance filter
                </Button>
              )}
            </div>
            {!userCoords && (
              <p className="text-xs text-muted-foreground">
                Distance filtering requires location access.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Vibe Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Vibe</Label>
            <div className="grid grid-cols-1 gap-2">
              {vibeOptions.map((vibe) => (
                <div key={vibe} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vibe-${vibe}`}
                    checked={selectedVibes.includes(vibe)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedVibes([...selectedVibes, vibe])
                      } else {
                        setSelectedVibes(selectedVibes.filter((v) => v !== vibe))
                      }
                    }}
                  />
                  <label htmlFor={`vibe-${vibe}`} className="text-sm cursor-pointer text-foreground">
                    {vibe}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
  
  if (isLoading) {
    return <PageLoading message="Loading dish search..." />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header location={location} />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Search by Dish</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Find cafés serving your favorite dishes
              </p>
            </div>
          </div>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative" ref={searchContainerRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a dish (e.g., pizza, pasta, coffee)..."
                value={dishQuery}
                onChange={(e) => setDishQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSuggestions(false)
                    setSuggestions([])
                    searchDishes()
                  }
                  if (e.key === 'Escape') {
                    setShowSuggestions(false)
                    setSuggestions([])
                  }
                }}
                onFocus={() => {
                  if (dishQuery.length >= 2 && suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                className="pl-10 h-12 text-base"
              />
              
              {/* Auto-suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0"
                      onClick={() => {
                        setDishQuery(suggestion)
                        setShowSuggestions(false)
                        setSuggestions([])
                        searchDishes()
                      }}
                    >
                      <span className="text-foreground">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => {
                setShowSuggestions(false)
                setSuggestions([])
                searchDishes()
              }} 
              disabled={!dishQuery.trim() || isSearching}
              className="w-full h-12 gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? "Searching..." : "Search Dishes"}
            </Button>
          </div>
          
          {/* Filters and Sort */}
          {searchResults.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1"></div>
              
              <div className="flex gap-2">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                
                {/* Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2 relative">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your dish search</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                      {activeFiltersCount > 0 && (
                        <Button variant="outline" onClick={clearFilters} className="w-full mt-6 gap-2">
                          <X className="h-4 w-4" />
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          )}
          
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Active filters:</span>
                  {selectedPriceRanges.map((range) => (
                    <span key={range} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                      {priceRangeOptions.find(opt => opt.value === range)?.label}
                    </span>
                  ))}
                  {selectedDistance && (
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                      {distanceOptions.find(opt => opt.value === selectedDistance)?.label}
                    </span>
                  )}
                  {selectedVibes.map((vibe) => (
                    <span key={vibe} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                      {vibe}
                    </span>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Results */}
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Found {filteredResults.length} {filteredResults.length === 1 ? "café" : "cafés"} serving "{dishQuery}"
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Sorted by {sortOptions.find(opt => opt.value === sortBy)?.label}
              </div>
            </div>
          )}
          
          {/* Results Grid */}
          {searchResults.length > 0 ? (
            filteredResults.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResults.map((result) => (
                  <div key={result.cafe.id} className="space-y-4">
                    <CafeCard
                      cafe={result.cafe}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(result.cafe.id)}
                    />
                    
                    {/* Matching Dishes */}
                    <Card>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold text-foreground mb-3">Matching Dishes:</h4>
                        <div className="space-y-2">
                          {result.matchingItems.slice(0, 3).map((match, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <div>
                                <span className="font-medium text-foreground">{match.item.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">({match.category})</span>
                              </div>
                              <span className="font-semibold text-primary">₹{match.item.price}</span>
                            </div>
                          ))}
                          {result.matchingItems.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{result.matchingItems.length - 3} more dishes
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">No cafés found</h3>
                      <p className="text-muted-foreground mt-1">
                        Try adjusting your filters to find more results.
                      </p>
                    </div>
                    <Button variant="outline" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          ) : dishQuery && !isSearching ? (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Utensils className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No dishes found</h3>
                    <p className="text-muted-foreground mt-1">
                      We couldn't find any cafés serving "{dishQuery}". Try a different dish name.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  )
}
