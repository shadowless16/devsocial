const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function verifyPositionsSave() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('devsocial-frontend');
    const collection = db.collection('projects');
    
    // Test position data
    const testPosition = {
      title: 'Test Position',
      description: 'Test position for verification',
      requirements: ['JavaScript', 'React']
    };
    
    // Create test project with position
    const testProject = {
      title: 'Position Save Test',
      description: 'Testing position save functionality',
      openPositions: [testPosition],
      author: 'test-user'
    };
    
    const insertResult = await collection.insertOne(testProject);
    console.log('✓ Project created with ID:', insertResult.insertedId);
    
    // Verify position was saved correctly
    const savedProject = await collection.findOne({ _id: insertResult.insertedId });
    const savedPosition = savedProject.openPositions[0];
    
    console.log('✓ Position saved:', {
      title: savedPosition.title,
      description: savedPosition.description,
      requirements: savedPosition.requirements
    });
    
    // Verify data integrity
    const isValid = savedPosition.title === testPosition.title &&
                   savedPosition.description === testPosition.description &&
                   JSON.stringify(savedPosition.requirements) === JSON.stringify(testPosition.requirements);
    
    console.log(isValid ? '✓ Position data integrity verified' : '✗ Position data mismatch');
    
    // Cleanup
    await collection.deleteOne({ _id: insertResult.insertedId });
    console.log('✓ Test data cleaned up');
    
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
  } finally {
    await client.close();
  }
}

verifyPositionsSave();