import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface FavoritesService {
  addFavorite: (userId: string, cafeId: string) => Promise<{ success: boolean; error?: string }>
  removeFavorite: (userId: string, cafeId: string) => Promise<{ success: boolean; error?: string }>
  getFavorites: (userId: string) => Promise<{ success: boolean; favorites?: string[]; error?: string }>
  isFavorite: (userId: string, cafeId: string) => Promise<boolean>
}

export const favoritesService: FavoritesService = {
  addFavorite: async (userId: string, cafeId: string) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        favorites: arrayUnion(cafeId)
      })
      return { success: true }
    } catch (error: any) {
      console.error("Add favorite error:", error)
      return { success: false, error: error.message }
    }
  },

  removeFavorite: async (userId: string, cafeId: string) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        favorites: arrayRemove(cafeId)
      })
      return { success: true }
    } catch (error: any) {
      console.error("Remove favorite error:", error)
      return { success: false, error: error.message }
    }
  },

  getFavorites: async (userId: string) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const data = userSnap.data()
        return { success: true, favorites: data.favorites || [] }
      }
      
      return { success: false, error: "User not found" }
    } catch (error: any) {
      console.error("Get favorites error:", error)
      return { success: false, error: error.message }
    }
  },

  isFavorite: async (userId: string, cafeId: string) => {
    if (!db) return false
    
    try {
      const result = await favoritesService.getFavorites(userId)
      if (result.success && result.favorites) {
        return result.favorites.includes(cafeId)
      }
      return false
    } catch (error) {
      console.error("Check favorite error:", error)
      return false
    }
  }
}
