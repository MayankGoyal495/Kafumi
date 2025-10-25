import { Sparkles } from "lucide-react"

interface LoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Loading({ message = "Loading...", size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <Sparkles className={`${sizeClasses[size]} text-primary animate-spin`} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loading message={message} size="lg" />
    </div>
  )
}

export function CardLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted h-48 w-full rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="bg-muted h-4 w-3/4 rounded"></div>
        <div className="bg-muted h-3 w-1/2 rounded"></div>
        <div className="bg-muted h-3 w-full rounded"></div>
        <div className="bg-muted h-3 w-2/3 rounded"></div>
      </div>
    </div>
  )
}

