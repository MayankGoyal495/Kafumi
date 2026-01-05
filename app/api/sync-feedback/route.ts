import { NextResponse } from 'next/server'
import { syncFirestoreToSheets } from '@/scripts/sync-feedback-to-sheets'

export async function POST(request: Request) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.SYNC_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const result = await syncFirestoreToSheets()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sync completed successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Sync failed' 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Sync API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
