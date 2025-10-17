import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import AILog from '@/models/AILog'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await (await import('@/models/User')).default.findById(session.user.id)
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const service = searchParams.get('service')
    const taskType = searchParams.get('taskType')
    const skip = (page - 1) * limit

    const filter: any = {}
    if (service) filter.service = service
    if (taskType) filter.taskType = taskType

    const [logs, total] = await Promise.all([
      AILog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AILog.countDocuments(filter)
    ])

    const stats = await AILog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { service: '$service', taskType: '$taskType' },
          count: { $sum: 1 },
          avgExecutionTime: { $avg: '$executionTime' },
          successRate: { $avg: { $cond: ['$success', 1, 0] } }
        }
      }
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    })
  } catch (error) {
    console.error('AI logs fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
