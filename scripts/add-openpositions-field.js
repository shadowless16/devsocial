const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function addOpenPositionsField() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('devsocial-frontend');
    const collection = db.collection('projects');
    
    // Find projects without openPositions field
    const projectsWithoutField = await collection.find({ 
      openPositions: { $exists: false } 
    }).toArray();
    
    console.log(`Found ${projectsWithoutField.length} projects without openPositions field`);
    
    if (projectsWithoutField.length > 0) {
      // Add empty openPositions array to projects that don't have it
      const result = await collection.updateMany(
        { openPositions: { $exists: false } },
        { $set: { openPositions: [] } }
      );
      
      console.log(`Updated ${result.modifiedCount} projects with openPositions field`);
    }
    
    // Verify all projects now have the field
    const allProjects = await collection.find({}).toArray();
    console.log('\n=== Verification ===');
    allProjects.forEach((project, index) => {
      console.log(`Project ${index + 1}: ${project.title}`);
      console.log(`Has openPositions: ${project.hasOwnProperty('openPositions')}`);
      console.log(`OpenPositions length: ${project.openPositions ? project.openPositions.length : 'N/A'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

addOpenPositionsField();