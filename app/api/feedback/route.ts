import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import connectDB from '@/lib/core/db'
import Feedback from '@/models/Feedback'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const { type, subject, description, rating } = await request.json()

    if (!type || !subject || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const feedback = new Feedback({
      userId: session.user.id,
      type,
      subject,
      description,
      rating: rating ? parseInt(rating) : undefined
    })

    await feedback.save()

    return NextResponse.json({ success: true, id: feedback._id })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Feedback submission error:', errorMessage)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'my'
    
    let query = {}
    if (view === 'my') {
      query = { userId: session.user.id }
    }
    // For 'all' view, no filter - shows all feedback
    
    const feedback = await Feedback.find(query as Record<string, unknown>)
      .populate('userId', 'username avatar role')
      .populate('solvedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ feedback })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Feedback fetch error:', errorMessage)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
