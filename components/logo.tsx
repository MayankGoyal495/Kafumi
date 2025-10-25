import Link from "next/link"
import { CoffeeCupIcon } from "./coffee-cup-icon"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/home" className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 ${className}`}>
      <CoffeeCupIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
      <div className="flex flex-col">
        <span className="text-base sm:text-xl md:text-2xl font-bold text-primary tracking-tight">KOFFISTA</span>
        <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase hidden xs:block">Sip on a feeling</span>
      </div>
    </Link>
  )
}
