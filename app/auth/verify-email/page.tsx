"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmailOTP, sendEmailOTP } = useAuth()
  
  const email = searchParams.get("email") || ""
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    const result = await verifyEmailOTP(email, otp)
    
    if (result.success) {
      router.push("/home")
    } else {
      setError(result.error || "Invalid OTP")
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    setError("")
    
    const result = await sendEmailOTP(email)
    setResending(false)
    
    if (result.success) {
      alert("OTP resent! Check your email inbox.")
    } else {
      setError(result.error || "Failed to resend OTP")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo className="justify-center" clickable={false} />
          <div>
            <p className="text-lg font-semibold">Check your email</p>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter OTP</label>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
              className="h-12 text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={resending}
              className="w-full"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push("/auth")}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          The code will expire in 10 minutes
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
