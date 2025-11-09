import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import { connectWithRetry } from '@/lib/connect-with-retry'
import Notification from '@/models/Notification'
import { cache } from '@/lib/cache'
import User from '@/models/User'
import { sendPushNotification } from '@/lib/push-notification'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'
    
    // Cache key for unread count queries (most frequent)
    if (unreadOnly && limit === 1) {
      const cacheKey = `notifications_unread_${session.user.id}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await connectWithRetry()

    const query: any = { recipient: session.user.id }
    if (unreadOnly) {
      query.read = false
    }

    // Use aggregation for better performance
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
        Notification.countDocuments({ recipient: session.user.id, read: false }) :
        Promise.resolve(0)
    ])

    const responseData = {
      success: true,
      data: {
        notifications,
        unreadCount: unreadOnly ? unreadCount : await Notification.countDocuments({
          recipient: session.user.id,
          read: false
        }),
        hasMore: notifications.length === limit
      }
    };
    
    // Cache unread count queries for 10 seconds
    if (unreadOnly && limit === 1) {
      const cacheKey = `notifications_unread_${session.user.id}`;
      cache.set(cacheKey, responseData, 10000);
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectWithRetry()

    const { recipient, type, title, message, relatedPost, relatedProject, actionUrl } = await request.json()

    const notification = new Notification({
      recipient,
      sender: session.user.id,
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
      await sendPushNotification(recipientUser.pushSubscription, {
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
    console.error('Error creating notification:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}