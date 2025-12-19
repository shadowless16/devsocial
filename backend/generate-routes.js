/**
 * Route Generator Script
 * Automatically generates Express routes from Next.js routes
 * Usage: node generate-routes.js <category>
 * Example: node generate-routes.js feed
 */

const fs = require('fs');
const path = require('path');

const category = process.argv[2];

if (!category) {
  console.error('❌ Please specify a category');
  console.log('Usage: node generate-routes.js <category>');
  console.log('Example: node generate-routes.js feed');
  process.exit(1);
}

const NEXT_API_DIR = path.join(__dirname, '..', 'app', 'api', category);
const OUTPUT_FILE = path.join(__dirname, 'src', 'routes', `${category}.routes.ts`);

if (!fs.existsSync(NEXT_API_DIR)) {
  console.error(`❌ Category "${category}" not found in app/api/`);
  process.exit(1);
}

console.log(`🔄 Generating Express routes for: ${category}`);
console.log(`📂 Source: ${NEXT_API_DIR}`);
console.log(`📝 Output: ${OUTPUT_FILE}\n`);

// Scan all route files in the category
function scanRoutes(dir, basePath = '') {
  const routes = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Check if it's a dynamic route [param]
      const isDynamic = item.startsWith('[') && item.endsWith(']');
      const paramName = isDynamic ? item.slice(1, -1) : item;
      const newPath = isDynamic ? `${basePath}/:${paramName}` : `${basePath}/${item}`;
      
      routes.push(...scanRoutes(fullPath, newPath));
    } else if (item === 'route.ts') {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Extract methods
      const methods = [];
      if (content.includes('export async function GET')) methods.push('GET');
      if (content.includes('export async function POST')) methods.push('POST');
      if (content.includes('export async function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE')) methods.push('DELETE');
      if (content.includes('export async function PATCH')) methods.push('PATCH');
      
      // Check auth
      const requiresAuth = content.includes('authMiddleware') || content.includes('getSession');
      
      routes.push({
        path: basePath || '/',
        methods,
        requiresAuth,
        sourceFile: fullPath,
        content
      });
    }
  }
  
  return routes;
}

const routes = scanRoutes(NEXT_API_DIR);

console.log(`Found ${routes.length} route(s):\n`);
routes.forEach((route, i) => {
  console.log(`${i + 1}. ${route.methods.join(', ')} ${route.path} ${route.requiresAuth ? '🔒' : '🔓'}`);
});

// Generate Express route file
function generateExpressRouteFile(routes, category) {
  let code = `import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

`;

  routes.forEach(route => {
    route.methods.forEach(method => {
      const methodLower = method.toLowerCase();
      const authMiddlewareStr = route.requiresAuth ? ', authMiddleware' : '';
      
      code += `// ${method} /api/${category}${route.path}
router.${methodLower}('${route.path}'${authMiddlewareStr}, async (req: Request, res: Response) => {
  try {
    // TODO: Implement ${method} ${route.path}
    // Source: ${path.relative(path.join(__dirname, '..'), route.sourceFile)}
    
    res.json({
      success: true,
      message: 'Route not yet implemented',
      data: {}
    });
  } catch (error) {
    console.error('Error in ${method} ${route.path}:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

`;
    });
  });

  code += `export default router;\n`;
  
  return code;
}

const expressCode = generateExpressRouteFile(routes, category);

// Write to file
fs.writeFileSync(OUTPUT_FILE, expressCode);

console.log(`\n✅ Generated: ${OUTPUT_FILE}`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Open ${OUTPUT_FILE}`);
console.log(`   2. Implement each route handler`);
console.log(`   3. Copy business logic from Next.js route files`);
console.log(`   4. Add route to backend/src/server.ts:`);
console.log(`      import ${category}Routes from './routes/${category}.routes';`);
console.log(`      app.use('/api/${category}', ${category}Routes);`);
console.log(`   5. Test the routes`);
console.log(`   6. Update frontend to use backend API\n`);
