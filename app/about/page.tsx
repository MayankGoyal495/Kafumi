"use client"

import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Heart, Filter, Coffee, Users, MapPin, Star } from "@/components/icons"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-12 space-y-16 max-w-4xl">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">About Koffista</h1>
          <p className="text-xl text-primary font-medium">Sip on a feeling</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Your personal café discovery companion, helping you find the perfect spot for every mood and moment.
          </p>
        </section>

        {/* Mission */}
        <section className="space-y-4">
          <h2 className="text-3xl font-serif font-bold text-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            At Koffista, we believe that finding the right café is about more than just coffee. It's about discovering
            spaces that match your mood, support your activities, and enhance your experiences. Whether you're looking
            for a quiet corner to work, a vibrant spot to meet friends, or a romantic setting for a date, we're here to
            help you find your perfect match.
          </p>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">What Makes Us Different</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Mood-Based Matching</h3>
                <p className="text-muted-foreground text-sm">
                  We understand that your café needs change. Our intelligent matching considers your purpose, preferred
                  ambience, and current mood.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Smart Filtering</h3>
                <p className="text-muted-foreground text-sm">
                  Filter by amenities like Wi-Fi and charging ports, dietary preferences, distance, and price range to
                  find exactly what you need.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Curated Selection</h3>
                <p className="text-muted-foreground text-sm">
                  Every café in our database is carefully reviewed, categorized, and updated to ensure accurate
                  recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Community Reviews</h3>
                <p className="text-muted-foreground text-sm">
                  Real reviews from real café lovers help you make informed decisions about where to spend your time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Location-Based</h3>
                <p className="text-muted-foreground text-sm">
                  Find cafés near you with accurate distance calculations and easy directions to get you there.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Personalized Experience</h3>
                <p className="text-muted-foreground text-sm">
                  Save your favorites, track your visits, and get recommendations based on your preferences over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">How It Works</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Tell Us Your Location</h3>
                <p className="text-muted-foreground text-sm">
                  Share your location or enter it manually to find cafés near you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Choose Your Discovery Method</h3>
                <p className="text-muted-foreground text-sm">
                  Browse all cafés, get a random surprise, or use our guided search to answer questions about your
                  preferences.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Discover Your Perfect Café</h3>
                <p className="text-muted-foreground text-sm">
                  Get personalized recommendations with all the details you need: menu, ambience, amenities, and
                  reviews.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Visit & Enjoy</h3>
                <p className="text-muted-foreground text-sm">
                  Get directions, save your favorites, and share your experience with the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-secondary/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">Get in Touch</h2>
          <p className="text-muted-foreground">Have questions or suggestions? We'd love to hear from you.</p>
          <p className="text-primary font-medium">hello@koffista.com</p>
        </section>
      </main>
    </div>
  )
}
