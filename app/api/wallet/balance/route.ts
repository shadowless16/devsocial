import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TransactionService } from '@/services/transactionService'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any)._id || (session.user as any).id
    const balance = await TransactionService.getBalance(userId)

    return NextResponse.json({ 
      balance,
      currency: 'HBAR'
    })
  } catch (error) {
    console.error('Balance fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}