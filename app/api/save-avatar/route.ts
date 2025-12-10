import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import User from '@/models/User'
import { getAvatarUrl } from '@/lib/storage/avatar-utils'
import { getSession } from '@/lib/auth/server-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { avatarUrl } = await request.json()
    if (!avatarUrl) {
      return NextResponse.json({ error: 'avatarUrl required' }, { status: 400 })
    }

    // Validate URL format (allow .glb with query params)
    if (!avatarUrl.includes('models.readyplayer.me')) {
      return NextResponse.json({ error: 'Invalid avatar URL' }, { status: 400 })
    }

    // Normalize to png (strip query params and convert .glb -> .png)
    const normalizedAvatar = getAvatarUrl(avatarUrl)

    await connectDB()
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { avatar: normalizedAvatar },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      avatarUrl: normalizedAvatar,
      message: 'Avatar saved successfully' 
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Save avatar error:', errorMessage)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
