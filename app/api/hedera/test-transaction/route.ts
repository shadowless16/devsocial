import { NextRequest, NextResponse } from 'next/server'
import { HederaService } from '@/lib/hedera-service'

export async function POST(request: NextRequest) {
  try {
    const { toAccountId, amount } = await request.json()
    
    if (!toAccountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const hederaService = new HederaService()
    const result = await hederaService.sendTestTransaction(toAccountId, amount || 1)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Hedera transaction error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const hederaService = new HederaService()
    const result = await hederaService.getAccountBalance(accountId)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Hedera balance error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
