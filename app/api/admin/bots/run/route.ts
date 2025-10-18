import { NextResponse } from 'next/server';
import { runBotEngagement } from '@/lib/bot-engine';

export async function POST() {
  try {
    await runBotEngagement();
    return NextResponse.json({ success: true, message: 'Bot engagement completed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
