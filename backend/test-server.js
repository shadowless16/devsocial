// Quick test to verify imports work
const path = require('path');

console.log('Testing imports...');
console.log('Post routes exists:', require('fs').existsSync(path.join(__dirname, 'src/routes/post.routes.ts')));
console.log('All route files:');
require('fs').readdirSync(path.join(__dirname, 'src/routes')).forEach(f => console.log('  -', f));
