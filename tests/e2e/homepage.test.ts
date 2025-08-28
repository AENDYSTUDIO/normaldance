import { test, expect } from '@playwright/test';

test('should display homepage', async ({ page }) => {
  await page.goto('/');
  
  // Проверяем, что страница загрузилась
  await expect(page).toHaveTitle(/NORMAL DANCE/);
  
  // Проверяем наличие ключевых элементов
  await expect(page.getByText('Добро пожаловать в NORMAL DANCE')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Начать слушать' })).toBeVisible();
});

test('should navigate to different sections', async ({ page }) => {
  await page.goto('/');
  
  // Проверяем навигацию
  await page.getByRole('link', { name: 'Тренды' }).click();
  await expect(page).toHaveURL(/.*trending/);
  
  await page.goBack();
  
  await page.getByRole('link', { name: 'Обзор' }).click();
  await expect(page).toHaveURL(/.*explore/);
});