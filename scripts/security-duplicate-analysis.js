#!/usr/bin/env node

// Script to analyze overlapping functions in security modules

import fs from 'fs';
import path from 'path';

// Function files to analyze
const securityFiles = [
  'src/lib/security/input-sanitizer.ts',
  'src/lib/security/input-validator.ts', 
  'src/lib/security/sanitize.ts',
  'src/lib/security/xss-csrf.ts'
];

// Extract function names from files
function extractFunctions(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const functions = [];
    
    // Match function exports and class methods
    const functionMatches = content.matchAll(/(?:export\s+)?function\s+(\w+)|static\s+(\w+)/g);
    
    for (const match of functionMatches) {
      const functionName = match[1] || match[2];
      if (functionName) {
        functions.push(functionName);
      }
    }
    
    // Match direct exports
    const exportMatches = content.matchAll(/export\s+\{[^}]*\}/g);
    for (const match of exportMatches) {
      const exportContent = match[0];
      const functionNames = exportContent.match(/\b(\w+)\b/g);
      if (functionNames) {
        functions.push(...functionNames.filter(name => name !== 'export'));
      }
    }
    
    return [...new Set(functions)];
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return [];
  }
}

// Analyze all files
console.log('=== Security Module Function Analysis ===\n');

const allFunctions = {};
const allFileFunctions = {};

for (const file of securityFiles) {
  const functions = extractFunctions(file);
  const fileName = path.basename(file);
  allFileFunctions[fileName] = functions;
  
  console.log(`${fileName}:`);
  console.log(functions.length > 0 ? functions.join(', ') : 'No functions found');
  console.log();
  
  functions.forEach(func => {
    if (!allFunctions[func]) {
      allFunctions[func] = [];
    }
    allFunctions[func].push(fileName);
  });
}

// Find duplicates
console.log('=== DUPLICATE FUNCTIONS ===\n');
let duplicateCount = 0;

for (const [funcName, files] of Object.entries(allFunctions)) {
  if (files.length > 1) {
    console.log(`${funcName}: found in ${files.join(', ')}`);
    duplicateCount++;
  }
}

if (duplicateCount === 0) {
  console.log('No duplicate functions found.\n');
} else {
  console.log(`\nFound ${duplicateCount} duplicate functions.`);
}

// Summary
console.log('\n=== SUMMARY ===\n');
console.log(`Total unique functions: ${Object.keys(allFunctions).length}`);
console.log(`Files analyzed: ${securityFiles.length}`);
console.log(`Duplicate functions: ${duplicateCount}`);

// Recommendation
console.log('\n=== RECOMMENDATIONS ===\n');

if (duplicateCount > 0) {
  console.log('1. Consolidate duplicate functions into sanitize.ts as primary location');
  console.log('2. Update index.ts to provide @deprecated aliases for compatibility');
  console.log('3. Remove duplicates from original files');
  console.log('4. Add comprehensive tests to ensure no breaking changes');
} else {
  console.log('No immediate action required - function names are unique.');
}
