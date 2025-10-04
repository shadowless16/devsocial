import mongoose from "mongoose"

// Try to load environment variables if they're not already loaded
if (!process.env.MONGODB_URI && !process.env.MONGODB_TEST_URI) {
  try {
    const { config } = require('dotenv')
    const path = require('path')
    config({ path: path.resolve(process.cwd(), '.env.local') })
  } catch (error) {
    // Ignore error if dotenv is not available
  }
}

// Use test URI in test environment, otherwise use regular URI
const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.MONGODB_TEST_URI 
  : process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI or MONGODB_TEST_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

type CachedConnection = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

async function connectDB() {
  // In test environment, if mongoose is already connected, return existing connection
  if (process.env.NODE_ENV === 'test' && mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 300000,
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary' as const,
      heartbeatFrequencyMS: 10000
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .catch(async (error) => {
        cached.promise = null
        console.error('MongoDB connection failed, retrying...', error.message)
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        return mongoose.connect(MONGODB_URI!, opts)
      })
  }

  try {
    cached.conn = await cached.promise
    console.log('MongoDB connected successfully')
  } catch (e) {
    cached.promise = null
    console.error('MongoDB connection failed:', e)
    throw e
  }

  return cached.conn
}

export default connectDB
