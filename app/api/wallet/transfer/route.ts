import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import { TransactionService } from '@/services/transactionService'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { toUserId, amount, description } = await request.json()
    const fromUserId = (session.user as any)._id || (session.user as any).id

    if (!toUserId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    const result = await TransactionService.transfer({
      fromUserId,
      toUserId,
      amount,
      description: description || 'HBAR Transfer',
      type: 'transfer'
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      balance: result.balance,
      message: result.message
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}