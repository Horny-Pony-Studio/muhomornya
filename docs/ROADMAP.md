# Muhomornya Frontend — Roadmap

## Completed: v0.1.0-alpha.1 — Foundation
- Tailwind v4 brand tokens (colors, breakpoints, fonts, 6 color schemes)
- i18n: next-intl (UK/EN/DE), `localePrefix: 'as-needed'`
- SEO: root metadata, canonical, hreflang, OG, verification (Google x3, Facebook)
- JSON-LD: Organization schema
- Analytics: GA4, Google Ads, FB Pixel (production only)
- robots.txt + sitemap.xml skeleton
- Favicon + apple-touch-icon
- Testing: Vitest + Playwright

---

## v0.2.0 — API Client + State Management

| Задача | Файл | Опис |
|--------|------|------|
| API клієнт | `src/lib/api.ts` | Fetch wrapper для Python backend, типізовані відповіді, error handling |
| API типи | `src/types/api.ts` | Інтерфейси Product, Collection, Article, Order, Cart, Variant |
| Cart store | `src/store/cart.ts` | Zustand: items, add/remove/update, localStorage 7-day TTL, subtotal |
| UI store | `src/store/ui.ts` | Zustand: cart drawer, mobile menu, modals, search |
| Analytics events | `src/lib/analytics.ts` | `trackViewItem()`, `trackAddToCart()`, `trackPurchase()` etc. (GA4 + FB Pixel) |

---

## v0.3.0 — UI Kit (базові компоненти)

| Задача | Файл | Опис |
|--------|------|------|
| Button | `src/components/ui/Button.tsx` | Variants: primary, secondary, outline. `radius-btn: 0px` |
| Input | `src/components/ui/Input.tsx` | Text, number, search. Стилі під бренд |
| QuantityInput | `src/components/ui/QuantityInput.tsx` | +/- кнопки, min/max |
| Modal | `src/components/ui/Modal.tsx` | Dialog з backdrop, keyboard close, focus trap |
| Accordion | `src/components/ui/Accordion.tsx` | Collapsible секції (FAQ, product details) |
| Slider | `src/components/ui/Slider.tsx` | Embla Carousel wrapper |
| SearchBar | `src/components/ui/SearchBar.tsx` | Autocomplete з API `/search/suggest` |
| PriceDisplay | `src/components/ui/PriceDisplay.tsx` | Завжди UAH (₴), форматування |

---

## v0.4.0 — Layout (шапка, футер, каркас сайту)

| Задача | Файл | Опис |
|--------|------|------|
| AnnouncementBar | `src/components/layout/AnnouncementBar.tsx` | Top banner, scheme-announcement |
| Header | `src/components/layout/Header.tsx` | Logo, nav, locale switcher, search, cart icon |
| StickyHeader | `src/components/layout/StickyHeader.tsx` | Scroll-triggered sticky behavior |
| MobileMenu | `src/components/layout/MobileMenu.tsx` | Drawer з навігацією (<750px) |
| Footer | `src/components/layout/Footer.tsx` | 4-column grid, scheme-footer |
| Root layout update | `src/app/[locale]/layout.tsx` | Grid: announcement → header → main → footer |

---

## v0.5.0 — SEO Components + Page Shells

| Задача | Файл | Опис |
|--------|------|------|
| BreadcrumbJsonLd | `src/components/seo/BreadcrumbJsonLd.tsx` | Schema для навігації |
| ProductJsonLd | `src/components/seo/ProductJsonLd.tsx` | Product schema з offers |
| ArticleJsonLd | `src/components/seo/ArticleJsonLd.tsx` | Article schema |
| Hreflang helper | `src/lib/seo.ts` | `generateHreflangAlternates()` для динамічних сторінок |
| Product page shell | `src/app/[locale]/products/[slug]/page.tsx` | `generateMetadata()` + skeleton |
| Collection page shell | `src/app/[locale]/collections/[slug]/page.tsx` | `generateMetadata()` + skeleton |
| Blog page shell | `src/app/[locale]/blogs/[category]/[slug]/page.tsx` | `generateMetadata()` + skeleton |
| Static page shell | `src/app/[locale]/pages/[slug]/page.tsx` | `generateMetadata()` + skeleton |
| Cart page | `src/app/[locale]/cart/page.tsx` | noindex |
| Dynamic sitemap | `src/app/sitemap.ts` | Підтягнути products/collections/articles з API |

---

## Feature Development (після базових налаштувань)

```
v0.6.0 — Product pages (gallery, variants, add-to-cart, recommendations)
v0.7.0 — Collections (grid, filters, sorting)
v0.8.0 — Cart + CartDrawer
v0.9.0 — Checkout + Payments (Stripe, LiqPay, Apple/Google Pay)
v0.10.0 — Blog (articles, categories)
v0.11.0 — Static pages + Search
v1.0.0-rc.1 — QA, performance, 301 redirects from Shopify
v1.0.0 — Go live 🚀
```

---

## Critical Business Rules (завжди пам'ятати)

1. **SEO — пріоритет #1.** Кожна сторінка: metadata, canonical, hreflang, JSON-LD.
2. **URL структура заморожена.** `/products/{slug}`, `/en/products/{slug}`, `/de/products/{slug-de}`.
3. **Валюта завжди UAH (₴)** — навіть на /en/ і /de/.
4. **Дисклеймер на кожній product page:** "ХАРЧОВА ДОБАВКА НЕ Є ЛІКАРСЬКИМ ЗАСОБОМ!"
5. **Cart у localStorage** з 7-day TTL.
6. **Безкоштовна доставка** від 1000 ₴ (Нова Пошта).
