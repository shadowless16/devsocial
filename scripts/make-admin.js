const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function makeUserAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // First, let's see what users exist
    const allUsers = await users.find({}).limit(10).toArray();
    console.log('Available users:');
    allUsers.forEach(u => console.log(`- Username: "${u.username}", Email: ${u.email}`));
    
    // Check current role first
    const currentUser = await users.findOne({ username: "AkDavid" });
    console.log(`Current role: ${currentUser.role || 'undefined'}`);
    
    const result = await users.updateOne(
      { username: "AkDavid" },
      { $set: { role: 'admin' } }
    );
    
    // Always show the final result
    const updatedUser = await users.findOne({ username: "AkDavid" });
    console.log(`✅ User: ${updatedUser.username}, Final Role: ${updatedUser.role}`);
    console.log(`Modified: ${result.modifiedCount > 0 ? 'Yes' : 'No (already admin)'}`);
    
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await client.close();
  }
}

makeUserAdmin();