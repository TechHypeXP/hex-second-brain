import { test, expect } from '@playwright/test';

test.describe('Debate Prep Workflow', () => {
  test('should allow uploading a document and checking dashboard', async ({ page }) => {
    // 1. Navigate to Debate Prep page
    await page.goto('/debate-prep');
    await expect(page).toHaveTitle(/Debate Prep/);

    // 2. Upload a file (using a placeholder file or a known test file if available)
    // For this example, we'll simulate uploading a text file.
    // In a real scenario, you'd have a test file.
    const testFilePath = './test.txt'; // Assuming test.txt exists in the root
    await page.locator('input[type="file"]').setInputFiles(testFilePath);
    await expect(page.locator('input[type="file"]')).toHaveValue(/test\.txt/);

    // 3. Submit the document
    await page.getByRole('button', { name: /Process Document/i }).click();

    // 4. Check status and wait for job submission
    await expect(page.locator('div[role="alert"]')).toContainText('Job submitted successfully');
    const jobId = await page.locator('div[role="alert"] p').textContent(); // Extract jobId if possible
    expect(jobId).not.toBeNull();

    // 5. Navigate to the Dashboard
    await page.locator('a', { hasText: 'Operational Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');

    // 6. Verify the job appears in the dashboard (this might require waiting for the worker to process)
    // For a basic test, we'll check if the dashboard loads and shows logs.
    // A more robust test would poll for the specific job status.
    await expect(page.locator('h1')).toContainText('Operational Dashboard');
    // We can't reliably check for the specific job without a running worker and a way to query it.
    // For now, we'll just check if logs are displayed.
    await expect(page.locator('table tbody tr')).toBeVisible();
  });

  // Add more tests for URL and Text input if needed
});
