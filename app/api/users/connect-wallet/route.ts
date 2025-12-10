import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import User from '@/models/User'
import { authMiddleware, type AuthResult } from '@/middleware/auth'
import { errorResponse } from '@/utils/response'

export async function POST(request: NextRequest) {
  try {
    const authResult: AuthResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status })
    }
    const session = { user: { id: authResult.user.id } }
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Connect wallet error:', errorMessage)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult: AuthResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status })
    }
    const session = { user: { id: authResult.user.id } }
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Disconnect wallet error:', errorMessage)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
