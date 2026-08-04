import { test, expect } from '@playwright/test';

test('home page loads and shows the welcome heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
});
