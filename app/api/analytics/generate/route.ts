import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics-service'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(req)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { days = 7 } = await request.json()
    
    // Generate analytics for the last N days
    const results = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      await AnalyticsService.generateDailySnapshot(date)
      results.push(`Generated analytics for ${date.toDateString()}`)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Generated analytics for ${days} days`,
      results 
    })
    
  } catch (error) {
    console.error('Analytics generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}