import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { ClientAuthProvider } from "@/src/components/ClientAuthProvider"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Koffista - Sip on a Feeling",
  description: "Discover cafés that match your mood, vibe, budget, and preferences",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${playfair.variable} antialiased`}>
        <ErrorBoundary>
          <ClientAuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </ClientAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
