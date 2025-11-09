import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Feedback from '@/models/Feedback'
import FeedbackComment from '@/models/FeedbackComment'
import User from '@/models/User'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req)
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
    console.error('Comment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}