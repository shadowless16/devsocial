const fs = require('fs');
const path = require('path');

// Find all dynamic route files
function findDynamicRoutes(dir) {
  const routes = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item.startsWith('[') && item.endsWith(']')) {
        // This is a dynamic route directory
        const routeFile = path.join(fullPath, 'route.ts');
        if (fs.existsSync(routeFile)) {
          routes.push(routeFile);
        }
        scanDir(fullPath);
      } else if (stat.isDirectory()) {
        scanDir(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return routes;
}

// Check if route file has Next.js 15 compatible params
function checkRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for old params pattern
  const oldParamsPattern = /{\s*params\s*}:\s*{\s*params:\s*{[^}]+}\s*}/g;
  const newParamsPattern = /{\s*params\s*}:\s*{\s*params:\s*Promise<{[^}]+}>\s*}/g;
  
  const oldMatches = content.match(oldParamsPattern);
  const newMatches = content.match(newParamsPattern);
  
  if (oldMatches && !newMatches) {
    issues.push({
      file: filePath,
      issue: 'Uses old params pattern, needs Promise<> wrapper',
      matches: oldMatches
    });
  }
  
  // Check for missing await params
  if (content.includes('const {') && content.includes('} = params') && !content.includes('await params')) {
    issues.push({
      file: filePath,
      issue: 'Missing await when destructuring params',
      line: content.split('\n').findIndex(line => line.includes('} = params')) + 1
    });
  }
  
  return issues;
}

// Main execution
const apiDir = path.join(__dirname, '..', 'app', 'api');
const dynamicRoutes = findDynamicRoutes(apiDir);

console.log(`Found ${dynamicRoutes.length} dynamic route files:`);

let totalIssues = 0;
for (const route of dynamicRoutes) {
  const issues = checkRouteFile(route);
  if (issues.length > 0) {
    console.log(`\n❌ ${route}:`);
    issues.forEach(issue => {
      console.log(`  - ${issue.issue}`);
      if (issue.line) console.log(`    Line: ${issue.line}`);
    });
    totalIssues += issues.length;
  } else {
    console.log(`✅ ${route}`);
  }
}

console.log(`\n${totalIssues === 0 ? '✅ All routes are Next.js 15 compatible!' : `❌ Found ${totalIssues} issues that need fixing`}`);
process.exit(totalIssues > 0 ? 1 : 0);