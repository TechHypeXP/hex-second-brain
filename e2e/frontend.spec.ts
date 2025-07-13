import { test, expect } from '@playwright/test';

const browserOptions = { headless: false, viewport: { width: 1280, height: 720 } };

test.describe('Frontend QA Test', () => {
  test.setTimeout(90000); // Increase timeout to 90 seconds
  test.beforeEach(async ({ page, browser }) => {
    const context = await browser.newContext({ ...browserOptions });
    const visiblePage = await context.newPage();
    let retries = 3;
    while (retries > 0) {
      try {
        await visiblePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }
    await visiblePage.screenshot({ path: 'debug-initial.png' });
    console.log('Debug: Initial page screenshot saved as debug-initial.png');
  });

  test('should navigate to Debate Prep and display elements', async ({ page }) => {
    await expect(page).toHaveScreenshot();
    console.log('Debug: Waiting for Debate Prep button...');
await page.waitForSelector('text=Debate Prep', { state: 'visible', timeout: 60000 });
console.log('Debug: Debate Prep button is visible.');
await page.screenshot({ path: 'debug-debate-prep.png' });
await page.click('text=Debate Prep');
    await expect(page.locator('h1:has-text("Debate Prep")')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('button:has-text("Upload File")')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter article URL"]')).toBeVisible();
    await expect(page.locator('button:has-text("Submit URL")')).toBeVisible();
  });

  test('should navigate to Operational Dashboard and display elements', async ({ page }) => {
    await expect(page).toHaveScreenshot();
    console.log('Debug: Waiting for Operational Dashboard button...');
await page.waitForSelector('text=Operational Dashboard', { state: 'visible', timeout: 60000 });
console.log('Debug: Operational Dashboard button is visible.');
await page.screenshot({ path: 'debug-operational-dashboard.png' });
await page.click('text=Operational Dashboard');
    await expect(page.locator('h1:has-text("Operational Dashboard")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Task Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Start Time")')).toBeVisible();
  });

  test('should navigate to Interactive Report and display elements', async ({ page }) => {
    await expect(page).toHaveScreenshot({ fullPage: true });
    console.log('Debug: Waiting for Interactive Report button...');
await page.waitForSelector('text=Interactive Report', { state: 'visible', timeout: 60000 });
console.log('Debug: Interactive Report button is visible.');
await page.screenshot({ path: 'debug-interactive-report.png' });
await page.click('text=Interactive Report');
    await expect(page.locator('h1:has-text("Analysis Report")')).toBeVisible();
    await expect(page.locator('p:has-text("Loading report...")')).toBeVisible(); // Initial state
  });

  test('should navigate to Ingestion Sandbox and display elements', async ({ page }) => {
    await expect(page).toHaveScreenshot({ fullPage: true });
    console.log('Debug: Waiting for Ingestion Sandbox button...');
await page.waitForSelector('text=Ingestion Sandbox', { state: 'visible', timeout: 60000 });
console.log('Debug: Ingestion Sandbox button is visible.');
await page.screenshot({ path: 'debug-ingestion-sandbox.png' });
await page.click('text=Ingestion Sandbox');
    await expect(page.locator('h1:has-text("Ingestion Sandbox")')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter URL for ingestion"]')).toBeVisible();
    await expect(page.locator('button:has-text("Submit URL for Ingestion")')).toBeVisible();
  });

  test('should submit URL in Ingestion Sandbox', async ({ page }) => {
    await expect(page).toHaveScreenshot({ fullPage: true });
    await page.click('button:has-text("Ingestion Sandbox")');
    const urlInput = page.locator('input[placeholder="Enter URL for ingestion"]');
    await urlInput.fill('https://example.com/test-article');
    console.log('Debug: Waiting for Submit URL for Ingestion button...');
await page.waitForSelector('text=Submit URL for Ingestion', { state: 'visible', timeout: 60000 });
console.log('Debug: Submit URL for Ingestion button is visible.');
await page.screenshot({ path: 'debug-submit-url.png' });
await page.click('text=Submit URL for Ingestion');
    // Expect a success message or a loading indicator, depending on the actual API response
    await expect(page.locator('div.bg-green-100, div.bg-red-100')).toBeVisible(); // Check for message div
  });
});
