import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import { TransactionService } from '@/services/transactionService'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any)._id || (session.user as any).id
    
    const [balance, history] = await Promise.all([
      TransactionService.getBalance(userId),
      TransactionService.getTransactionHistory(userId, 1, 10)
    ])

    return NextResponse.json({
      balance,
      currency: 'HBAR',
      recentTransactions: history.transactions
    })
  } catch (error) {
    console.error('Wallet error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
