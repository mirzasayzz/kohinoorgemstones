# Kohinoor Gemstone

A full-stack D2C gemstone marketplace with bilingual catalog, dynamic pricing, real-time chat, and AI-powered recommendations.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Socket.io
- **Backend:** Node.js, Express, MongoDB
- **AI:** Google Gemini API
- **Auth:** JWT + OTP email verification (Resend API)
- **Payments:** Razorpay
- **Media:** Cloudinary + Multer
- **QA:** Playwright (TypeScript, Page Object Model)

## Features

- Bilingual gemstone catalog with dynamic pricing
- Real-time Socket.io chat with authenticated rooms
- LLM chatbot via Gemini API with multi-provider fallback
- Certification tracking per gemstone
- WhatsApp deep-link per product
- RBAC admin dashboard
- Dual-auth (JWT + OTP email verification)

## QA Automation

- **Framework:** Playwright + TypeScript with Page Object Model
- **Tests:** 5 E2E suites + 3 API suites
- **Browsers:** Chrome, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **CI/CD:** GitHub Actions with matrix browser testing

### Running Tests

```bash
cd tests
npm install
npx playwright install --with-deps
npm test
```

## Live

[kohinoorgemstone.com](https://kohinoorgemstone.com)

## Author

[Tuba Mirza](https://github.com/mirzasayzz)
