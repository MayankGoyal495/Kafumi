"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Star, MapPin, Heart, VegMark } from "@/components/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Cafe } from "@/lib/types"
import { formatKm } from "@/lib/geocoding"
import { getDistanceKm } from "@/lib/distance"
import { useAuth } from "@/lib/auth-context"
import { favoritesService } from "@/lib/favorites-service"

interface CafeCardProps {
  cafe: Cafe
  onToggleFavorite?: (cafeId: string) => void
  isFavorite?: boolean
}

export function CafeCard({ cafe, onToggleFavorite, isFavorite = false }: CafeCardProps) {
  const router = useRouter()
  const { user, userData, refreshUserData } = useAuth()
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  
  // Check if cafe is favorite
  const isCafeFavorite = userData?.favorites?.includes(cafe.id) || isFavorite

  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem("userCoords")
        if (!saved) {
          setIsLoading(false)
          return
        }
        const coords = JSON.parse(saved) as { lat: number; lng: number }
        const km = await getDistanceKm(coords, cafe.location.coordinates)
        setDistanceLabel(formatKm(km))
      } catch (error) {
        console.error('Error calculating distance:', error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [cafe.location.coordinates])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if user is logged in
    if (!user) {
      router.push("/auth")
      return
    }

    setFavoriteLoading(true)

    try {
      if (isCafeFavorite) {
        // Remove from favorites
        await favoritesService.removeFavorite(user.uid, cafe.id)
      } else {
        // Add to favorites
        await favoritesService.addFavorite(user.uid, cafe.id)
      }
      
      // Refresh user data to update UI
      await refreshUserData()
      
      if (onToggleFavorite) {
        onToggleFavorite(cafe.id)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all active:scale-[0.98] group flex flex-col h-full">
      <Link href={`/cafe/${cafe.id}`}>
        <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden -mb-2" style={{ backgroundColor: '#f3f4f6' }}>
          {(() => {
            let imageSrc = imageError || !cafe.image || cafe.image.trim() === '' || cafe.image.includes('placeholder')
              ? '/placeholder.jpg'
              : cafe.image;
            
            if (imageSrc.includes('drive.google.com') && imageSrc !== '/placeholder.jpg') {
              imageSrc = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
            }
            
            return (
              <img
                key={imageSrc}
                src={imageSrc}
                alt={cafe.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                loading="lazy"
                onError={(e) => {
                  const currentSrc = e.currentTarget.src;
                  const placeholderUrl = window.location.origin + '/placeholder.jpg';
                  
                  if (!currentSrc.includes('placeholder.jpg') && currentSrc !== placeholderUrl) {
                    e.currentTarget.src = '/placeholder.jpg';
                    setImageError(true);
                  }
                }}
              />
            );
          })()}
          {cafe.type === 'Veg' && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 bg-white text-emerald-700 border border-emerald-300 shadow-md">
              <VegMark className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Veg
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-1.5 sm:gap-2">
          <Link href={`/cafe/${cafe.id}`} className="flex-1 min-w-0">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {cafe.name}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 hover:scale-110 transition-transform"
          >
            <Heart 
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-all ${
                isCafeFavorite 
                  ? "fill-red-500 text-red-500" 
                  : "text-muted-foreground hover:text-red-400"
              }`} 
            />
          </Button>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 leading-relaxed">{cafe.shortDescription}</p>

        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-yellow-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-yellow-900 text-xs sm:text-sm">{cafe.rating}</span>
            <span className="text-yellow-700 text-[10px] sm:text-xs">({cafe.reviewCount})</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate text-[10px] sm:text-xs">
              {isLoading ? "..." : distanceLabel || ""}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {cafe.vibe.slice(0, 2).map((v) => (
            <span key={v} className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium">
              {v}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border mt-auto">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Best Dish</p>
            <p className="text-xs sm:text-sm font-semibold text-primary truncate">{cafe.bestDish}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Price</p>
            <p className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">₹{cafe.pricePerPerson}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
