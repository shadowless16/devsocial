import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Report from '@/models/Report'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    const { action, status } = await request.json()

    const report = await Report.findById(params.id)
    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
    }

    report.status = status || 'resolved'
    report.action = action
    report.reviewedBy = session.user.id
    report.reviewedAt = new Date()

    await report.save()

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully'
    })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}