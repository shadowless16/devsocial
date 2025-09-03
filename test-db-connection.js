const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Possible fixes:');
      console.log('1. Check if MongoDB Atlas cluster is running');
      console.log('2. Verify network access settings (whitelist your IP)');
      console.log('3. Check if cluster is paused');
    }
  }
}

testConnection();