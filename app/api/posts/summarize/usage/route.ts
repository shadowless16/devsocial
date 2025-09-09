// app/api/posts/summarize/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const summaryUsage = user.summaryUsage || {};
    const monthlyUsage = summaryUsage[monthKey] || 0;
    const monthlyLimit = user.isPremium ? 100 : 5;
    const remainingUsage = user.username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage;
    
    return NextResponse.json(successResponse({ 
      used: user.username === 'AkDavid' ? 0 : monthlyUsage,
      limit: user.username === 'AkDavid' ? 999999 : monthlyLimit,
      remaining: remainingUsage,
      isPremium: user.isPremium || user.username === 'AkDavid'
    }));
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(errorResponse('Failed to check usage'), { status: 500 });
  }
}