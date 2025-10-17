import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const action = formData.get('action') as string || 'analyze';
    
    if (!imageFile) {
      return NextResponse.json({ success: false, message: 'Image file is required' }, { status: 400 });
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Image file too large (max 5MB)' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const imageAnalysisUsage = user.imageAnalysisUsage || {};
    const monthlyUsage = imageAnalysisUsage[monthKey] || 0;
    const monthlyLimit = user.isPremium ? 100 : 10;
    
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return NextResponse.json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} image analyses reached.`
      }, { status: 429 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    let result: string;
    if (action === 'describe') {
      result = await aiService.describeImage(base64Image, imageFile.type);
    } else {
      result = await aiService.analyzeImage(base64Image, imageFile.type);
    }
    
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(session.user.id, {
        $set: { [`imageAnalysisUsage.${monthKey}`]: monthlyUsage + 1 }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        analysis: result,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json({ success: false, message: 'Failed to analyze image' }, { status: 500 });
  }
}
