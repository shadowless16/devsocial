import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('transcriptionUsage isPremium username').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const transcriptionUsage = (user as any).transcriptionUsage || {};
    const monthlyUsage = transcriptionUsage[monthKey] || 0;
    const monthlyLimit = (user as any).isPremium ? 100 : 10;
    const remainingUsage = (user as any).username === 'AkDavid' ? 999999 : monthlyLimit - monthlyUsage;
    
    return NextResponse.json({
      success: true,
      data: { 
        used: (user as any).username === 'AkDavid' ? 0 : monthlyUsage,
        limit: (user as any).username === 'AkDavid' ? 999999 : monthlyLimit,
        remaining: remainingUsage,
        isPremium: (user as any).isPremium || (user as any).username === 'AkDavid'
      }
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ success: false, message: 'Failed to check usage' }, { status: 500 });
  }
}
