"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, AlertCircle } from "lucide-react"

interface LocationNotFoundDialogProps {
  isOpen: boolean
  searchQuery: string
  onClose: () => void
  onUseCurrentLocation: () => void
  onTryAgain: () => void
  onContinueAnyway: () => void
  isDetecting?: boolean
}

export function LocationNotFoundDialog({
  isOpen,
  searchQuery,
  onClose,
  onUseCurrentLocation,
  onTryAgain,
  onContinueAnyway,
  isDetecting = false
}: LocationNotFoundDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-xl">Location Not Found</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              We couldn't find <span className="font-semibold">"{searchQuery}"</span> in our location database.
            </p>
            <p className="text-sm">
              This might happen if the location is very specific or newly developed.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Use Current Location - Primary Option */}
          <Button
            onClick={onUseCurrentLocation}
            disabled={isDetecting}
            className="w-full gap-2 h-12"
            size="lg"
          >
            <Navigation className="h-5 w-5" />
            {isDetecting ? "Detecting Location..." : "Use My Current Location"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onTryAgain}
              className="h-10"
            >
              Try Different Search
            </Button>
            <Button
              variant="outline"
              onClick={onContinueAnyway}
              className="h-10"
            >
              Continue Anyway
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Suggestions:</p>
              <ul className="space-y-0.5">
                <li>• Try searching for a nearby landmark or area</li>
                <li>• Use broader terms like "Mumbai" instead of specific areas</li>
                <li>• Check spelling and try alternative names</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}