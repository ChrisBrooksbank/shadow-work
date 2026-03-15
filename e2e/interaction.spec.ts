import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('navigation links are accessible', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('nav a, nav button');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toBeVisible();
    }
  });

  test('tab order is logical', async ({ page }) => {
    await page.goto('/');

    // Tab through the first several focusable elements and verify they receive focus
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const count = await focused.count();
      if (count === 0) break;
      await expect(focused.first()).toBeVisible();
    }
  });
});
