import { test, expect } from '@playwright/test'

test.describe('Telegram Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Telegram WebApp environment
    await page.addInitScript(() => {
      window.Telegram = {
        WebApp: {
          ready: jest.fn(),
          expand: jest.fn(),
          close: jest.fn(),
          initData: {
            user: {
              id: 123456,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
            },
            query_id: '123456',
          },
          MainButton: {
            text: 'OPEN APP',
            color: '#007AFF',
          },
        }
      }
    })
    
    await page.goto('/telegram-app')
  })

  test('should initialize Telegram WebApp', async ({ page }) => {
    await page.goto('/telegram-app')
    
    // Should call ready
    await expect(page.evaluate(() => window.Telegram.WebApp.ready)).toHaveBeenCalled()
    
    // Should show user info
    const userInfo = page.locator('[data-testid="user-info"]')
    await expect(userInfo).toContainText('Test User')
    await expect(userInfo).toContainText('@testuser')
  })

  test('should handle main button click', async ({ page }) => {
    await page.goto('/telegram-app')
    
    const mainButton = page.locator('[data-testid="main-button"]')
    await expect(mainButton).toBeVisible()
    
    await mainButton.click()
    
    // Should expand app
    await expect(page.evaluate(() => window.Telegram.WebApp.expand)).toHaveBeenCalled()
  })

  test('should handle mini app navigation', async ({ page }) => {
    await page.goto('/telegram-app')
    
    // Mock expanded state
    await page.addInitScript(() => {
      window.Telegram.WebApp.isExpanded = true
    })
    
    const navItems = page.locator('[data-testid="nav-item"]')
    await expect(navItems).toHaveCount(3)
  })

  test('should handle back button', async ({ page }) => {
    await page.goto('/telegram-app')
    
    // Mock expanded state
    await page.addInitScript(() => {
      window.Telegram.WebApp.isExpanded = true
    })
    
    const backButton = page.locator('[data-testid="back-button"]')
    await expect(backButton).toBeVisible()
    
    await backButton.click()
    
    // Should call close
    await expect(page.evaluate(() => window.Telegram.WebApp.close)).toHaveBeenCalled()
  })

  test('should handle theme switching', async ({ page }) => {
    await page.goto('/telegram-app')
    
    const themeButton = page.locator('[data-testid="theme-toggle"]')
    await expect(themeButton).toBeVisible()
    
    await themeButton.click()
    
    // Should toggle theme
    await expect(page.evaluate(() => {
      const currentTheme = window.Telegram.WebApp.theme || 'light'
      return window.Telegram.WebApp.theme === 'light' ? 'dark' : 'light'
    })).toBe('dark')
  })

  test('should handle haptic feedback', async ({ page }) => {
    await page.goto('/telegram-app')
    
    const hapticButton = page.locator('[data-testid="haptic-button"]')
    await expect(hapticButton).toBeVisible()
    
    await hapticButton.click()
    
    // Should trigger haptic feedback
    await expect(page.evaluate(() => window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'))).toHaveBeenCalled()
  })

  test('should handle popup opening', async ({ page }) => {
    await page.goto('/telegram-app')
    
    const popupButton = page.locator('[data-testid="popup-button"]')
    await expect(popupButton).toBeVisible()
    
    await popupButton.click()
    
    // Should open popup
    await expect(page.evaluate(() => window.Telegram.WebApp.openPopup)).toHaveBeenCalled()
  })

  test('should handle QR code scanning', async ({ page }) => {
    await page.goto('/telegram-app')
    
    const qrButton = page.locator('[data-testid="qr-scan"]')
    await expect(qrButton).toBeVisible()
    
    await qrButton.click()
    
    // Should show scanner
    const scanner = page.locator('[data-testid="qr-scanner"]')
    await expect(scanner).toBeVisible()
  })

  test('should handle biometric authentication', async ({ page }) => {
    await page.goto('/telegram-app')
    
    const biometricButton = page.locator('[data-testid="biometric-auth"]')
    await expect(biometricButton).toBeVisible()
    
    await biometricButton.click()
    
    // Should trigger biometric prompt
    await expect(page.evaluate(() => window.Telegram.WebApp.requestBiometricAccess)).toHaveBeenCalled()
  })
})