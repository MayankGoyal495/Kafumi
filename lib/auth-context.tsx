"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInAnonymously,
  updateProfile,
  ConfirmationResult
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  userData: UserData | null
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  sendEmailOTP: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyEmailOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  sendPhoneOTP: (phone: string) => Promise<{ success: boolean; error?: string; confirmationResult?: ConfirmationResult }>
  confirmPhoneOTP: (confirmationResult: ConfirmationResult, code: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

interface UserData {
  displayName: string | null
  email: string | null
  phone: string | null
  authProvider: "google" | "email" | "phone"
  createdAt: any
  favorites: string[]
  deviceInfo?: {
    lastLogin: any
    userAgent: string
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string) => {
    if (!db) return null
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        return userDoc.data() as UserData
      }
      return null
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Create or update user profile
  const createOrUpdateUser = async (user: User, provider: "google" | "email" | "phone", email?: string) => {
    if (!db) return
    
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)
    
    const deviceInfo = {
      lastLogin: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ""
    }
    
    if (!userSnap.exists()) {
      // New user
      const newUser: UserData = {
        displayName: user.displayName || email?.split('@')[0] || null,
        email: email || user.email,
        phone: user.phoneNumber,
        authProvider: provider,
        createdAt: serverTimestamp(),
        favorites: [],
        deviceInfo
      }
      await setDoc(userRef, newUser)
      setUserData(newUser)
    } else {
      // Existing user - update last login
      await setDoc(userRef, { deviceInfo }, { merge: true })
      const data = userSnap.data() as UserData
      setUserData(data)
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const data = await fetchUserData(user.uid)
        setUserData(data)
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Google Sign-In
  const signInWithGoogle = async () => {
    if (!auth) return { success: false, error: "Auth not initialized" }
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await createOrUpdateUser(result.user, "google")
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Email OTP - Send
  const sendEmailOTP = async (email: string) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store OTP in Firestore temporarily (expires in 10 minutes)
      const otpRef = doc(db, "email_otps", email)
      await setDoc(otpRef, {
        otp,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      })
      
      // Send email via API route
      const response = await fetch('/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send email')
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('Send email OTP error:', error)
      return { success: false, error: error.message }
    }
  }

  // Email OTP - Verify (NO PASSWORD!)
  const verifyEmailOTP = async (email: string, otp: string) => {
    if (!auth || !db) return { success: false, error: "Auth not initialized" }
    
    try {
      // Get OTP from Firestore
      const otpRef = doc(db, "email_otps", email)
      const otpDoc = await getDoc(otpRef)
      
      if (!otpDoc.exists()) {
        return { success: false, error: "OTP not found or expired" }
      }
      
      const otpData = otpDoc.data()
      const expiresAt = otpData.expiresAt.toDate()
      
      // Check if OTP is expired
      if (new Date() > expiresAt) {
        await deleteDoc(otpRef)
        return { success: false, error: "OTP expired. Please request a new one." }
      }
      
      // Verify OTP
      if (otpData.otp !== otp) {
        return { success: false, error: "Invalid OTP" }
      }
      
      // Delete OTP after successful verification
      await deleteDoc(otpRef)
      
      // Sign in anonymously, then update profile with email
      const result = await signInAnonymously(auth)
      
      // Update display name
      const displayName = email.split('@')[0]
      await updateProfile(result.user, { displayName })
      
      // Create user profile in Firestore with email
      await createOrUpdateUser(result.user, "email", email)
      
      return { success: true }
    } catch (error: any) {
      console.error('Verify email OTP error:', error)
      return { success: false, error: error.message }
    }
  }

  // Phone OTP - Send
  const sendPhoneOTP = async (phone: string) => {
    if (!auth) return { success: false, error: "Auth not initialized" }
    
    try {
      // Format phone number to E.164
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
      
      // Create RecaptchaVerifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
      
      return { success: true, confirmationResult }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Phone OTP - Confirm
  const confirmPhoneOTP = async (confirmationResult: ConfirmationResult, code: string) => {
    if (!auth) return { success: false, error: "Auth not initialized" }
    
    try {
      const result = await confirmationResult.confirm(code)
      await createOrUpdateUser(result.user, "phone")
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Sign Out
  const signOut = async () => {
    if (!auth) return
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserData(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user.uid)
      setUserData(data)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userData,
        signInWithGoogle,
        sendEmailOTP,
        verifyEmailOTP,
        sendPhoneOTP,
        confirmPhoneOTP,
        signOut,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
