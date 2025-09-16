const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function addIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    // Posts indexes
    await db.collection('posts').createIndex({ createdAt: -1 })
    await db.collection('posts').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('posts').createIndex({ 'tags.name': 1 })
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ username: 1 }, { unique: true })
    
    // Notifications indexes
    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('notifications').createIndex({ userId: 1, read: 1 })
    
    // Follows indexes
    await db.collection('follows').createIndex({ followerId: 1 })
    await db.collection('follows').createIndex({ followingId: 1 })
    
    console.log('Database indexes added successfully')
  } catch (error) {
    console.error('Error adding indexes:', error)
  } finally {
    await client.close()
  }
}

addIndexes()