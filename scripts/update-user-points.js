// Quick script to update user points directly in MongoDB
// Usage: node scripts/update-user-points.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function updateUserPoints() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Find AkDavid user
    const user = await users.findOne({ 
      username: 'AkDavid'
    });
    
    if (user) {
      console.log(`Current points: ${user.points}`);
      
      // Add 1000 points (or set to specific amount)
      const newPoints = user.points + 1000; // Change this value as needed
      
      const result = await users.updateOne(
        { _id: user._id },
        { $set: { points: newPoints } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Points updated: ${user.points} → ${newPoints}`);
        
        // Verify the update
        const updatedUser = await users.findOne({ _id: user._id });
        console.log(`✅ Verified - Current points: ${updatedUser.points}`);
        console.log(`✅ Current level: ${updatedUser.level}`);
      } else {
        console.log('❌ Update failed');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateUserPoints();