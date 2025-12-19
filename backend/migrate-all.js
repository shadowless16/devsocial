/**
 * Migrate All Routes Script
 * Generates Express boilerplate for ALL remaining routes
 * Usage: node migrate-all.js [--priority=1] [--dry-run]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const priorityFilter = args.find(arg => arg.startsWith('--priority='))?.split('=')[1];
const dryRun = args.includes('--dry-run');

const ROUTE_CATEGORIES = {
  // Priority 1
  feed: { priority: 1, done: false },
  search: { priority: 1, done: false },
  tags: { priority: 1, done: false },
  trending: { priority: 1, done: false },
  
  // Priority 2
  profile: { priority: 2, done: false },
  referrals: { priority: 2, done: false },
  upload: { priority: 2, done: false },
  
  // Priority 3
  messages: { priority: 3, done: false },
  communities: { priority: 3, done: false },
  projects: { priority: 3, done: false },
  polls: { priority: 3, done: false },
  feedback: { priority: 3, done: false },
  
  // Priority 4
  challenges: { priority: 4, done: false },
  
  // Priority 5
  'career-paths': { priority: 5, done: false },
  'knowledge-bank': { priority: 5, done: false },
  
  // Priority 6
  ai: { priority: 6, done: false },
  
  // Priority 7
  admin: { priority: 7, done: false },
  mod: { priority: 7, done: false },
  reports: { priority: 7, done: false },
  
  // Priority 8
  cron: { priority: 8, done: false },
  affiliations: { priority: 8, done: false },
  'link-preview': { priority: 8, done: false },
  'save-avatar': { priority: 8, done: false },
  'xp-overtakes': { priority: 8, done: false }
};

console.log('🚀 Migrate All Routes Script\n');

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be generated\n');
}

if (priorityFilter) {
  console.log(`📌 Filtering by Priority ${priorityFilter}\n`);
}

const categoriesToMigrate = Object.entries(ROUTE_CATEGORIES)
  .filter(([_, info]) => !info.done)
  .filter(([_, info]) => !priorityFilter || info.priority === parseInt(priorityFilter))
  .sort((a, b) => a[1].priority - b[1].priority);

console.log(`Found ${categoriesToMigrate.length} categories to migrate:\n`);

const byPriority = {};
categoriesToMigrate.forEach(([category, info]) => {
  if (!byPriority[info.priority]) {
    byPriority[info.priority] = [];
  }
  byPriority[info.priority].push(category);
});

Object.keys(byPriority).sort().forEach(priority => {
  console.log(`Priority ${priority}:`);
  byPriority[priority].forEach(cat => {
    console.log(`  - ${cat}`);
  });
  console.log('');
});

if (dryRun) {
  console.log('✅ Dry run complete. Run without --dry-run to generate routes.\n');
  process.exit(0);
}

console.log('⚠️  This will generate route files for all categories above.');
console.log('⚠️  Existing files will NOT be overwritten.\n');

// Give user 3 seconds to cancel
console.log('Starting in 3 seconds... (Ctrl+C to cancel)');
setTimeout(() => {
  console.log('\n🔄 Generating routes...\n');
  
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  
  categoriesToMigrate.forEach(([category, info]) => {
    const outputFile = path.join(__dirname, 'src', 'routes', `${category}.routes.ts`);
    
    if (fs.existsSync(outputFile)) {
      console.log(`⏭️  Skipping ${category} (file exists)`);
      skipped++;
      return;
    }
    
    try {
      console.log(`📦 Generating ${category}...`);
      execSync(`node generate-routes.js ${category}`, { stdio: 'pipe' });
      console.log(`✅ ${category} generated`);
      generated++;
    } catch (error) {
      console.log(`❌ Failed to generate ${category}`);
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n✅ Route generation complete!`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Implement route logic in backend/src/routes/`);
  console.log(`   2. Add routes to backend/src/server.ts`);
  console.log(`   3. Test each route`);
  console.log(`   4. Update frontend to use backend\n`);
}, 3000);
