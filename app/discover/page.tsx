"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Home, Utensils } from "lucide-react"

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
              <span className="text-sm text-muted-foreground hidden sm:block">{location}</span>
            )}
            {!isLoggedIn && (
              <Button variant="outline" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Main Content */}
        <div className="space-y-6 md:space-y-8">
          {/* Hero Section - Help Me Search */}
          <section className="text-center space-y-4 md:space-y-5 pt-4">
            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
                Find Your Perfect <span className="text-primary">Café</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Answer a few questions and we'll match you with the best cafés for your mood
              </p>
            </div>

            {/* Hero CTA Card */}
            <Card className="max-w-2xl mx-auto hover:shadow-2xl transition-all duration-300 border-2 border-primary/30 bg-gradient-to-br from-background via-background to-primary/5">
              <CardContent className="pt-6 pb-6 px-5 md:px-7 text-center space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-primary/20">
                  <HelpCircle className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">
                    Help Me Search
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Our smart recommendation system will guide you to your ideal café in just a few clicks
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => router.push("/guided")}
                  className="px-6 sm:px-10 py-4 sm:py-5 text-sm sm:text-base h-auto rounded-full hover:scale-105 transition-all shadow-xl font-semibold w-full sm:w-auto"
                >
                  Start Smart Search →
                </Button>
                
                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-3 sm:gap-5 pt-2 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Personalized</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary">✓</span>
                    <span>Fast & Easy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Other Ways to Explore Section */}
          <section className="max-w-2xl mx-auto pb-6">
            {/* Dropdown Toggle Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-lg border-2 border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
            >
              <span className="text-sm sm:text-base font-semibold text-foreground">
                Other Ways to Explore
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>

            {/* Expandable Cards Section */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isExpanded ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                {/* Search by Dish */}
                <Card
                  className="hover:shadow-lg hover:scale-105 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => router.push("/search-dish")}
                >
                  <CardContent className="pt-4 pb-4 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-semibold">Search by Dish</h3>
                      <p className="text-xs text-muted-foreground">
                        Find cafés serving your favorite food
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-transparent text-xs py-1.5">
                      Explore Dishes
                    </Button>
                  </CardContent>
                </Card>

                {/* Explore All Cafés */}
                <Card
                  className="hover:shadow-lg hover:scale-105 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => router.push("/home")}
                >
                  <CardContent className="pt-4 pb-4 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-semibold">Browse All</h3>
                      <p className="text-xs text-muted-foreground">
                        See our complete café collection
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-transparent text-xs py-1.5">
                      View All
                    </Button>
                  </CardContent>
                </Card>

                {/* Find Random Café */}
                <Card
                  className="hover:shadow-lg hover:scale-105 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => router.push("/random")}
                >
                  <CardContent className="pt-4 pb-4 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif font-semibold">Surprise Me</h3>
                      <p className="text-xs text-muted-foreground">
                        Discover a random café
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-transparent text-xs py-1.5">
                      Get Random
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
