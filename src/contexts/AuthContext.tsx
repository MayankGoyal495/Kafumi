"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { authHelpers, firestoreHelpers } from '../firebase'

interface UserProfile {
  uid: string
  email: string
  displayName: string
  createdAt: string
  favorites: string[]
  preferences: {
    location: string | null
    dietaryPreferences: string[]
    priceRange: string | null
    vibes: string[]
  }
  profileImage?: string
}

interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  favorites: string[]
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; user?: User; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  addToFavorites: (cafeId: string) => Promise<{ success: boolean; error?: string }>
  removeFromFavorites: (cafeId: string) => Promise<{ success: boolean; error?: string }>
  toggleFavorite: (cafeId: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await authHelpers.signUpWithEmail(email, password, displayName)
    return result
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const result = await authHelpers.signInWithEmail(email, password)
    return result
  }

  // Sign out
  const logout = async () => {
    const result = await authHelpers.signOut()
    if (result.success) {
      setCurrentUser(null)
      setUserProfile(null)
      setFavorites([])
    }
    return result
  }

  // Reset password
  const resetPassword = async (email: string) => {
    return await authHelpers.resetPassword(email)
  }

  // Update user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!currentUser) return { success: false, error: "No user logged in" }
    
    const result = await firestoreHelpers.updateUserProfile(currentUser.uid, profileData)
    if (result.success) {
      setUserProfile(prev => prev ? { ...prev, ...profileData } : null)
    }
    return result
  }

  // Add to favorites
  const addToFavorites = async (cafeId: string) => {
    if (!currentUser) return { success: false, error: "No user logged in" }
    
    const result = await firestoreHelpers.addToFavorites(currentUser.uid, cafeId)
    if (result.success) {
      setFavorites(prev => [...prev, cafeId])
    }
    return result
  }

  // Remove from favorites
  const removeFromFavorites = async (cafeId: string) => {
    if (!currentUser) return { success: false, error: "No user logged in" }
    
    const result = await firestoreHelpers.removeFromFavorites(currentUser.uid, cafeId)
    if (result.success) {
      setFavorites(prev => prev.filter(id => id !== cafeId))
    }
    return result
  }

  // Toggle favorite
  const toggleFavorite = async (cafeId: string) => {
    if (favorites.includes(cafeId)) {
      return await removeFromFavorites(cafeId)
    } else {
      return await addToFavorites(cafeId)
    }
  }

  // Load user profile and favorites
  const loadUserData = async (user: User | null) => {
    if (user) {
      // Load user profile
      const profileResult = await firestoreHelpers.getUserProfile(user.uid)
      if (profileResult.success) {
        setUserProfile(profileResult.data as UserProfile)
      }

      // Load user favorites
      const favoritesResult = await firestoreHelpers.getUserFavorites(user.uid)
      if (favoritesResult.success) {
        setFavorites(favoritesResult.favorites)
      }
    } else {
      setUserProfile(null)
      setFavorites([])
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChanged(async (user) => {
      setCurrentUser(user)
      await loadUserData(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    userProfile,
    favorites,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
