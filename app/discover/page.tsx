"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, ChevronDown, Sparkles, Home, Utensils } from "lucide-react"

export default function DiscoverPage() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [location, setLocation] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const authToken = localStorage.getItem("authToken")
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!(authToken || user))
    
    // Load location
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) setLocation(savedLocation)
  }, [])

  const handleSignIn = () => {
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {location && (
              <span className="text-sm text-muted-foreground">{location}</span>
            )}
            {!isLoggedIn && (
              <Button variant="outline" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl flex items-center justify-center min-h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="space-y-8 w-full">
          {/* Help Me Search - Primary CTA */}
          <section className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              Help Me <span className="text-primary">Search</span>
            </h1>

            <Card className="max-w-2xl mx-auto hover:shadow-2xl transition-all border-primary/30 bg-gradient-to-br from-background to-primary/10">
              <CardContent className="pt-6 pb-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground">Find Your Perfect Café</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us what you're looking for and we'll match you with the best cafés
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => router.push("/guided")}
                  className="px-8 py-4 text-base h-auto rounded-full hover:scale-105 transition-all shadow-lg font-semibold"
                >
                  Start Now →
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Other Ways to Explore - Larger Text */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground text-center">
              Other Ways to Explore
            </h2>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
                {/* Search by Dish */}
                <Card
                  className="hover:shadow-lg hover:scale-105 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => router.push("/search-dish")}
                >
                  <CardContent className="pt-5 pb-5 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Utensils className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-semibold">Search by Dish</h3>
                      <p className="text-xs text-muted-foreground">
                        Find cafés serving your favorite dishes
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent text-sm py-2">
                      Search Dishes
                    </Button>
                  </CardContent>
                </Card>

                {/* Explore All Cafés */}
                <Card
                  className="hover:shadow-lg hover:scale-105 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => router.push("/home")}
                >
                  <CardContent className="pt-5 pb-5 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Home className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-semibold">Explore All Cafés</h3>
                      <p className="text-xs text-muted-foreground">
                        Browse through our complete collection
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent text-sm py-2">
                      View Home
                    </Button>
                  </CardContent>
                </Card>

                {/* Find Random Café */}
                <Card
                  className="hover:shadow-lg hover:scale-105 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => router.push("/random")}
                >
                  <CardContent className="pt-5 pb-5 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-serif font-semibold">Find a Random Café</h3>
                      <p className="text-xs text-muted-foreground">
                        Feeling adventurous? Let us surprise you
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent text-sm py-2">
                      Surprise Me
                    </Button>
                  </CardContent>
                </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
