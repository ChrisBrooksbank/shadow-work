import { test, expect } from '@playwright/test';

test('homepage screenshot baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
