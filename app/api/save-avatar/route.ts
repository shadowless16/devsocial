import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { avatarUrl } = await request.json()
    if (!avatarUrl) {
      return NextResponse.json({ error: 'avatarUrl required' }, { status: 400 })
    }

    // Validate URL format
    if (!avatarUrl.includes('models.readyplayer.me') || !avatarUrl.endsWith('.glb')) {
      return NextResponse.json({ error: 'Invalid avatar URL' }, { status: 400 })
    }

    await connectDB()
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { avatar: avatarUrl },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar saved successfully' 
    })

  } catch (error) {
    console.error('Save avatar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}