import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/core/db'
import Feedback from '@/models/Feedback'
import FeedbackComment from '@/models/FeedbackComment'
import User from '@/models/User'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const { content } = await request.json()
    const { id } = await params

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Check if feedback exists
    const feedback = await Feedback.findById(id)
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    // Check if user can comment (feedback owner or admin/moderator)
    const user = await User.findById(session.user.id)
    const canComment = feedback.userId.toString() === session.user.id || 
                      user?.role === 'admin' || 
                      user?.role === 'moderator'

    if (!canComment) {
      return NextResponse.json({ error: 'Not authorized to comment on this feedback' }, { status: 403 })
    }

    const comment = new FeedbackComment({
      feedbackId: id,
      userId: session.user.id,
      content: content.trim(),
      isAdminComment: user?.role === 'admin' || user?.role === 'moderator'
    })

    await comment.save()

    // Update comments count
    await Feedback.findByIdAndUpdate(id, {
      $inc: { commentsCount: 1 }
    })

    // Populate the comment before returning
    await comment.populate('userId', 'username avatar role')

    return NextResponse.json({ comment })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Comment creation error:', errorMessage)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}