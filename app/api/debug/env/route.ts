import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) + '...',
    }
  })
}
