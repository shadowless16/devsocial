// scripts/test-followers-api.ts
async function testFollowersAPI() {
  try {
    console.log('Testing followers API...');
    
    const response = await fetch('http://localhost:3000/api/users/_toxicszn_/followers?page=1&limit=20', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e: unknown) {
        console.error('JSON parse error:', e);
      }
    }
    
  } catch (error: unknown) {
    console.error('Test error:', error);
  }
}

testFollowersAPI();