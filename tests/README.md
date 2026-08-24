# Kohinoor Gemstone - QA Automation Framework

A comprehensive Playwright-based test automation framework for the Kohinoor Gemstone e-commerce platform. Built with TypeScript, Page Object Model pattern, and CI/CD integration.

## Test Suite: 235 Tests

### E2E Tests (171 tests)

#### Authentication (60 tests)
- **Login (32):** UI validation, successful/failed login, remember me, logout, form validation, accessibility, security, responsive
- **Registration (28):** Form fields, validation, password strength, terms acceptance, navigation, responsive

#### Product Browsing (46 tests)
- Homepage display, hero section, featured products, categories, footer
- Product search with enter, empty search, no results handling
- Product details: name, price, description, images, tabs, breadcrumb
- Quantity selection, add to cart, wishlist, buy now
- Related products, certification badge, category navigation
- Scroll interactions, responsive design

#### Shopping Cart (32 tests)
- Empty cart display, add single/multiple products
- Custom quantities, same product multiple times
- Update quantity, remove items, clear cart
- Coupon validation, total calculation, continue shopping

#### Checkout Process (33 tests)
- Checkout page display, shipping form, payment section
- Credit card, UPI, Cash on Delivery payment methods
- Form validation, order summary, place order flow
- Navigation back to cart, responsive design

### API Tests (64 tests)

#### Authentication API (19 tests)
- Register new user, duplicate email handling
- Login with valid/invalid credentials, JWT token validation
- Profile get/update, logout, password reset, email verification

#### Products API (23 tests)
- Get all products, get by ID, 404 handling, schema validation
- Search products, filter by category/price, pagination
- Categories endpoint, sorting (price, name), error handling

#### Cart API (22 tests)
- Get cart, add/update/remove items, clear cart
- Quantity validation, unauthorized access, cart total calculation
- Product existence validation, quantity bounds checking

## Architecture

```
tests/
├── pages/                    # Page Object Model (9 classes)
│   ├── BasePage.ts          # Common methods (fill, click, waitFor)
│   ├── HomePage.ts          # Search, categories, featured
│   ├── LoginPage.ts         # Auth flows, validation
│   ├── RegisterPage.ts      # Registration, password strength
│   ├── ProductPage.ts       # Details, images, tabs, actions
│   ├── CartPage.ts          # Cart operations, coupons
│   ├── CheckoutPage.ts      # Payment, shipping, orders
│   ├── ProfilePage.ts       # User profile management
│   └── index.ts             # Barrel exports
├── tests/
│   ├── e2e/                 # End-to-end browser tests
│   │   ├── auth/            # login.spec.ts, registration.spec.ts
│   │   ├── product/         # product.spec.ts
│   │   ├── cart/            # cart.spec.ts
│   │   └── checkout/        # checkout.spec.ts
│   └── api/                 # REST API validation
│       ├── auth/            # auth.spec.ts
│       ├── products/        # products.spec.ts
│       └── cart/            # cart.spec.ts
├── helpers/                  # Utility modules
│   ├── performance.ts       # Core Web Vitals, load times
│   ├── accessibility.ts     # A11y checks, contrast, ARIA
│   └── visual.ts            # Screenshots, layout shift
├── playwright.config.ts     # Multi-browser configuration
├── package.json             # Scripts and dependencies
└── .env.example             # Environment template
```

## Features

### Testing Capabilities
- **E2E Testing:** Complete user journeys with authenticated states
- **API Testing:** RESTful endpoint validation with JSON schema checks
- **Cross-Browser:** Chromium, Firefox, WebKit testing
- **Mobile Testing:** Pixel 5 (Android), iPhone 12 (iOS) viewports
- **Security Testing:** JWT validation, password masking, rate limiting
- **Accessibility Testing:** ARIA labels, keyboard nav, color contrast
- **Responsive Testing:** 375px, 768px, 1440px viewports
- **Performance Testing:** LCP, CLS, load times, resource budgets
- **Visual Regression:** Screenshot comparison on failure
- **Data-Driven:** Faker.js for dynamic test data

### Framework Features
- **Page Object Model:** Maintainable, reusable page abstractions
- **Type Safety:** Full TypeScript with strict mode
- **Parallel Execution:** Faster test runs across browsers
- **CI/CD Integration:** GitHub Actions with matrix testing
- **Comprehensive Reporting:** HTML, JSON, and list reporters
- **Failure Artifacts:** Screenshots, videos, traces on failure
- **Retry Logic:** Auto-retry on CI (2 retries), no retry locally

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npm test

# Run specific suites
npm run test:e2e           # E2E tests
npm run test:api           # API tests
npm run test:auth          # Auth tests only
npm run test:headed        # Visible browser
npm run test:debug         # Debug with inspector
npm run test:ui            # Interactive UI mode

# View reports
npm run report
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/test.yml`):
- Triggers on push to main/develop, PRs, daily schedule
- Matrix: Chromium, Firefox, WebKit
- Steps: checkout, node setup, install deps, install browsers, run tests, upload artifacts
- PR comments with test results summary
- 7-day artifact retention

## Best Practices

- **Test Independence:** No test depends on another test's state
- **Data Isolation:** Faker.js generates unique data per test
- **Explicit Waits:** Playwright auto-waiting, no sleep calls
- **Failure Evidence:** Screenshots, videos, traces captured automatically
- **Page Objects:** All selectors centralized, easy to maintain
- **Environment Config:** Secrets in .env, never committed

## Author

**Tuba Mirza** - [GitHub](https://github.com/mirzasayzz)
