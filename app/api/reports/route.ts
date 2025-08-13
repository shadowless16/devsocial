import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Report from '@/models/Report'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const reports = await Report.find({ status })
      .populate('reporter', 'username displayName avatar')
      .populate('reportedUser', 'username displayName avatar')
      .populate('reportedPost', 'content')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: { reports }
    })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { postId, reason, description } = body

    if (!postId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already reported this post
    const existingReport = await Report.findOne({
      reporter: session.user.id,
      reportedPost: postId
    })

    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this post' }, { status: 400 })
    }

    // Get the post to find the reported user
    const Post = (await import('@/models/Post')).default
    const post = await Post.findById(postId).populate('author')
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const report = await Report.create({
      reporter: session.user.id,
      reportedUser: post.author._id,
      reportedPost: postId,
      reason,
      description: description || '',
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      data: { report }
    })
  } catch (error) {
    console.error('Report creation error:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}