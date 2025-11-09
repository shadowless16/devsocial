import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Project from '@/models/Project'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const { status } = await request.json()
    
    if (!['planning', 'in-progress', 'completed', 'on-hold'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const { id } = await params
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    if (project.author.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to update this project' }, { status: 403 })
    }

    project.status = status
    await project.save()

    return NextResponse.json({
      success: true,
      data: { status: project.status }
    })
  } catch (error) {
    console.error('Error updating project status:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}