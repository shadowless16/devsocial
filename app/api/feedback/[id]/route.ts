import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Feedback from '@/models/Feedback'
import FeedbackComment from '@/models/FeedbackComment'
import User from '@/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    
    const feedback = await Feedback.findById(id)
      .populate('userId', 'username avatar role')
      .populate('solvedBy', 'username')

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    // Get comments
    const comments = await FeedbackComment.find({ feedbackId: id })
      .populate('userId', 'username avatar role')
      .sort({ createdAt: 1 })

    return NextResponse.json({ feedback, comments })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    
    const user = await User.findById(session.user.id)
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { status } = await request.json()

    if (!['open', 'in-progress', 'solved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: any = { status }
    if (status === 'solved') {
      updateData.solvedBy = session.user.id
      updateData.solvedAt = new Date()
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'username avatar role')
     .populate('solvedBy', 'username')

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}