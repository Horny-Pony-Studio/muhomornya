# 07. План міграції даних та поетапний розгортання

## 7.1 Загальний план міграції

```mermaid
gantt
    title План міграції muhomornya.com: Shopify → Next.js + Python
    dateFormat  YYYY-MM-DD
    axisFormat  %d.%m

    section Phase 0: Підготовка
    Аналіз та SDD документація           :done, p0a, 2026-03-01, 3d
    Налаштування репозиторіїв             :p0b, after p0a, 2d
    CI/CD pipeline                        :p0c, after p0b, 2d

    section Phase 1: Backend API
    Database schema + migrations          :p1a, after p0c, 3d
    Product/Collection API                :p1b, after p1a, 4d
    Blog/Pages API                        :p1c, after p1a, 3d
    Cart API                              :p1d, after p1b, 3d
    Search API                            :p1e, after p1c, 2d

    section Phase 2: Frontend Core
    Next.js scaffold + routing            :p2a, after p0c, 3d
    Design system (Tailwind + tokens)     :p2b, after p2a, 3d
    Layout (Header/Footer/Nav)            :p2c, after p2b, 4d
    i18n setup (next-intl)                :p2d, after p2a, 2d

    section Phase 3: Pages
    Homepage + Slideshow                  :p3a, after p2c, 3d
    Product page + Gallery                :p3b, after p2c, 4d
    Collection page + Filters             :p3c, after p3b, 3d
    Blog listing + Article                :p3d, after p2c, 3d
    Static pages (FAQ, About, etc.)       :p3e, after p2c, 2d

    section Phase 4: Cart & Checkout
    Cart drawer + state                   :p4a, after p3b, 3d
    Checkout wizard (3 steps)             :p4b, after p4a, 5d
    Stripe integration                    :p4c, after p4b, 3d
    Apple Pay + Google Pay                :p4d, after p4c, 3d
    Nova Poshta integration               :p4e, after p4b, 3d
    Order flow + notifications            :p4f, after p4c, 3d

    section Phase 5: SEO & Polish
    SEO meta/OG/JSON-LD                   :p5a, after p3b, 3d
    Sitemap + robots.txt                  :p5b, after p5a, 1d
    Atom feeds + oEmbed                   :p5c, after p5a, 2d
    Analytics (GA4 + FB Pixel)            :p5d, after p5a, 2d
    Performance optimization              :p5e, after p5d, 3d

    section Phase 6: Міграція
    Data migration script                 :p6a, after p1b, 3d
    Content migration (blogs, pages)      :p6b, after p6a, 3d
    Image migration                       :p6c, after p6a, 2d
    UAT testing                           :p6d, after p5e, 5d
    301 redirect setup                    :p6e, after p6d, 1d
    DNS cutover                           :p6f, after p6e, 1d
    Post-launch monitoring                :p6g, after p6f, 7d
```

## 7.2 Міграція даних (Shopify → PostgreSQL)

```mermaid
flowchart TD
    subgraph Source["Shopify Source Files"]
        S1[".oembed files\n(product data JSON)"]
        S2[".html files\n(content + SEO meta)"]
        S3[".atom files\n(blog content)"]
        S4["CDN images\n(70 base images)"]
    end

    subgraph Script["Migration Script (Python)"]
        M1["parse_oembed()\nExtract: title, price, variants, images"]
        M2["parse_html()\nExtract: meta tags, descriptions, content"]
        M3["parse_atom()\nExtract: articles, dates, authors"]
        M4["download_images()\nFetch originals from CDN"]
    end

    subgraph Target["PostgreSQL + R2"]
        T1[(Products + Variants)]
        T2[(Collections)]
        T3[(Articles)]
        T4[(Static Pages)]
        T5[Cloudflare R2 / S3]
    end

    S1 --> M1
    S2 --> M2
    S3 --> M3
    S4 --> M4

    M1 --> T1
    M1 --> T2
    M2 --> T1 & T2 & T3 & T4
    M3 --> T3
    M4 --> T5
```

### Migration Script (Python)

