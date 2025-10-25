"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClientAuth } from "@/src/hooks/useClientAuth"
import { LogOut, User, Mail, MapPin, Heart, Settings, LogIn } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useClientAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [newLocation, setNewLocation] = useState("")

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleUpdateProfile = () => {
    if (!displayName.trim()) {
      setError("Name cannot be empty")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Update user in localStorage
      const updatedUser = { ...user, displayName: displayName.trim() }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || "")
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  const handleLocationChange = () => {
    if (!newLocation.trim()) {
      setError("Location cannot be empty")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Update location in localStorage
      localStorage.setItem('userLocation', newLocation.trim())
      
      setSuccess("Location updated successfully!")
      setIsEditingLocation(false)
      setNewLocation("")
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelLocationEdit = () => {
    setNewLocation("")
    setIsEditingLocation(false)
    setError("")
    setSuccess("")
  }

  const handleStartLocationEdit = () => {
    setNewLocation(localStorage.getItem('userLocation') || "")
    setIsEditingLocation(true)
    setError("")
    setSuccess("")
  }

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header location="Profile" />
        <Navigation />

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground mt-2">Sign in to manage your account and preferences</p>
              </div>
            </div>

            {/* Login Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You need to sign in to access your profile, view your favorites, and manage your preferences.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="w-full gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </CardContent>
            </Card>

            {/* Benefits of Signing In */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Benefits of Signing In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Save Your Favorites</div>
                      <div className="text-sm text-muted-foreground">Keep track of your favorite cafés</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Personalized Recommendations</div>
                      <div className="text-sm text-muted-foreground">Get tailored suggestions based on your preferences</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Location-Based Results</div>
                      <div className="text-sm text-muted-foreground">Find cafés near you automatically</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // If user is logged in, show profile information
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header location="Profile" />
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
            </div>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email/Phone</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user.email || user.phone || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <Input
                      id="displayName"
                      value={displayName}
                      disabled
                      className="bg-muted flex-1"
                    />
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600">{success}</p>
              )}

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {(() => {
                      const saved = localStorage.getItem('favorites')
                      return saved ? JSON.parse(saved).length : 0
                    })()}
                  </div>
                  <div className="text-sm text-muted-foreground">Favorite Cafés</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {user?.id ? 
                      Math.floor((Date.now() - parseInt(user.id)) / (1000 * 60 * 60 * 24))
                      : 0
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Days as Member</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">
                          {localStorage.getItem('userLocation') || "Not set"}
                        </div>
                      </div>
                    </div>
                    {!isEditingLocation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartLocationEdit}
                      >
                        Change
                      </Button>
                    )}
                  </div>
                  
                  {isEditingLocation && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="location">New Location</Label>
                        <Input
                          id="location"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Enter your location (e.g., Bangalore, Mumbai)"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleLocationChange}
                          disabled={isLoading}
                          size="sm"
                          className="flex-1"
                        >
                          {isLoading ? "Saving..." : "Save Location"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelLocationEdit}
                          size="sm"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="font-medium mb-2">Authentication Method</div>
                  <div className="text-sm text-muted-foreground">
                    {user?.email ? "Email" : user?.phone ? "Phone" : "Unknown"}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium mb-2">User ID</div>
                  <div className="text-sm text-muted-foreground">
                    {user?.id || "Not available"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
