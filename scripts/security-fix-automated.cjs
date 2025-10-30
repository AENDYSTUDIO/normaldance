#!/usr/bin/env node

/**
 * Automated Security Fix Script
 * 
 * This script automatically fixes known security vulnerabilities
 * by updating package versions to secure ones.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(msg) { log(`✓ ${msg}`, 'green'); }
function logWarning(msg) { log(`⚠ ${msg}`, 'yellow'); }
function logError(msg) { log(`✗ ${msg}`, 'red'); }
function logInfo(msg) { log(`ℹ ${msg}`, 'cyan'); }

log('\n========================================', 'cyan');
log('  Automated Security Fix', 'cyan');
log('========================================\n', 'cyan');

// Step 1: Run audit
logInfo('Step 1: Analyzing vulnerabilities...\n');

try {
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditOutput);
  
  logInfo(`Total vulnerabilities: ${audit.metadata.vulnerabilities.total}`);
  logWarning(`  Critical: ${audit.metadata.vulnerabilities.critical}`);
  logWarning(`  High: ${audit.metadata.vulnerabilities.high}`);
  logInfo(`  Moderate: ${audit.metadata.vulnerabilities.moderate}`);
  logInfo(`  Low: ${audit.metadata.vulnerabilities.low}`);
  
} catch (error) {
  logWarning('Could not parse audit output, continuing...');
}

// Step 2: Automatic fix
log('\n========================================', 'cyan');
logInfo('Step 2: Attempting automatic fixes...\n');

try {
  logInfo('Running: npm audit fix');
  execSync('npm audit fix', { stdio: 'inherit' });
  logSuccess('Automatic fixes applied!');
} catch (error) {
  logError('Automatic fix failed, trying with --force...');
  
  try {
    logWarning('Running: npm audit fix --force');
    logWarning('This may cause breaking changes!');
    execSync('npm audit fix --force', { stdio: 'inherit' });
    logSuccess('Force fixes applied!');
  } catch (forceError) {
    logError('Force fix also failed. Manual intervention required.');
  }
}

// Step 3: Verify
log('\n========================================', 'cyan');
logInfo('Step 3: Verification...\n');

try {
  const postAuditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const postAudit = JSON.parse(postAuditOutput);
  
  logInfo(`Remaining vulnerabilities: ${postAudit.metadata.vulnerabilities.total}`);
  
  if (postAudit.metadata.vulnerabilities.total === 0) {
    logSuccess('All vulnerabilities fixed! 🎉');
  } else {
    logWarning(`Still have ${postAudit.metadata.vulnerabilities.total} vulnerabilities`);
    logWarning(`  Critical: ${postAudit.metadata.vulnerabilities.critical}`);
    logWarning(`  High: ${postAudit.metadata.vulnerabilities.high}`);
  }
  
} catch (error) {
  logInfo('Verification completed');
}

// Step 4: Recommendations
log('\n========================================', 'cyan');
log('  Next Steps', 'cyan');
log('========================================\n', 'cyan');

logInfo('1. Test the application:');
console.log('   npm run dev');
logInfo('2. Run tests:');
console.log('   npm test');
logInfo('3. If everything works, commit:');
console.log('   git add package.json package-lock.json');
console.log('   git commit -m "security: fix vulnerabilities"');
console.log('   git push');

log('\n========================================\n', 'cyan');
logSuccess('Security fix process completed!');

process.exit(0);
