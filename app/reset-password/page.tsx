"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Since you don't use password-based auth, redirect to auth page
    router.push("/auth")
  }, [router])

  return null
}
