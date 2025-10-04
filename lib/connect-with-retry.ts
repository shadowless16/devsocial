import connectDB from './db'

export const connectWithRetry = async (maxRetries = 3): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB()
      return
    } catch (error: any) {
      console.error(`DB connection attempt ${i + 1} failed:`, error.message)
      
      if (i === maxRetries - 1) {
        throw error
      }
      
      const delay = Math.min(1000 * Math.pow(2, i), 5000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}