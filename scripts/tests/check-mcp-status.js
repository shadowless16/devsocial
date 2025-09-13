#!/usr/bin/env node

// Quick MCP status checker
const http = require('http');

const checkMCPStatus = () => {
  const postData = JSON.stringify({
    tool: 'get_leaderboard',
    args: { limit: 1 }
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/mcp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ MCP Server is running and accessible');
        console.log('📊 Sample data:', JSON.parse(data)[0]?.username || 'No users found');
      } else {
        console.log('❌ MCP Server error:', res.statusCode);
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ MCP Server not accessible:', err.message);
    console.log('💡 Run: pnpm run dev:with-mcp');
  });

  req.write(postData);
  req.end();
};

checkMCPStatus();