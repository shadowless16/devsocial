import { NextRequest, NextResponse } from 'next/server';

// Avatar upload is now disabled - using Ready Player Me instead
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Avatar upload is disabled. Please use Ready Player Me avatar creator instead.' 
    },
    { status: 410 } // Gone
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Avatar upload is disabled. Please use Ready Player Me avatar creator instead.' 
    },
    { status: 410 } // Gone
  );
}