import User from '@/models/User'
import connectDB from '@/lib/core/db'

export async function updateLastActive(userId: string) {
  try {
    await connectDB()
    await User.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error updating last active:', errorMessage)
  }
}