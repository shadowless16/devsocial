import { NextRequest, NextResponse } from 'next/server'
import { connectWithRetry } from '@/lib/core/connect-with-retry'
import User from '@/models/User'
import { getSession } from '@/lib/auth/server-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscription } = await request.json()
    await connectWithRetry()

    await User.findByIdAndUpdate(session.user.id, {
      pushSubscription: subscription
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Subscribe error:', errorMessage)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
