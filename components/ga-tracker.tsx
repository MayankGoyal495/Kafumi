"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

function GATrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const search = searchParams ? `?${searchParams.toString()}` : ""
    const page_path = `${pathname}${search}`

    if (typeof window.gtag === "function") {
      window.gtag("config", "G-CPRYZJF7WD", {
        page_path,
      })
    }
  }, [pathname, searchParams])

  return null
}

export default function GATracker() {
  return (
    <Suspense fallback={null}>
      <GATrackerInner />
    </Suspense>
  )
}
