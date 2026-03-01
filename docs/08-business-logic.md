# 08. Бізнес-логіка та процеси

## 8.1 User Journey — Покупка товару

```mermaid
journey
    title Шлях клієнта: від пошуку до доставки
    section Відкриття
      Google пошук: 5: Клієнт
      Переходить на сторінку товару: 4: Клієнт
      Читає опис та інструкцію: 3: Клієнт
    section Вибір
      Обирає варіант (60шт/120шт): 4: Клієнт
      Додає в кошик: 5: Клієнт
      Переглядає кошик: 4: Клієнт
    section Оформлення
      Заповнює контактні дані: 3: Клієнт
      Обирає відділення НП: 3: Клієнт
      Оплачує через Apple Pay: 5: Клієнт
    section Отримання
      Отримує email підтвердження: 4: Клієнт
      Отримує трекінг номер: 4: Клієнт
      Отримує посилку: 5: Клієнт
```

## 8.2 Продуктовий каталог — бізнес-правила

```mermaid
graph TD
    subgraph Catalog["Каталог товарів"]
        P[Product]
        V[Variant]
        C[Collection]
        T[Tag]
    end

    subgraph Rules["Бізнес-правила"]
        R1["Товар може мати 1+ варіантів\n(розмір, вага, кількість)"]
        R2["Ціна завжди в UAH\nнезалежно від мови"]
        R3["Товар може бути в 1+ категоріях"]
        R4["Кожен товар має інструкцію\nпо вживанню (link)"]
        R5["Disclaimer обов'язковий:\nХАРЧОВА ДОБАВКА НЕ Є\nЛІКАРСЬКИМ ЗАСОБОМ!"]
        R6["Протипоказання обов'язкові:\nвагітність, лактація,\nіндивідуальна непереносимість"]
    end

    P --> R1
    P --> R2
    P --> R3
    P --> R4
    P --> R5
    P --> R6
    P --> V
    P --> C
    P --> T
```

## 8.3 Cart — Бізнес-логіка

```mermaid
stateDiagram-v2
    [*] --> Empty: Початковий стан

    Empty --> HasItems: add_item()
    HasItems --> HasItems: add_item() / update_quantity()
    HasItems --> Empty: remove_last_item()

    state HasItems {
        [*] --> Calculating
        Calculating --> Updated: Перерахунок total
        Updated --> Calculating: Зміна кількості
    }

    HasItems --> Checkout: Перехід до оформлення
    Checkout --> [*]: Замовлення створено
    HasItems --> [*]: Клієнт покинув сайт (localStorage зберігає)
```

### Cart бізнес-правила

| Правило | Опис |
|---------|------|
| **Збереження** | Кошик зберігається в localStorage (TTL: 7 днів) |
| **Варіанти** | При додаванні того ж товару з іншим варіантом — окремий рядок |
| **Кількість** | Min: 1, Max: залежить від stock_quantity |
| **Ціна** | Завжди UAH, фіксована на момент додавання |
| **Оновлення ціни** | При відкритті кошика — перевірка актуальності ціни через API |
| **Out of stock** | Показувати warning якщо товар зник з наявності |

## 8.4 Order — Стани та переходи

```mermaid
stateDiagram-v2
    [*] --> pending: Замовлення створено

    pending --> payment_processing: Ініційовано оплату
    pending --> cancelled: Клієнт скасував

    payment_processing --> paid: Stripe webhook: succeeded
    payment_processing --> payment_failed: Stripe webhook: failed
    payment_processing --> pending: Timeout (30 min)

    payment_failed --> payment_processing: Повторна спроба
    payment_failed --> cancelled: Після 3 спроб

    paid --> processing: Адмін підтвердив
    paid --> refunded: Повне повернення

    processing --> shipped: Створено ТТН Nova Poshta
    processing --> refunded: Повне повернення

    shipped --> delivered: Nova Poshta статус: доставлено
    shipped --> returned: Клієнт відмовився

    delivered --> [*]
    cancelled --> [*]
    refunded --> [*]
    returned --> refunded: Повернення коштів
```

### Тригери переходів

| Перехід | Тригер | Дія |
|---------|--------|-----|
| `pending → payment_processing` | User починає оплату | Create PaymentIntent |
| `payment_processing → paid` | Stripe webhook `payment_intent.succeeded` | Save payment, send confirmation email |
| `paid → processing` | Адмін натиснув "Підтвердити" | Telegram notification |
| `processing → shipped` | Адмін вводить ТТН | Email з трекінг-номером |
| `shipped → delivered` | Nova Poshta API callback | Email "Замовлення доставлено" |
| `any → cancelled` | Адмін або клієнт скасовує | Stripe refund (якщо оплачено) |

## 8.5 Shipping — Логіка доставки

