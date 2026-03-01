# 04. Удосконалений механізм замовлення + Apple Pay / Google Pay

## 4.1 Поточний флоу замовлення (Shopify)

```mermaid
sequenceDiagram
    actor User
    participant Site as Shopify Store
    participant Cart as Shopify Cart API
    participant Checkout as Shopify Hosted Checkout
    participant Payment as Shopify Payments

    User->>Site: Переглядає товар
    User->>Site: Обирає варіант
    User->>Cart: POST /cart/add.json
    Cart-->>Site: Cart updated (section rendering)
    Site->>User: Cart notification popup

    User->>Site: Натискає "Оформити замовлення"
    Site->>Checkout: Redirect → /checkouts/...
    Note over Checkout: Hosted checkout (Shopify контролює)
    Checkout->>User: Форма: контакт, доставка, оплата
    User->>Payment: Заповнює платіжні дані
    Payment-->>Checkout: Payment confirmed
    Checkout->>User: Сторінка "Дякуємо"
```

### Проблеми поточного флоу:
1. ❌ **Hosted checkout** — не кастомізується, різний дизайн
2. ❌ **Redirect** — користувач покидає сайт
3. ❌ **Обмежені способи оплати** — залежність від Shopify Payments
4. ❌ **Немає інтеграції з Nova Poshta API** — ручний ввід адреси
5. ❌ **Немає Apple Pay / Google Pay** як окремих кнопок

## 4.2 Новий флоу замовлення (Next.js + Python + Stripe)

```mermaid
sequenceDiagram
    actor User
    participant Site as Next.js Frontend
    participant API as Python Backend
    participant Stripe as Stripe API
    participant NP as Nova Poshta API
    participant Email as Email Service
    participant TG as Telegram Bot

    User->>Site: Переглядає товар
    User->>Site: Обирає варіант, кількість
    Site->>Site: Zustand cart.add() — client-side

    alt Quick Buy (Apple Pay / Google Pay)
        User->>Site: Натискає Apple Pay / Google Pay
        Site->>API: POST /api/v1/payments/create-intent
        API->>Stripe: Create PaymentIntent
        Stripe-->>API: client_secret
        API-->>Site: client_secret
        Site->>Stripe: stripe.confirmPayment() via Payment Request API
        Stripe-->>Site: Payment success
        Site->>API: POST /api/v1/orders (with payment_intent_id)
        API->>API: Validate payment, create order
        API->>Email: Send confirmation
        API->>TG: Notify admin
        API-->>Site: Order created
        Site->>User: Сторінка подяки
    else Standard Checkout
        User->>Site: Натискає "Оформити замовлення"
        Site->>Site: /checkout page

        rect rgb(240, 248, 255)
            Note over Site: Крок 1: Контактні дані
            User->>Site: Email, телефон, ім'я
        end

        rect rgb(240, 255, 240)
            Note over Site: Крок 2: Доставка
            User->>Site: Обирає метод доставки
            Site->>API: GET /api/v1/shipping/warehouses?city=...
            API->>NP: Nova Poshta API
            NP-->>API: Список відділень
            API-->>Site: Warehouses list
            User->>Site: Обирає відділення НП
        end

        rect rgb(255, 248, 240)
            Note over Site: Крок 3: Оплата
            Site->>API: POST /api/v1/payments/create-intent
            API->>Stripe: Create PaymentIntent
            Stripe-->>API: client_secret
            API-->>Site: client_secret + payment methods

            alt Card Payment
                User->>Site: Вводить дані картки
                Site->>Stripe: stripe.confirmCardPayment()
            else Apple Pay
                User->>Site: Натискає Apple Pay
                Site->>Stripe: Payment Request API
            else Google Pay
                User->>Site: Натискає Google Pay
                Site->>Stripe: Payment Request API
            else LiqPay
                Site->>API: POST /api/v1/payments/liqpay
                API-->>Site: Redirect URL
                Site->>User: Redirect to LiqPay
            end

            Stripe-->>Site: Payment confirmed
        end

        Site->>API: POST /api/v1/orders
        API->>API: Validate + Create order
        API->>Email: Confirmation email
        API->>TG: Admin notification
        API-->>Site: order_id, status
        Site->>User: /checkout/success?order={id}
    end
```

## 4.3 Порівняння поточного vs нового флоу

