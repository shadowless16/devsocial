// app/api/cron/missions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { missionScheduler } from '@/lib/mission-scheduler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run daily mission check
    await missionScheduler.scheduleDailyCheck();
    
    // Check if it's Monday for weekly missions
    const today = new Date();
    if (today.getDay() === 1) { // Monday
      await missionScheduler.scheduleWeeklyCheck();
    }

    return NextResponse.json({
      success: true,
      message: 'Mission cron job completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mission cron job error:', error);
    return NextResponse.json({
      success: false,
      error: 'Mission cron job failed'
    }, { status: 500 });
  }
}