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
      maxPoolSize: 20, // Increased pool size
      minPoolSize: 2, // Reduced min pool size
      serverSelectionTimeoutMS: 10000, // Reduced to 10 seconds
      socketTimeoutMS: 45000, // Increased socket timeout
      connectTimeoutMS: 10000, // Reduced connection timeout
      maxIdleTimeMS: 60000, // Increased idle time
      retryWrites: true,
      retryReads: true,
      readPreference: 'primaryPreferred' as const, // Allow secondary reads
      heartbeatFrequencyMS: 30000, // Reduced heartbeat frequency
      compressors: ['zlib'], // Enable compression
      zlibCompressionLevel: 6
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts) as any
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
