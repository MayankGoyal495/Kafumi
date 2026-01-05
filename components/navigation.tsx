"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Heart, Info, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { href: "/home", label: "Explore", icon: Home },
    { href: "/browse", label: "Browse", icon: Search },
    { href: "/favorites", label: "Favourites", icon: Heart },
    { href: "/about", label: "About", icon: Info },
    { href: user ? "/profile" : "/auth", label: user ? "Profile" : "Login", icon: User },
  ]

  return (
    <nav className="sticky top-14 sm:top-16 md:top-20 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-1.5 sm:px-2 md:px-4">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 h-11 sm:h-12 md:h-14 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
