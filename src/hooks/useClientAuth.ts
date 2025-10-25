"use client"

import { useState, useEffect } from 'react'

interface User {
  id: string
  email?: string
  phone?: string
  displayName?: string
}

export function useClientAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in via localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('authToken', 'authenticated') // Set auth token for logged-in state
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('authToken') // Remove auth token on logout
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}

