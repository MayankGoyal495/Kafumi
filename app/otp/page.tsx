"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { verifyOTP, resendOTP } from "@/src/services/otpService"
import { useClientAuth } from "@/src/hooks/useClientAuth"

function OTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useClientAuth()
  const phone = searchParams.get("phone")
  const email = searchParams.get("email")
  const method = searchParams.get("method") // "phone" or "email"
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [error, setError] = useState("")

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const identifier = phone || email
      const result = await verifyOTP(identifier, otp)
      
      if (result.success) {
        // Login user with simple auth
        const userData = {
          id: Date.now().toString(),
          email: email || undefined,
          phone: phone || undefined,
          displayName: email || phone || "User"
        }
        login(userData)
        router.push("/location")
      } else {
        setError(result.error || "Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setCanResend(false)
    setCountdown(30)
    setError("")
    
    try {
      const identifier = phone || email
      const result = await resendOTP(identifier, method || 'phone')
      
      if (result.success) {
        setError("OTP resent successfully!")
        setTimeout(() => setError(""), 3000)
      } else {
        setError(result.error || "Failed to resend OTP. Please try again.")
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Logo */}
        <div className="text-center">
          <Logo className="justify-center" />
        </div>

        {/* OTP Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl sm:text-2xl">Verify OTP</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              {phone ? `We've sent a code to ${phone}` : 
               email ? `We've sent a code to ${email}` : 
               "We've sent a verification code"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            {/* OTP Input */}
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-xl sm:text-2xl tracking-widest h-12 sm:h-14"
                maxLength={6}
              />
              
              {error && (
                <p className={`text-sm text-center ${error.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {error}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || isLoading}
              className="w-full h-12 sm:h-14"
              size="lg"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <Button variant="link" onClick={handleResend} className="text-primary">
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Resend OTP in {countdown}s</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPContent />
    </Suspense>
  )
}
