import { test, expect } from '@playwright/test';

test.describe('Admin CMS Panel Smoke Tests', () => {
  // Login helper to set up session
  test.beforeEach(async ({ page, context }) => {
    // Reset IP blocks before attempting login
    try {
      await page.request.post('/api/auth/reset-ip');
    } catch (err) {
      console.warn('Failed to reset IP block:', err);
    }

    await page.goto('/admin/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'iskcon123');
    await page.click('button[type="submit"]');
    
    // Wait for the URL to contain /admin and wait for the header to load
    await page.waitForURL('**/admin');
    await expect(page.locator('h1.text-xl:has-text("Admin")')).toBeVisible();
    
    // Set token in localStorage if it needs to be populated
    const token = await page.evaluate(() => localStorage.getItem('iskcon_admin_token'));
    console.log('Logged in successfully. URL:', page.url(), 'Local token:', token ? 'exists' : 'missing');
    
    const cookies = await context.cookies();
    console.log('Cookies after login:', cookies.map(c => `${c.name}=${c.value}`));
  });

  test('should load Homepage Editor', async ({ page }) => {
    await page.goto('/admin/homepage-editor');
    await expect(page.locator('h1.text-3xl')).toHaveText('Homepage Editor');
    await expect(page.locator('input[name="heroTitle"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should load Banner Management', async ({ page }) => {
    await page.goto('/admin/banner-management');
    await expect(page.locator('h1.text-3xl')).toHaveText('Notice Banner Management');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=Active Banner')).toBeVisible();
  });

  test('should load News Management', async ({ page }) => {
    await page.goto('/admin/news');
    await expect(page.locator('h1.text-3xl')).toHaveText('News Feed Management');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Annual Ratha Yatra Festival Dates Announced')).toBeVisible();
  });

  test('should load Festival Announcements', async ({ page }) => {
    await page.goto('/admin/festivals');
    await expect(page.locator('h1.text-3xl')).toHaveText('Festival Announcements');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Sri Krishna Janmashtami')).toBeVisible();
  });

  test('should load Video Library', async ({ page }) => {
    await page.goto('/admin/video-library');
    await expect(page.locator('h1.text-3xl')).toHaveText('Video Library');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Janmashtami 2025 Maha Abhishek Darshan')).toBeVisible();
  });

  test('should load Blog Management', async ({ page }) => {
    await page.goto('/admin/blog');
    await expect(page.locator('h1.text-3xl')).toHaveText('Blog Management');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Understanding Karma: The Law of Action and Reaction')).toBeVisible();
  });

  test('should load Prabhupada Quotes Management', async ({ page }) => {
    await page.goto('/admin/quotes');
    await expect(page.locator('h1.text-3xl')).toHaveText('Prabhupada Quotes');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=Brahmacārī life is meant for following the rules')).toBeVisible();
  });

  test('should load Bhajans Management', async ({ page }) => {
    await page.goto('/admin/bhajans');
    await expect(page.locator('h1.text-3xl')).toHaveText('Bhajan Kutir Songbook');
    await expect(page.locator('input[placeholder*="Search bhajans"]')).toBeVisible();
  });
});
