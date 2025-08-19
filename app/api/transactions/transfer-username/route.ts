import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TransactionService } from '@/services/transactionService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.username) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { toUsername, amount, description } = await request.json()

    if (!toUsername || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username and amount are required' 
      }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Amount must be greater than 0' 
      }, { status: 400 })
    }

    if (session.user.username === toUsername) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot transfer to yourself' 
      }, { status: 400 })
    }

    const result = await TransactionService.transferByUsername({
      fromUsername: session.user.username,
      toUsername,
      amount,
      description,
      type: 'transfer'
    })

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.message 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction: result.transaction,
        newBalance: result.balance,
        message: result.message
      }
    })

  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}