import { NextRequest, NextResponse } from 'next/server'
import { connectWithRetry } from '@/lib/core/connect-with-retry'
import Notification from '@/models/Notification'
import { cache } from '@/lib/core/cache'
import User from '@/models/User'
import { sendPushNotification } from '@/lib/notifications/push-notification'
import { authMiddleware } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  const startTotal = performance.now();
  console.log('[API] Notifications: Request started');

  try {
    const startAuth = performance.now();
    const authResult = await authMiddleware(request)
    console.log(`[API] Notifications: Auth took ${(performance.now() - startAuth).toFixed(2)}ms`);

    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authResult.user!.id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'
    
    // Cache key for unread count queries (most frequent)
    if (unreadOnly && limit === 1) {
      const cacheKey = `notifications_unread_${userId}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('[API] Notifications: Returning cached unread count');
        return NextResponse.json(cached);
      }
    }

    const startDb = performance.now();
    await connectWithRetry()
    console.log(`[API] Notifications: DB Connection took ${(performance.now() - startDb).toFixed(2)}ms`);

    const query: Record<string, unknown> = { recipient: userId }
    if (unreadOnly) {
      query.read = false
    }

    // Use aggregation for better performance
    const startQuery = performance.now();
    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'username displayName avatar level')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('type title message read createdAt actionUrl data sender')
        .lean(),
      
      // Only count unread if we need it
      unreadOnly ? 
        Notification.countDocuments({ recipient: userId, read: false }) :
        Promise.resolve(0)
    ])
    console.log(`[API] Notifications: Query execution took ${(performance.now() - startQuery).toFixed(2)}ms`);

    const responseData = {
      success: true,
      data: {
        notifications,
        unreadCount: unreadOnly ? unreadCount : await Notification.countDocuments({
          recipient: userId,
          read: false
        }),
        hasMore: notifications.length === limit
      }
    };
    
    // Cache unread count queries for 10 seconds
    if (unreadOnly && limit === 1) {
      const cacheKey = `notifications_unread_${userId}`;
      cache.set(cacheKey, responseData, 10000);
    }

    console.log(`[API] Notifications: Total request took ${(performance.now() - startTotal).toFixed(2)}ms`);
    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error fetching notifications:', errorMessage)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authResult.user!.id

    await connectWithRetry()

    const { recipient, type, title, message, relatedPost, relatedProject, actionUrl } = await request.json()

    const notification = new Notification({
      recipient,
      sender: userId,
      type,
      title,
      message,
      relatedPost,
      relatedProject,
      actionUrl
    })

    await notification.save()

    // Send push notification
    const recipientUser = await User.findById(recipient)
    if (recipientUser?.pushSubscription) {
      await sendPushNotification(recipientUser.pushSubscription as any, {
        title,
        body: message,
        url: actionUrl || '/notifications',
        icon: '/icon-192x192.png'
      })
    }

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error creating notification:', errorMessage)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
