# 02. Архітектура міграції: Next.js + Python

## 2.1 Загальна архітектура

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        A[Next.js App - SSR/SSG]
        A1[React Components]
        A2[next/image optimization]
        A3[next-intl i18n]
    end

    subgraph Edge["CDN / Edge"]
        B[Vercel Edge Network]
        B1[Static Assets Cache]
        B2[ISR - Incremental Static Regen]
    end

    subgraph Backend["Python Backend API"]
        C[FastAPI Application]
        C1[Product Service]
        C2[Order Service]
        C3[Payment Service]
        C4[Blog Service]
        C5[Auth Service]
    end

    subgraph Database["Data Layer"]
        D1[(PostgreSQL)]
        D2[(Redis Cache)]
        D3[S3 / Media Storage]
    end

    subgraph Payments["Payment Providers"]
        E1[Stripe - Apple Pay]
        E2[Stripe - Google Pay]
        E3[LiqPay / Monobank]
        E4[Nova Poshta API]
    end

    subgraph External["External Services"]
        F1[GA4 / GTM]
        F2[Facebook CAPI]
        F3[SendGrid / Email]
        F4[Telegram Bot]
    end

    A --> B
    B --> C
    A1 --> A
    A2 --> A
    A3 --> A
    C --> C1 & C2 & C3 & C4 & C5
    C1 --> D1
    C2 --> D1
    C2 --> D2
    C3 --> E1 & E2 & E3
    C4 --> D1
    C --> D2
    C --> D3
    C2 --> E4
    C --> F1 & F2 & F3
    C2 --> F4
