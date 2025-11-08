"use client"

import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Search, Home, Utensils } from "lucide-react"

export default function ChoicesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-4xl space-y-12">
        {/* Logo */}
        <div className="text-center">
          <Logo className="justify-center" />
        </div>

        {/* Choices */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground text-balance">
            How would you like to discover cafés?
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">Choose your adventure</p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Surprise Me */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/random")}>
            <CardContent className="pt-8 text-center space-y-6 p-6 sm:p-8">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold">Surprise Me!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Let us pick a random café for you</p>
              </div>
              <Button className="w-full">Try It</Button>
            </CardContent>
          </Card>

          {/* Help Me Search */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => router.push("/guided")}>
            <CardContent className="pt-8 text-center space-y-6 p-6 sm:p-8">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold">Help Me Search</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Answer questions to find your match</p>
              </div>
              <Button className="w-full">Start</Button>
              <span className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                Recommended
              </span>
            </CardContent>
          </Card>

          {/* Search by Dish */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/search-dish")}>
            <CardContent className="pt-8 text-center space-y-6 p-6 sm:p-8">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Utensils className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold">Search by Dish</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Find cafés serving your favorite dish</p>
              </div>
              <Button className="w-full">Search</Button>
            </CardContent>
          </Card>

          {/* Visit Home */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/home")}>
            <CardContent className="pt-8 text-center space-y-6 p-6 sm:p-8">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Home className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold">Visit Home</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Explore all features and cafés</p>
              </div>
              <Button className="w-full">Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
