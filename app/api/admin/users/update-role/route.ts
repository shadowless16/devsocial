import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const currentUser = await User.findById(session.user.id)
    
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const { userId, role } = await req.json()
    
    if (!userId || !role) {
      return NextResponse.json({ success: false, message: 'userId and role required' }, { status: 400 })
    }

    if (!['user', 'admin', 'moderator', 'analytics'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('username displayName email role avatar level')

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { user: updatedUser }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
