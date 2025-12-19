import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import Notification from '@/models/Notification'
import { getSession } from '@/lib/auth/server-auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { notificationIds } = await request.json()

    if (notificationIds && Array.isArray(notificationIds)) {
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          recipient: session.user.id 
        },
        { read: false }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error marking notifications as unread:', errorMessage)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
