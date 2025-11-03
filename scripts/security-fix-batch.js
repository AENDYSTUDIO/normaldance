#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Batch security fixes
const fixes = [
  {
    pattern: /eval\(/g,
    replacement: '// SECURITY: eval() removed\nthrow new Error("Dynamic code execution not allowed"); // eval(',
    description: 'Remove eval() calls'
  },
  {
    pattern: /console\.(log|error|warn|info)\(/g,
    replacement: 'SecureLogger.$1(',
    description: 'Replace console with SecureLogger'
  },
  {
    pattern: /"[A-Za-z0-9]{32,}"/g,
    replacement: 'process.env.SECRET_KEY',
    description: 'Replace hardcoded secrets'
  }
];

function applyFixes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      changed = true;
      console.log(`✅ ${fix.description} in ${filePath}`);
    }
  });

  if (changed) {
    // Add SecureLogger import if needed
    if (content.includes('SecureLogger') && !content.includes('import { SecureLogger }')) {
      content = `import { SecureLogger } from '@/lib/security/secure-logger';\n${content}`;
    }
    fs.writeFileSync(filePath, content);
  }
}

// Process all TypeScript files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      applyFixes(filePath);
    }
  });
}

console.log('🔒 Starting security fixes...');
processDirectory('./src');
console.log('✅ Security fixes completed!');