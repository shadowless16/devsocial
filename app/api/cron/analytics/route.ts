import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics/analytics-service'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Generate analytics for yesterday (since today's data might be incomplete)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    await AnalyticsService.generateDailySnapshot(yesterday)
    
    return NextResponse.json({ 
      success: true, 
      message: `Analytics generated for ${yesterday.toISOString().split('T')[0]}`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Cron analytics generation error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
