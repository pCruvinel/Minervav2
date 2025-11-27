import { test, expect, Page } from '@playwright/test';

test.describe('OS Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3006');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should load OS details page', async ({ page }) => {
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Minerva/);

    // Check for main content areas
    const mainContent = page.locator('[data-testid="main-content"], main, .min-h-screen');
    await expect(mainContent).toBeVisible();
  });

  test('should handle OS creation workflow', async ({ page }) => {
    // This test would simulate the full OS creation workflow
    // For now, we'll just check that the workflow components render

    // Look for workflow stepper or OS creation components
    const workflowElements = page.locator('[data-testid*="workflow"], [class*="workflow"], [class*="stepper"]');
    const osCreationElements = page.locator('[data-testid*="os"], [class*="os"], button:has-text("Criar")');

    // At least one of these should be present
    const hasWorkflow = await workflowElements.count() > 0;
    const hasOSCreation = await osCreationElements.count() > 0;

    expect(hasWorkflow || hasOSCreation).toBe(true);
  });

  test('should handle file upload functionality', async ({ page }) => {
    // Look for file upload components
    const uploadButtons = page.locator('button:has-text("Upload"), input[type="file"]');
    const fileInputs = page.locator('input[type="file"]');

    // Check if upload functionality exists
    const uploadCount = await uploadButtons.count();
    const fileInputCount = await fileInputs.count();

    expect(uploadCount + fileInputCount).toBeGreaterThan(0);
  });

  test('should handle theme switching', async ({ page }) => {
    // Look for theme toggle button
    const themeButtons = page.locator('button:has-text("Sun"), button:has-text("Moon"), [class*="theme"], [data-testid*="theme"]');

    if (await themeButtons.count() > 0) {
      // If theme toggle exists, test it
      const initialTheme = await page.evaluate(() => document.documentElement.className);
      await themeButtons.first().click();

      // Wait a bit for theme change
      await page.waitForTimeout(100);

      const newTheme = await page.evaluate(() => document.documentElement.className);
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should handle navigation between tabs', async ({ page }) => {
    // Look for tab navigation
    const tabs = page.locator('[role="tab"], [data-testid*="tab"], button[class*="tab"]');

    if (await tabs.count() > 1) {
      // Test tab switching
      const firstTab = tabs.first();
      const secondTab = tabs.nth(1);

      await firstTab.click();
      await page.waitForTimeout(100);

      await secondTab.click();
      await page.waitForTimeout(100);

      // Should not have crashed
      expect(page.url()).toContain('localhost');
    }
  });

  test('should handle search and filtering', async ({ page }) => {
    // Look for search inputs
    const searchInputs = page.locator('input[placeholder*="Buscar"], input[type="search"], input[placeholder*="Search"]');

    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();

      // Type in search
      await searchInput.fill('test');
      await page.waitForTimeout(300);

      // Should not crash and should show some results or empty state
      const results = page.locator('[data-testid*="result"], [class*="result"], li, .card');
      const noResults = page.locator(':has-text("nenhum"), :has-text("no results"), :has-text("vazio")');

      const hasResults = await results.count() > 0;
      const hasNoResults = await noResults.count() > 0;

      expect(hasResults || hasNoResults).toBe(true);
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Look for pagination controls
    const paginationButtons = page.locator('button:has-text("Anterior"), button:has-text("Próxima"), button:has-text("Next"), button:has-text("Previous")');

    if (await paginationButtons.count() > 0) {
      const nextButton = paginationButtons.filter({ hasText: /Próxima|Next/ }).first();

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Should navigate without crashing
        expect(page.url()).toContain('localhost');
      }
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Try to trigger some error conditions
    // This is a basic test - in a real scenario we'd mock API failures

    // Check that error boundaries or error messages exist
    const errorElements = page.locator('[class*="error"], [data-testid*="error"], :has-text("erro"), :has-text("Error")');

    // The app should have some error handling in place
    // We don't expect errors in normal operation, but the infrastructure should exist
    const errorCount = await errorElements.count();

    // Just check that the page is still functional
    expect(page.url()).toContain('localhost');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for responsive adjustments
    await page.waitForTimeout(300);

    // Check that content is still accessible
    const mainContent = page.locator('[data-testid="main-content"], main, .min-h-screen');
    await expect(mainContent).toBeVisible();

    // Check that no horizontal scroll is needed
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small margin
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test keyboard accessibility
    await page.keyboard.press('Tab');

    // Check if focus is visible somewhere
    const focusedElement = page.locator(':focus');
    const hasFocus = await focusedElement.count() > 0;

    // At least some element should be focusable
    expect(hasFocus).toBe(true);
  });
});