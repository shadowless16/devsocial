import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { aiService } from '@/lib/ai-service';

const EXPLAIN_LIMIT = 5; // Daily limit

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    
    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ 
        success: false, 
        message: 'Content must be at least 10 characters long' 
      }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check daily usage (unlimited for AkDavid)
    const today = new Date().toDateString();
    const todayUsage = user.aiUsage?.explain?.filter((usage: any) => 
      new Date(usage.date).toDateString() === today
    ).length || 0;

    if (user.username !== 'AkDavid' && todayUsage >= EXPLAIN_LIMIT) {
      return NextResponse.json({ 
        success: false, 
        message: `Daily limit of ${EXPLAIN_LIMIT} explanations reached` 
      }, { status: 429 });
    }

    // Generate explanation using AI service
    const explanation = await aiService.explainPost(content);

    // Update user usage (skip for AkDavid)
    if (user.username !== 'AkDavid') {
      if (!user.aiUsage) user.aiUsage = {};
      if (!user.aiUsage.explain) user.aiUsage.explain = [];
      
      user.aiUsage.explain.push({
        date: new Date(),
        contentLength: content.length
      });

      await user.save();
    }

    const remainingUsage = user.username === 'AkDavid' ? 999999 : EXPLAIN_LIMIT - (todayUsage + 1);

    return NextResponse.json({
      success: true,
      data: {
        explanation,
        remainingUsage,
        dailyLimit: EXPLAIN_LIMIT
      }
    });

  } catch (error) {
    console.error('Explain API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
