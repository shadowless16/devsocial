import mongoose from "mongoose"

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
interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

let cached: CachedConnection = (global as typeof globalThis & { mongoose?: CachedConnection }).mongoose || { conn: null, promise: null }

if (!cached) {
  cached = (global as typeof globalThis & { mongoose?: CachedConnection }).mongoose = { conn: null, promise: null }
}



async function connectDB() {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 300000,
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary' as const,
      heartbeatFrequencyMS: 10000
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully')
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    const errorMessage = err instanceof Error ? err.message : 'MongoDB connection failed'
    console.error('MongoDB connection failed:', errorMessage)
    throw err
  }

  return cached.conn
}

export default connectDB
