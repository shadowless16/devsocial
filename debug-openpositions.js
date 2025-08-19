const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function debugOpenPositions() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('devsocial-frontend');
    const projectsCollection = db.collection('projects');
    const usersCollection = db.collection('users');
    
    // 1. Check current state of all projects
    console.log('\n📊 === CURRENT PROJECT STATE ===');
    const allProjects = await projectsCollection.find({}).toArray();
    
    allProjects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}:`);
      console.log(`  ID: ${project._id}`);
      console.log(`  Title: ${project.title}`);
      console.log(`  Has openPositions: ${project.hasOwnProperty('openPositions')}`);
      console.log(`  OpenPositions: ${JSON.stringify(project.openPositions || 'undefined')}`);
      console.log(`  OpenPositions length: ${project.openPositions ? project.openPositions.length : 'N/A'}`);
    });
    
    // 2. Test creating a project with openPositions (simulating frontend)
    console.log('\n🧪 === TESTING PROJECT CREATION ===');
    
    // Get a user to use as author
    const testUser = await usersCollection.findOne({});
    if (!testUser) {
      console.log('❌ No users found in database. Cannot test project creation.');
      return;
    }
    
    console.log(`Using test user: ${testUser.username} (${testUser._id})`);
    
    // Simulate the exact data structure sent from frontend
    const frontendData = {
      title: 'Frontend Test Project',
      description: 'This project is created to test openPositions functionality from frontend simulation',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      githubUrl: 'https://github.com/test/frontend-test',
      liveUrl: 'https://frontend-test.vercel.app',
      images: [],
      openPositions: [
        {
          title: 'UI/UX Designer',
          description: 'Looking for a designer to help with user interface and experience design',
          requirements: ['Figma', 'Adobe XD', 'UI Design']
        },
        {
          title: 'React Developer',
          description: 'Need a React developer to help with component development',
          requirements: ['React', 'TypeScript', 'CSS']
        }
      ],
      status: 'in-progress'
    };
    
    // Filter out empty positions (same logic as API)
    const validPositions = (frontendData.openPositions || []).filter(pos => 
      pos.title && pos.title.trim() && pos.description && pos.description.trim()
    );
    
    console.log(`\n📝 Filtered positions: ${validPositions.length} valid positions`);
    validPositions.forEach((pos, i) => {
      console.log(`  Position ${i + 1}: ${pos.title} - ${pos.description.substring(0, 50)}...`);
    });
    
    const projectData = {
      title: frontendData.title,
      description: frontendData.description,
      technologies: frontendData.technologies || [],
      githubUrl: frontendData.githubUrl,
      liveUrl: frontendData.liveUrl,
      images: frontendData.images || [],
      openPositions: validPositions,
      status: frontendData.status || 'in-progress',
      author: testUser._id,
      visibility: 'public',
      likes: [],
      views: 0,
      viewedBy: [],
      featured: false,
      createdAt: new Date()
    };
    
    console.log('\n📤 Creating project with data:');
    console.log(JSON.stringify(projectData, null, 2));
    
    const result = await projectsCollection.insertOne(projectData);
    console.log(`\n✅ Project created with ID: ${result.insertedId}`);
    
    // 3. Verify the created project
    const createdProject = await projectsCollection.findOne({ _id: result.insertedId });
    console.log('\n🔍 === VERIFICATION ===');
    console.log(`Created project openPositions: ${JSON.stringify(createdProject.openPositions, null, 2)}`);
    console.log(`OpenPositions count: ${createdProject.openPositions.length}`);
    
    // 4. Test API endpoint simulation
    console.log('\n🌐 === API ENDPOINT SIMULATION ===');
    
    // Simulate what happens in the API route
    const apiBody = {
      title: 'API Test Project',
      description: 'Testing API route logic',
      technologies: ['Node.js', 'Express', 'MongoDB'],
      githubUrl: '',
      liveUrl: '',
      images: [],
      openPositions: [
        {
          title: 'Backend Developer',
          description: 'Need help with API development',
          requirements: ['Node.js', 'Express', 'MongoDB']
        },
        {
          title: '', // This should be filtered out
          description: 'Empty title position',
          requirements: ['Test']
        },
        {
          title: 'DevOps Engineer',
          description: '', // This should be filtered out
          requirements: ['Docker', 'AWS']
        }
      ],
      status: 'planning'
    };
    
    // Apply the same filtering logic as the API
    const apiValidPositions = (apiBody.openPositions || []).filter(pos => 
      pos.title && pos.title.trim() && pos.description && pos.description.trim()
    );
    
    console.log(`Original positions: ${apiBody.openPositions.length}`);
    console.log(`Valid positions after filtering: ${apiValidPositions.length}`);
    
    const apiProjectData = {
      title: apiBody.title,
      description: apiBody.description,
      technologies: apiBody.technologies || [],
      githubUrl: apiBody.githubUrl,
      liveUrl: apiBody.liveUrl,
      images: apiBody.images || [],
      openPositions: apiValidPositions,
      status: apiBody.status || 'in-progress',
      author: testUser._id,
      visibility: 'public',
      likes: [],
      views: 0,
      viewedBy: [],
      featured: false,
      createdAt: new Date()
    };
    
    const apiResult = await projectsCollection.insertOne(apiProjectData);
    console.log(`\n✅ API simulation project created with ID: ${apiResult.insertedId}`);
    
    const apiCreatedProject = await projectsCollection.findOne({ _id: apiResult.insertedId });
    console.log(`API project openPositions: ${JSON.stringify(apiCreatedProject.openPositions, null, 2)}`);
    
    // 5. Fix existing projects by adding sample positions
    console.log('\n🔧 === FIXING EXISTING PROJECTS ===');
    
    const projectsWithoutPositions = await projectsCollection.find({
      $or: [
        { openPositions: { $exists: false } },
        { openPositions: { $size: 0 } }
      ]
    }).toArray();
    
    console.log(`Found ${projectsWithoutPositions.length} projects without openPositions`);
    
    for (const project of projectsWithoutPositions.slice(0, 3)) { // Fix first 3 projects
      const samplePositions = [
        {
          title: 'Full Stack Developer',
          description: `Looking for a developer to help with ${project.title}. Join our team and contribute to this exciting project!`,
          requirements: project.technologies?.slice(0, 3) || ['JavaScript', 'React', 'Node.js']
        }
      ];
      
      await projectsCollection.updateOne(
        { _id: project._id },
        { $set: { openPositions: samplePositions } }
      );
      
      console.log(`✅ Fixed project: ${project.title}`);
    }
    
    // 6. Final verification
    console.log('\n📋 === FINAL STATE ===');
    const finalProjects = await projectsCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray();
    
    finalProjects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}: ${project.title}`);
      console.log(`  OpenPositions count: ${project.openPositions?.length || 0}`);
      if (project.openPositions && project.openPositions.length > 0) {
        project.openPositions.forEach((pos, i) => {
          console.log(`    ${i + 1}. ${pos.title}: ${pos.description.substring(0, 50)}...`);
        });
      }
    });
    
    // Clean up test projects
    console.log('\n🧹 === CLEANUP ===');
    await projectsCollection.deleteMany({
      title: { $in: ['Frontend Test Project', 'API Test Project'] }
    });
    console.log('✅ Test projects cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔚 Test completed');
  }
}

debugOpenPositions();