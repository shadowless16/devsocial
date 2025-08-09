#!/usr/bin/env node

// Script to quickly toggle logging levels
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

function updateEnvFile(updates) {
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('Creating new .env.local file...');
  }

  // Update or add each environment variable
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}=${value}`;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, line);
    } else {
      envContent += `\n${line}`;
    }
  });

  fs.writeFileSync(envPath, envContent);
  console.log('Updated .env.local with logging preferences');
}

const command = process.argv[2];

switch (command) {
  case 'minimal':
    updateEnvFile({
      'NEXTAUTH_DEBUG': 'false',
      'LOG_API_CALLS': 'false',
      'LOG_MIDDLEWARE': 'false',
      'LOG_WEBSOCKET': 'false'
    });
    console.log('✅ Set to minimal logging');
    break;
    
  case 'debug':
    updateEnvFile({
      'NEXTAUTH_DEBUG': 'true',
      'LOG_API_CALLS': 'true',
      'LOG_MIDDLEWARE': 'true',
      'LOG_WEBSOCKET': 'true'
    });
    console.log('✅ Set to debug logging');
    break;
    
  default:
    console.log('Usage: node scripts/reduce-logs.js [minimal|debug]');
    console.log('  minimal - Reduce all logging to minimum');
    console.log('  debug   - Enable all logging for debugging');
}