```mermaid
graph TD
    A[Вибір методу доставки] --> B{Країна?}

    B -->|Україна| C{Метод?}
    C -->|Nova Poshta відділення| D[Пошук міста → Пошук відділення]
    C -->|Nova Poshta кур'єр| E[Адреса доставки]
    C -->|Укрпошта| F[Поштовий індекс + адреса]

    B -->|Європа| G[Міжнародна доставка]
    G --> G1[Адреса + індекс]
    G --> G2["Розрахунок вартості\n(по вазі товарів)"]

    B -->|USA / Canada| H[Міжнародна доставка]
    H --> H1[Адреса + ZIP code]
    H --> H2["Розрахунок вартості\n(по вазі товарів)"]

    D --> I[Безкоштовна доставка від 1000 UAH]
    E --> I
```

### Shipping бізнес-правила

| Правило | Опис |
|---------|------|
| **Безкоштовна доставка** | Від 1000 UAH (Україна, Nova Poshta) |
| **Вага варіанту** | Зберігається в `weight_grams` у Variant |
| **Трекінг** | Автоматичне створення ТТН через NP API |
| **Міжнародна** | Вартість розраховується по зонах + вага |
| **Обмеження** | Деякі товари можуть мати обмеження на міжнародну доставку |

## 8.6 Blog — Контентна модель

```mermaid
graph TD
    subgraph Blog["Блог"]
        B1["news / news-de\n(Корисна інформація)"]
        B2["instrukciі-po-vzhivannyu\n(Інструкції по вживанню)"]
    end

    subgraph Articles["Статті (~30 UA + переклади)"]
        A1["Мікродозинг мухомора"]
        A2["Біохімія мухомора"]
        A3["Як визначити якість"]
        A4["Кордіцепс властивості"]
        A5["ПТСР та мікродозинг"]
        A6["..."]
    end

    subgraph Instructions["Інструкції (6)"]
        I1["Червоний мухомор"]
        I2["Їжовик гребінчастий"]
        I3["Гриб веселка"]
        I4["Кордіцепс"]
        I5["Гриби лисички"]
        I6["Гриб чага"]
    end

    B1 --> A1 & A2 & A3 & A4 & A5 & A6
    B2 --> I1 & I2 & I3 & I4 & I5 & I6

    subgraph SEO["SEO для блогу"]
        S1["Кожна стаття — окрема сторінка\nз meta, OG, canonical"]
        S2["Пагінація: ?page=1, ?page=2..."]
        S3["Atom feed для RSS readers"]
        S4["Author: ТОВ Територія Комфорту"]
    end

    Articles --> S1 & S2 & S3 & S4
```

## 8.7 Dropshipping & Wholesale (Bulk)

```mermaid
graph TD
    A[Бізнес-моделі] --> B[B2C: Роздрібні клієнти]
    A --> C[B2B: Оптовики]
    A --> D[Dropshipping]

    B --> B1[Стандартне замовлення через сайт]
    B --> B2[Оплата: картка / Apple Pay / Google Pay]

    C --> C1["Сторінка /pages/bulk\nФорма заявки на опт"]
    C --> C2["Індивідуальне ціноутворення"]
    C --> C3["Мінімальне замовлення"]

    D --> D1["Сторінка /pages/dropshipping\nОпис програми"]
    D --> D2["Зв'язок через форму"]
    D --> D3["Спеціальні умови"]
```

## 8.8 Analytics Events — Data Layer

```mermaid
sequenceDiagram
    actor User
    participant Site as Next.js
    participant DL as dataLayer
    participant GA4 as Google Analytics 4
    participant FB as Facebook Pixel

    User->>Site: Переглядає товар
    Site->>DL: view_item {item_id, item_name, price}
    DL->>GA4: gtag('event', 'view_item', {...})
    DL->>FB: fbq('track', 'ViewContent', {...})

    User->>Site: Додає в кошик
    Site->>DL: add_to_cart {item_id, quantity, value}
    DL->>GA4: gtag('event', 'add_to_cart', {...})
    DL->>FB: fbq('track', 'AddToCart', {...})

    User->>Site: Починає checkout
    Site->>DL: begin_checkout {items, value, currency}
    DL->>GA4: gtag('event', 'begin_checkout', {...})
    DL->>FB: fbq('track', 'InitiateCheckout', {...})

    User->>Site: Додає платіжні дані
    Site->>DL: add_payment_info {payment_type}
    DL->>GA4: gtag('event', 'add_payment_info', {...})
    DL->>FB: fbq('track', 'AddPaymentInfo', {...})

    User->>Site: Завершує покупку
    Site->>DL: purchase {transaction_id, value, items}
    DL->>GA4: gtag('event', 'purchase', {...})
    DL->>FB: fbq('track', 'Purchase', {...})

    Note over GA4: Google Ads Conversion:\nAW-11375386416/conversion_label
```

### Event mapping (Shopify → Next.js)

| Shopify Event | GA4 Event | FB Pixel | Сторінка |
|--------------|-----------|----------|----------|
| Page view | `page_view` | `PageView` | Всі |
| Product view | `view_item` | `ViewContent` | Product |
| Add to cart | `add_to_cart` | `AddToCart` | Product/Collection |
| Begin checkout | `begin_checkout` | `InitiateCheckout` | Checkout |
| Add payment | `add_payment_info` | `AddPaymentInfo` | Checkout step 3 |
| Purchase | `purchase` | `Purchase` | Success page |
| Search | `search` | `Search` | Search |
