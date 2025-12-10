// app/api/posts/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server-auth';
import { geminiPublicService } from '@/lib/ai/gemini-public-service';

import connectDB from '@/lib/core/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { content } = await req.json();
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ success: false, message: 'Content too long for summarization' }, { status: 400 });
    }

    // Connect to database and check usage
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
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
      return NextResponse.json({
        success: false,
        message: `Monthly limit of ${monthlyLimit} summaries reached. ${user.isPremium ? '' : 'Upgrade to premium for unlimited access.'}`
      }, { status: 429 });
    }

    const summary = await geminiPublicService.summarizePost(content);
    
    // Update usage count (skip for AkDavid)
    if (user.username !== 'AkDavid') {
      await User.findByIdAndUpdate(session.user.id, {
        $set: {
          [`summaryUsage.${monthKey}`]: monthlyUsage + 1
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        summary,
        remainingUsage: user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage - 1,
        monthlyLimit
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Summarization error:', errorMessage);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate summary'
    }, { status: 500 });
  }
}
