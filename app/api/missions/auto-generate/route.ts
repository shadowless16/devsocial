// app/api/missions/auto-generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { missionScheduler } from '@/lib/mission-scheduler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { trigger } = await request.json();
    
    const validTriggers = ['user_signup', 'daily_check', 'weekly_check', 'user_milestone'];
    
    if (!trigger || !validTriggers.includes(trigger)) {
      return NextResponse.json({
        success: false,
        error: `Invalid trigger. Must be one of: ${validTriggers.join(', ')}`
      }, { status: 400 });
    }

    await missionScheduler.triggerMissionCreation(trigger);

    return NextResponse.json({
      success: true,
      message: `Mission creation triggered for: ${trigger}`
    });

  } catch (error) {
    console.error('Auto-generate missions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger mission creation'
    }, { status: 500 });
  }
}

// GET endpoint for manual triggering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger') || 'daily_check';
    
    await missionScheduler.triggerMissionCreation(trigger as any);

    return NextResponse.json({
      success: true,
      message: `Mission creation triggered for: ${trigger}`
    });

  } catch (error) {
    console.error('Auto-generate missions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger mission creation'
    }, { status: 500 });
  }
}
