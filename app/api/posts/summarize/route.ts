// app/api/posts/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import { errorResponse, successResponse } from '@/utils/response';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    const { content } = await req.json();
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(errorResponse('Content is required'), { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json(errorResponse('Content too long for summarization'), { status: 400 });
    }

    // Connect to database and check usage
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    // Check monthly usage limit (5 per month for free users, unlimited for AkDavid)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const summaryUsage = user.summaryUsage || {};
    const monthlyUsage = summaryUsage[monthKey] || 0;
    const monthlyLimit = user.isPremium ? 100 : 5; // Premium users get 100, free users get 5
    
    // Give AkDavid unlimited access
    if (user.username !== 'AkDavid' && monthlyUsage >= monthlyLimit) {
      return NextResponse.json(
        errorResponse(`Monthly limit of ${monthlyLimit} summaries reached. ${user.isPremium ? '' : 'Upgrade to premium for unlimited access.'}`), 
        { status: 429 }
      );
    }

    const summary = await aiService.summarizePost(content);
    
    // Update usage count (skip for AkDavid)
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(session.user.id, {
        $set: {
          [`summaryUsage.${monthKey}`]: monthlyUsage + 1
        }
      });
    }
    
    return NextResponse.json(successResponse({ 
      summary,
      remainingUsage: monthlyLimit - monthlyUsage - 1
    }));
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(errorResponse('Failed to generate summary'), { status: 500 });
  }
}