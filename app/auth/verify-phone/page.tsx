"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VerifyPhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")
  
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    // This will be handled by the auth context
    // For now, just redirect after successful verification
    // The actual verification logic needs confirmationResult from auth context
    
    setTimeout(() => {
      router.push("/home")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo className="justify-center" clickable={false} />
          <p className="text-muted-foreground">Enter OTP sent to {phone}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
            className="h-12 text-center text-lg tracking-widest"
            maxLength={6}
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/auth")}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}
