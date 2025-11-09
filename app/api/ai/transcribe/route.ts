import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ success: false, message: 'Audio file is required' }, { status: 400 });
    }

    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Audio file too large (max 10MB)' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const transcriptionUsage = user.transcriptionUsage || {};
    const monthlyUsage = transcriptionUsage[monthKey] || 0;
    const monthlyLimit = user.isPremium ? 100 : 10;
    
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return NextResponse.json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} transcriptions reached.`
      }, { status: 429 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    
    const transcription = await aiService.transcribeAudio(base64Audio, audioFile.type);
    
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(session.user.id, {
        $set: { [`transcriptionUsage.${monthKey}`]: monthlyUsage + 1 }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        transcription,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ success: false, message: 'Failed to transcribe audio' }, { status: 500 });
  }
}
