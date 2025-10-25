"use client"

import { AuthProvider } from '../contexts/AuthContext'

interface ClientAuthProviderProps {
  children: React.ReactNode
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return <AuthProvider>{children}</AuthProvider>
}

