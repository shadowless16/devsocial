import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import { sendPushToUser } from '@/lib/notifications/push-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let type = 'test'
    try {
      const body = await request.json()
      type = body.type || 'test'
    } catch {
      // No body or invalid JSON, use default
    }

    const notifications = {
      test: {
        title: '🔔 Test Notification',
        body: 'This is a test push notification! It works! 🎉',
        url: '/',
        icon: '/icon-192x192.png'
      },
      like: {
        title: '❤️ New Like',
        body: 'TestUser liked your post',
        url: '/',
        icon: '/icon-192x192.png'
      },
      comment: {
        title: '💬 New Comment',
        body: 'TestUser: This is an amazing post!',
        url: '/',
        icon: '/icon-192x192.png'
      },
      follow: {
        title: '👤 New Follower',
        body: 'TestUser started following you',
        url: '/profile/TestUser',
        icon: '/icon-192x192.png'
      },
      mention: {
        title: '📢 You were mentioned',
        body: 'TestUser mentioned you in a post',
        url: '/',
        icon: '/icon-192x192.png'
      },
      message: {
        title: '💬 New Message',
        body: 'TestUser: Hey! How are you doing?',
        url: '/messages',
        icon: '/icon-192x192.png'
      },
      xp: {
        title: '🏆 You\'ve been overtaken!',
        body: 'TestUser just passed you by 50 XP! Time to level up!',
        url: '/leaderboard',
        icon: '/icon-192x192.png'
      }
    }

    const payload = notifications[type as keyof typeof notifications] || notifications.test

    const result = await sendPushToUser(session.user.id, payload)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.mock 
          ? 'Localhost mode: Browser notification will be shown instead.'
          : 'Push notification sent!',
        mock: result.mock,
        payload: result.mock ? payload : undefined, // Send payload for frontend to show browser notification
        type 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.reason || 'Failed to send notification',
        reason: result.reason
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Test push error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test notification' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
