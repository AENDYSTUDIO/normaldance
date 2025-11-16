import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to home page', async ({ page }) => {
    await expect(page).toHaveTitle(/NORMALDANCE/)
    await expect(page.locator('h1')).toContainText('Welcome to NORMALDANCE')
  })

  test('should navigate to components section', async ({ page }) => {
    await page.click('text=Components')
    await expect(page).toHaveURL(/components/)
    await expect(page.locator('h1')).toContainText('Components')
  })

  test('should handle responsive navigation', async ({ page }) => {
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('text=Menu')
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should navigate to focused element
    await expect(page.url()).toMatch(/#/)
  })
})

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components')
  })

  test('should render button correctly', async ({ page }) => {
    await page.goto('/components')
    
    const button = page.locator('button', { name: /click me/i })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
    
    await button.click()
    await expect(button).toBeVisible()
  })

  test('should handle form submission', async ({ page }) => {
    await page.goto('/components')
    
    const input = page.locator('input[placeholder*="email"]')
    await input.fill('test@example.com')
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Check for success message or validation
    await expect(page.locator('[data-testid="form-message"]')).toBeVisible()
  })

  test('should handle modal interactions', async ({ page }) => {
    await page.goto('/components')
    
    const modalTrigger = page.locator('[data-testid="modal-trigger"]')
    await modalTrigger.click()
    
    const modal = page.locator('[data-testid="modal"]')
    await expect(modal).toBeVisible()
    
    const closeButton = page.locator('[data-testid="modal-close"]')
    await closeButton.click()
    
    await expect(modal).not.toBeVisible()
  })
})

test.describe('Web3 Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Web3 environment
    await page.addInitScript(() => {
      window.ethereum = {
        request: jest.fn(),
        enable: jest.fn(),
      }
      window.solana = {
        connect: jest.fn(),
        disconnect: jest.fn(),
      }
    })
    
    await page.goto('/')
  })

  test('should handle wallet connection', async ({ page }) => {
    const connectButton = page.locator('[data-testid="wallet-connect"]')
    await expect(connectButton).toBeVisible()
    
    await connectButton.click()
    
    // Should show wallet options
    const walletOptions = page.locator('[data-testid="wallet-options"]')
    await expect(walletOptions).toBeVisible()
  })

  test('should handle token swap', async ({ page }) => {
    await page.goto('/swap')
    
    const fromToken = page.locator('[data-testid="from-token"]')
    await fromToken.selectOption({ label: 'SOL' })
    
    const toToken = page.locator('[data-testid="to-token"]')
    await toToken.selectOption({ label: 'USDC' })
    
    const amountInput = page.locator('[data-testid="swap-amount"]')
    await amountInput.fill('10')
    
    const swapButton = page.locator('[data-testid="swap-button"]')
    await swapButton.click()
    
    // Should show loading state
    await expect(page.locator('[data-testid="swap-loading"]')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load page within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Performance budget: 3 seconds for initial load
    expect(loadTime).toBeLessThan(3000)
    
    // Check for large images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    // Should not have too many large images
    expect(imageCount).toBeLessThan(20)
  })

  test('should handle large page efficiently', async ({ page }) => {
    await page.goto('/components')
    
    // Monitor memory usage
    const metrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory,
        timing: (performance as any).timing,
      }
    })
    
    // Memory should not exceed 50MB
    expect(metrics.memory.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024)
  })
})

test.describe('Accessibility', () => {
  test('should be accessible via keyboard', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Check focus management
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/components')
    
    const button = page.locator('button')
    await expect(button).toHaveAttribute('aria-label')
    
    const form = page.locator('form')
    await expect(form).toHaveAttribute('aria-label')
  })

  test('should support screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading structure
    const main = page.locator('main')
    await expect(main).toHaveAttribute('role', 'main')
    
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })
})