import { NextRequest, NextResponse } from 'next/server'
import { XPOvertakeService } from '@/utils/xp-overtake-service'

export async function POST(request: NextRequest) {
  try {
    const { type = 'all-time' } = await request.json().catch(() => ({}))
    
    const validType = type as 'weekly' | 'monthly' | 'all-time'
    const result = await XPOvertakeService.checkAndNotifyOvertakes(validType)
    
    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('XP overtake check error:', errorMessage)
    return NextResponse.json({ success: false, error: 'Failed to check overtakes' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all-time'
    
    const validType = type as 'weekly' | 'monthly' | 'all-time'
    const result = await XPOvertakeService.checkAndNotifyOvertakes(validType)
    
    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('XP overtake check error:', errorMessage)
    return NextResponse.json({ success: false, error: 'Failed to check overtakes' }, { status: 500 })
  }
}
