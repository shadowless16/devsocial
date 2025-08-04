const fs = require('fs');
const path = require('path');

const EXCLUDE = ['node_modules', '.git', '.next', 'dist', 'ui'];

function generateTree(dir, prefix = '') {
  const items = fs.readdirSync(dir).filter(item => !EXCLUDE.includes(item));
  let tree = '';

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const fullPath = path.join(dir, item);
    const isDir = fs.statSync(fullPath).isDirectory();

    tree += `${prefix}${isLast ? '└── ' : '├── '}${item}\n`;

    if (isDir) {
      tree += generateTree(fullPath, prefix + (isLast ? '    ' : '│   '));
    }
  });

  return tree;
}

const output = `# Project Structure\n\n\`\`\`\n${generateTree('./')}\n\`\`\`\n`;
fs.writeFileSync('social-dev-project-structure.md', output);

console.log('✅ social-dev-project-structure.md generated');
