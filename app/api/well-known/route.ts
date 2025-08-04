import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  
  // Handle Chrome DevTools requests gracefully
  if (path?.includes('com.chrome.devtools')) {
    return NextResponse.json(
      { message: 'DevTools endpoint not available' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(
    { message: 'Well-known endpoint not found' },
    { status: 404 }
  )
}
