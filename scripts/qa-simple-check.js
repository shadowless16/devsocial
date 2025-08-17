// Simple QA check for imprint implementation
const fs = require('fs');
const path = require('path');

console.log('🔍 QA Check: Imprint Implementation Status\n');

const checks = [
  {
    name: 'Step 4: Post Model has imprint fields',
    check: () => {
      const postModel = fs.readFileSync('./models/Post.ts', 'utf8');
      return postModel.includes('imprintStatus') && 
             postModel.includes('onChainProof') && 
             postModel.includes('contentHash');
    }
  },
  {
    name: 'Step 4: Post creation includes hash generation',
    check: () => {
      const postRoute = fs.readFileSync('./app/api/posts/route.ts', 'utf8');
      return postRoute.includes('hashPost') && 
             postRoute.includes('imprintStatus: "pending"') &&
             postRoute.includes('enqueueImprintJob');
    }
  },
  {
    name: 'Step 7: Imprint worker exists',
    check: () => {
      return fs.existsSync('./workers/imprintWorker.ts');
    }
  },
  {
    name: 'Step 7: Imprint queue service exists',
    check: () => {
      return fs.existsSync('./services/imprintQueue.ts');
    }
  },
  {
    name: 'Step 8: Canonicalizer exists',
    check: () => {
      return fs.existsSync('./lib/canonicalizer.ts');
    }
  },
  {
    name: 'Step 10: Verify endpoint exists',
    check: () => {
      return fs.existsSync('./app/api/posts/verify/route.ts');
    }
  },
  {
    name: 'Step 11: PostMeta component exists',
    check: () => {
      return fs.existsSync('./components/shared/PostMeta.tsx');
    }
  },
  {
    name: 'Step 11: PostMeta integrated in post-card',
    check: () => {
      const postCard = fs.readFileSync('./components/post-card.tsx', 'utf8');
      return postCard.includes('PostMeta') && 
             postCard.includes('imprintStatus') &&
             postCard.includes('onChainProof');
    }
  },
  {
    name: 'Step 12: Unit tests exist',
    check: () => {
      return fs.existsSync('./__tests__/canonicalizer.test.ts') &&
             fs.existsSync('./__tests__/imprint-worker.test.ts') &&
             fs.existsSync('./__tests__/verify-endpoint.test.ts');
    }
  },
  {
    name: 'Step 13: Monitoring endpoint exists',
    check: () => {
      return fs.existsSync('./app/api/monitoring/imprint/route.ts');
    }
  },
  {
    name: 'Step 13: Worker has logging and metrics',
    check: () => {
      const worker = fs.readFileSync('./workers/imprintWorker.ts', 'utf8');
      return worker.includes('logger.info') && 
             worker.includes('imprintJobsProcessed') &&
             worker.includes('getImprintMetrics');
    }
  },
  {
    name: 'Step 14: Documentation exists',
    check: () => {
      return fs.existsSync('./docs/imprint-flow.md');
    }
  }
];

let passed = 0;
let total = checks.length;

checks.forEach((check, index) => {
  try {
    const result = check.check();
    if (result) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
    }
  } catch (error) {
    console.log(`❌ ${check.name} (Error: ${error.message})`);
  }
});

console.log(`\n📊 Summary: ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('🎉 All imprint implementation steps are complete!');
} else {
  console.log(`⚠️  ${total - passed} items need attention`);
}

// Additional file structure check
console.log('\n📁 Key Files Status:');
const keyFiles = [
  './models/Post.ts',
  './lib/canonicalizer.ts', 
  './workers/imprintWorker.ts',
  './services/imprintQueue.ts',
  './app/api/posts/verify/route.ts',
  './components/shared/PostMeta.tsx',
  './app/api/monitoring/imprint/route.ts',
  './docs/imprint-flow.md'
];

keyFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🔧 Test Commands Available:');
console.log('- npm test (runs all tests including imprint tests)');
console.log('- curl http://localhost:3000/api/monitoring/imprint (check metrics)');
console.log('- curl -X POST http://localhost:3000/api/posts/verify -d \'{"postId":"..."}\' (verify post)');