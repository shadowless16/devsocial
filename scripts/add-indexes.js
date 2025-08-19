// scripts/add-indexes.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function createIndexSafely(collection, indexSpec, options = {}) {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`✅ Created index on ${collection.collectionName}:`, indexSpec);
  } catch (error) {
    if (error.code === 86) { // IndexKeySpecsConflict
      console.log(`ℹ️  Index already exists on ${collection.collectionName}:`, indexSpec);
    } else {
      throw error;
    }
  }
}

async function addIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Posts indexes
    await createIndexSafely(db.collection('posts'), { createdAt: -1 });
    await createIndexSafely(db.collection('posts'), { author: 1, createdAt: -1 });
    await createIndexSafely(db.collection('posts'), { tags: 1 });
    
    // Notifications indexes
    await createIndexSafely(db.collection('notifications'), { recipient: 1, createdAt: -1 });
    await createIndexSafely(db.collection('notifications'), { recipient: 1, read: 1 });
    
    // Users indexes
    await createIndexSafely(db.collection('users'), { username: 1 });
    await createIndexSafely(db.collection('users'), { email: 1 });
    await createIndexSafely(db.collection('users'), { isGenerated: 1 });
    
    // Likes indexes
    await createIndexSafely(db.collection('likes'), { user: 1, post: 1 });
    await createIndexSafely(db.collection('likes'), { post: 1 });
    
    // Comments indexes
    await createIndexSafely(db.collection('comments'), { post: 1, createdAt: -1 });
    
    console.log('✅ All indexes processed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

addIndexes();