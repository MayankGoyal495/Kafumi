"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail } from "@/components/icons"
import { sendPhoneOTP, sendEmailOTP } from "@/src/services/otpService"

export default function AuthPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpMethod, setOtpMethod] = useState("") // "phone" or "email"

  const handlePhoneLogin = async () => {
    if (phoneNumber.length >= 10) {
      setIsLoading(true)
      setError("")
      
      try {
        const result = await sendPhoneOTP(phoneNumber)
        
        if (result.success) {
          setOtpSent(true)
          setOtpMethod("phone")
          router.push(`/otp?phone=${phoneNumber}&method=phone`)
        } else {
          setError(result.error || "Failed to send OTP. Please try again.")
        }
      } catch (err) {
        setError("Failed to send OTP. Please try again.")
      } finally {
        setIsLoading(false)
      }
    } else {
      setError("Please enter a valid 10-digit phone number")
    }
  }

  const handleEmailLogin = async () => {
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await sendEmailOTP(email)
      
      if (result.success) {
        setOtpSent(true)
        setOtpMethod("email")
        router.push(`/otp?email=${encodeURIComponent(email)}&method=email`)
      } else {
        setError(result.error || "Failed to send OTP. Please try again.")
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/location")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        {/* Logo and Branding */}
        <div className="text-center space-y-3 md:space-y-4">
          <Logo className="justify-center" />
          <p className="text-muted-foreground text-base md:text-lg px-4">Welcome to your perfect café experience</p>
        </div>

        {/* Auth Card */}
        <Card>
          <CardContent className="pt-6 space-y-5 md:space-y-6">
            {/* Phone Login */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Login with Mobile Number</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 h-11"
                  maxLength={10}
                />
                <Button
                  onClick={handlePhoneLogin}
                  disabled={phoneNumber.length < 10 || isLoading}
                  className="gap-2 h-11 w-full sm:w-auto"
                >
                  <Phone className="h-4 w-4" />
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Email Login */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Login with Email</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <Button
                onClick={handleEmailLogin}
                disabled={!email.includes("@") || !email.includes(".") || isLoading}
                className="gap-2 h-11 w-full"
              >
                <Mail className="h-4 w-4" />
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>

            {/* Skip */}
            <Button variant="ghost" className="w-full h-11" onClick={handleSkip}>
              Skip for now
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs md:text-sm text-muted-foreground px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
