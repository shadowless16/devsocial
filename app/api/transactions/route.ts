import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import Transaction from '@/models/Transaction'
import connectDB from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const userId = (session.user as any)._id || (session.user as any).id

    const transactions = await Transaction.find({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

    return NextResponse.json({
      success: true,
      transactions,
      page,
      hasMore: transactions.length === limit
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { toUserId, amount, description } = await request.json()
    
    if (!toUserId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid transaction data' }, { status: 400 })
    }

    await connectDB()
    
    const fromUserId = (session.user as any)._id || (session.user as any).id

    const transaction = new Transaction({
      fromUserId,
      toUserId,
      amount,
      type: 'transfer',
      status: 'completed',
      description: description || 'Transfer'
    })

    await transaction.save()

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transfer completed successfully'
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ success: false, message: 'Transfer failed' }, { status: 500 })
  }
}