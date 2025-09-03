import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const query: any = { recipient: session.user.id }
    if (unreadOnly) {
      query.read = false
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username displayName avatar level')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('type title message read createdAt actionUrl data sender')
      .lean()

    // Always compute the true unread count from the DB.
    // Previously, when `unread=true` we returned notifications.length which was
    // limited by the `limit` param (often 1) and made the unread badge stuck at 1.
    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      read: false
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        hasMore: notifications.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

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

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}