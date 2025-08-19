import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TransactionService } from '@/services/transactionService'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const userId = (session.user as any)._id || (session.user as any).id
    const history = await TransactionService.getTransactionHistory(userId, page, limit)

    return NextResponse.json({
      success: true,
      ...history
    })
  } catch (error) {
    console.error('Transaction history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}