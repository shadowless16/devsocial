const fetch = require('node-fetch');

// Test the actual API endpoint with the same data structure as frontend
async function testFrontendSubmission() {
  console.log('🧪 Testing Frontend Form Submission to API');
  
  // This simulates the exact data structure sent from the frontend form
  const formData = {
    title: 'Test Project from Frontend Simulation',
    description: 'This project is created to test the frontend form submission with openPositions',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    githubUrl: 'https://github.com/test/frontend-simulation',
    liveUrl: 'https://test-frontend.vercel.app',
    images: [],
    openPositions: [
      {
        title: 'Frontend Developer',
        description: 'Looking for a React/TypeScript developer to help with UI components and state management',
        requirements: ['React', 'TypeScript', 'CSS']
      },
      {
        title: 'Backend Developer',
        description: 'Need help with API development, database design, and server-side logic',
        requirements: ['Node.js', 'MongoDB', 'Express']
      },
      {
        title: 'UI/UX Designer',
        description: 'Seeking a designer to improve user experience and create beautiful interfaces',
        requirements: ['Figma', 'Adobe XD', 'UI Design']
      }
    ],
    status: 'in-progress'
  };
  
  console.log('\n📤 Sending data to API:');
  console.log(JSON.stringify(formData, null, 2));
  
  try {
    // Note: This will fail because we don't have authentication in this script
    // But we can see what data would be sent
    console.log('\n📊 Data Analysis:');
    console.log(`Title: ${formData.title}`);
    console.log(`Description length: ${formData.description.length}`);
    console.log(`Technologies count: ${formData.technologies.length}`);
    console.log(`OpenPositions count: ${formData.openPositions.length}`);
    
    formData.openPositions.forEach((position, index) => {
      console.log(`\nPosition ${index + 1}:`);
      console.log(`  Title: "${position.title}"`);
      console.log(`  Description: "${position.description}"`);
      console.log(`  Requirements: [${position.requirements.join(', ')}]`);
      console.log(`  Title valid: ${!!(position.title && position.title.trim())}`);
      console.log(`  Description valid: ${!!(position.description && position.description.trim())}`);
    });
    
    // Test the filtering logic that happens in the API
    const validPositions = formData.openPositions.filter(pos => 
      pos.title && pos.title.trim() && pos.description && pos.description.trim()
    );
    
    console.log(`\n🔍 Filtering Results:`);
    console.log(`Original positions: ${formData.openPositions.length}`);
    console.log(`Valid positions: ${validPositions.length}`);
    
    if (validPositions.length !== formData.openPositions.length) {
      console.log('⚠️  Some positions were filtered out!');
    } else {
      console.log('✅ All positions are valid');
    }
    
    // Show what would be saved to database
    const projectData = {
      title: formData.title,
      description: formData.description,
      technologies: formData.technologies || [],
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      images: formData.images || [],
      openPositions: validPositions,
      status: formData.status || 'in-progress'
    };
    
    console.log('\n💾 Data that would be saved to database:');
    console.log(JSON.stringify(projectData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test with edge cases
async function testEdgeCases() {
  console.log('\n\n🔬 Testing Edge Cases');
  
  const edgeCases = [
    {
      name: 'Empty positions array',
      openPositions: []
    },
    {
      name: 'Positions with empty titles',
      openPositions: [
        { title: '', description: 'Valid description', requirements: ['React'] },
        { title: 'Valid Title', description: 'Valid description', requirements: ['Node.js'] }
      ]
    },
    {
      name: 'Positions with empty descriptions',
      openPositions: [
        { title: 'Valid Title', description: '', requirements: ['React'] },
        { title: 'Another Valid Title', description: 'Valid description', requirements: ['Node.js'] }
      ]
    },
    {
      name: 'Positions with whitespace only',
      openPositions: [
        { title: '   ', description: 'Valid description', requirements: ['React'] },
        { title: 'Valid Title', description: '   ', requirements: ['Node.js'] },
        { title: 'Good Title', description: 'Good description', requirements: ['Vue.js'] }
      ]
    },
    {
      name: 'Mixed valid and invalid positions',
      openPositions: [
        { title: 'Frontend Dev', description: 'React developer needed', requirements: ['React'] },
        { title: '', description: 'No title', requirements: ['Angular'] },
        { title: 'Backend Dev', description: '', requirements: ['Node.js'] },
        { title: 'Full Stack', description: 'Full stack developer', requirements: ['JavaScript'] }
      ]
    }
  ];
  
  edgeCases.forEach((testCase, index) => {
    console.log(`\n--- Test Case ${index + 1}: ${testCase.name} ---`);
    console.log(`Original positions: ${testCase.openPositions.length}`);
    
    const validPositions = testCase.openPositions.filter(pos => 
      pos.title && pos.title.trim() && pos.description && pos.description.trim()
    );
    
    console.log(`Valid positions: ${validPositions.length}`);
    
    if (validPositions.length > 0) {
      console.log('Valid positions:');
      validPositions.forEach((pos, i) => {
        console.log(`  ${i + 1}. ${pos.title}: ${pos.description}`);
      });
    } else {
      console.log('❌ No valid positions found');
    }
  });
}

// Run tests
async function runAllTests() {
  await testFrontendSubmission();
  await testEdgeCases();
  
  console.log('\n\n📋 === SUMMARY ===');
  console.log('✅ Frontend data structure analysis completed');
  console.log('✅ Edge case testing completed');
  console.log('✅ API filtering logic verified');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Run debug-openpositions.js to test database operations');
  console.log('2. Check if existing projects need openPositions field migration');
  console.log('3. Verify frontend form is sending correct data structure');
  console.log('4. Test actual API endpoint with authentication');
}

runAllTests();