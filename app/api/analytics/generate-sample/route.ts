import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only allow admin users to generate sample data
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Generate analytics data for the last 7 days
    const promises = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      promises.push(AnalyticsService.generateDailySnapshot(date))
    }
    
    await Promise.all(promises)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sample analytics data generated for the last 7 days' 
    })
    
  } catch (error) {
    console.error('Generate sample analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample analytics data' },
      { status: 500 }
    )
  }
}