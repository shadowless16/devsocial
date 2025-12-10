import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import connectDB from '@/lib/core/db'
import Project from '@/models/Project'
import User from '@/models/User'
import Notification from '@/models/Notification'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const { id } = await params
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    const userId = session.user.id
    const isLiked = project.likes.includes(userId)
    
    if (isLiked) {
      // Unlike
      await Project.findByIdAndUpdate(id, {
        $pull: { likes: userId }
      })
    } else {
      // Like
      await Project.findByIdAndUpdate(id, {
        $addToSet: { likes: userId }
      })
      
      // Award XP to project author (not the liker)
      if (project.author.toString() !== userId) {
        await User.findByIdAndUpdate(project.author, {
          $inc: { points: 5 }
        })
        
        // Create notification for project author
        await Notification.create({
          recipient: project.author,
          sender: userId,
          type: 'project_like',
          title: 'Project Liked',
          message: `Someone liked your project "${project.title}"`,
          relatedProject: project._id,
          actionUrl: `/projects/${project._id}`
        })
      }
    }
    
    const updatedProject = await Project.findById(id)
      .populate('author', 'username displayName avatar level')
      .lean() as { _id: unknown; title: string; author: unknown; likes?: string[] } | null
    
    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found after update' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        project: updatedProject,
        isLiked: !isLiked,
        likesCount: updatedProject.likes?.length || 0
      }
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}