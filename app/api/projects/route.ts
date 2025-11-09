import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const status = searchParams.get('status')
    const tech = searchParams.get('tech')
    const author = searchParams.get('author')
    const featured = searchParams.get('featured')
    
    const skip = (page - 1) * limit
    
    // Build query
    const query: any = { visibility: 'public' }
    
    if (status) query.status = status
    if (tech) query.technologies = { $in: [tech] }
    if (author) query.author = author
    if (featured === 'true') query.featured = true
    
    const projects = await Project.find(query)
      .populate('author', 'username displayName avatar level')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Project.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: any) {
    console.error('Project fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    const body = await request.json()
    const { title, description, technologies, githubUrl, liveUrl, images, openPositions, status } = body
    
    // Filter out empty positions
    const validPositions = (openPositions || []).filter((pos: any) => 
      pos.title && pos.title.trim() && pos.description && pos.description.trim()
    )
    
    const projectData = {
      title,
      description,
      technologies: technologies || [],
      githubUrl,
      liveUrl,
      images: images || [],
      openPositions: validPositions,
      status: status || 'in-progress',
      author: session.user.id
    }
    
    const project = await Project.create(projectData)
    
    const populatedProject = await Project.findById(project._id)
      .populate('author', 'username displayName avatar level')
      .lean()
    
    // Award XP for creating project
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { points: 50 }
    })
    
    return NextResponse.json({
      success: true,
      data: populatedProject
    })
  } catch (error: any) {
    console.error('Project creation error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationErrors.join(', ') 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create project', details: error.message },
      { status: 500 }
    )
  }
}
