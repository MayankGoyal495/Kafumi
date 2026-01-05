"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { Mail, Phone } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const { signInWithGoogle, sendEmailOTP, sendPhoneOTP } = useAuth()
  
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")
    const result = await signInWithGoogle()
    setLoading(false)
    
    if (result.success) {
      router.push("/home")
    } else {
      setError(result.error || "Failed to sign in with Google")
    }
  }

  const handleEmailSubmit = async () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email")
      return
    }
    
    setLoading(true)
    setError("")
    
    const result = await sendEmailOTP(email)
    setLoading(false)
    
    if (result.success) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    } else {
      setError(result.error || "Failed to send OTP")
    }
  }

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }
    
    setLoading(true)
    setError("")
    
    const result = await sendPhoneOTP(phone)
    setLoading(false)
    
    if (result.success && result.confirmationResult) {
      router.push(`/auth/verify-phone?phone=${phone}`)
    } else {
      setError(result.error || "Failed to send OTP")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Logo className="justify-center" clickable={false} />
          <p className="text-muted-foreground">Welcome to your perfect café experience</p>
        </div>

        {/* Auth Container */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Google Sign-In - Primary */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 text-base"
            size="lg"
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign in with</span>
            </div>
          </div>

          {/* Email & Phone Buttons - Circular */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setShowEmail(!showEmail)
                setShowPhone(false)
                setError("")
              }}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
                showEmail 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-border hover:border-primary"
              }`}
            >
              <Mail className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                setShowPhone(!showPhone)
                setShowEmail(false)
                setError("")
              }}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
                showPhone 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-border hover:border-primary"
              }`}
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>

          {/* Email Input (Inline Expand) */}
          {showEmail && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                className="h-11"
              />
              <Button
                onClick={handleEmailSubmit}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                We'll send a 6-digit code to your email
              </p>
            </div>
          )}

          {/* Phone Input (Inline Expand) */}
          {showPhone && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <Input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                className="h-11"
                maxLength={10}
              />
              <Button
                onClick={handlePhoneSubmit}
                disabled={loading || phone.length < 10}
                className="w-full"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              {/* Hidden recaptcha container */}
              <div id="recaptcha-container"></div>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Skip for now */}
          <Button
            variant="ghost"
            onClick={() => router.push("/home")}
            className="w-full"
          >
            Skip for now →
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
