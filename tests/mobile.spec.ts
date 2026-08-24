import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 12'], // Use mobile viewport configuration (390x844)
});

test.describe('Mobile Responsiveness and Usability Tests', () => {
  test('should load homepage on mobile and hide desktop navigation', async ({ page }) => {
    await page.goto('/');

    // Desktop navigation links should be hidden on mobile viewports
    const desktopNav = page.locator('nav.hidden.lg\\:flex');
    await expect(desktopNav).not.toBeVisible();

    // Mobile menu trigger button (hamburger icon) should be visible
    const mobileMenuBtn = page.locator('button.text-2xl.text-gray-800');
    await expect(mobileMenuBtn).toBeVisible();
  });

  test('should open and close the mobile navigation menu drawer', async ({ page }) => {
    await page.goto('/');

    const mobileMenuBtn = page.locator('button.text-2xl.text-gray-800');
    const mobileMenuDrawer = page.locator('.lg\\:hidden.bg-white');

    // Drawer should initially not be visible or present
    await expect(mobileMenuDrawer).not.toBeVisible();

    // Click hamburger button to open drawer
    await mobileMenuBtn.click();
    await page.waitForTimeout(500); // Wait for Framer Motion animation transition
    await expect(mobileMenuDrawer).toBeVisible();

    // Verify key menu items inside mobile drawer are visible (scoping queries to mobileMenuDrawer)
    await expect(mobileMenuDrawer.locator('a', { hasText: 'Home' }).first()).toBeVisible();
    await expect(mobileMenuDrawer.locator('button', { hasText: 'Spiritual Life' }).first()).toBeVisible();

    // Click close icon button to close drawer
    await mobileMenuBtn.click();
    await page.waitForTimeout(500); // Wait for transition
    await expect(mobileMenuDrawer).not.toBeVisible();
  });

  test('should verify mobile stacking on grid layout pages', async ({ page }) => {
    await page.goto('/get-involved');

    // Select the main grid on get-involved page and verify it uses grid-cols-1
    const gridLayout = page.locator('main .grid').first();
    await expect(gridLayout).toBeVisible();
    await expect(gridLayout).toHaveClass(/grid-cols-1/);

    const cards = page.locator('main .bg-white.p-8.rounded-xl');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify each card spans the full width of the mobile container (approximate check)
    const cardBoundingBox = await cards.first().boundingBox();
    const viewportSize = page.viewportSize();
    if (cardBoundingBox && viewportSize) {
      expect(cardBoundingBox.width).toBeLessThan(viewportSize.width);
      expect(cardBoundingBox.width).toBeGreaterThan(viewportSize.width * 0.8); // Should occupy most of screen width
    }
  });
});
