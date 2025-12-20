import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/core/db'
import KnowledgeEntry from '@/models/KnowledgeEntry'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()
    const { id } = await params
    const userId = session.user.id

    const entry = await KnowledgeEntry.findById(id)
    if (!entry) {
      return NextResponse.json(
        { success: false, message: 'Knowledge entry not found' },
        { status: 404 }
      )
    }

    const isLiked = entry.likes.some((id: any) => id.toString() === userId)

    if (isLiked) {
      // Unlike
      entry.likes = entry.likes.filter((like: any) => like.toString() !== userId)
    } else {
      // Like
      (entry.likes as any).push(userId)
      
      // Award XP to entry author (but not if liking own entry)
      if (entry.author.toString() !== userId) {
        await User.findByIdAndUpdate(entry.author, {
          $inc: { xp: 2 } // 2 XP for receiving a like
        })
      }
    }

    await entry.save()

    return NextResponse.json({
      success: true,
      isLiked: !isLiked,
      likesCount: entry.likes.length
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error toggling like:', errorMessage)
    return NextResponse.json(
      { success: false, message: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}