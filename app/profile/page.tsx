"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, User, Mail, Phone, Heart, Settings, LogIn } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, userData, loading, signOut } = useAuth()
  
  const [displayName, setDisplayName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "")
    }
  }, [userData])

  const handleLogout = async () => {
    await signOut()
    router.push("/home")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header location="Profile" />
        <Navigation />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header location="Profile" />
        <Navigation />

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold">Profile</h1>
                <p className="text-muted-foreground mt-2">Sign in to manage your account</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You need to sign in to access your profile, view favorites, and give feedback.
                </p>
                <Button onClick={() => router.push("/auth")} className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </CardContent>
            </Card>

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
                      <div className="font-medium">Save Favorites</div>
                      <div className="text-sm text-muted-foreground">Keep track of cafés you love</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Give Feedback</div>
                      <div className="text-sm text-muted-foreground">Share your café experiences</div>
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header location="Profile" />
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">{displayName || "User"}</h1>
              <p className="text-muted-foreground mt-2">Manage your account</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.email && (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input value={userData.email} disabled className="bg-muted" />
                  </div>
                </div>
              )}

              {userData?.phone && (
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input value={userData.phone} disabled className="bg-muted" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Authentication Method</Label>
                <Input 
                  value={userData?.authProvider?.toUpperCase() || "UNKNOWN"} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {userData?.favorites?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Favorite Cafés</div>
              </div>
            </CardContent>
          </Card>

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
