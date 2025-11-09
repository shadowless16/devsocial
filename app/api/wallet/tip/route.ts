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

    const { toUsername, amount, description } = await request.json()
    const fromUsername = (session.user as any).username

    if (!toUsername || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!fromUsername) {
      return NextResponse.json({ error: 'User session invalid' }, { status: 400 })
    }

    if (fromUsername === toUsername) {
      return NextResponse.json({ error: 'Cannot tip yourself' }, { status: 400 })
    }

    const result = await TransactionService.transferByUsername({
      fromUsername,
      toUsername,
      amount,
      description: description || 'Tip',
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
    console.error('Tip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}