| Аспект | Shopify (поточний) | Next.js + Stripe (новий) |
|--------|-------------------|--------------------------|
| **Checkout** | Hosted (redirect) | Вбудований (on-site) |
| **Дизайн** | Стандартний Shopify | Кастомний, бренд-консистентний |
| **Apple Pay** | Через Shopify Payments | Stripe Payment Request API |
| **Google Pay** | Через Shopify Payments | Stripe Payment Request API |
| **Карткова оплата** | Shopify Payments | Stripe Elements |
| **LiqPay** | ❌ Не підтримується | ✅ Redirect-based |
| **Monobank** | ❌ Не підтримується | ✅ Можливо через API |
| **Nova Poshta** | Ручний ввід | Автокомплект відділень |
| **Кроки checkout** | 1 сторінка (hosted) | 3 кроки (wizard) |
| **Швидка покупка** | ❌ | ✅ Express checkout buttons |
| **Збереження кошика** | Cookie/session | Zustand + localStorage + server-sync |

## 4.4 Архітектура платежів (Stripe)

```mermaid
graph TB
    subgraph Frontend["Next.js Frontend"]
        A[Stripe Elements]
        B[Payment Request Button]
        B1[Apple Pay]
        B2[Google Pay]
        C[Card Input]
    end

    subgraph Backend["Python Backend"]
        D[Payment Service]
        E[Order Service]
        F[Webhook Handler]
    end

    subgraph Stripe["Stripe"]
        G[PaymentIntent API]
        H[Webhook Events]
    end

    subgraph Other["Alternative Payments"]
        I[LiqPay API]
        J[Monobank Acquiring]
    end

    B --> B1 & B2
    B1 & B2 --> A
    C --> A
    A -->|client_secret| G
    D -->|create PaymentIntent| G
    G -->|payment_intent.succeeded| H
    H -->|POST /webhooks/stripe| F
    F --> E

    D -->|redirect flow| I
    I -->|callback| F

    E -->|order.created| F
```

## 4.5 Stripe Payment Request API (Apple Pay + Google Pay)

### Як це працює

```mermaid
sequenceDiagram
    participant Browser
    participant StripeJS as Stripe.js
    participant Backend as Python API
    participant Stripe as Stripe API

    Note over Browser: Перевірка підтримки
    Browser->>StripeJS: stripe.paymentRequest({...})
    StripeJS->>Browser: canMakePayment()
    Browser-->>StripeJS: {applePay: true, googlePay: true}

    Note over Browser: Користувач натиснув кнопку
    Browser->>StripeJS: paymentRequest.show()
    StripeJS->>Browser: Native payment sheet (Face ID / fingerprint)
    Browser-->>StripeJS: PaymentMethod token

    StripeJS->>Backend: POST /payments/create-intent {amount, currency, payment_method}
    Backend->>Stripe: stripe.PaymentIntent.create()
    Stripe-->>Backend: {id, client_secret, status}
    Backend-->>StripeJS: {client_secret}

    StripeJS->>Stripe: confirmPayment(client_secret)
    Stripe-->>StripeJS: {status: "succeeded"}
    StripeJS-->>Browser: Payment complete
    Browser->>Backend: POST /orders {payment_intent_id, cart, shipping}
```

### Вимоги для Apple Pay

1. **Домен верифікація**: файл `/.well-known/apple-developer-merchantid-domain-association` на сервері
2. **HTTPS обов'язково**: Apple Pay працює тільки через HTTPS
3. **Stripe Dashboard**: активувати Apple Pay в налаштуваннях Stripe
4. **Safari / iOS**: працює тільки в Safari та iOS пристроях

### Вимоги для Google Pay

1. **Google Pay API**: реєстрація merchant ID в Google Pay Business Console
2. **Stripe Dashboard**: активувати Google Pay
3. **Chrome / Android**: працює в Chrome та Android пристроях

## 4.6 Модель даних замовлення

```mermaid
stateDiagram-v2
    [*] --> pending: Замовлення створено
    pending --> payment_processing: Оплата ініційована
    payment_processing --> paid: Оплата успішна
    payment_processing --> payment_failed: Оплата невдала
    payment_failed --> payment_processing: Повторна спроба
    payment_failed --> cancelled: Скасовано
    paid --> processing: Адмін підтвердив
    processing --> shipped: Відправлено (трекінг)
    shipped --> delivered: Доставлено
    delivered --> [*]
    paid --> refunded: Повернення коштів
    cancelled --> [*]
    refunded --> [*]
```

### Структура замовлення

```python
class OrderCreate(BaseModel):
    """Створення замовлення"""
    # Контактні дані
    email: EmailStr
    phone: str
    first_name: str
    last_name: str

    # Кошик
    items: list[OrderItemCreate]

    # Доставка
    shipping_method: Literal["nova_poshta_warehouse", "nova_poshta_courier", "ukrposhta", "international"]
    shipping_address: ShippingAddress

    # Оплата
    payment_method: Literal["stripe_card", "apple_pay", "google_pay", "liqpay"]
    payment_intent_id: str | None = None  # Для Stripe

    # Мова та валюта
    locale: Literal["uk", "en", "de"] = "uk"
    currency: str = "UAH"

    # Додатково
    notes: str | None = None
    accepts_marketing: bool = False


class ShippingAddress(BaseModel):
    """Адреса доставки"""
    country: str
    city: str
    # Для Nova Poshta
    nova_poshta_warehouse_ref: str | None = None
    nova_poshta_warehouse_name: str | None = None
    # Для міжнародної доставки
    address_line1: str | None = None
    address_line2: str | None = None
    postal_code: str | None = None
    region: str | None = None
```

