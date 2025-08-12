#!/usr/bin/env node

/**
 * Test script to verify signup functionality and avatar generation
 * Run with: node scripts/test-signup.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Signup and Avatar Generation Tests...\n');

const testCommands = [
  {
    name: 'Avatar Generator Tests',
    command: 'npm test __tests__/utils/avatar-generator.test.ts',
    description: 'Testing avatar generation utility functions'
  },
  {
    name: 'Signup API Tests', 
    command: 'npm test __tests__/auth/signup.test.ts',
    description: 'Testing signup API endpoint functionality'
  },
  {
    name: 'Avatar Setup Component Tests',
    command: 'npm test __tests__/components/avatar-setup.test.tsx',
    description: 'Testing avatar setup component in onboarding'
  },
  {
    name: 'Signup Flow Integration Tests',
    command: 'npm test __tests__/integration/signup-flow.test.ts',
    description: 'Testing complete signup user flow'
  }
];

let passedTests = 0;
let totalTests = testCommands.length;

for (const test of testCommands) {
  console.log(`\n📋 ${test.name}`);
  console.log(`   ${test.description}`);
  console.log(`   Running: ${test.command}\n`);
  
  try {
    execSync(test.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${test.name} - PASSED\n`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED\n`);
    console.error(`Error: ${error.message}\n`);
  }
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passedTests}/${totalTests} test suites passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! Signup functionality is working correctly.');
  console.log('\n✨ Features verified:');
  console.log('   • Signup success detection fixed');
  console.log('   • Avatar generation on signup');
  console.log('   • Gender-specific avatar generation');
  console.log('   • Avatar regeneration during onboarding');
  console.log('   • Upload button disabled with explanation');
  console.log('   • Comprehensive error handling');
} else {
  console.log('⚠️  Some tests failed. Please check the output above.');
  process.exit(1);
}

console.log('\n🚀 Ready for production deployment!');