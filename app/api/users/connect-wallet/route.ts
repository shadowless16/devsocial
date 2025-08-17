import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hederaAccountId, publicKey } = await request.json()
    if (!hederaAccountId) {
      return NextResponse.json({ error: 'Hedera account ID required' }, { status: 400 })
    }

    await connectDB()
    
    await User.findByIdAndUpdate(session.user.id, {
      hederaAccountId,
      publicKey: publicKey || null,
      walletConnected: true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Connect wallet error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    await User.findByIdAndUpdate(session.user.id, {
      $unset: { hederaAccountId: 1, publicKey: 1 },
      walletConnected: false
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect wallet error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}