```

## 2.2 Стек технологій

### Frontend (Next.js)

| Технологія | Обґрунтування |
|-----------|---------------|
| **Next.js 15 (App Router)** | SSR + SSG + ISR для SEO; React Server Components |
| **React 19** | UI-компоненти, Server Components |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Утиліти + кастомна тема (збереження дизайну) |
| **next-intl** | i18n з підтримкою UK/EN/DE routing |
| **next/image** | Оптимізація зображень (замість Shopify CDN) |
| **next/font** | Локальне завантаження Assistant + Montserrat |
| **Zustand** | Client-side state (cart, UI) |
| **React Hook Form + Zod** | Форми + валідація |

### Backend (Python)

| Технологія | Обґрунтування |
|-----------|---------------|
| **FastAPI** | Async API, автогенерація OpenAPI spec |
| **SQLAlchemy 2.0** | ORM з async support |
| **Alembic** | Database migrations |
| **PostgreSQL 16** | Primary database |
| **Redis** | Caching, sessions, rate limiting |
| **Pydantic v2** | Data validation, settings |
| **Celery + Redis** | Background tasks (email, notifications) |
| **Stripe SDK** | Apple Pay, Google Pay, card payments |
| **boto3** | S3 media storage |

### Infrastructure

| Технологія | Обґрунтування |
|-----------|---------------|
| **Vercel** | Next.js hosting + Edge CDN |
| **Railway / Render** | Python backend hosting |
| **Neon / Supabase** | Managed PostgreSQL |
| **Upstash** | Managed Redis |
| **Cloudflare R2** | Media storage (S3-compatible) |
| **GitHub Actions** | CI/CD pipeline |

## 2.3 Структура Next.js проекту

```
muhomornya-web/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx              # Root layout з meta, fonts, analytics
│   │   │   ├── page.tsx                # Головна сторінка
│   │   │   ├── products/
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx        # Сторінка товару (SSG + ISR)
│   │   │   │   └── page.tsx            # Каталог
│   │   │   ├── collections/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Сторінка категорії
│   │   │   ├── blogs/
│   │   │   │   ├── [category]/
│   │   │   │   │   ├── [slug]/
│   │   │   │   │   │   └── page.tsx    # Стаття блогу
│   │   │   │   │   └── page.tsx        # Список статей
│   │   │   │   └── page.tsx            # Блог index
│   │   │   ├── pages/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Статичні сторінки (FAQ, About...)
│   │   │   ├── cart/
│   │   │   │   └── page.tsx            # Кошик
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx            # Оформлення замовлення
│   │   │   └── policies/
│   │   │       └── [slug]/
│   │   │           └── page.tsx        # Політики (noindex)
│   │   ├── api/
│   │   │   ├── revalidate/
│   │   │   │   └── route.ts            # ISR revalidation webhook
│   │   │   └── og/
│   │   │       └── route.tsx           # Dynamic OG images
│   │   ├── sitemap.ts                  # Dynamic sitemap generation
│   │   ├── robots.ts                   # Dynamic robots.txt
│   │   └── feed/
│   │       └── [type]/
│   │           └── route.ts            # Atom feeds
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── StickyHeader.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   └── ProductRecommendations.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentMethods.tsx
│   │   │   ├── ApplePayButton.tsx
│   │   │   └── GooglePayButton.tsx
│   │   ├── collection/
│   │   │   ├── CollectionGrid.tsx
│   │   │   └── CollectionFilters.tsx
│   │   ├── blog/
│   │   │   ├── ArticleCard.tsx
│   │   │   └── ArticleContent.tsx
│   │   ├── ui/
│   │   │   ├── Slider.tsx
│   │   │   ├── Slideshow.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   └── QuantityInput.tsx
│   │   └── seo/
│   │       ├── JsonLd.tsx
│   │       ├── OpenGraph.tsx
│   │       └── HreflangTags.tsx
│   ├── lib/
│   │   ├── api.ts                      # Backend API client
│   │   ├── stripe.ts                   # Stripe client config
│   │   └── analytics.ts               # GA4 + FB tracking
│   ├── store/
│   │   ├── cart.ts                     # Zustand cart store
│   │   └── ui.ts                       # UI state (modals, menu)
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── request.ts
│   │   └── messages/
│   │       ├── uk.json
│   │       ├── en.json
│   │       └── de.json
│   └── styles/
│       └── globals.css                 # Tailwind + custom brand tokens
├── public/
│   ├── fonts/                          # Assistant, Montserrat woff2
│   ├── images/                         # Static images, logos
│   └── favicons/
├── next.config.ts
├── tailwind.config.ts
└── middleware.ts                        # i18n routing, geo-redirect
```

## 2.4 Структура Python Backend

```
muhomornya-api/
├── app/
│   ├── main.py                         # FastAPI app entry
│   ├── config.py                       # Pydantic Settings
│   ├── database.py                     # SQLAlchemy async engine
│   ├── models/
│   │   ├── product.py                  # Product, Variant, Collection
│   │   ├── order.py                    # Order, OrderItem, OrderStatus
│   │   ├── customer.py                 # Customer info
│   │   ├── blog.py                     # Article, BlogCategory
│   │   ├── page.py                     # StaticPage
│   │   └── payment.py                  # Payment, PaymentMethod
│   ├── schemas/
│   │   ├── product.py                  # Pydantic response/request schemas
│   │   ├── order.py
│   │   ├── payment.py
│   │   └── blog.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── products.py             # GET /products, /products/{slug}
│   │   │   ├── collections.py          # GET /collections/{slug}
│   │   │   ├── orders.py               # POST /orders, GET /orders/{id}
│   │   │   ├── payments.py             # POST /payments/create-intent
│   │   │   ├── cart.py                 # Cart operations
│   │   │   ├── blog.py                 # GET /blog/articles
│   │   │   ├── pages.py               # GET /pages/{slug}
│   │   │   ├── search.py              # GET /search/suggest
│   │   │   └── webhooks.py            # Stripe webhooks, revalidation
│   │   └── deps.py                     # Dependencies (DB session, auth)
│   ├── services/
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── payment_service.py          # Stripe integration
│   │   ├── shipping_service.py         # Nova Poshta API
│   │   ├── email_service.py
│   │   └── analytics_service.py        # FB CAPI server-side
│   ├── tasks/
│   │   ├── celery_app.py
│   │   ├── email_tasks.py
│   │   └── notification_tasks.py       # Telegram notifications
│   └── migrations/
│       └── versions/
├── tests/
├── alembic.ini
├── pyproject.toml
└── Dockerfile
```

## 2.5 Database Schema (ER-діаграма)

```mermaid
erDiagram
    PRODUCT {
        uuid id PK
        string slug UK
        jsonb title_i18n
        jsonb description_i18n
        jsonb meta_description_i18n
        string brand
        uuid collection_id FK
        string[] tags
        jsonb images
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    VARIANT {
        uuid id PK
        uuid product_id FK
        jsonb title_i18n
        decimal price
        string currency
        string sku
        integer stock_quantity
        integer weight_grams
        boolean in_stock
        integer sort_order
    }

    COLLECTION {
        uuid id PK
        string slug UK
        jsonb title_i18n
        jsonb description_i18n
        jsonb meta_description_i18n
        string image_url
        integer sort_order
        boolean is_active
    }

    ORDER {
        uuid id PK
        string order_number UK
        uuid customer_id FK
        string status
        decimal subtotal
        decimal shipping_cost
        decimal total
        string currency
        string locale
        jsonb shipping_address
        jsonb billing_address
        string shipping_method
        string tracking_number
        string notes
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid variant_id FK
        integer quantity
        decimal unit_price
        decimal total_price
        jsonb product_snapshot
    }

    PAYMENT {
        uuid id PK
        uuid order_id FK
        string stripe_payment_intent_id
        string method
        string status
        decimal amount
        string currency
        jsonb metadata
        timestamp created_at
    }

    CUSTOMER {
        uuid id PK
        string email UK
        string first_name
        string last_name
        string phone
        jsonb default_address
        boolean accepts_marketing
        timestamp created_at
    }

    ARTICLE {
        uuid id PK
        string slug UK
        string blog_category
        jsonb title_i18n
        jsonb content_i18n
        jsonb meta_description_i18n
        string author
        string image_url
        string[] tags
        boolean is_published
        timestamp published_at
        timestamp updated_at
    }

    STATIC_PAGE {
        uuid id PK
        string slug UK
        jsonb title_i18n
        jsonb content_i18n
        jsonb meta_description_i18n
        boolean is_active
    }

    PRODUCT ||--o{ VARIANT : "has variants"
    COLLECTION ||--o{ PRODUCT : "contains"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER ||--|| PAYMENT : "paid via"
    ORDER }o--|| CUSTOMER : "placed by"
    ORDER_ITEM }o--|| PRODUCT : "references"
    ORDER_ITEM }o--|| VARIANT : "specific variant"
