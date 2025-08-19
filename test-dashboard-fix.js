// Test script to verify dashboard API fix
// Run this with: node test-dashboard-fix.js

const fetch = require('node-fetch');

async function testDashboardAPI() {
  try {
    console.log('Testing dashboard API...');
    
    // This should return 401 since we're not authenticated
    const response = await fetch('http://localhost:3000/api/dashboard?period=week');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.status === 401) {
      console.log('✅ Dashboard API correctly returns 401 for unauthenticated requests');
    } else {
      console.log('❌ Unexpected response status');
    }
    
  } catch (error) {
    console.error('Error testing dashboard API:', error.message);
  }
}

testDashboardAPI();