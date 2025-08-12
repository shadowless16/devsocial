import User from '@/models/User'
import connectDB from '@/lib/db'

export async function updateLastActive(userId: string) {
  try {
    await connectDB()
    await User.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true }
    )
  } catch (error) {
    console.error('Error updating last active:', error)
  }
}