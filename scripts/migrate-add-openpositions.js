const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function migrateProjects() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('devsocial-frontend');
    const collection = db.collection('projects');
    
    // Update all projects that don't have openPositions field
    const result = await collection.updateMany(
      { openPositions: { $exists: false } },
      { $set: { openPositions: [] } }
    );
    
    console.log(`Updated ${result.modifiedCount} projects with openPositions field`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('Migration completed');
  }
}

migrateProjects();