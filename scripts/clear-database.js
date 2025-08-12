#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('Found collections:', collections.map(c => c.name));
    
    // Clear all collections
    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`Cleared ${collection.name}: ${result.deletedCount} documents deleted`);
    }

    console.log('\n✅ Database cleared successfully!');
    console.log('🔄 You can now start fresh with real users');
    
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Confirm before clearing
console.log('⚠️  WARNING: This will delete ALL data from your database!');
console.log('Database:', MONGODB_URI?.split('@')[1]?.split('/')[1] || 'Unknown');
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');

setTimeout(() => {
  clearDatabase();
}, 5000);