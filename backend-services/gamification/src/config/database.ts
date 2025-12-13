import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial'
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected for gamification service')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}
