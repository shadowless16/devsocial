import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function GET(req: NextRequest) {
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

    const searchQuery = req.nextUrl.searchParams.get('q') || ''

    const query = searchQuery.trim() ? {
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { displayName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {}

    const users = await User.find(query)
    .select('username displayName email role avatar level')
    .sort({ createdAt: -1 })
    .lean()

    return NextResponse.json({
      success: true,
      data: { users }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
