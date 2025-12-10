import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server-auth'
import connectDB from '@/lib/core/db'
import AILog from '@/models/AILog'

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(req)
    
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const service = searchParams.get('service')
    const taskType = searchParams.get('taskType')
    const skip = (page - 1) * limit

    interface FilterQuery {
      service?: string;
      taskType?: string;
    }
    
    const filter: FilterQuery = {}
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('AI logs fetch error:', errorMessage)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
