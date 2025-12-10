import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server-auth';
import connectDB from '@/lib/core/db';
import User from '@/models/User';
import { geminiPublicService } from '@/lib/ai/gemini-public-service';

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
    
    interface ExplainUsage {
      date: Date;
      contentLength: number;
    }
    
    const todayUsage = user.aiUsage?.explain?.filter((usage: unknown) => {
      const typedUsage = usage as ExplainUsage;
      return new Date(typedUsage.date).toDateString() === today;
    }).length || 0;

    if (user.username !== 'AkDavid' && todayUsage >= EXPLAIN_LIMIT) {
      return NextResponse.json({ 
        success: false, 
        message: `Daily limit of ${EXPLAIN_LIMIT} explanations reached` 
      }, { status: 429 });
    }

    // Generate explanation using AI service
    const explanation = await geminiPublicService.explainPost(content);

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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Explain API error:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
