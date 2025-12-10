import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server-auth';

import connectDB from '@/lib/core/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('imageAnalysisUsage isPremium username').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    interface UserWithUsage {
      imageAnalysisUsage?: Record<string, number>;
      isPremium?: boolean;
      username: string;
    }
    
    const typedUser = user as UserWithUsage;
    const imageAnalysisUsage = typedUser.imageAnalysisUsage || {};
    const monthlyUsage = imageAnalysisUsage[monthKey] || 0;
    const monthlyLimit = typedUser.isPremium ? 100 : 10;
    const isUnlimited = typedUser.username === 'AkDavid';
    const remainingUsage = isUnlimited ? 999999 : monthlyLimit - monthlyUsage;
    
    return NextResponse.json({
      success: true,
      data: { 
        used: isUnlimited ? 0 : monthlyUsage,
        limit: isUnlimited ? 999999 : monthlyLimit,
        remaining: remainingUsage,
        isPremium: typedUser.isPremium || isUnlimited
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Usage check error:', errorMessage);
    return NextResponse.json({ success: false, message: 'Failed to check usage' }, { status: 500 });
  }
}
