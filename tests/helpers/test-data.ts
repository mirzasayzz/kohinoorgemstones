// Test Data Generator for Kohinoor Gemstone QA Automation
// Provides deterministic test data for consistent test runs

export interface TestCustomer {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface TestGemstone {
  name: { english: string; urdu: string };
  category: string;
  color: string;
  price: number;
  description: string;
}

// Pre-seeded customer credentials (matches seed-ci.js)
export const TEST_CUSTOMER: TestCustomer = {
  name: 'Playwright Customer',
  email: 'customer@playwright.local',
  password: 'PlaywrightPassword123',
  phone: '9876543210',
};

// Generate unique email for registration tests
export function generateTestEmail(): string {
  return `testuser${Date.now()}@playwright.local`;
}

// Generate test customer with unique email
export function generateTestCustomer(): TestCustomer {
  return {
    name: `Test User ${Date.now()}`,
    email: generateTestEmail(),
    password: 'TestPassword123!',
    phone: '9876543210',
  };
}

// Test gemstone data (matches seed-ci.js)
export const TEST_GEMSTONES: TestGemstone[] = [
  {
    name: { english: 'Playwright Emerald', urdu: 'زمرد' },
    category: 'Emerald',
    color: 'Green',
    price: 25000,
    description: 'A deterministic emerald for automated tests',
  },
  {
    name: { english: 'Playwright Ruby', urdu: 'یاقوت' },
    category: 'Ruby',
    color: 'Red',
    price: 18000,
    description: 'A deterministic ruby for automated tests',
  },
];

// Test OTP (fixed in TEST_MODE)
export const TEST_OTP = '123456';

// API endpoints
export const API_ENDPOINTS = {
  CUSTOMER_AUTH: '/api/customer',
  CART: '/api/cart',
  GEMSTONES: '/api/gemstones',
  HEALTH: '/api/health',
} as const;

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  HOMEPAGE: { maxLoadTime: 5000, maxLCP: 2500, maxCLS: 0.1 },
  PRODUCT_DETAIL: { maxLoadTime: 5000, maxLCP: 3000 },
  API_RESPONSE: { maxResponseTime: 1000 },
} as const;

// Test timeouts (ms)
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  PAGE_LOAD: 30000,
} as const;
