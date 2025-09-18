#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Web3 Tests for NORMALDANCE...\n');

try {
  // Run Web3 specific tests
  console.log('📋 Running Wallet Adapter Tests...');
  execSync('npm test -- tests/web3/wallet-adapter.test.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n📋 Running Staking Manager Tests...');
  execSync('npm test -- tests/web3/staking-manager.test.tsx', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n📋 Running NDT Manager Tests...');
  execSync('npm test -- tests/web3/ndt-manager.test.tsx', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n📋 Running NFT Memorial Tests...');
  execSync('npm test -- tests/web3/nft-memorial.test.tsx', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n📋 Running Donate Button Tests...');
  execSync('npm test -- tests/web3/donate-button.test.tsx', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ All Web3 tests completed successfully!');
  console.log('\n📊 Test Coverage Summary:');
  console.log('   • Wallet Adapter: Connection, transactions, error handling');
  console.log('   • Staking Manager: Tier validation, rewards calculation');
  console.log('   • NDT Manager: Token economics, deflationary model');
  console.log('   • NFT Memorial: Metadata creation, IPFS integration');
  console.log('   • Donate Button: Payment flow, validation, analytics');

} catch (error) {
  console.error('\n❌ Web3 tests failed:', error.message);
  process.exit(1);
}
