import Link from "next/link"
import Image from "next/image"

export function Logo({ className = "", clickable = true }: { className?: string; clickable?: boolean }) {
  const logoImage = (
    <Image
      src="/kafumi-logo.png"
      alt="Kafumi - The Essence of Every Cafe"
      width={200}
      height={60}
      priority
      className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
    />
  )

  if (!clickable) {
    return <div className={`flex items-center ${className}`}>{logoImage}</div>
  }

  return (
    <Link href="/home" className={`flex items-center ${className}`}>
      {logoImage}
    </Link>
  )
}
