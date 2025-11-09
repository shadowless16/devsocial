import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Project from "@/models/Project"
import UserModel from "@/models/User";
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { positionIndex } = await request.json()
    
    if (typeof positionIndex !== 'number') {
      return NextResponse.json({ success: false, error: "Invalid position index" }, { status: 400 })
    }

    const { id } = await params
    const project = await Project.findById(id).populate('author', 'username displayName avatar level')
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    const user = await UserModel.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    if (!project.openPositions || positionIndex >= project.openPositions.length) {
      return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 })
    }

    if (project.author._id.toString() === user._id.toString()) {
      return NextResponse.json({ success: false, error: "Cannot join your own project" }, { status: 400 })
    }

    if (!project.openPositions[positionIndex].applicants) {
      project.openPositions[positionIndex].applicants = []
    }

    const hasApplied = project.openPositions[positionIndex].applicants.some(
      (applicant: any) => applicant.user.toString() === user._id.toString()
    )

    if (hasApplied) {
      return NextResponse.json({ success: false, error: "You have already applied to this position" }, { status: 400 })
    }

    project.openPositions[positionIndex].applicants.push({
      user: user._id,
      appliedAt: new Date(),
      status: 'pending'
    })

    await project.save()

    return NextResponse.json({ 
      success: true, 
      message: "Successfully applied to position" 
    })

  } catch (error) {
    console.error("Error joining position:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}