```python
# scripts/migrate_data.py

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

SOURCE_DIR = Path("muhomornya.source")
LOCALES = ["uk", "en", "de"]

def parse_product_oembed(file_path: Path) -> dict:
    """Parse .oembed JSON file to extract product data."""
    data = json.loads(file_path.read_text())
    return {
        "slug": data["product_id"],
        "title": data["title"],
        "description_html": data["description"],
        "brand": data["brand"],
        "thumbnail_url": data["thumbnail_url"],
        "canonical_url": data["url"],
        "variants": [
            {
                "title": offer["title"],
                "shopify_variant_id": offer["offer_id"],
                "sku": offer["sku"],
                "price": offer["price"],
                "currency": offer["currency_code"],
                "in_stock": offer["in_stock"],
            }
            for offer in data.get("offers", [])
        ],
    }

def parse_html_meta(file_path: Path) -> dict:
    """Extract SEO meta from HTML file."""
    soup = BeautifulSoup(file_path.read_text(), "html.parser")
    return {
        "title": soup.title.string if soup.title else "",
        "meta_description": _get_meta(soup, "description"),
        "og_title": _get_og(soup, "og:title"),
        "og_description": _get_og(soup, "og:description"),
        "og_image": _get_og(soup, "og:image"),
        "canonical": _get_link(soup, "canonical"),
        "hreflang": _get_hreflangs(soup),
    }

def migrate_all():
    """Main migration pipeline."""
    # 1. Products (3 locales)
    products = {}
    for locale in LOCALES:
        oembed_dir = get_products_dir(locale)
        for f in oembed_dir.glob("*.oembed"):
            product_data = parse_product_oembed(f)
            slug = product_data["slug"]
            if slug not in products:
                products[slug] = {"variants": product_data["variants"]}
            products[slug][f"title_{locale}"] = product_data["title"]
            products[slug][f"description_{locale}"] = product_data["description_html"]

    # 2. Blog articles from .atom feeds
    # 3. Static pages from .html
    # 4. Collections from collection .oembed
    # 5. Download images

    # Insert into PostgreSQL via SQLAlchemy
    ...
```

## 7.3 Верифікація міграції

```mermaid
graph TD
    A[Migration Complete] --> B[Automated Verification]

    B --> C[URL Check]
    C --> C1["Crawl all ~300 URLs\nExpect 200 OK"]
    C --> C2["Check 301 redirects\nfor changed URLs"]

    B --> D[Content Check]
    D --> D1["Compare titles\nShopify vs NextJS"]
    D --> D2["Compare meta descriptions"]
    D --> D3["Compare product counts\nand prices"]

    B --> E[SEO Check]
    E --> E1["Validate JSON-LD\nwith Google Rich Results"]
    E --> E2["Validate hreflang\ncross-references"]
    E --> E3["Validate sitemap\nall URLs present"]
    E --> E4["Validate robots.txt\nidentical rules"]

    B --> F[Visual Check]
    F --> F1["Screenshot comparison\nPercy / Playwright"]
    F --> F2["Mobile responsive\ncheck all breakpoints"]

    B --> G[Performance Check]
    G --> G1["Lighthouse audit\n>90 all categories"]
    G --> G2["Core Web Vitals\nLCP<2.5s, CLS<0.1"]
```

## 7.4 Стратегія розгортання (Zero-downtime)

```mermaid
sequenceDiagram
    participant DNS
    participant Shopify as Shopify (поточний)
    participant Vercel as Vercel (новий)
    participant API as Python Backend

    Note over DNS,API: Фаза 1: Паралельна робота
    DNS->>Shopify: muhomornya.com → Shopify
    Note over Vercel: staging.muhomornya.com → Vercel
    Note over Vercel: UAT testing на staging

    Note over DNS,API: Фаза 2: DNS переключення
    DNS->>Vercel: muhomornya.com → Vercel
    Note over Shopify: Shopify як fallback (тимчасово)
    Note over Vercel: Monitoring: 404s, traffic, conversions

    Note over DNS,API: Фаза 3: Стабілізація (7 днів)
    DNS->>Vercel: muhomornya.com → Vercel
    Note over Vercel: Моніторинг GSC indexing
    Note over Vercel: Моніторинг rankings
    Note over Vercel: A/B порівняння conversion rate

    Note over DNS,API: Фаза 4: Shopify деактивація
    Note over Shopify: Shopify subscription cancelled
```

## 7.5 Rollback план

```mermaid
graph TD
    A[Проблема після міграції?] --> B{Критичність?}

    B -->|Критична: сайт не працює| C[Rollback DNS → Shopify]
    B -->|Висока: SEO падіння >20%| D[Аналіз + часткове виправлення]
    B -->|Середня: баг на сторінці| E[Hotfix деплой]
    B -->|Низька: дрібниця| F[Fix у наступному релізі]

    C --> C1[DNS TTL: 300s = 5 хвилин]
    C --> C2[Shopify залишається активним 30 днів]

    D --> D1[Перевірка canonical URLs]
    D --> D2[Перевірка hreflang]
    D --> D3[Перевірка 301 redirects]
    D --> D4[Resubmit sitemap to GSC]
```

## 7.6 Моніторинг після запуску

| Метрика | Інструмент | Порог алерту | Частота |
|---------|-----------|-------------|---------|
| **Uptime** | Vercel / UptimeRobot | <99.9% | Real-time |
| **Error rate (5xx)** | Vercel Analytics | >1% | Real-time |
| **404 errors** | Google Search Console | >10 нових | Щоденно |
| **Indexing coverage** | GSC | Зменшення >5% | Щоденно |
| **Search rankings** | Ahrefs / Semrush | Падіння >10 позицій | Щотижня |
| **Organic traffic** | GA4 | Падіння >15% | Щотижня |
| **Conversion rate** | GA4 | Падіння >10% | Щотижня |
| **Core Web Vitals** | GSC / PageSpeed | Red zone | Щотижня |
| **LCP** | Vercel Speed Insights | >2.5s | Real-time |
| **Payment success rate** | Stripe Dashboard | <95% | Щоденно |
