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

    const { content, action } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
    }

    if (!action || !['professional', 'funny', 'casual', 'hashtags'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Use summary usage for text enhancement
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const summaryUsage = user.summaryUsage || {};
    const monthlyUsage = summaryUsage[monthKey] || 0;
    const monthlyLimit = user.isPremium ? 100 : 5;
    
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return NextResponse.json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} enhancements reached.`
      }, { status: 429 });
    }

    let enhanced: string;
    
    switch (action) {
      case 'professional':
        enhanced = await aiService.enhanceText(content, 'Rewrite this in a professional, formal tone suitable for business communication');
        break;
      case 'funny':
        enhanced = await aiService.enhanceText(content, 'Rewrite this in a funny, humorous tone while keeping the main message');
        break;
      case 'casual':
        enhanced = await aiService.enhanceText(content, 'Rewrite this in a casual, friendly tone');
        break;
      case 'hashtags':
        enhanced = await aiService.enhanceText(content, 'Add 3-5 relevant hashtags at the end of this text. Keep the original text and just append hashtags');
        break;
      default:
        enhanced = content;
    }
    
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(session.user.id, {
        $set: { [`summaryUsage.${monthKey}`]: monthlyUsage + 1 }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        enhanced,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    });
  } catch (error) {
    console.error('Text enhancement error:', error);
    return NextResponse.json({ success: false, message: 'Failed to enhance text' }, { status: 500 });
  }
}
