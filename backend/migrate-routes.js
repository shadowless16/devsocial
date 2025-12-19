/**
 * Automated Route Migration Script
 * Converts Next.js API routes to Express routes
 */

const fs = require('fs');
const path = require('path');

const NEXT_API_DIR = path.join(__dirname, '..', 'app', 'api');
const BACKEND_ROUTES_DIR = path.join(__dirname, 'src', 'routes');

// Routes to skip (already migrated or not needed)
const SKIP_ROUTES = [
  'test-', 'debug', 'proxy-', 'well-known', 'mcp', 'health', 'docs'
];

// Route categories and their priority
const ROUTE_CATEGORIES = {
  // Priority 1: Core Features
  comments: { priority: 1, done: true },
  likes: { priority: 1, done: true },
  feed: { priority: 1, done: false },
  search: { priority: 1, done: false },
  tags: { priority: 1, done: false },
  trending: { priority: 1, done: false },
  
  // Priority 2: User Features
  profile: { priority: 2, done: false },
  dashboard: { priority: 2, done: true },
  referrals: { priority: 2, done: false },
  upload: { priority: 2, done: false },
  
  // Priority 3: Social
  messages: { priority: 3, done: false },
  communities: { priority: 3, done: false },
  projects: { priority: 3, done: false },
  polls: { priority: 3, done: false },
  feedback: { priority: 3, done: false },
  
  // Priority 4: Gamification
  challenges: { priority: 4, done: false },
  
  // Priority 5: Learning
  'career-paths': { priority: 5, done: false },
  'knowledge-bank': { priority: 5, done: false },
  
  // Priority 6: AI
  ai: { priority: 6, done: false },
  
  // Priority 7: Admin
  admin: { priority: 7, done: false },
  mod: { priority: 7, done: false },
  reports: { priority: 7, done: false },
  
  // Priority 8: System
  cron: { priority: 8, done: false },
  affiliations: { priority: 8, done: false },
  'link-preview': { priority: 8, done: false },
  'save-avatar': { priority: 8, done: false },
  'xp-overtakes': { priority: 8, done: false }
};

function scanNextJSRoutes() {
  const routes = [];
  
  function scanDir(dir, category = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const newCategory = category || item;
        scanDir(fullPath, newCategory);
      } else if (item === 'route.ts') {
        const relativePath = path.relative(NEXT_API_DIR, dir);
        const routeCategory = relativePath.split(path.sep)[0];
        
        // Skip certain routes
        if (SKIP_ROUTES.some(skip => routeCategory.startsWith(skip))) {
          continue;
        }
        
        routes.push({
          category: routeCategory,
          path: relativePath,
          fullPath: fullPath,
          priority: ROUTE_CATEGORIES[routeCategory]?.priority || 9,
          done: ROUTE_CATEGORIES[routeCategory]?.done || false
        });
      }
    }
  }
  
  scanDir(NEXT_API_DIR);
  return routes.sort((a, b) => a.priority - b.priority);
}

function generateExpressRoute(nextJSRoute) {
  const content = fs.readFileSync(nextJSRoute.fullPath, 'utf-8');
  
  // Extract HTTP methods
  const methods = [];
  if (content.includes('export async function GET')) methods.push('GET');
  if (content.includes('export async function POST')) methods.push('POST');
  if (content.includes('export async function PUT')) methods.push('PUT');
  if (content.includes('export async function DELETE')) methods.push('DELETE');
  if (content.includes('export async function PATCH')) methods.push('PATCH');
  
  // Check if auth is required
  const requiresAuth = content.includes('authMiddleware') || content.includes('getSession');
  
  // Extract route parameters
  const params = nextJSRoute.path.match(/\[([^\]]+)\]/g) || [];
  const paramNames = params.map(p => p.replace(/[\[\]]/g, ''));
  
  return {
    methods,
    requiresAuth,
    params: paramNames,
    category: nextJSRoute.category
  };
}

function createMigrationReport() {
  console.log('🔍 Scanning Next.js API routes...\n');
  
  const routes = scanNextJSRoutes();
  
  console.log(`📊 Found ${routes.length} routes to migrate\n`);
  console.log('=' .repeat(80));
  
  const byPriority = {};
  routes.forEach(route => {
    if (!byPriority[route.priority]) {
      byPriority[route.priority] = [];
    }
    byPriority[route.priority].push(route);
  });
  
  Object.keys(byPriority).sort().forEach(priority => {
    const priorityRoutes = byPriority[priority];
    const done = priorityRoutes.filter(r => r.done).length;
    const total = priorityRoutes.length;
    
    console.log(`\n📌 Priority ${priority} (${done}/${total} done)`);
    console.log('-'.repeat(80));
    
    const byCategory = {};
    priorityRoutes.forEach(route => {
      if (!byCategory[route.category]) {
        byCategory[route.category] = [];
      }
      byCategory[route.category].push(route);
    });
    
    Object.keys(byCategory).sort().forEach(category => {
      const categoryRoutes = byCategory[category];
      const status = categoryRoutes[0].done ? '✅' : '⏳';
      console.log(`  ${status} ${category} (${categoryRoutes.length} routes)`);
      
      categoryRoutes.forEach(route => {
        const routeInfo = generateExpressRoute(route);
        const methodStr = routeInfo.methods.join(', ');
        const authStr = routeInfo.requiresAuth ? '🔒' : '🔓';
        console.log(`     ${authStr} ${methodStr.padEnd(20)} /${route.path}`);
      });
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📈 Summary:`);
  console.log(`   Total routes: ${routes.length}`);
  console.log(`   Completed: ${routes.filter(r => r.done).length}`);
  console.log(`   Remaining: ${routes.filter(r => !r.done).length}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the migration report above`);
  console.log(`   2. Start with Priority 1 routes (Core Features)`);
  console.log(`   3. Run: node backend/generate-routes.js <category>`);
  console.log(`   4. Test each route before moving to next category\n`);
}

// Run the report
createMigrationReport();
