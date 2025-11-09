// app/api/posts/summarize/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Simple in-memory cache for usage data
const usageCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `usage_${userId}`;
    const now = Date.now();
    
    // Check cache first
    const cached = usageCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(successResponse(cached.data));
    }

    await connectDB();
    const user = await User.findById(userId).select('summaryUsage isPremium username').lean();
    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const summaryUsage = (user as any).summaryUsage || {};
    const monthlyUsage = summaryUsage[monthKey] || 0;
    const monthlyLimit = (user as any).isPremium ? 100 : 5;
    const remainingUsage = (user as any).username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage;
    
    const responseData = { 
      used: (user as any).username === 'AkDavid' ? 0 : monthlyUsage,
      limit: (user as any).username === 'AkDavid' ? 999999 : monthlyLimit,
      remaining: remainingUsage,
      isPremium: (user as any).isPremium || (user as any).username === 'AkDavid'
    };
    
    // Cache the result
    usageCache.set(cacheKey, { data: responseData, timestamp: now });
    
    return NextResponse.json(successResponse(responseData));
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(errorResponse('Failed to check usage'), { status: 500 });
  }
}