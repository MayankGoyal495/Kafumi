"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search, ChevronDown, AlertCircle, Loader2, Sparkles, Lightbulb } from "lucide-react"
import { reverseGeocodeToCity, geocodeCityToCoords, searchLocationsEnhanced, geocodeWithNominatim } from "@/lib/geocoding"
import { GeminiLocationAI } from "@/lib/gemini-location-ai"
import { LocationNotFoundDialog } from "@/components/location-not-found-dialog"
import { useDebounce } from "@/hooks/useDebounce"

export default function LocationPage() {
  const router = useRouter()
  const [manualLocation, setManualLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDetectingManual, setIsDetectingManual] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{ 
    name: string; 
    address: string; 
    city: string; 
    state: string; 
    country: string;
    lat: number;
    lng: number;
    source?: string;
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showLocationNotFound, setShowLocationNotFound] = useState(false)
  const [failedSearchQuery, setFailedSearchQuery] = useState("")
  const [isDetectingFallback, setIsDetectingFallback] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [locationContext, setLocationContext] = useState<string>("")
  const [typoCorrection, setTypoCorrection] = useState<string>("")
  const [gpsError, setGpsError] = useState<string>("")
  const [showGpsError, setShowGpsError] = useState(false)
  
  // Debounce the search input to reduce API calls
  const debouncedSearchQuery = useDebounce(manualLocation, 600)

  const getGPSErrorMessage = (error: GeolocationPositionError): string => {
    console.log('📍 GPS Error Details:', {
      code: error.code,
      message: error.message,
      PERMISSION_DENIED: error.PERMISSION_DENIED,
      POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
      TIMEOUT: error.TIMEOUT
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
            
            const city = await reverseGeocodeToCity(latitude, longitude)
            const locationValue = city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            
            localStorage.setItem("userLocation", locationValue)
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
          enableHighAccuracy: false,  // ✅ Changed to false for better compatibility
          timeout: 15000,  // ✅ Increased to 15s for reliability
          maximumAge: 30000  // ✅ Allow 30s old position
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
            const city = await reverseGeocodeToCity(latitude, longitude)
            const locationValue = city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
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
          enableHighAccuracy: false,
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
      
      // Try Gemini AI typo correction first
      const correction = await GeminiLocationAI.correctLocationTypo(manualLocation).catch(() => null);
      let queryToSearch = manualLocation;
      
      if (correction && correction.corrected !== manualLocation && correction.confidence > 0.7) {
        console.log(`🤖 Gemini corrected "${manualLocation}" to "${correction.corrected}"`);
        queryToSearch = correction.corrected;
        setTypoCorrection(correction.corrected);
      }
      
      // Try enhanced search
      const searchResults = await searchLocationsEnhanced(queryToSearch);
      
      if (searchResults && searchResults.length > 0) {
        const bestResult = searchResults[0];
        console.log('✅ Using search result:', bestResult);
        
        localStorage.setItem("userCoords", JSON.stringify({ 
          lat: bestResult.lat, 
          lng: bestResult.lng 
        }));
        localStorage.setItem("userLocation", bestResult.address || bestResult.name);
        router.push("/discover");
        return;
      }
      
      console.log('⚠️ Enhanced search returned no results, trying fallbacks...');
      
      // Fallback: Try Nominatim directly
      const nominatimResult = await geocodeWithNominatim(queryToSearch);
      if (nominatimResult) {
        console.log('✅ Using Nominatim fallback:', nominatimResult);
        localStorage.setItem("userCoords", JSON.stringify({ 
          lat: nominatimResult.lat, 
          lng: nominatimResult.lng 
        }));
        localStorage.setItem("userLocation", nominatimResult.address);
        router.push("/discover");
        return;
      }
      
      // Final fallback: Try BigDataCloud
      const coords = await geocodeCityToCoords(queryToSearch);
      if (coords) {
        console.log('✅ Using BigDataCloud fallback:', coords);
        localStorage.setItem("userCoords", JSON.stringify(coords));
        localStorage.setItem("userLocation", queryToSearch);
        router.push("/discover");
        return;
      }
      
      // All attempts failed - show dialog
      console.log('❌ All geocoding attempts failed');
      setFailedSearchQuery(manualLocation);
      setShowLocationNotFound(true);
      
    } catch (err) {
      console.error("Error geocoding location:", err);
      setFailedSearchQuery(manualLocation);
      setShowLocationNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLocationSelect = async (location: { 
    name: string; 
    address: string; 
    city: string; 
    state: string; 
    country: string;
    lat: number;
    lng: number;
    source?: string;
  }) => {
    const locationString = location.address || `${location.name}, ${location.city}, ${location.state}`
    setManualLocation(locationString)
    setShowDropdown(false)
    setSearchResults([])
    
    setIsLoading(true)
    try {
      console.log(`✅ Selected location from ${location.source}:`, location);
      
      localStorage.setItem("userCoords", JSON.stringify({ lat: location.lat, lng: location.lng }))
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
      setAiSuggestions([])
      setLocationContext("")
      return
    }

    setIsSearching(true)
    try {
      console.log(`🔍 Searching for: ${query}`);
      
      // Run geocoding and AI suggestions in parallel
      const [geocodeResults, aiSuggestionsResult] = await Promise.all([
        searchLocationsEnhanced(query),
        GeminiLocationAI.generateSearchSuggestions(query).catch(() => [])
      ]);
      
      console.log(`📍 Found ${geocodeResults.length} geocoding results`);
      console.log(`🤖 Got ${aiSuggestionsResult.length} AI suggestions`);
      
      setSearchResults(geocodeResults)
      setAiSuggestions(aiSuggestionsResult)
      setShowDropdown(true)
      
      // Get location context for the first result
      if (geocodeResults.length > 0) {
        const context = await GeminiLocationAI.getLocationContext(geocodeResults[0].name).catch(() => null);
        if (context) {
          setLocationContext(context);
        }
      }
      
    } catch (err) {
      console.error("Error searching locations:", err)
      setSearchResults([])
      setAiSuggestions([])
      setShowDropdown(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualLocation(value)
    setTypoCorrection("")
    
    // Show dropdown immediately but search will be debounced
    if (value.length >= 2) {
      setShowDropdown(true)
      setIsSearching(true)
    } else {
      setShowDropdown(false)
      setSearchResults([])
      setAiSuggestions([])
      setLocationContext("")
    }
  }

  const handleAiSuggestionClick = (suggestion: string) => {
    setManualLocation(suggestion)
    setShowDropdown(false)
    // Trigger search with the suggestion
    setTimeout(() => handleLocationSearch(suggestion), 100)
  }

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      handleLocationSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  // Dialog handlers for location not found
  const handleUseCurrentLocationFallback = () => {
    setIsDetectingFallback(true)
    setGpsError("")
    
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const city = await reverseGeocodeToCity(latitude, longitude)
            const locationValue = city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            localStorage.setItem("userLocation", locationValue)
            localStorage.setItem("userCoords", JSON.stringify({ lat: latitude, lng: longitude }))
            setShowLocationNotFound(false)
            router.push("/discover")
          } catch (err) {
            console.error("Reverse geocoding failed", err)
            localStorage.setItem("userCoords", JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude }))
            localStorage.setItem("userLocation", `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
            setShowLocationNotFound(false)
            router.push("/discover")
          } finally {
            setIsDetectingFallback(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsDetectingFallback(false)
          const errorMessage = getGPSErrorMessage(error)
          setGpsError(errorMessage)
          setShowGpsError(true)
          setShowLocationNotFound(false)
        },
        { 
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 30000
        },
      )
    } else {
      setIsDetectingFallback(false)
      setGpsError("Geolocation is not supported by your browser")
      setShowGpsError(true)
      setShowLocationNotFound(false)
    }
  }

  const handleTryAgain = () => {
    setShowLocationNotFound(false)
    setManualLocation("")
    setSearchResults([])
    setAiSuggestions([])
    setLocationContext("")
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      if (input) {
        input.focus()
      }
    }, 100)
  }

  const handleContinueAnyway = () => {
    localStorage.setItem("userLocation", failedSearchQuery)
    setShowLocationNotFound(false)
    router.push("/discover")
  }

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
              <p className="text-sm sm:text-base text-muted-foreground">Help us discover the perfect spots nearby</p>
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
                  <Sparkles className="h-3 w-3 text-purple-500" />
                </label>
                <p className="text-xs text-muted-foreground">
                  AI-powered search • India locations only
                </p>
              </div>

              {/* Typo Correction Banner */}
              {typoCorrection && (
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2 text-xs flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                  <span className="text-purple-700 dark:text-purple-300">
                    Searching for: <strong>{typoCorrection}</strong>
                  </span>
                </div>
              )}

              <div className="relative location-dropdown-container">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g., Koramangala, Connaught Place, Mumbai"
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
                          Searching with AI...
                        </div>
                      ) : (
                        <>
                          {/* AI Suggestions Section */}
                          {aiSuggestions.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 px-2 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Suggestions
                              </div>
                              {aiSuggestions.map((suggestion, index) => (
                                <button
                                  key={`ai-${index}`}
                                  onClick={() => handleAiSuggestionClick(suggestion)}
                                  className="w-full text-left px-2 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded flex items-center gap-2 transition-colors"
                                >
                                  <Lightbulb className="h-3 w-3 text-purple-500 flex-shrink-0" />
                                  <span>{suggestion}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Geocoding Results Section */}
                          {searchResults.length > 0 ? (
                            <>
                              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 border-t border-border pt-2 mt-2">
                                Found {searchResults.length} location{searchResults.length !== 1 ? 's' : ''} in India
                              </div>
                              {searchResults.map((location, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleLocationSelect(location)}
                                  className="w-full text-left px-2 py-3 text-sm hover:bg-secondary rounded flex flex-col gap-1 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium">{location.name}</span>
                                    {location.source && (
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        via {location.source}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground ml-5 line-clamp-1">
                                    {location.address}
                                  </div>
                                </button>
                              ))}
                              
                              {/* Location Context */}
                              {locationContext && (
                                <div className="mt-2 px-2 py-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-700 dark:text-blue-300 flex gap-2">
                                  <Sparkles className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                  <span>{locationContext}</span>
                                </div>
                              )}
                            </>
                          ) : manualLocation.length >= 2 && !isSearching && aiSuggestions.length === 0 ? (
                            <div className="px-2 py-3 space-y-2">
                              <div className="text-sm text-muted-foreground">
                                No locations found in India for "{manualLocation}"
                              </div>
                              <button
                                onClick={() => {
                                  setFailedSearchQuery(manualLocation)
                                  setShowLocationNotFound(true)
                                  setShowDropdown(false)
                                }}
                                className="w-full text-left px-2 py-2 text-xs bg-muted/50 hover:bg-muted rounded flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <AlertCircle className="h-3 w-3" />
                                Need help finding this location?
                              </button>
                            </div>
                          ) : null}
                        </>
                      )}
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
            <Sparkles className="h-3 w-3 text-purple-500" />
            AI-powered search • India locations only • Smart typo correction
          </p>
          <p>e.g., "mg road blr" or "cp delhi" works perfectly!</p>
        </div>
      </div>

      {/* Location Not Found Dialog */}
      <LocationNotFoundDialog
        isOpen={showLocationNotFound}
        searchQuery={failedSearchQuery}
        onClose={() => setShowLocationNotFound(false)}
        onUseCurrentLocation={handleUseCurrentLocationFallback}
        onTryAgain={handleTryAgain}
        onContinueAnyway={handleContinueAnyway}
        isDetecting={isDetectingFallback}
      />
    </div>
  )
}