```

## 2.6 API Endpoints

### Products API

```
GET    /api/v1/products                     # Список товарів (з пагінацією)
GET    /api/v1/products/{slug}              # Товар за slug
GET    /api/v1/products/{slug}/oembed       # oEmbed дані
GET    /api/v1/products/{slug}/recommendations  # Рекомендації
```

### Collections API

```
GET    /api/v1/collections                  # Список категорій
GET    /api/v1/collections/{slug}           # Категорія з товарами
GET    /api/v1/collections/{slug}/oembed    # oEmbed
GET    /api/v1/collections/{slug}/feed.atom # Atom feed
```

### Cart & Orders API

```
POST   /api/v1/cart/add                     # Додати в кошик
PATCH  /api/v1/cart/update                  # Оновити кількість
DELETE /api/v1/cart/remove/{item_id}        # Видалити з кошика
GET    /api/v1/cart                         # Отримати кошик

POST   /api/v1/orders                       # Створити замовлення
GET    /api/v1/orders/{id}                  # Статус замовлення
GET    /api/v1/orders/{id}/tracking         # Трекінг доставки
```

### Payments API

```
POST   /api/v1/payments/create-intent       # Stripe PaymentIntent
POST   /api/v1/payments/confirm             # Підтвердження платежу
POST   /api/v1/webhooks/stripe              # Stripe webhook
```

### Content API

```
GET    /api/v1/blog/{category}              # Статті блогу
GET    /api/v1/blog/{category}/{slug}       # Стаття
GET    /api/v1/blog/{category}/feed.atom    # Atom feed
GET    /api/v1/pages/{slug}                 # Статична сторінка
GET    /api/v1/search/suggest?q=            # Пошук
```
