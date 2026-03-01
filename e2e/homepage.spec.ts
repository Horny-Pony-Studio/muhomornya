import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('renders Ukrainian homepage at /', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Мухоморня/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });

  test('renders English homepage at /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/Muhomornya/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('renders German homepage at /de', async ({ page }) => {
    await page.goto('/de');
    await expect(page).toHaveTitle(/Muhomornya/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });
});

test.describe('SEO meta tags', () => {
  test('has hreflang alternates', async ({ page }) => {
    await page.goto('/');
    const hreflangs = page.locator('link[rel="alternate"][hreflang]');
    await expect(hreflangs).not.toHaveCount(0);
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /muhomornya\.com/);
  });

  test('has Google verification meta tags', async ({ page }) => {
    await page.goto('/');
    const googleVerification = page.locator('meta[name="google-site-verification"]');
    await expect(googleVerification.first()).toBeAttached();
  });

  test('has Organization JSON-LD', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
    const content = await jsonLd.first().textContent();
    const data = JSON.parse(content!);
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('Крамниця Мухоморня');
  });
});
