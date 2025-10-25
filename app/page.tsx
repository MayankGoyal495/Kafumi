"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLoading } from "@/components/loading"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to landing page
    router.push("/landing")
  }, [router])

  return <PageLoading message="Loading Koffista..." />
}
