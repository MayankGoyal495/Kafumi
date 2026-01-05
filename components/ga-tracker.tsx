"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export default function GATracker() {
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
