import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { action } = await request.json()
    
    if (action === 'mark_generated') {
      // Mark all existing users as generated (since they're from your data generation)
      const result = await User.updateMany(
        { isGenerated: { $ne: true } }, // Only update users not already marked
        { $set: { isGenerated: true } }
      )
      
      return NextResponse.json({ 
        success: true,
        message: `Marked ${result.modifiedCount} users as generated`,
        modifiedCount: result.modifiedCount
      })
    }
    
    if (action === 'delete_generated') {
      // Get generated user IDs first
      const generatedUsers = await User.find({ isGenerated: true }).select('_id')
      const generatedUserIds = generatedUsers.map(u => u._id)
      
      // Delete posts by generated users
      const postResult = await Post.deleteMany({ 
        author: { $in: generatedUserIds } 
      })
      
      // Delete generated users
      const userResult = await User.deleteMany({ isGenerated: true })
      
      return NextResponse.json({ 
        success: true,
        message: `Deleted ${userResult.deletedCount} generated users and ${postResult.deletedCount} posts`,
        deletedUsers: userResult.deletedCount,
        deletedPosts: postResult.deletedCount
      })
    }
    
    if (action === 'count_users') {
      const totalUsers = await User.countDocuments()
      const generatedUsers = await User.countDocuments({ isGenerated: true })
      const realUsers = totalUsers - generatedUsers
      
      return NextResponse.json({
        success: true,
        totalUsers,
        realUsers,
        generatedUsers
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('User management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage users' },
      { status: 500 }
    )
  }
}