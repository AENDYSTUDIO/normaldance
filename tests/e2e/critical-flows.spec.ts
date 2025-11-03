import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('User can connect wallet and play music', async ({ page }) => {
    await page.goto('/');
    
    // Connect wallet
    await page.click('[data-testid="connect-wallet"]');
    await page.click('[data-testid="phantom-wallet"]');
    
    // Play music
    await page.click('[data-testid="play-button"]');
    await expect(page.locator('[data-testid="audio-player"]')).toBeVisible();
  });

  test('Artist can upload track', async ({ page }) => {
    await page.goto('/upload');
    
    await page.fill('[data-testid="track-title"]', 'Test Track');
    await page.setInputFiles('[data-testid="audio-file"]', 'test-audio.mp3');
    await page.click('[data-testid="upload-button"]');
    
    await expect(page.locator('text=Upload successful')).toBeVisible();
  });

  test('Payment flow works correctly', async ({ page }) => {
    await page.goto('/tracks/1');
    
    await page.click('[data-testid="buy-button"]');
    await page.click('[data-testid="solana-pay"]');
    
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
  });
});