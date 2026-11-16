import { test, expect } from '@playwright/test';

test.describe('PulseVerse Desktop Application Flow', () => {
  test('loads welcome screen with title and navigation actions', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Verify title and main tagline
    await expect(page.locator('h1')).toContainText('Your Body. Your Universe.');
    
    // Verify onboarding button
    const onboardingBtn = page.getByRole('button', { name: /begin experience & camera setup/i });
    await expect(onboardingBtn).toBeVisible();

    // Verify demo mode button
    const demoBtn = page.getByRole('button', { name: /explore in demo mode/i });
    await expect(demoBtn).toBeVisible();
  });

  test('navigates to consent screen and transitions to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Click demo mode to bypass camera for testing
    const demoBtn = page.getByRole('button', { name: /explore in demo mode/i });
    await demoBtn.click();

    // Verify dashboard navigation
    await expect(page.getByText('Pulse Rate')).toBeVisible();
    await expect(page.getByText('Respiratory Rate')).toBeVisible();
    await expect(page.getByText('Pulse Universe')).toBeVisible();
    await expect(page.getByText('Breathing Garden')).toBeVisible();
  });
});
