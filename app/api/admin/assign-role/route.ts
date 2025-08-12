import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // For development: allow users to assign analytics role to themselves
    // In production, only admins should be able to assign roles
    if (session.user.role !== 'admin' && role !== 'analytics') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // If not admin, only allow assigning analytics role to self
    if (session.user.role !== 'admin' && userId !== session.user.id) {
      return NextResponse.json({ error: 'Can only assign analytics role to yourself' }, { status: 403 })
    }
    
    await connectDB()
    
    const { userId, role } = await request.json()
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
    }
    
    const validRoles = ['user', 'moderator', 'admin', 'analytics']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    user.role = role
    await user.save()
    
    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Assign role error:', error)
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    )
  }
}

// Get current user role (for verification)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    
    const user = await User.findById(session.user.id).select('username email role')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Get user role error:', error)
    return NextResponse.json(
      { error: 'Failed to get user role' },
      { status: 500 }
    )
  }
}