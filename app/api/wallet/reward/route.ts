import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TransactionService } from '@/services/transactionService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, amount, description } = await request.json()

    if (!userId || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Only allow system/admin users to reward others (you can add role check here)
    const currentUserId = (session.user as any)._id || (session.user as any).id
    
    const result = await TransactionService.rewardUser(userId, amount, description)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      message: result.message
    })
  } catch (error) {
    console.error('Reward error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}