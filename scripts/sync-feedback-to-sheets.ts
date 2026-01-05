/**
 * ONE-WAY SYNC: Firestore Feedback → Google Sheets
 * 
 * This script updates rating and review count in Google Sheets
 * based on feedback stored in Firestore.
 * 
 * IMPORTANT: Sheet remains the source of truth for café data.
 * This only updates rating and review count columns.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { google } from 'googleapis'

// Initialize Firebase Admin (server-side only)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.GOOGLE_PROJECT_ID || 'kafumi-007',
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

const db = getFirestore()

// Google Sheets setup
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CAFE_ID_COLUMN = 'AI' // Column AI as specified (last column)
const RATING_COLUMN = 'D' // Adjust to your rating column
const REVIEW_COUNT_COLUMN = 'E' // Adjust to your review count column

interface CafeRating {
  cafeId: string
  averageRating: number
  reviewCount: number
}

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  return auth
}

/**
 * Calculate ratings from Firestore feedback
 */
async function calculateRatingsFromFirestore(): Promise<Map<string, CafeRating>> {
  const ratings = new Map<string, CafeRating>()
  
  try {
    const feedbackSnapshot = await db.collection('feedback')
      .where('status', '==', 'published')
      .get()
    
    // Group by cafeId
    const feedbackByCafe = new Map<string, number[]>()
    
    feedbackSnapshot.forEach(doc => {
      const data = doc.data()
      const cafeId = data.cafeId
      const rating = data.rating
      
      if (!feedbackByCafe.has(cafeId)) {
        feedbackByCafe.set(cafeId, [])
      }
      feedbackByCafe.get(cafeId)!.push(rating)
    })
    
    // Calculate averages
    feedbackByCafe.forEach((ratingsList, cafeId) => {
      const sum = ratingsList.reduce((a, b) => a + b, 0)
      const average = sum / ratingsList.length
      
      ratings.set(cafeId, {
        cafeId,
        averageRating: Math.round(average * 10) / 10, // Round to 1 decimal
        reviewCount: ratingsList.length
      })
    })
    
    console.log(`Calculated ratings for ${ratings.size} cafés`)
    return ratings
  } catch (error) {
    console.error('Error calculating ratings:', error)
    throw error
  }
}

/**
 * Update Google Sheets with new ratings
 */
async function updateGoogleSheets(ratings: Map<string, CafeRating>) {
  try {
    const auth = await getAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    
    // Read current sheet data to find cafe IDs and their row numbers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CAFE_ID_COLUMN}:${CAFE_ID_COLUMN}` // Read cafe_id column
    })
    
    const rows = response.data.values || []
    const updates: any[] = []
    
    // Start from row 2 (skip header)
    for (let i = 1; i < rows.length; i++) {
      const cafeId = rows[i][0]
      const rowNumber = i + 1 // Sheet rows are 1-indexed
      
      if (ratings.has(cafeId)) {
        const rating = ratings.get(cafeId)!
        
        // Update rating and review count
        updates.push({
          range: `${RATING_COLUMN}${rowNumber}`,
          values: [[rating.averageRating]]
        })
        updates.push({
          range: `${REVIEW_COUNT_COLUMN}${rowNumber}`,
          values: [[rating.reviewCount]]
        })
      }
    }
    
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      })
      console.log(`Updated ${updates.length / 2} cafés in Google Sheets`)
    } else {
      console.log('No updates needed')
    }
  } catch (error) {
    console.error('Error updating Google Sheets:', error)
    throw error
  }
}

/**
 * Main sync function
 */
export async function syncFirestoreToSheets() {
  console.log('Starting Firestore → Sheets sync...')
  
  try {
    const ratings = await calculateRatingsFromFirestore()
    await updateGoogleSheets(ratings)
    console.log('✓ Sync completed successfully')
    return { success: true }
  } catch (error) {
    console.error('✗ Sync failed:', error)
    return { success: false, error }
  }
}

// CLI execution
if (require.main === module) {
  syncFirestoreToSheets()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