## 4.7 Інтеграція Nova Poshta

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js
    participant Backend as Python API
    participant NP as Nova Poshta API

    User->>Frontend: Вводить місто
    Frontend->>Backend: GET /shipping/cities?q=Київ
    Backend->>NP: POST api.novaposhta.ua/v2.0/json/ {method: searchSettlements}
    NP-->>Backend: [{Ref, Description, Area}]
    Backend-->>Frontend: Cities autocomplete

    User->>Frontend: Обирає місто
    Frontend->>Backend: GET /shipping/warehouses?city_ref=xxx
    Backend->>NP: POST {method: getWarehouses, CityRef}
    NP-->>Backend: [{Ref, Description, Number, TypeOfWarehouse}]
    Backend-->>Frontend: Warehouses list

    User->>Frontend: Обирає відділення №42
    Frontend->>Frontend: Зберігає warehouse_ref у формі

    Note over Backend: Після створення замовлення
    Backend->>NP: POST {method: save, InternetDocument}
    NP-->>Backend: {IntDocNumber, CostOnSite, EstimatedDeliveryDate}
    Backend->>Backend: Зберігає tracking_number
```

## 4.8 Checkout UI — 3-крокова форма

```mermaid
graph LR
    A["Крок 1\n📧 Контакти"] --> B["Крок 2\n🚚 Доставка"] --> C["Крок 3\n💳 Оплата"]

    subgraph Step1["Контактна інформація"]
        A1[Email]
        A2[Телефон]
        A3["Ім'я / Прізвище"]
    end

    subgraph Step2["Доставка"]
        B1[Метод доставки]
        B2[Пошук міста]
        B3[Вибір відділення НП]
        B4[Або адреса для кур'єра]
    end

    subgraph Step3["Оплата"]
        C1[Express: Apple Pay / Google Pay]
        C2[Stripe Card Element]
        C3[LiqPay redirect]
        C4[Підсумок замовлення]
    end
```

## 4.9 Express Checkout (Quick Buy)

Express checkout дозволяє купити товар прямо зі сторінки товару або кошика **без заповнення форм** — адреса і платіж беруться з Apple Pay / Google Pay.

```mermaid
graph TD
    A[Сторінка товару] --> B{Apple Pay / Google Pay доступний?}
    B -->|Так| C[Показати Express Checkout кнопки]
    B -->|Ні| D[Тільки стандартний Checkout]

    C --> E[User натискає кнопку]
    E --> F[Native Payment Sheet]
    F --> G[Автозаповнення: ім'я, email, адреса, картка]
    G --> H[Підтвердження Face ID / PIN]
    H --> I[Payment Token → Stripe]
    I --> J[Створення замовлення на бекенді]
    J --> K[Confirmation page]

    D --> L[Кошик → 3-крокова форма Checkout]
```

## 4.10 Сповіщення про замовлення

```mermaid
graph TD
    A[Нове замовлення] --> B[Order Service]

    B --> C[Email клієнту]
    B --> D[Telegram адміну]
    B --> E[Email адміну]

    C --> C1[Підтвердження замовлення]
    C --> C2[Оплата отримана]
    C --> C3[Замовлення відправлено + трекінг]
    C --> C4[Замовлення доставлено]

    D --> D1[🔔 Нове замовлення #123]
    D --> D2[💰 Оплата: 1250 UAH]
    D --> D3[📦 Товари: Мухомор 60шт x2]
    D --> D4[🚚 Доставка: НП Київ №42]

    subgraph Celery["Background Tasks (Celery)"]
        C
        D
        E
    end
```

## 4.11 Безпека платежів

| Захід | Реалізація |
|-------|-----------|
| **PCI DSS** | Stripe Elements — карткові дані ніколи не торкаються нашого сервера |
| **3D Secure** | Stripe SCA (Strong Customer Authentication) автоматично |
| **HTTPS** | Обов'язково для Apple Pay та Google Pay |
| **Webhook verification** | stripe.Webhook.construct_event() з підписом |
| **Idempotency** | Idempotency keys на створення PaymentIntent |
| **Rate limiting** | Redis-based rate limiter на API |
| **Input validation** | Pydantic schemas + Zod на фронті |
| **CSRF** | Next.js built-in CSRF protection |
| **hCaptcha** | На формі контактів та checkout (anti-bot) |
