import { NextResponse } from "next/server"
import connectDB from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json({
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      message: error.message
    }, { status: 500 })
  }
}