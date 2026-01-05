"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { favoritesService } from "@/lib/favorites-service"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { CafeCard } from "@/components/cafe-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCafes } from "@/lib/cafe-data-service"
import type { Cafe } from "@/lib/types"
import { Heart, ArrowLeft, Loader2 } from "lucide-react"

export default function FavoritesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [favoriteCafes, setFavoriteCafes] = useState<Cafe[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoadingFavorites(false)
        return
      }

      try {
        // Get user's favorite IDs from Firestore
        const result = await favoritesService.getFavorites(user.uid)
        
        if (result.success && result.favorites && result.favorites.length > 0) {
          // Fetch all cafes and filter by favorites
          const allCafes = await getCafes()
          const cafesData = allCafes.filter(cafe => result.favorites!.includes(cafe.id))
          setFavoriteCafes(cafesData)
        } else {
          setFavoriteCafes([])
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
        setFavoriteCafes([])
      } finally {
        setLoadingFavorites(false)
      }
    }

    loadFavorites()
  }, [user])

  if (loading || loadingFavorites) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header location="Favorites" />
        <Navigation />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

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
              <h1 className="text-3xl font-serif font-bold">Sign In to View Favorites</h1>
              <p className="text-muted-foreground mt-2">Create an account to save your favorite cafés</p>
            </div>
            <Button onClick={() => router.push("/auth")} className="gap-2">
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
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Your Favorite Cafés</h1>
              <p className="text-muted-foreground mt-2">
                {favoriteCafes.length} café{favoriteCafes.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>

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
                <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
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
