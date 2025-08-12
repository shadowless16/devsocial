// Quick script to update user role directly in MongoDB
// Usage: node scripts/update-user-role.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

async function updateUserRole() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // First, let's find the user with case-insensitive search
    const existingUser = await users.findOne({ 
      username: { $regex: /^akdavid$/i } 
    });
    
    if (existingUser) {
      console.log(`Found user: ${existingUser.username}`);
      
      // Update the user to admin role
      const result = await users.updateOne(
        { _id: existingUser._id },
        { $set: { role: 'admin' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ Successfully updated user to admin role');
        console.log(`User: ${existingUser.username}, New Role: admin`);
      } else {
        console.log('⚠️ User was already admin or update failed');
      }
    } else {
      console.log('❌ User "akdavid" not found (case-insensitive search)');
      
      // Let's list some users to help debug
      const allUsers = await users.find({}).limit(5).toArray();
      console.log('Available users:');
      allUsers.forEach(u => console.log(`- ${u.username} (${u.email})`));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateUserRole();