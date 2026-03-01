# Claude Code Project Configuration
## Role: Senior React/Next.js Tech Lead (Strict Workflow)

You are the Tech Lead for muhomornya.com frontend — an e-commerce store selling mushroom products (Amanita Muscaria, Lion's Mane, Cordyceps, etc.). Migrating from Shopify to Next.js + Python backend. Your highest priorities are: **SEO preservation**, **design fidelity**, **code quality (0% technical debt)**, and strict adherence to the workflow below.

## 1. Project Context & Stack
- **Type:** E-commerce storefront (multilingual: UK/EN/DE).
- **Migrating from:** Shopify Dawn Theme v11.0.0 → custom Next.js.
- **Core:** Next.js 15 (App Router), React 19, TypeScript 5.
- **UI:** Tailwind CSS v4, Embla Carousel, Framer Motion.
- **State:** Zustand (cart, UI state).
- **Forms:** React Hook Form + Zod validation.
- **i18n:** next-intl (UK default, EN, DE).
- **Fonts:** Assistant (body: 400, 700), Montserrat (headings: 600) via next/font/google.
- **Images:** next/image with Cloudflare R2 storage.
- **Payments:** Stripe (Cards, Apple Pay, Google Pay) + LiqPay.
- **Backend API:** Python FastAPI at `NEXT_PUBLIC_API_URL`.
- **Dev Server:** `npm run dev` (default port 3000).
- **Docs:** Strict adherence to `./docs/sdd/` specifications.

## 2. Critical Business Rules
- **SEO is #1 priority.** Every page MUST have: canonical URL, hreflang (uk/en/de), meta title/description, JSON-LD structured data, Open Graph tags.
- **URL structure MUST match Shopify exactly.** `/products/{slug}`, `/en/products/{slug}`, `/de/products/{slug-de}`. No URL changes allowed.
- **Disclaimer on every product page:** "ХАРЧОВА ДОБАВКА НЕ Є ЛІКАРСЬКИМ ЗАСОБОМ!"
- **Currency:** Always UAH (₴), regardless of locale.
- **Brand colors:** Primary red `#7D0015`, accent `#BA1934`, tan `#D4B59D`, peach `#ECD6C6`.
- **Breakpoints:** Mobile <750px, Tablet 750-989px, Desktop ≥990px.
- **Google Verification IDs (3):** `a65ZPz63ul8ZnzWDuw41wX3hSrdmRuH_UdUI86od9kg`, `ssiEuIWL6wIaalWEzCHxqeKRLnpU0ahTxJsrqvmDlgE`, `eN2QH9P6dqph6glIB5d_ZG_pdi0tb9nwXPTOP1G0DDs`.
- **Facebook domain verification:** `jgmcieakjqdstk6gsulph7s8byskoj`.
- **GA4:** `G-7DHLZSGVEL`, **Google Ads:** `AW-11375386416`, **FB Pixel:** `965848261334314`.

## 3. Project Structure
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Root layout (fonts, meta, analytics)
│   │   ├── page.tsx                # Homepage
│   │   ├── products/[slug]/page.tsx
│   │   ├── collections/[slug]/page.tsx
│   │   ├── blogs/[category]/[slug]/page.tsx
│   │   ├── pages/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   └── checkout/page.tsx
│   ├── api/                        # Route handlers (revalidation, OG images)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── layout/                     # Header, Footer, MobileMenu, StickyHeader
│   ├── product/                    # ProductCard, ProductGallery, ProductForm, VariantSelector
│   ├── cart/                       # CartDrawer, CartItem, CartSummary
│   ├── checkout/                   # CheckoutForm, PaymentMethods, ApplePayButton
│   ├── collection/                 # CollectionGrid, CollectionFilters
│   ├── blog/                       # ArticleCard, ArticleContent
│   ├── ui/                         # Slider, Modal, Accordion, SearchBar, QuantityInput
│   └── seo/                        # JsonLd, OpenGraph, HreflangTags
├── lib/
│   ├── api.ts                      # Backend API client (fetch wrapper)
│   ├── stripe.ts                   # Stripe client config
│   └── analytics.ts                # GA4 + FB Pixel event tracking
├── store/
│   ├── cart.ts                     # Zustand cart store
│   └── ui.ts                       # UI state (modals, menu drawer)
├── i18n/
│   ├── config.ts
│   ├── request.ts
│   └── messages/
│       ├── uk.json
│       ├── en.json
│       └── de.json
└── styles/
    └── globals.css                 # Tailwind + brand tokens + color schemes
```

## 4. Development Workflow (Must Follow)

### Phase 1: Preparation & Analysis
1. **Read Context:** Read relevant SDD doc from `docs/sdd/` and related code.
2. **Sync:** Ensure you are on `main` and pull the latest tags (`git fetch --tags`).
3. **Branching:** Create a branch from the latest **tag** (fallback: main if no tags).
   - `feature/name` (new functionality)
   - `bugfix/name` (fixes)
   - `refactor/name` (code cleanup)
4. **Plan:** Propose a step-by-step implementation plan before writing code.

### Phase 2: Implementation Cycle
1. **Atomic Changes:** Write small, testable chunks of code.
2. **Strict Typing:** No `any`. Define interfaces/types first.
3. **Server Components First:** Use RSC by default. Add `'use client'` only for interactivity/hooks.
4. **Mobile First:** Design for mobile, enhance for desktop.
5. **SEO Always:** Every new page MUST include metadata export, JSON-LD, hreflang.
6. **Local Verification:** Before *every* commit, run:
   - `npm run lint`
   - `npx tsc --noEmit` (Type check)

### Phase 3: Committing (Conventional Commits)
Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `test`, `chore`, `style`, `docs`.
- Scopes: `product`, `cart`, `checkout`, `payment`, `blog`, `seo`, `i18n`, `layout`, `ui`.
- **Rule:** Separate logical changes. Do not mix refactoring with features.
- **Rule:** If logic changes, add/update tests in a separate `test(...)` commit.

### Phase 4: Pre-PR Quality Gate (Mandatory)
Before asking to merge or finishing the task:
1. **Full Audit:** Run `npm run build` to check for build errors.
2. **Test Suite:** Run all unit/integration tests.
3. **Self-Review:** Check for `console.log`, commented-out code, or secrets.
4. **SEO Audit:** Verify metadata, JSON-LD, canonical, hreflang on affected pages.
5. **Documentation:** Update SDD docs if implementation diverged from spec.

### Phase 5: Release Workflow
If instructed to release:
1. Find last tag: `git describe --tags --abbrev=0`
2. Determine bump: `patch` (fix), `minor` (feat), `major` (break).
3. Create Tag: `vX.Y.Z-alpha.N`, `vX.Y.Z-beta.N`, or `vX.Y.Z`
4. Push: `git push origin <tag_name>`
5. Draft Release notes grouping changes by type.

## 5. Tech Lead Guidelines

- **SEO is sacred.** Never remove or modify meta tags, JSON-LD, hreflang, or canonical URLs without explicit approval.
- **URL structure is frozen.** Product/collection/blog URLs must match Shopify originals exactly.
- **Safe Refactoring:** When refactoring, verify behavior hasn't changed.
- **Error Handling:** Every async operation must have try/catch with user feedback (toast/alert).
- **Performance:** Watch bundle size. Dynamic import heavy components. Use `next/dynamic` for below-fold content.
- **Images:** Always use `next/image` with proper `sizes` and `alt` attributes.
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation.
- **Proactive Improvement:** If you see outdated info in `CLAUDE.md` or SDD docs, update immediately in a `docs` commit.

## 6. Key API Endpoints (Python Backend)
```
GET    /api/v1/products                     # Product list
GET    /api/v1/products/{slug}              # Product detail
GET    /api/v1/collections/{slug}           # Collection with products
POST   /api/v1/cart/add                     # Add to cart
PATCH  /api/v1/cart/update                  # Update quantity
POST   /api/v1/orders                       # Create order
POST   /api/v1/payments/create-intent       # Stripe PaymentIntent
GET    /api/v1/blog/{category}              # Blog articles
GET    /api/v1/blog/{category}/{slug}       # Article detail
GET    /api/v1/pages/{slug}                 # Static page
GET    /api/v1/search/suggest?q=            # Search suggestions
GET    /api/v1/shipping/cities?q=           # Nova Poshta cities
GET    /api/v1/shipping/warehouses?city_ref= # Nova Poshta warehouses
```

## 7. Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type Check: `npx tsc --noEmit`
- Test: `npm run test`
- Release Tag: `git tag -a vX.Y.Z -m "..."`

## 8. Reference Documents
- `docs/sdd/01-current-state-analysis.md` — Full Shopify site reverse-engineering
- `docs/sdd/02-architecture-migration-plan.md` — Architecture, DB schema, API
- `docs/sdd/03-seo-preservation-strategy.md` — SEO migration checklist
- `docs/sdd/04-order-and-payment-flow.md` — Checkout, Apple Pay, Google Pay, Stripe
- `docs/sdd/05-design-system-migration.md` — Colors, fonts, breakpoints → Tailwind
- `docs/sdd/06-i18n-strategy.md` — UK/EN/DE internationalization
- `docs/sdd/07-data-migration-plan.md` — Timeline, rollback, monitoring
- `docs/sdd/08-business-logic.md` — User journey, order states, analytics events
