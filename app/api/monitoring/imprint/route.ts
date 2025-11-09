import { NextRequest, NextResponse } from 'next/server'
import { getImprintMetrics } from '@/workers/imprintWorker'
import connectDB from '@/lib/db'
import Post from '@/models/Post'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get real-time pending count from database
    const pendingCount = await Post.countDocuments({ 
      imprintStatus: 'pending' 
    })
    
    const confirmedCount = await Post.countDocuments({ 
      imprintStatus: 'confirmed' 
    })
    
    const failedCount = await Post.countDocuments({ 
      imprintStatus: 'failed' 
    })
    
    const workerMetrics = getImprintMetrics()
    
    const metrics = {
      ...workerMetrics,
      // Override with real-time database counts
      pendingImprintsCount: pendingCount,
      confirmedImprintsCount: confirmedCount,
      failedImprintsCount: failedCount,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Failed to get imprint metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
}
