import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()
    
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: await mongoose.connection.db?.listCollections().toArray() || []
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connection test",
      data: dbStatus
    })
  } catch (error: any) {
    console.error("Database connection error:", error)
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to connect to database",
      error: error.toString()
    }, { status: 500 })
  }
}
