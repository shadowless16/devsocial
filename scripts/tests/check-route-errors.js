#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findRouteFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

function checkRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  
  // Check for old params pattern
  const oldParamsPattern = /params:\s*{\s*[^}]+\s*}/g;
  const promiseParamsPattern = /params:\s*Promise<\s*{\s*[^}]+\s*}\s*>/g;
  const awaitParamsPattern = /await\s+params/g;
  
  const hasOldParams = oldParamsPattern.test(content);
  const hasPromiseParams = promiseParamsPattern.test(content);
  const hasAwaitParams = awaitParamsPattern.test(content);
  
  if (hasOldParams && !hasPromiseParams) {
    errors.push('Uses old params type (should be Promise<{...}>)');
  }
  
  if (hasPromiseParams && !hasAwaitParams) {
    errors.push('Has Promise params but missing await');
  }
  
  return errors;
}

console.log('🔍 Scanning for Next.js 15 route parameter errors...\n');

const appDir = path.join(process.cwd(), 'app');
const routeFiles = findRouteFiles(appDir);

let totalErrors = 0;

for (const file of routeFiles) {
  const errors = checkRouteFile(file);
  
  if (errors.length > 0) {
    console.log(`❌ ${path.relative(process.cwd(), file)}`);
    errors.forEach(error => console.log(`   - ${error}`));
    console.log();
    totalErrors += errors.length;
  }
}

if (totalErrors === 0) {
  console.log('✅ No route parameter errors found!');
} else {
  console.log(`❌ Found ${totalErrors} error(s) in ${routeFiles.filter(f => checkRouteFile(f).length > 0).length} file(s)`);
  process.exit(1);
}