import { initializeApp, getApps } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAI5gTX5VddXvZ5_K4LBYdarrdqdXyaQps",
  authDomain: "kafumi-007.firebaseapp.com",
  projectId: "kafumi-007",
  storageBucket: "kafumi-007.firebasestorage.app",
  messagingSenderId: "933115416684",
  appId: "1:933115416684:web:5ac53d61ae29199f434849",
  measurementId: "G-7LJN4HYNMB"
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Auth with 30-day persistence
let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null

if (typeof window !== 'undefined') {
  auth = getAuth(app)
  db = getFirestore(app)
  
  // Set 30-day session persistence
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth persistence error:", error)
  })
}

export { app, auth, db }
