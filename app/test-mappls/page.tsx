"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapplsAPI } from "@/lib/mappls-api"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function MapplsTestPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [testLat, setTestLat] = useState("12.9352")
  const [testLng, setTestLng] = useState("77.6245")
  const [reverseResult, setReverseResult] = useState<any>(null)
  const [reverseLoading, setReverseLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setError(null)
    setResults([])
    
    try {
      console.log('Testing Mappls Autosuggest...')
      const locations = await MapplsAPI.autosuggest(searchQuery)
      
      if (locations.length === 0) {
        setError('No results found. The API might not be working or no locations match your query.')
      } else {
        setResults(locations)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleReverseGeocode = async () => {
    const lat = parseFloat(testLat)
    const lng = parseFloat(testLng)
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates')
      return
    }
    
    setReverseLoading(true)
    setError(null)
    setReverseResult(null)
    
    try {
      console.log('Testing Mappls Reverse Geocode...')
      const result = await MapplsAPI.reverseGeocode(lat, lng)
      
      if (!result) {
        setError('Reverse geocode failed. The API might not be working.')
      } else {
        setReverseResult(result)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      console.error('Reverse geocode error:', err)
    } finally {
      setReverseLoading(false)
    }
  }

  const testGPS = async () => {
    setReverseLoading(true)
    setError(null)
    
    try {
      const location = await MapplsAPI.getCurrentLocation()
      
      if (!location) {
        setError('GPS location failed')
      } else {
        setTestLat(location.lat.toString())
        setTestLng(location.lng.toString())
        setReverseResult(location)
      }
    } catch (err: any) {
      setError(`GPS Error: ${err.message}`)
    } finally {
      setReverseLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mappls API Test Page</h1>
          <p className="text-muted-foreground">
            Use this page to test if Mappls API is working correctly
          </p>
        </div>

        {/* Autosuggest Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test 1: Autosuggest (Location Search)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Try: Koramangala, Connaught Place, Mumbai"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Found {results.length} results!</span>
                </div>
                {results.map((loc, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-secondary/50">
                    <p className="font-medium">{loc.placeName}</p>
                    <p className="text-sm text-muted-foreground">{loc.placeAddress}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {loc.type} | Coords: {loc.latitude}, {loc.longitude}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reverse Geocode Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test 2: Reverse Geocode (Coordinates → Address)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  placeholder="12.9352"
                  value={testLat}
                  onChange={(e) => setTestLat(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  placeholder="77.6245"
                  value={testLng}
                  onChange={(e) => setTestLng(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleReverseGeocode} disabled={reverseLoading}>
                {reverseLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Reverse Geocode'
                )}
              </Button>
              <Button onClick={testGPS} variant="outline" disabled={reverseLoading}>
                Use GPS Location
              </Button>
            </div>

            {reverseResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Reverse geocode successful!</span>
                </div>
                <div className="p-3 border rounded-lg bg-secondary/50">
                  <p className="font-medium">{reverseResult.formattedAddress || reverseResult.city}</p>
                  <p className="text-sm text-muted-foreground">
                    City: {reverseResult.city} | State: {reverseResult.state}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coords: {testLat}, {testLng}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">API Key:</div>
              <div className="font-mono text-xs">dbsomdpdvapmmxivbiaiebuehatqkylcivew</div>
              
              <div className="font-medium">Autosuggest URL:</div>
              <div className="font-mono text-xs">https://atlas.mappls.com/api/places/search/json</div>
              
              <div className="font-medium">Geocode URL:</div>
              <div className="font-mono text-xs">https://apis.mappls.com/advancedmaps/v1</div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> If you see "No results" or errors, check:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>Open browser DevTools (F12) → Network tab</li>
                <li>Look for requests to mappls.com</li>
                <li>Check if they return 200 OK or error codes</li>
                <li>Look for CORS errors in Console tab</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Console Logs */}
        <Card>
          <CardHeader>
            <CardTitle>How to Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Open Browser DevTools (Press F12)</p>
            <p>2. Go to Console tab</p>
            <p>3. Click "Search" button above</p>
            <p>4. Look for these logs:</p>
            <div className="font-mono text-xs bg-secondary p-3 rounded-lg mt-2">
              🔍 Mappls Autosuggest: "your query"<br/>
              🔍 Mappls API Response: {"[{...}]"}<br/>
              ✅ Found X locations in India
            </div>
            <p className="mt-4">5. If you see errors, check Network tab for API response details</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
