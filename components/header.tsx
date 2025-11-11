"use client"

import { Logo } from "./logo"
import { MapPin } from "@/components/icons"
import { Button } from "./ui/button"

interface HeaderProps {
  location?: string
  onLocationClick?: () => void
}

export function Header({ location, onLocationClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 md:h-20 flex items-center justify-between">
        <Logo />

        {location && (
          <Button variant="ghost" className="flex items-center gap-1 sm:gap-1.5 md:gap-2 h-8 sm:h-9 md:h-10 px-2 sm:px-3" onClick={onLocationClick}>
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm md:text-base truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">{location}</span>
          </Button>
        )}
      </div>
    </header>
  )
}
