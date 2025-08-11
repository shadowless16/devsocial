import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Report from '@/models/Report'
import Post from '@/models/Post'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { postId, reason, description } = await request.json()

    if (!postId || !reason) {
      return NextResponse.json({ success: false, error: 'Post ID and reason are required' }, { status: 400 })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    // Check if user already reported this post
    const existingReport = await Report.findOne({
      reporter: session.user.id,
      reportedPost: postId
    })

    if (existingReport) {
      return NextResponse.json({ success: false, error: 'You have already reported this post' }, { status: 400 })
    }

    const report = new Report({
      reporter: session.user.id,
      reportedPost: postId,
      reportedUser: post.author,
      reason,
      description
    })

    await report.save()

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully'
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view reports
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const reports = await Report.find({ status })
      .populate('reporter', 'username displayName avatar')
      .populate('reportedUser', 'username displayName avatar')
      .populate('reportedPost', 'content createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const totalReports = await Report.countDocuments({ status })

    return NextResponse.json({
      success: true,
      data: {
        reports,
        totalReports,
        hasMore: reports.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}