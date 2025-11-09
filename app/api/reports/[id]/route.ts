import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Report from '@/models/Report'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const body = await request.json()
    const { action, status } = body

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        action
      },
      { new: true }
    )

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Handle post removal if action is post_removed
    if (action === 'post_removed') {
      const Post = (await import('@/models/Post')).default
      await Post.findByIdAndDelete(report.reportedPost)
    }

    return NextResponse.json({
      success: true,
      data: { report }
    })
  } catch (error) {
    console.error('Report update error:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}