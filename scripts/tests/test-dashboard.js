// Test dashboard API directly
const testDashboardAPI = async () => {
  try {
    // First, we need to get a session
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      credentials: 'include',
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session data:', sessionData);
    
    // Now test the dashboard API
    const dashboardResponse = await fetch('http://localhost:3000/api/dashboard?period=week', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Dashboard response status:', dashboardResponse.status);
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard data:', JSON.stringify(dashboardData, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Note: Run this in the browser console when logged in
console.log('Copy and paste this into your browser console:');
console.log(testDashboardAPI.toString());
console.log('testDashboardAPI();');
