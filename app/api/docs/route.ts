import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/api/swagger'

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
