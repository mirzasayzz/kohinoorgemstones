# Kohinoor Gemstone

A full-stack D2C gemstone marketplace with bilingual catalog, dynamic pricing, real-time chat, and AI-powered recommendations.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Socket.io
- **Backend:** Node.js, Express, MongoDB
- **AI:** Google Gemini API with multi-provider fallback
- **Auth:** JWT + OTP email verification (Resend API)
- **Payments:** Razorpay
- **Media:** Cloudinary + Multer
- **QA Automation:** Playwright, TypeScript, Page Object Model, GitHub Actions CI/CD

## Features

- Bilingual gemstone catalog with dynamic pricing
- Real-time Socket.io chat with authenticated rooms
- LLM chatbot via Gemini API with zodiac/budget/occasion scoring
- Certification tracking per gemstone
- WhatsApp deep-link per product
- RBAC admin dashboard
- Dual-auth (JWT + OTP email verification)

## QA Automation Framework

### Architecture

```
tests/
├── pages/                    # Page Object Model classes
│   ├── BasePage.ts          # Base class with common methods
│   ├── HomePage.ts          # Homepage interactions
│   ├── LoginPage.ts         # Login functionality
│   ├── RegisterPage.ts      # Registration functionality
│   ├── ProductPage.ts       # Product details page
│   ├── CartPage.ts          # Shopping cart
│   ├── CheckoutPage.ts      # Checkout process
│   └── ProfilePage.ts       # User profile
├── tests/
│   ├── e2e/                 # 171 End-to-end tests
│   │   ├── auth/            # Login + Registration (60 tests)
│   │   ├── product/         # Browsing, search, details (46 tests)
│   │   ├── cart/            # Cart operations (32 tests)
│   │   └── checkout/        # Payment flows (33 tests)
│   └── api/                 # 64 API tests
│       ├── auth/            # Authentication endpoints (19 tests)
│       ├── products/        # Product CRUD + search (23 tests)
│       └── cart/            # Cart operations (22 tests)
├── playwright.config.ts     # Multi-browser config
└── package.json             # Dependencies + scripts
```

### Test Coverage: 235 Tests

| Category | Tests | Coverage |
|----------|-------|----------|
| Login | 32 | UI, auth, security, accessibility, responsive |
| Registration | 28 | Fields, validation, password strength, terms |
| Product Browsing | 46 | Search, details, images, tabs, categories, responsive |
| Shopping Cart | 32 | Add, update, remove, quantities, coupons, totals |
| Checkout | 33 | Shipping, payment methods, COD, order summary |
| Auth API | 19 | Register, login, profile, JWT, email verification |
| Products API | 23 | CRUD, search, filter, pagination, sorting, schema |
| Cart API | 22 | Add, update, remove, calculations, validation |

### Testing Capabilities

- **E2E Testing:** Complete user journeys from registration to checkout
- **API Testing:** RESTful endpoint validation with schema checks
- **Cross-Browser:** Chrome, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Mobile Testing:** Pixel 5 and iPhone 12 viewport testing
- **Security Testing:** JWT validation, password masking, rate limiting, XSS prevention
- **Accessibility Testing:** ARIA labels, keyboard navigation, form labels
- **Responsive Testing:** Mobile (375px), Tablet (768px), Desktop viewports
- **Performance Monitoring:** Page load times, API response times, Core Web Vitals
- **Visual Regression:** Screenshot comparison on failure
- **Data-Driven Testing:** Faker.js for dynamic test data generation

### Running Tests

```bash
cd tests
npm install
npx playwright install --with-deps
npm test                    # Run all tests
npm run test:e2e           # E2E tests only
npm run test:api           # API tests only
npm run test:auth          # Auth tests only
npm run test:headed        # Visible browser mode
npm run test:debug         # Debug mode with inspector
npm run test:ui            # Interactive UI mode
npm run report             # View HTML report
```

### CI/CD Pipeline

GitHub Actions workflow runs on every push:
- Matrix testing across Chromium, Firefox, WebKit
- Parallel execution with retry on failure
- HTML + JSON test reports
- Artifact upload for test results
- PR comment with test summary

## Live

[kohinoorgemstone.com](https://kohinoorgemstone.com)

## Author

[Tuba Mirza](https://github.com/mirzasayzz)
