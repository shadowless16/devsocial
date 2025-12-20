import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import Report from '@/models/Report'
import { getSession } from '@/lib/auth/server-auth'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Reports fetch error:', errorMessage)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    
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
      reporter: new mongoose.Types.ObjectId(session.user.id),
      reportedUser: post.author._id,
      reportedPost: new mongoose.Types.ObjectId(postId),
      reason,
      description: description || '',
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      data: { report }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Report creation error:', errorMessage)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
