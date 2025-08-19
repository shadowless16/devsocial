import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import path from 'path'
import os from 'os'

let mongoServer: MongoMemoryServer | null = null

// Configure global settings to cache MongoDB binary
process.env.MONGOMS_DOWNLOAD_DIR = path.join(os.homedir(), '.cache', 'mongodb-binaries')
process.env.MONGOMS_VERSION = '6.0.4'
process.env.MONGOMS_DISABLE_POSTINSTALL = 'true'

export const setupMongoDB = async () => {
  if (mongoServer) return mongoServer.getUri()
  
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
    await mongoServer.stop()
    mongoServer = null
  }
}

export const clearDatabase = async () => {
  if (mongoose.connection.readyState === 0) return
  
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}