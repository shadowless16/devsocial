import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Make current user admin
    await User.findByIdAndUpdate(session.user.id, { role: 'admin' })

    return NextResponse.json({
      success: true,
      message: 'You are now an admin! Please refresh the page.'
    })
  } catch (error) {
    console.error('Error making user admin:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}