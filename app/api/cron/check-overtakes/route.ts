import { NextRequest, NextResponse } from 'next/server'
import { XPOvertakeService } from '@/utils/xp-overtake-service'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [allTime, weekly, monthly] = await Promise.all([
      XPOvertakeService.checkAndNotifyOvertakes('all-time'),
      XPOvertakeService.checkAndNotifyOvertakes('weekly'),
      XPOvertakeService.checkAndNotifyOvertakes('monthly')
    ])
    
    return NextResponse.json({
      success: true,
      message: `Checked overtakes - All-time: ${allTime.overtakes}, Weekly: ${weekly.overtakes}, Monthly: ${monthly.overtakes}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron overtake check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check overtakes' 
    }, { status: 500 })
  }
}
