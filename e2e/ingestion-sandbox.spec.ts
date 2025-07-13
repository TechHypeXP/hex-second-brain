import { test, expect } from '@playwright/test';

test.describe('Ingestion Sandbox Workflow', () => {
  test('should allow submitting a URL for ingestion', async ({ page }) => {
    // 1. Navigate to Ingestion Sandbox page
    await page.goto('/sandbox');
    await expect(page).toHaveTitle(/Ingestion Sandbox/);

    // 2. Enter a URL
    const testUrl = 'https://example.com/test-article';
    await page.locator('input[type="text"]').fill(testUrl);
    await expect(page.locator('input[type="text"]')).toHaveValue(testUrl);

    // 3. Submit the URL
    await page.getByRole('button', { name: /Submit URL for Ingestion/i }).click();

    // 4. Check status and wait for job submission
    await expect(page.locator('div').filter({ hasText: 'URL successfully ingested!' }).first()).toBeVisible();
  });

  // Add tests for file upload and text input if the sandbox component is enhanced to support them
});
