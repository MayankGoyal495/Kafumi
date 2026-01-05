import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Feedback {
  id?: string
  cafeId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: any
  status: "published" | "hidden"
}

export interface FeedbackService {
  createFeedback: (feedback: Omit<Feedback, "id" | "createdAt" | "status">) => Promise<{ success: boolean; id?: string; error?: string }>
  getCafeFeedback: (cafeId: string, sortBy?: "newest" | "highest" | "lowest") => Promise<{ success: boolean; feedback?: Feedback[]; error?: string }>
  hideFeedback: (feedbackId: string) => Promise<{ success: boolean; error?: string }>
  publishFeedback: (feedbackId: string) => Promise<{ success: boolean; error?: string }>
}

export const feedbackService: FeedbackService = {
  createFeedback: async (feedback) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      const feedbackData: Omit<Feedback, "id"> = {
        ...feedback,
        createdAt: serverTimestamp(),
        status: "published"
      }
      
      const docRef = await addDoc(collection(db, "feedback"), feedbackData)
      
      return { success: true, id: docRef.id }
    } catch (error: any) {
      console.error("Create feedback error:", error)
      return { success: false, error: error.message }
    }
  },

  getCafeFeedback: async (cafeId, sortBy = "newest") => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      let q = query(
        collection(db, "feedback"),
        where("cafeId", "==", cafeId),
        where("status", "==", "published")
      )
      
      // Add sorting
      if (sortBy === "newest") {
        q = query(q, orderBy("createdAt", "desc"))
      } else if (sortBy === "highest") {
        q = query(q, orderBy("rating", "desc"))
      } else if (sortBy === "lowest") {
        q = query(q, orderBy("rating", "asc"))
      }
      
      const querySnapshot = await getDocs(q)
      
      const feedbackList: Feedback[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        feedbackList.push({
          id: doc.id,
          cafeId: data.cafeId,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt,
          status: data.status
        })
      })
      
      return { success: true, feedback: feedbackList }
    } catch (error: any) {
      console.error("Get feedback error:", error)
      return { success: false, error: error.message }
    }
  },

  hideFeedback: async (feedbackId) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      const feedbackRef = doc(db, "feedback", feedbackId)
      await updateDoc(feedbackRef, {
        status: "hidden"
      })
      return { success: true }
    } catch (error: any) {
      console.error("Hide feedback error:", error)
      return { success: false, error: error.message }
    }
  },

  publishFeedback: async (feedbackId) => {
    if (!db) return { success: false, error: "Database not initialized" }
    
    try {
      const feedbackRef = doc(db, "feedback", feedbackId)
      await updateDoc(feedbackRef, {
        status: "published"
      })
      return { success: true }
    } catch (error: any) {
      console.error("Publish feedback error:", error)
      return { success: false, error: error.message }
    }
  }
}
