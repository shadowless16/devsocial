import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Project from '@/models/Project'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    await connectDB()
    
    const project = await Project.findById(params.id)
      .populate('author', 'username displayName avatar level')
      .lean()
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Increment view count only if user hasn't viewed before
    if (session?.user?.id) {
      const hasViewed = project.viewedBy?.some(id => id.toString() === session.user.id)
      if (!hasViewed) {
        await Project.findByIdAndUpdate(params.id, {
          $inc: { views: 1 },
          $addToSet: { viewedBy: session.user.id }
        })
        project.views = (project.views || 0) + 1
      }
    }
    
    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const project = await Project.findById(params.id)
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    if (project.author.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to edit this project' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('author', 'username displayName avatar level')
    
    return NextResponse.json({
      success: true,
      data: updatedProject
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const project = await Project.findById(params.id)
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    if (project.author.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this project' },
        { status: 403 }
      )
    }
    
    await Project.findByIdAndDelete(params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}