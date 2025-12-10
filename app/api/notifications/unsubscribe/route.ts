import { NextRequest, NextResponse } from 'next/server'
import { connectWithRetry } from '@/lib/core/connect-with-retry'
import { getSession } from '@/lib/auth/server-auth'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectWithRetry()
    await User.findByIdAndUpdate(session.user.id, {
      $unset: { pushSubscription: 1 }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Unsubscribe error:', errorMessage)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
