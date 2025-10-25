"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CafeCard } from "@/components/cafe-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useClientAuth } from "@/src/hooks/useClientAuth"
import { cafes } from "@/lib/cafe-data"
import { Heart, ArrowLeft } from "lucide-react"

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useClientAuth()
  const [favoriteCafes, setFavoriteCafes] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      try {
        const favorites = JSON.parse(saved)
        if (favorites && favorites.length > 0) {
          const cafesData = cafes.filter(cafe => favorites.includes(cafe.id))
          setFavoriteCafes(cafesData)
        } else {
          setFavoriteCafes([])
        }
      } catch (error) {
        console.error('Error parsing favorites:', error)
        setFavoriteCafes([])
      }
    } else {
      setFavoriteCafes([])
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header location="Favorites" />
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6 py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Sign In to View Favorites</h1>
              <p className="text-muted-foreground mt-2">Create an account to save your favorite cafés</p>
            </div>
            <Button onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Login
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header location="Favorites" />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Your Favorite Cafés</h1>
              <p className="text-muted-foreground mt-2">
                {favoriteCafes.length} café{favoriteCafes.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>

          {/* Favorites Grid */}
          {favoriteCafes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteCafes.map((cafe) => (
                <CafeCard
                  key={cafe.id}
                  cafe={cafe}
                  isFavorite={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Favorites Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring cafés and save your favorites by clicking the heart icon
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => router.push("/browse")}>
                    Browse Cafés
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/home")}>
                    Go to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {favoriteCafes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <Button variant="outline" onClick={() => router.push("/browse")}>
                Discover More
              </Button>
              <Button onClick={() => router.push("/random")}>
                Try Random Café
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}