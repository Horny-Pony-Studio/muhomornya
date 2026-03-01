# Changelog

## [v0.1.0-alpha.1] — 2026-03-01

First alpha release — project foundation with branding, SEO, i18n, and testing infrastructure.

### Features
- **Tailwind v4 brand tokens:** colors (`#7D0015`, `#BA1934`, `#D4B59D`, `#ECD6C6`), breakpoints (mobile/tablet/desktop/wide), fonts, spacing, border-radius, 6 color schemes
- **i18n:** next-intl with UK (default), EN, DE locales; `localePrefix: 'as-needed'`; translation messages; Next.js 16 proxy.ts
- **Root layout:** Assistant + Montserrat fonts via next/font/google, NextIntlClientProvider
- **SEO metadata:** title template, descriptions, canonical URLs, hreflang (uk/en/de/x-default), Open Graph, Twitter cards
- **Verification:** Google Search Console (3 IDs), Facebook domain verification
- **JSON-LD:** Organization schema on all pages
- **Analytics:** GA4, Google Ads, FB Pixel (production only)
- **robots.txt:** matching Shopify rules (disallow cart/checkout/admin/search, crawl delays)
- **sitemap.xml:** skeleton with homepage alternates
- **Favicon:** original 32x32 brand icon + apple-touch-icon

### Testing
- Vitest + @testing-library/react + jsdom + v8 coverage
- Playwright with Chromium, webServer auto-start, CI support
- Sample unit test and E2E tests for homepage i18n + SEO meta tags

### Fixes
- Correct Assistant font subsets (no cyrillic — uses fallback)
- Add cyrillic-ext to Montserrat for Ukrainian headings

### Chores
- Install core dependencies (next-intl, zustand)
- Align test configs with srochno project conventions
