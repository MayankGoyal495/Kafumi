"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, MapPin, Phone, Mail, LogOut } from "@/components/icons"

export default function AccountPage() {
  const router = useRouter()
  const [name, setName] = useState("Guest User")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("Bangalore")

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) setLocation(savedLocation)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header location={location} />
      <Navigation />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Default Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">City</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  localStorage.setItem("userLocation", location)
                }}
              >
                Update Location
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
