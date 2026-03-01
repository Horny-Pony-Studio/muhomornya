# SDD — Spec Driven Design: Міграція muhomornya.com

## Shopify → Next.js 15 + Python (FastAPI)

---

## Зміст документації

| # | Документ | Опис |
|---|----------|------|
| 01 | [Аналіз поточного стану](./01-current-state-analysis.md) | Повний аналіз Shopify-сайту: структура, SEO, дизайн, технології |
| 02 | [Архітектура міграції](./02-architecture-migration-plan.md) | Next.js + Python архітектура, DB schema, API endpoints |
| 03 | [Стратегія збереження SEO](./03-seo-preservation-strategy.md) | URL-маппінг, meta tags, JSON-LD, sitemap, robots.txt |
| 04 | [Замовлення та платежі](./04-order-and-payment-flow.md) | Новий checkout flow, Apple Pay, Google Pay, Stripe, Nova Poshta |
| 05 | [Міграція дизайн-системи](./05-design-system-migration.md) | Shopify Dawn → Tailwind CSS, компоненти, шрифти, кольори |
| 06 | [Стратегія i18n](./06-i18n-strategy.md) | UK/EN/DE мультимовність, next-intl, URL routing |
| 07 | [План міграції даних](./07-data-migration-plan.md) | Gantt chart, data migration, rollback, моніторинг |
| 08 | [Бізнес-логіка](./08-business-logic.md) | User journey, order states, shipping, analytics events |

---

## Ключові рішення

### Збереження SEO (найвищий пріоритет)

- **URL paths ідентичні** — жодна сторінка не змінює URL
- **Hreflang** на кожній сторінці для 3 мов
- **JSON-LD** (Organization + Product) на всіх товарних сторінках
- **Canonical URLs** точно збігаються з поточними
- **301 redirects** тільки для Shopify-специфічних URL (/checkouts/)
- **robots.txt** та **sitemap.xml** ідентичні правила

### Покращення платежів

- **Apple Pay** + **Google Pay** через Stripe Payment Request API
- **Express Checkout** — купівля одним кліком зі сторінки товару
- **3-крокова форма checkout** замість Shopify hosted
- **Nova Poshta API** — автокомплект міст та відділень
- **LiqPay** як альтернативний метод для Україні

### Технологічний стек

```
Frontend:  Next.js 15 + React 19 + TypeScript + Tailwind CSS v4
Backend:   FastAPI + SQLAlchemy + PostgreSQL + Redis
Payments:  Stripe (Apple Pay / Google Pay / Cards)
Hosting:   Vercel (frontend) + Railway (backend) + Neon (DB)
```

---

## Діаграми (Mermaid)

Вся документація містить **Mermaid діаграми** для візуалізації:

- Архітектурні діаграми (graph)
- Sequence diagrams (payment flows)
- State diagrams (order lifecycle)
- ER diagrams (database schema)
- Gantt charts (project timeline)
- Journey maps (user experience)

Для перегляду діаграм використовуйте:
- GitHub (нативна підтримка Mermaid)
- VS Code з розширенням Markdown Preview Mermaid
- [mermaid.live](https://mermaid.live) для онлайн-рендерингу
