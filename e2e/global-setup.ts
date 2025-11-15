import { chromium, firefox, webkit } from '@playwright/test'

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
async function globalSetup() {
  console.log('🔧 Setting up E2E test environment...')
  
  // Setup test database
  const { execSync } = require('child_process')
  
  try {
    // Start local test server if not running
    execSync('npm run dev > /dev/null 2>&1 &', { stdio: 'pipe' })
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('✅ Test environment ready')
    
    // Setup test data
    process.env.TEST_USER_ID = 'test-user-123'
    process.env.TEST_WALLET_ADDRESS = '11111111111111111111111112'
    process.env.TEST_TOKEN_CONTRACT = 'TokenKeypath'
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup