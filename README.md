# Kohinoor Gemstone

> Full-stack D2C gemstone marketplace with AI-powered recommendations, real-time chat, and comprehensive QA automation.

[![CI](https://github.com/mirzasayzz/kohinoorgemstones/actions/workflows/qa-automation.yml/badge.svg)](https://github.com/mirzasayzz/kohinoorgemstones/actions)
[![Tests](https://img.shields.io/badge/tests-235-brightgreen)](https://github.com/mirzasayzz/kohinoorgemstones)
[![Playwright](https://img.shields.io/badge/Playwright-1.59-blue)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)

[Live Demo](https://kohinoorgemstone.com) | [QA Report](tests/README.md) | [Architecture](ARCHITECTURE.md)

---

## Overview

Kohinoor Gemstone is a production e-commerce platform for certified gemstones. The platform features a bilingual catalog, dynamic pricing, WhatsApp deep-links, and an AI chatbot that recommends gemstones based on zodiac, budget, occasion, and purpose.

### Key Metrics

| Metric | Value |
|--------|-------|
| Test Suites | 8 |
| Total Tests | 235 |
| E2E Tests | 171 |
| API Tests | 64 |
| Browser Coverage | 5 (Chrome, Firefox, WebKit, Mobile Chrome, Mobile Safari) |
| Page Objects | 9 classes |
| CI/CD | GitHub Actions |

---

## Architecture

```
kohinoorgemstones/
├── frontend/                 # React + Tailwind CSS
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helper functions
│   └── package.json
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── middleware/       # Auth, validation, error handling
│   │   └── utils/            # Email, encryption, helpers
│   └── package.json
├── tests/                    # Playwright QA automation
│   ├── pages/                # Page Object Model (9 classes)
│   │   ├── BasePage.ts       # Base class with common methods
│   │   ├── HomePage.ts       # Search, categories, featured
│   │   ├── LoginPage.ts      # Auth flows, validation
│   │   ├── RegisterPage.ts   # Registration, password strength
│   │   ├── ProductPage.ts    # Details, images, tabs, actions
│   │   ├── CartPage.ts       # Cart operations, coupons
│   │   ├── CheckoutPage.ts   # Payment, shipping, orders
│   │   ├── ProfilePage.ts    # User profile management
│   │   └── index.ts          # Barrel exports
│   ├── tests/
│   │   ├── e2e/              # End-to-end browser tests
│   │   │   ├── auth/         # login + registration (60 tests)
│   │   │   ├── product/      # browsing + search (46 tests)
│   │   │   ├── cart/         # cart operations (32 tests)
│   │   │   └── checkout/     # payment flows (33 tests)
│   │   └── api/              # REST API validation
│   │       ├── auth/         # authentication (19 tests)
│   │       ├── products/     # product CRUD (23 tests)
│   │       └── cart/         # cart operations (22 tests)
│   ├── helpers/              # Testing utilities
│   │   ├── performance.ts    # Core Web Vitals, load budgets
│   │   ├── accessibility.ts  # ARIA, keyboard nav, contrast
│   │   └── visual.ts         # Screenshots, layout shift
│   ├── playwright.config.ts  # Multi-browser configuration
│   └── package.json          # Scripts and dependencies
├── .github/workflows/
│   └── qa-automation.yml     # CI/CD pipeline
└── docker-compose.yml        # Container orchestration
```

---

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time chat
- **React Router** for navigation

### Backend
- **Node.js** + **Express**
- **MongoDB** with Mongoose
- **JWT** + **OTP email verification** (Resend API)
- **Razorpay** for payments
- **Cloudinary** + **Multer** for media
- **Google Gemini API** for AI recommendations

### QA Automation
- **Playwright** 1.59 with TypeScript
- **Page Object Model** pattern
- **Faker.js** for test data generation
- **GitHub Actions** for CI/CD
- **ESLint** + **Prettier** for code quality

---

## Features

### E-Commerce
- Bilingual gemstone catalog (English/Hindi)
- Dynamic pricing based on carat, clarity, cut
- Certification tracking per gemstone
- WhatsApp deep-link per product
- Razorpay payment integration
- Saved address management

### AI & Real-Time
- Gemini-powered chatbot with zodiac/budget/occasion scoring
- Multi-provider LLM fallback (Gemini -> Groq)
- Socket.io real-time chat with authenticated rooms
- Admin dashboard with RBAC

### QA Automation
- 235 automated tests across E2E and API
- Cross-browser testing (5 browsers)
- Mobile-responsive testing (Pixel 5, iPhone 12)
- Performance monitoring (LCP, CLS, load times)
- Accessibility testing (ARIA, keyboard nav)
- CI/CD with matrix browser testing

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas or local instance
- Razorpay test keys
- Cloudinary account

### Installation

```bash
# Clone the repository
git clone https://github.com/mirzasayzz/kohinoorgemstones.git
cd kohinoorgemstones

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install test dependencies
cd ../tests && npm install && npx playwright install --with-deps
```

### Environment Variables

```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=your_resend_key

# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Tests (.env)
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

### Running

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Run tests
cd tests && npm test
```

---

## QA Automation

### Test Coverage

| Suite | Tests | Description |
|-------|-------|-------------|
| Login | 32 | UI, auth, security, accessibility, responsive |
| Registration | 28 | Fields, validation, password strength, terms |
| Products | 46 | Search, details, images, tabs, categories |
| Cart | 32 | Add, update, remove, quantities, coupons |
| Checkout | 33 | Shipping, payment methods, COD, orders |
| Auth API | 19 | Register, login, profile, JWT, verification |
| Products API | 23 | CRUD, search, filter, pagination, sorting |
| Cart API | 22 | Add, update, remove, calculations, validation |

### Running Tests

```bash
cd tests

# All tests
npm test

# Specific suites
npm run test:e2e           # E2E tests
npm run test:api           # API tests
npm run test:auth          # Auth tests only

# Modes
npm run test:headed        # Visible browser
npm run test:debug         # Debug with inspector
npm run test:ui            # Interactive UI mode

# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Reports
npm run report
```

### CI/CD Pipeline

GitHub Actions runs on every push:
- **Trigger:** Push to main/develop, PRs, daily schedule
- **Matrix:** Chromium, Firefox, WebKit
- **Steps:** Checkout, Node.js setup, install deps, install browsers, run E2E, run API, upload artifacts
- **Reports:** HTML + JSON, 7-day retention
- **PR Comments:** Automated test summary

---

## Project Structure

### Page Objects

| Class | Responsibility |
|-------|---------------|
| `BasePage` | Common methods (fill, click, waitFor, screenshot) |
| `HomePage` | Search, categories, featured products, navigation |
| `LoginPage` | Login form, validation, remember me, forgot password |
| `RegisterPage` | Registration form, password strength, terms |
| `ProductPage` | Product details, images, tabs, add to cart |
| `CartPage` | Cart operations, coupon codes, quantity updates |
| `CheckoutPage` | Shipping, payment methods, order placement |
| `ProfilePage` | User profile, address management |

### Test Helpers

| Module | Purpose |
|--------|---------|
| `performance.ts` | Core Web Vitals, load time budgets, resource monitoring |
| `accessibility.ts` | ARIA checks, keyboard navigation, color contrast |
| `visual.ts` | Screenshot comparison, responsive testing, layout shift |

---

## Security

- JWT authentication with refresh tokens
- OTP email verification via Resend API
- AES-256 encryption for API keys
- HMAC signature verification for webhooks
- Rate limiting on auth endpoints
- XSS prevention via input sanitization
- CORS configuration for production

---

## Deployment

### Docker

```bash
docker-compose up -d
```

### Manual

```bash
# Build frontend
cd frontend && npm run build

# Start backend (serves API + static files)
cd backend && NODE_ENV=production npm start
```

### Environment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Media:** Cloudinary CDN

---

## Author

**Tuba Mirza**

- [GitHub](https://github.com/mirzasayzz)
- [LinkedIn](https://linkedin.com/in/tubamirza)
- Email: tubamirza822@gmail.com

---

## License

MIT
