import { chromium, firefox, webkit } from '@playwright/test'

/**
 * Global teardown for E2E tests
 * Runs once after all tests
 */
async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...')
  
  try {
    // Cleanup test data
    delete process.env.TEST_USER_ID
    delete process.env.TEST_WALLET_ADDRESS
    delete process.env.TEST_TOKEN_CONTRACT
    delete process.env.TEST_SOL_TOKEN
    delete process.env.TEST_USDC_TOKEN
    delete process.env.TELEGRAM_WEBAPP
    delete process.env.TELEGRAM_INIT_DATA
    
    // Stop test server
    const { execSync } = require('child_process')
    
    try {
      execSync('pkill -f "npm run dev"', { stdio: 'pipe' })
      console.log('✅ Test server stopped')
    } catch (error) {
      // Server might not be running
      console.log('ℹ️ Test server was not running')
    }
    
    // Clean up test artifacts
    const fs = require('fs')
    const path = require('path')
    
    const reportDir = path.join(process.cwd(), 'playwright-report')
    if (fs.existsSync(reportDir)) {
      const files = fs.readdirSync(reportDir)
      for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg')) {
          // Keep screenshots for debugging
          continue
        }
        fs.unlinkSync(path.join(reportDir, file))
      }
    }
    
    console.log('✅ E2E test environment cleaned up')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    throw error
  }
}

export default globalTeardown