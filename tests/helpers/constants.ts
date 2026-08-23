// Test Constants for Kohinoor Gemstone QA Automation
// Centralizes all test configuration values

// URLs
export const URLS = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  WISHLIST: '/wishlist',
} as const;

// Selectors
export const SELECTORS = {
  EMAIL_INPUT: 'input[type="email"], input[name="email"]',
  PASSWORD_INPUT: 'input[type="password"], input[name="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',
  ERROR_MESSAGE: '[class*="error"], [class*="alert-danger"]',
  SUCCESS_MESSAGE: '[class*="success"], [class*="alert-success"]',
  LOADING_SPINNER: '.loading, .spinner, [class*="loading"]',
} as const;

// Test data
export const TEST_DATA = {
  VALID_EMAIL: 'customer@playwright.local',
  VALID_PASSWORD: 'PlaywrightPassword123',
  INVALID_EMAIL: 'invalid@example.com',
  INVALID_PASSWORD: 'WrongPassword123!',
  OTP: '123456',
} as const;

// Timeouts (ms)
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  PAGE_LOAD: 30000,
  ACTION: 15000,
} as const;

// Viewports
export const VIEWPORTS = {
  MOBILE: { width: 375, height: 812 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1440, height: 900 },
} as const;

// HTTP Status Codes
export const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const;

// API Endpoints
export const ENDPOINTS = {
  LOGIN: '/api/customer/login',
  SIGNUP: '/api/customer/signup',
  SEND_OTP: '/api/customer/send-otp',
  VERIFY_OTP: '/api/customer/verify-otp',
  FORGOT_PASSWORD: '/api/customer/forgot-password',
  PROFILE: '/api/customer/profile',
  ME: '/api/customer/me',
  LOGOUT: '/api/customer/logout',
  CART: '/api/cart',
  CART_ADD: '/api/cart/add',
  GEMSTONES: '/api/gemstones',
  HEALTH: '/api/health',
} as const;
