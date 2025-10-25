"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/src/contexts/AuthContext"
import { ArrowLeft, Mail } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await resetPassword(email)
      if (result.success) {
        setMessage("Password reset email sent! Check your inbox and follow the instructions.")
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
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

        {/* Reset Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl sm:text-2xl">Reset Password</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {message && (
                <p className="text-sm text-green-600">{message}</p>
              )}

              <Button
                type="submit"
                disabled={!email.includes("@") || !email.includes(".") || isLoading}
                className="w-full h-12 gap-2"
              >
                <Mail className="h-4 w-4" />
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>

            <div className="text-center">
              <Button variant="link" onClick={() => router.push("/")} className="text-primary">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
