"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search, ChevronDown, AlertCircle, Loader2, Sparkles } from "lucide-react"
import { MapplsAPI } from "@/lib/mappls-api"
import type { MapplsLocation } from "@/lib/mappls-api"
import { useDebounce } from "@/hooks/useDebounce"

export default function LocationPage() {
  const router = useRouter()
  const [manualLocation, setManualLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDetectingManual, setIsDetectingManual] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<MapplsLocation[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [gpsError, setGpsError] = useState<string>("")
  const [showGpsError, setShowGpsError] = useState(false)
  
  // Debounce the search input to reduce API calls
  const debouncedSearchQuery = useDebounce(manualLocation, 600)

  const getGPSErrorMessage = (error: GeolocationPositionError): string => {
    console.log('📍 GPS Error Details:', {
      code: error.code,
      message: error.message,
    });
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access was denied. Click the location icon in your browser's address bar and allow location access, then try again.";
      case error.POSITION_UNAVAILABLE:
        return "Unable to get your location. This could be due to: (1) Location services disabled on your device, (2) Poor GPS signal, or (3) Browser restrictions. Please try entering your location manually below.";
      case error.TIMEOUT:
        return "Location request timed out. Please try again or enter your location manually.";
      default:
        return "An error occurred while getting your location. Please try entering it manually.";
    }
  }

  const handleDeviceLocation = () => {
    setIsLoading(true)
    setGpsError("")
    setShowGpsError(false)
    
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            console.log(`📍 Device location: ${latitude}, ${longitude}`)
            
            // Use Mappls Reverse Geocode
            const result = await MapplsAPI.reverseGeocode(latitude, longitude)
            
            const locationValue = result?.city || result?.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            const addressValue = result?.formattedAddress || locationValue
            
            localStorage.setItem("userLocation", addressValue)
            localStorage.setItem("userCoords", JSON.stringify({ lat: latitude, lng: longitude }))
            
            console.log(`✅ Location saved: ${locationValue}`)
            router.push("/discover")
          } catch (err) {
            console.error("Reverse geocoding failed", err)
            const { latitude, longitude } = position.coords
            localStorage.setItem("userCoords", JSON.stringify({ lat: latitude, lng: longitude }))
            localStorage.setItem("userLocation", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
            router.push("/discover")
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
          
          const errorMessage = getGPSErrorMessage(error)
          setGpsError(errorMessage)
          setShowGpsError(true)
        },
        { 
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        },
      )
    } else {
      setIsLoading(false)
      setGpsError("Geolocation is not supported by your browser. Please enter your location manually.")
      setShowGpsError(true)
    }
  }

  const handleDetectManual = () => {
    setIsDetectingManual(true)
    setGpsError("")
    
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            
            // Use Mappls Reverse Geocode
            const result = await MapplsAPI.reverseGeocode(latitude, longitude)
            
            const locationValue = result?.city || result?.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            
            setManualLocation(locationValue)
            localStorage.setItem("userCoords", JSON.stringify({ lat: latitude, lng: longitude }))
          } catch (err) {
            console.error("Reverse geocoding failed", err)
            const { latitude, longitude } = position.coords
            setManualLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          } finally {
            setIsDetectingManual(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsDetectingManual(false)
          const errorMessage = getGPSErrorMessage(error)
          setGpsError(errorMessage)
          setShowGpsError(true)
        },
        { 
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        },
      )
    } else {
      setIsDetectingManual(false)
      setGpsError("Geolocation is not supported by your browser. Please enter your location manually.")
      setShowGpsError(true)
    }
  }

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    
    setIsLoading(true)
    try {
      console.log(`🔍 Starting location search for: ${manualLocation}`);
      
      // Try Mappls Geocode
      const geocodeResult = await MapplsAPI.geocode(manualLocation.trim())
      
      if (geocodeResult) {
        console.log('✅ Using Mappls geocode result:', geocodeResult);
        
        localStorage.setItem("userCoords", JSON.stringify({ 
          lat: geocodeResult.lat, 
          lng: geocodeResult.lng 
        }));
        localStorage.setItem("userLocation", geocodeResult.formattedAddress || geocodeResult.city);
        router.push("/discover");
        return;
      }
      
      console.log('⚠️ Mappls geocode failed, trying autosuggest...');
      
      // Fallback: Try autosuggest
      const suggestions = await MapplsAPI.autosuggest(manualLocation.trim())
      
      if (suggestions && suggestions.length > 0) {
        const first = suggestions[0]
        console.log('✅ Using first autosuggest result:', first);
        
        localStorage.setItem("userCoords", JSON.stringify({ 
          lat: first.latitude, 
          lng: first.longitude 
        }));
        localStorage.setItem("userLocation", first.placeAddress || first.placeName);
        router.push("/discover");
        return;
      }
      
      // All attempts failed
      console.log('❌ All Mappls searches failed');
      setGpsError(`Could not find "${manualLocation}" in India. Please try: City name, landmark, or area (e.g., "Koramangala Bangalore", "Connaught Place Delhi").`);
      setShowGpsError(true);
      
    } catch (err) {
      console.error("Error searching location:", err);
      setGpsError("Search failed. Please check your internet connection and try again.");
      setShowGpsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLocationSelect = async (location: MapplsLocation) => {
    const locationString = location.placeAddress || location.placeName
    setManualLocation(locationString)
    setShowDropdown(false)
    setSearchResults([])
    
    setIsLoading(true)
    try {
      console.log(`✅ Selected location from Mappls:`, location);
      
      localStorage.setItem("userCoords", JSON.stringify({ 
        lat: location.latitude, 
        lng: location.longitude 
      }))
      localStorage.setItem("userLocation", locationString)
      router.push("/discover")
    } catch (err) {
      console.error("Error saving location:", err)
      localStorage.setItem("userLocation", locationString)
      router.push("/discover")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      console.log(`🔍 Searching with Mappls: ${query}`);
      
      // Use Mappls Autosuggest
      const results = await MapplsAPI.autosuggest(query)
      
      console.log(`📍 Found ${results.length} Mappls results`);
      
      setSearchResults(results)
      setShowDropdown(true)
      
    } catch (err) {
      console.error("Error searching locations:", err)
      setSearchResults([])
      setShowDropdown(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualLocation(value)
    
    // Show dropdown immediately but search will be debounced
    if (value.length >= 2) {
      setShowDropdown(true)
      setIsSearching(true)
    } else {
      setShowDropdown(false)
      setSearchResults([])
    }
  }

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      handleLocationSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.location-dropdown-container')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Logo className="justify-center" clickable={false} />
        </div>

        {/* Location Card */}
        <Card>
          <CardContent className="pt-6 space-y-6 p-4 sm:p-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground text-balance">
                Where should we find cafés for you?
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Powered by Mappls • India's most accurate maps
              </p>
            </div>

            {/* GPS Error Alert */}
            {showGpsError && gpsError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-red-800 dark:text-red-200">{gpsError}</p>
                    <button
                      onClick={() => setShowGpsError(false)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Device Location */}
            <Button 
              onClick={handleDeviceLocation} 
              disabled={isLoading} 
              className="w-full gap-2 h-12 sm:h-14" 
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm sm:text-base">Detecting Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5" />
                  <span className="text-sm sm:text-base">Use Device Location</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Manual Location */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Enter Location Manually
                  <Sparkles className="h-3 w-3 text-blue-500" />
                </label>
                <p className="text-xs text-muted-foreground">
                  Mappls-powered • All of India • Most accurate
                </p>
              </div>

              <div className="relative location-dropdown-container">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g., Koramangala Bangalore, CP Delhi, Marine Drive Mumbai"
                    value={manualLocation}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (manualLocation.length >= 2) {
                        setShowDropdown(true)
                      }
                    }}
                    className="pl-10 pr-10 h-10 sm:h-auto"
                    onKeyDown={(e) => e.key === "Enter" && handleManualLocation()}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {isSearching ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching with Mappls...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                            Found {searchResults.length} location{searchResults.length !== 1 ? 's' : ''} in India
                          </div>
                          {searchResults.map((location, index) => (
                            <button
                              key={`${location.eLoc}-${index}`}
                              onClick={() => handleLocationSelect(location)}
                              className="w-full text-left px-2 py-3 text-sm hover:bg-secondary rounded flex flex-col gap-1 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                                <span className="font-medium">{location.placeName}</span>
                                <span className="text-xs text-muted-foreground ml-auto capitalize">
                                  {location.type}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground ml-5 line-clamp-1">
                                {location.placeAddress}
                              </div>
                            </button>
                          ))}
                        </>
                      ) : manualLocation.length >= 2 && !isSearching ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          No locations found in India for "{manualLocation}"
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleDetectManual} 
                  disabled={isDetectingManual} 
                  className="w-full sm:w-auto"
                >
                  {isDetectingManual ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    "Detect Current"
                  )}
                </Button>
                <Button 
                  onClick={handleManualLocation} 
                  disabled={!manualLocation.trim() || isLoading} 
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search Location"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Tips */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-blue-500" />
            Powered by Mappls • Most accurate • India-only locations
          </p>
          <p>Try: "Koramangala", "Connaught Place", "Marine Drive"</p>
        </div>
      </div>
    </div>
  )
}
