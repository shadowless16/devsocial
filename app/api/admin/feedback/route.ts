import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Feedback from '@/models/Feedback'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    
    let query: any = {}
    if (status) query.status = status
    if (type) query.type = type
    
    const feedback = await Feedback.find(query)
      .populate('userId', 'username avatar email')
      .populate('solvedBy', 'username')
      .sort({ createdAt: -1 })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Admin feedback fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const { feedbackId, status, adminResponse } = await request.json()

    if (!feedbackId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updateData: any = { 
      status,
      updatedAt: new Date()
    }

    if (status === 'solved') {
      updateData.solvedBy = session.user.id
      updateData.solvedAt = new Date()
    }

    if (adminResponse) {
      updateData.adminResponse = adminResponse
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    ).populate('userId', 'username avatar email')
     .populate('solvedBy', 'username')

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Admin feedback update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}