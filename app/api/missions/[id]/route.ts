import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import MissionProgress from "@/models/MissionProgress"
import User from "@/models/User"

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    
    // Delete mission and all related progress
    await Promise.all([
      Mission.findByIdAndDelete(id),
      MissionProgress.deleteMany({ mission: id })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete mission error:", error)
    return NextResponse.json({ error: "Failed to delete mission" }, { status: 500 })
  }
}