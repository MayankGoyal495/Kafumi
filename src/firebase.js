// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA04-h6SKDOKE55ZAeRO-mUwMpDqLwcdas",
  authDomain: "Kafumi-b3d94.firebaseapp.com",
  projectId: "Kafumi-b3d94",
  storageBucket: "Kafumi-b3d94.firebasestorage.app",
  messagingSenderId: "411704539005",
  appId: "1:411704539005:web:5ab3f27d3e1a9ad9553e14",
  measurementId: "G-3Q46NB7TYB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize client-side services
let analytics, auth, db, storage;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUpWithEmail: async (email, password, displayName) => {
    if (!auth || !db) {
      return { success: false, error: "Firebase not initialized" };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        createdAt: new Date().toISOString(),
        favorites: [],
        preferences: {
          location: null,
          dietaryPreferences: [],
          priceRange: null,
          vibes: []
        }
      });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email, password) => {
    if (!auth) {
      return { success: false, error: "Firebase not initialized" };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    if (!auth) {
      return { success: false, error: "Firebase not initialized" };
    }
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    if (!auth) {
      return { success: false, error: "Firebase not initialized" };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth ? auth.currentUser : null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    if (!auth) {
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  // Send email verification
  sendEmailVerification: async () => {
    if (!auth) {
      return { success: false, error: "Firebase not initialized" };
    }
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: "No user logged in" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Firestore helper functions
export const firestoreHelpers = {
  // Create or update user profile
  updateUserProfile: async (uid, userData) => {
    if (!db) {
      return { success: false, error: "Firestore not initialized" };
    }
    try {
      await setDoc(doc(db, "users", uid), userData, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  getUserProfile: async (uid) => {
    if (!db) {
      return { success: false, error: "Firestore not initialized" };
    }
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: "User profile not found" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add cafe to favorites
  addToFavorites: async (uid, cafeId) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const favorites = userData.favorites || [];
        
        if (!favorites.includes(cafeId)) {
          favorites.push(cafeId);
          await updateDoc(userRef, { favorites });
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove cafe from favorites
  removeFromFavorites: async (uid, cafeId) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const favorites = (userData.favorites || []).filter(id => id !== cafeId);
        
        await updateDoc(userRef, { favorites });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user favorites
  getUserFavorites: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return { success: true, favorites: userData.favorites || [] };
      }
      
      return { success: false, error: "User not found" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user preferences
  updateUserPreferences: async (uid, preferences) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { preferences });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Save search history
  saveSearchHistory: async (uid, searchQuery, results) => {
    try {
      await addDoc(collection(db, "searchHistory"), {
        uid,
        query: searchQuery,
        results: results.length,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get search history
  getSearchHistory: async (uid, limit = 10) => {
    try {
      const q = query(
        collection(db, "searchHistory"),
        where("uid", "==", uid)
      );
      const querySnapshot = await getDocs(q);
      
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by timestamp and limit results
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { success: true, history: history.slice(0, limit) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Storage helper functions
export const storageHelpers = {
  // Upload user profile image
  uploadProfileImage: async (uid, file) => {
    try {
      const imageRef = ref(storage, `profile-images/${uid}/${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile with image URL
      await firestoreHelpers.updateUserProfile(uid, { profileImage: downloadURL });
      
      return { success: true, downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Upload cafe review images
  uploadReviewImages: async (cafeId, files) => {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const imageRef = ref(storage, `review-images/${cafeId}/${Date.now()}-${index}-${file.name}`);
        const snapshot = await uploadBytes(imageRef, file);
        return await getDownloadURL(snapshot.ref);
      });
      
      const downloadURLs = await Promise.all(uploadPromises);
      return { success: true, downloadURLs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export { auth, db, storage, analytics };
export default app;
