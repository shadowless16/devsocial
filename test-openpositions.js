const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function testOpenPositions() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('devsocial-frontend');
    const collection = db.collection('projects');
    
    // Check if projects have openPositions field
    const projects = await collection.find({}).toArray();
    console.log('\n=== Projects with openPositions field ===');
    
    projects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}:`);
      console.log(`Title: ${project.title}`);
      console.log(`Has openPositions field: ${project.hasOwnProperty('openPositions')}`);
      console.log(`OpenPositions value:`, project.openPositions);
      console.log(`OpenPositions length: ${project.openPositions ? project.openPositions.length : 'N/A'}`);
    });
    
    // Test creating a project with openPositions
    console.log('\n=== Testing project creation with openPositions ===');
    const testProject = {
      title: 'Test Project with Positions',
      description: 'This is a test project to verify openPositions functionality',
      author: projects[0].author, // Use existing author
      technologies: ['React', 'Node.js'],
      openPositions: [
        {
          title: 'Frontend Developer',
          description: 'Looking for a React developer to help with UI components',
          requirements: ['React', 'JavaScript', 'CSS']
        },
        {
          title: 'Backend Developer', 
          description: 'Need help with API development and database design',
          requirements: ['Node.js', 'MongoDB', 'Express']
        }
      ],
      status: 'in-progress',
      visibility: 'public',
      likes: [],
      views: 0,
      viewedBy: [],
      featured: false
    };
    
    const result = await collection.insertOne(testProject);
    console.log('Test project created with ID:', result.insertedId);
    
    // Verify the test project was created correctly
    const createdProject = await collection.findOne({ _id: result.insertedId });
    console.log('Created project openPositions:', createdProject.openPositions);
    
    // Clean up - remove test project
    await collection.deleteOne({ _id: result.insertedId });
    console.log('Test project cleaned up');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await client.close();
    console.log('\nTest completed');
  }
}

testOpenPositions();