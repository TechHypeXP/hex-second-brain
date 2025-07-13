import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    // 1. Navigate to Home (assuming '/' maps to the main page)
    await page.goto('/');
    await expect(page).toHaveTitle(/Second Brain/); // Assuming title from layout.tsx

    // 2. Navigate to Debate Prep
    await page.locator('nav a', { hasText: 'Debate Prep' }).click();
    await expect(page).toHaveURL('/debate-prep');
    await expect(page.locator('h1')).toContainText('Debate Preparation');

    // 3. Navigate to Dashboard
    await page.locator('nav a', { hasText: 'Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Operational Dashboard');

    // 4. Navigate to Ingestion Sandbox
    await page.locator('nav a', { hasText: 'Ingestion Sandbox' }).click();
    await expect(page).toHaveURL('/sandbox');
    await expect(page.locator('h1')).toContainText('Ingestion Sandbox');

    // 5. Navigate back to Home (or any other page to confirm navigation works both ways)
    await page.locator('nav a', { hasText: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Second Brain'); // Assuming a home page title
  });
});
