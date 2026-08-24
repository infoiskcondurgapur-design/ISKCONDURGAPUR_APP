import { test, expect } from '@playwright/test';

test.describe('Bhajans Sharing and Deep Linking Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Grant clipboard permissions to the browser context so we can read copied text
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  test('should load the bhajans list page', async ({ page }) => {
    await page.goto('/resources/bhajans');
    await expect(page.locator('h1')).toContainText('Vaishnava Bhajan Kutir');
    
    // Check that bhajan cards exist
    const cards = page.locator('main section.grid > div');
    await expect(cards.first()).toBeVisible();
  });

  test('should copy the share link to clipboard when clicking the share button', async ({ page, context }) => {
    await page.goto('/resources/bhajans');

    // Find the share button on the first card
    const firstCard = page.locator('main section.grid > div').first();
    const shareBtn = firstCard.locator('button[title="Share Bhajan"]');
    await expect(shareBtn).toBeVisible();

    // Click the share button
    await shareBtn.click();

    // Verify toast notification appears using text selector
    const toast = page.locator('text="Link copied to clipboard!"');
    await expect(toast).toBeVisible();

    // Read the copied clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/resources/bhajans?id=');
  });

  test('should deep link directly to a bhajan when id parameter is present', async ({ page }) => {
    // First, let's get a valid bhajan ID dynamically from the first card's share link
    await page.goto('/resources/bhajans');
    const firstCard = page.locator('main section.grid > div').first();
    
    // Get the title to compare later
    const expectedTitle = await firstCard.locator('h3').textContent();
    
    const shareBtn = firstCard.locator('button[title="Share Bhajan"]');
    await shareBtn.click();
    
    // Retrieve URL from clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clipboardText);
    const bhajanId = url.searchParams.get('id');
    expect(bhajanId).toBeTruthy();

    // Navigate directly using the extracted bhajan id
    await page.goto(`/resources/bhajans?id=${bhajanId}`);

    // Wait for the modal/overlay to open automatically
    // The overlay has the backdrop-blur-sm class
    const modal = page.locator('div.backdrop-blur-sm').first();
    await expect(modal).toBeVisible();

    // Verify modal contains the correct bhajan title
    await expect(modal.locator('h2')).toContainText(expectedTitle || '');

    // Close the modal
    const closeBtn = modal.locator('button').last();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });
});
