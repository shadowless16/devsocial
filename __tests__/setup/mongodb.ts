import mongoose from 'mongoose'
import path from 'path'
import os from 'os'
let mongoServer: unknown = null

// If the user provides a MONGODB_TEST_URI or MONGODB_URI, prefer that
// This avoids downloading MongoMemoryServer binaries in CI or local where a DB is available.
const getEnvUri = () => process.env.MONGODB_TEST_URI || process.env.MONGODB_URI

export const setupMongoDB = async () => {
  const envUri = getEnvUri()
  if (envUri) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(envUri)
    }
    return envUri
  }

  // Fallback to MongoMemoryServer only when no URI is provided
  // Lazy import to avoid requiring the binary if unnecessary
  const { MongoMemoryServer } = await import('mongodb-memory-server')
  if (mongoServer) return mongoServer.getUri()

  // Configure global settings to cache MongoDB binary
  process.env.MONGOMS_DOWNLOAD_DIR = path.join(os.homedir(), '.cache', 'mongodb-binaries')
  process.env.MONGOMS_VERSION = '6.0.4'
  process.env.MONGOMS_DISABLE_POSTINSTALL = 'true'

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.4',
      skipMD5: true,
      downloadDir: path.join(os.homedir(), '.cache', 'mongodb-binaries'),
    },
    instance: {
      dbName: 'test',
    },
  })

  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
  return uri
}

export const teardownMongoDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    try { await mongoServer.stop() } catch (e: unknown) { /* ignore */ }
    mongoServer = null
  }
}

export const clearDatabase = async () => {
  if (mongoose.connection.readyState === 0) return

  const collections = mongoose.connection.collections
  for (const key in collections) {
    try { await collections[key].deleteMany({}) } catch (e: unknown) { /* ignore */ }
  }
}