"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleDiscover = () => {
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 text-center space-y-8 transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Logo with Animation */}
        <div
          className={`transition-all duration-1000 delay-300 ease-out ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Logo className="justify-center mb-6 scale-125" />
        </div>

        {/* Slogan with Animation */}
        <div
          className={`space-y-4 transition-all duration-1000 delay-500 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground text-balance px-4">
            Find Your Perfect <span className="text-primary">Café Moment</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance px-6">
            Discover cafés that match your mood, vibe, and preferences. Your perfect spot is just moments away.
          </p>
        </div>

        {/* Discover Button with Animation */}
        <div
          className={`transition-all duration-1000 delay-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Button
            onClick={handleDiscover}
            size="lg"
            className="px-8 py-6 text-lg h-auto rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            Discover Your Café ☕
          </Button>
        </div>

        {/* Subtitle */}
        <div
          className={`transition-all duration-1000 delay-900 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Sip on a feeling • Experience • Explore
          </p>
        </div>
      </div>
    </div>
  )
}
