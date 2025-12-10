// app/api/posts/summarize/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server-auth';
import { errorResponse, successResponse } from '@/utils/response';
import connectDB from '@/lib/core/db';
import User from '@/models/User';

// Simple in-memory cache for usage data
interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  isPremium: boolean;
}

const usageCache = new Map<string, { data: UsageData; timestamp: number }>();
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
      return NextResponse.json(successResponse(cached.data as unknown as Record<string, unknown>));
    }

    await connectDB();
    const user = await User.findById(userId).select('summaryUsage isPremium username').lean();
    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    interface UserWithUsage {
      summaryUsage?: Record<string, number>;
      isPremium?: boolean;
      username: string;
    }
    
    const typedUser = user as UserWithUsage;
    const summaryUsage = typedUser.summaryUsage || {};
    const monthlyUsage = summaryUsage[monthKey] || 0;
    const monthlyLimit = typedUser.isPremium ? 100 : 5;
    const isUnlimited = typedUser.username === 'AkDavid';
    const remainingUsage = isUnlimited ? 999999 : monthlyLimit - monthlyUsage;
    
    const responseData = { 
      used: isUnlimited ? 0 : monthlyUsage,
      limit: isUnlimited ? 999999 : monthlyLimit,
      remaining: remainingUsage,
      isPremium: typedUser.isPremium || isUnlimited
    };
    
    // Cache the result
    usageCache.set(cacheKey, { data: responseData, timestamp: now });
    
    return NextResponse.json(successResponse(responseData as unknown as Record<string, unknown>));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Usage check error:', errorMessage);
    return NextResponse.json(errorResponse('Failed to check usage'), { status: 500 });
  }
}
