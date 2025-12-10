import { NextResponse } from "next/server"
import connectDB from "@/lib/core/db"
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Database connection error:", errorMessage)
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to connect to database",
      error: error.toString()
    }, { status: 500 })
  }
}
