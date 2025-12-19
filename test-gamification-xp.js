// Simple test without JWT library - generate token manually or skip auth for testing
const userId = '68a438eefd6f004b767daf85'; // AkDavid's ID

const testData = {
  action: 'post_created',
  content: 'Testing XP award from microservice',
  refId: '507f1f77bcf86cd799439011'
};

console.log('Testing XP Award Endpoint (No Auth)\n');
console.log('User ID:', userId);
console.log('Request:', JSON.stringify(testData, null, 2));
console.log('\nNote: This will fail auth check. Testing endpoint availability...\n');

fetch('http://localhost:3001/api/gamification/award-xp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
  .then(res => res.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success === false && data.error === 'Unauthorized') {
      console.log('\n✅ Endpoint is working! (Auth required as expected)');
      console.log('   To test with auth, get a JWT token from Next.js login');
    } else if (data.success) {
      console.log('\n✅ XP Award Successful!');
      console.log(`   XP Awarded: ${data.xpAwarded}`);
    } else {
      console.log('\n⚠️ Unexpected response');
    }
  })
  .catch(err => {
    console.error('\n❌ Request Failed:', err.message);
  });
