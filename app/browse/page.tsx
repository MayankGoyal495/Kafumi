"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CafeCard } from "@/components/cafe-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { cafes } from "@/lib/cafe-data"
import { formatKm } from "@/lib/geocoding"
import { getDistanceKm } from "@/lib/distance"
import { Search, SlidersHorizontal, X, ArrowUpDown, Star, MapPin, DollarSign } from 'lucide-react'
import { PageLoading, CardLoading } from "@/components/loading"
import { useDebounce } from "@/hooks/use-debounce"
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

function BrowseContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filteredCafes, setFilteredCafes] = useState(cafes)
  const [favorites, setFavorites] = useState<string[]>([])
  const [location, setLocation] = useState("Bangalore")
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Filters
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([])
  const [selectedFoodDrinkTypes, setSelectedFoodDrinkTypes] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")

  const vibeOptions = [
    "Aesthetic & Instagrammable",
    "Green/Nature",
    "Modern/Trendy",
    "Music & Live Events",
    "Quiet & Peaceful",
    "Rooftop/Open-air",
  ]

  const purposeOptions = [
    "Business / Professional",
    "Family Outing",
    "Fun Night Out",
    "Hangout with Friends",
    "Romantic Date",
    "Work / Study Alone",
  ]

  const amenityOptions = [
    "Charging Ports",
    "Free Wi-Fi",
    "Outdoor Seating",
    "Parking",
    "Pet-Friendly",
  ]

  const priceRangeOptions = ["Budget Friendly – under ₹300", "Moderate – ₹300–₹600", "Mid-Range – ₹600–₹900", "Premium – ₹900+"]

  const typeOptions = ["Veg"]

  const foodDrinkTypeOptions = [
    "Breakfast & Brunch",
    "Coffee & Beverages", 
    "Desserts & Bakery",
    "Alcoholic Drinks",
    "Fine Dining",
    "All-rounder Menu",
  ]

  const distanceOptions = [
    { value: "1", label: "Walking ≤1km" },
    { value: "3", label: "Short Ride ≤3km" },
    { value: "6", label: "Nearby ≤6km" },
    { value: "12", label: "Moderate ≤12km" },
    { value: "999", label: "Anywhere 12km+" },
  ]

  const sortOptions = [
    { value: "name", label: "Name (A-Z)", icon: ArrowUpDown },
    { value: "rating", label: "Rating (High to Low)", icon: Star },
    { value: "price", label: "Price (Low to High)", icon: DollarSign },
    { value: "distance", label: "Distance (Near to Far)", icon: MapPin },
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
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    const applyFilters = async () => {
      let filtered = cafes

      // Search query filter (using debounced query)
      if (debouncedSearchQuery) {
        filtered = filtered.filter(
          (cafe) =>
            cafe.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            cafe.shortDescription.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            cafe.vibe.some((v) => v.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
            cafe.purpose.some((p) => p.toLowerCase().includes(debouncedSearchQuery.toLowerCase())),
        )
      }

      // Purpose filter
      if (selectedPurposes.length > 0) {
        filtered = filtered.filter((cafe) => selectedPurposes.some((purpose) => cafe.purpose.includes(purpose)))
      }

      // Vibe filter
      if (selectedVibes.length > 0) {
        filtered = filtered.filter((cafe) => selectedVibes.some((vibe) => cafe.vibe.includes(vibe)))
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        filtered = filtered.filter((cafe) => selectedAmenities.some((amenity) => cafe.amenities.includes(amenity)))
      }

      // Food & Drink Types filter
      if (selectedFoodDrinkTypes.length > 0) {
        filtered = filtered.filter((cafe) => selectedFoodDrinkTypes.some((type) => cafe.foodDrinkTypes?.includes(type)))
      }

      // Price range filter
      if (selectedPriceRanges.length > 0) {
        filtered = filtered.filter((cafe) => selectedPriceRanges.includes(cafe.priceRange))
      }

      // Type filter
      if (selectedTypes.length > 0) {
        filtered = filtered.filter((cafe) => selectedTypes.includes(cafe.type || ""))
      }

      // Distance filter
      if (maxDistance && userCoords) {
        const maxDistanceKm = parseFloat(maxDistance)
        const cafesWithDistance = await Promise.all(
          filtered.map(async (cafe) => {
            const distance = await getDistanceKm(userCoords, cafe.location.coordinates)
            return { cafe, distance }
          })
        )
        
        filtered = cafesWithDistance
          .filter(({ distance }) => distance !== null && distance <= maxDistanceKm)
          .map(({ cafe }) => cafe)
      }

      // Sorting
      if (sortBy === "distance" && userCoords) {
        const cafesWithDistance = await Promise.all(
          filtered.map(async (cafe) => {
            const distance = await getDistanceKm(userCoords, cafe.location.coordinates)
            return { cafe, distance }
          })
        )
        
        filtered = cafesWithDistance
          .sort((a, b) => {
            if (a.distance === null) return 1
            if (b.distance === null) return -1
            return a.distance - b.distance
          })
          .map(({ cafe }) => cafe)
      } else {
        filtered.sort((a, b) => {
          switch (sortBy) {
            case "rating":
              return b.rating - a.rating
            case "price":
              return a.pricePerPerson - b.pricePerPerson
            case "name":
              return a.name.localeCompare(b.name)
            default:
              return 0
          }
        })
      }

      setFilteredCafes(filtered)
    }

    applyFilters()
  }, [searchQuery, selectedPurposes, selectedVibes, selectedAmenities, selectedFoodDrinkTypes, selectedPriceRanges, selectedTypes, maxDistance, sortBy, userCoords])

  const toggleFavorite = (cafeId: string) => {
    const newFavorites = favorites.includes(cafeId) ? favorites.filter((id) => id !== cafeId) : [...favorites, cafeId]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const clearFilters = () => {
    setSelectedVibes([])
    setSelectedAmenities([])
    setSelectedPriceRanges([])
    setSelectedTypes([])
    setSelectedPurposes([])
    setSelectedFoodDrinkTypes([])
    setMaxDistance("")
    setSearchQuery("")
  }

  const activeFiltersCount =
    selectedVibes.length + selectedAmenities.length + selectedPriceRanges.length + selectedTypes.length + selectedPurposes.length + selectedFoodDrinkTypes.length + (maxDistance ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Purpose Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Purpose</Label>
            <div className="grid grid-cols-1 gap-2">
              {purposeOptions.map((purpose) => (
                <div key={purpose} className="flex items-center space-x-2">
                  <Checkbox
                    id={`purpose-${purpose}`}
                    checked={selectedPurposes.includes(purpose)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPurposes([...selectedPurposes, purpose])
                      } else {
                        setSelectedPurposes(selectedPurposes.filter((p) => p !== purpose))
                      }
                    }}
                  />
                  <label htmlFor={`purpose-${purpose}`} className="text-sm cursor-pointer text-foreground">
                    {purpose}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Café Type</Label>
            <div className="space-y-2">
              {typeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTypes([...selectedTypes, type])
                      } else {
                        setSelectedTypes(selectedTypes.filter((t) => t !== type))
                      }
                    }}
                  />
                  <label htmlFor={`type-${type}`} className="text-sm cursor-pointer text-foreground">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vibe Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Vibe & Ambience</Label>
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

      {/* Amenities Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Amenities</Label>
            <div className="grid grid-cols-1 gap-2">
              {amenityOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAmenities([...selectedAmenities, amenity])
                      } else {
                        setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))
                      }
                    }}
                  />
                  <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer text-foreground">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food & Drink Types Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Food & Drinks</Label>
            <div className="grid grid-cols-1 gap-2">
              {foodDrinkTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`food-${type}`}
                    checked={selectedFoodDrinkTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFoodDrinkTypes([...selectedFoodDrinkTypes, type])
                      } else {
                        setSelectedFoodDrinkTypes(selectedFoodDrinkTypes.filter((t) => t !== type))
                      }
                    }}
                  />
                  <label htmlFor={`food-${type}`} className="text-sm cursor-pointer text-foreground">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Price Range</Label>
            <div className="space-y-2">
              {priceRangeOptions.map((range) => (
                <div key={range} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${range}`}
                    checked={selectedPriceRanges.includes(range)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPriceRanges([...selectedPriceRanges, range])
                      } else {
                        setSelectedPriceRanges(selectedPriceRanges.filter((p) => p !== range))
                      }
                    }}
                  />
                  <label htmlFor={`price-${range}`} className="text-sm cursor-pointer text-foreground">
                    {range}
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
            <Label className="text-base font-semibold text-foreground">Maximum Distance</Label>
            <div className="space-y-2">
              {distanceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`distance-${option.value}`}
                    name="distance"
                    value={option.value}
                    checked={maxDistance === option.value}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor={`distance-${option.value}`} className="text-sm cursor-pointer text-foreground">
                    {option.label}
                  </label>
                </div>
              ))}
              {maxDistance && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMaxDistance("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear distance filter
                </Button>
              )}
            </div>
            {!userCoords && (
              <p className="text-xs text-muted-foreground">
                Distance filtering requires location access. Please enable location in the location page.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (isLoading) {
    return <PageLoading message="Loading cafés..." />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header location={location} />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Browse Cafés</h1>
            <p className="text-muted-foreground mt-1">Discover and filter cafés based on your preferences</p>
          </div>

          {/* Search, Sort and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search cafés by name, description, vibe, or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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

              {/* Mobile Filter Sheet */}
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
                    <SheetDescription>Refine your café search</SheetDescription>
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

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Active filters:</span>
                  {[...selectedPurposes, ...selectedTypes, ...selectedVibes, ...selectedAmenities, ...selectedFoodDrinkTypes, ...selectedPriceRanges].map((filter) => (
                    <span key={filter} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                      {filter}
                    </span>
                  ))}
                  {maxDistance && (
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                      Max {distanceOptions.find(opt => opt.value === maxDistance)?.label}
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCafes.length} {filteredCafes.length === 1 ? "café" : "cafés"}
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                </span>
              )}
            </div>
            {filteredCafes.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Sorted by {sortOptions.find(opt => opt.value === sortBy)?.label}
              </div>
            )}
          </div>

          {/* Café Grid */}
          {filteredCafes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCafes.map((cafe) => (
                <CafeCard
                  key={cafe.id}
                  cafe={cafe}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(cafe.id)}
                />
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
                      Try adjusting your filters or search terms to find more results.
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  )
}
