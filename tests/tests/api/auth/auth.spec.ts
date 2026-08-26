import { test, expect } from '@playwright/test';
import { assertApiAvailable } from '../../../helpers/api-check';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Pre-seeded customer credentials (from seed-ci.js)
const CUSTOMER_EMAIL = 'customer@playwright.local';
const CUSTOMER_PASSWORD = 'PlaywrightPassword123';

test.describe('Authentication API', () => {
  test.beforeAll(async ({ request }) => {
    await assertApiAvailable(request, API_BASE_URL);
  });

  test.describe('Registration', () => {
    test('should register new user', async ({ request }) => {
      const email = `testuser${Date.now()}@playwright.local`;

      // Step 1: Send OTP
      const otpRes = await request.post(`${API_BASE_URL}/api/customer/send-otp`, {
        data: { email },
      });
      expect(otpRes.ok()).toBeTruthy();

      // Step 2: Verify OTP (TEST_MODE uses fixed OTP 123456)
      const verifyRes = await request.post(`${API_BASE_URL}/api/customer/verify-otp`, {
        data: { email, otp: '123456' },
      });
      expect(verifyRes.ok()).toBeTruthy();

      // Step 3: Signup
      const response = await request.post(`${API_BASE_URL}/api/customer/signup`, {
        data: {
          name: 'Test User',
          email,
          password: 'TestPassword123!',
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const result = await response.json();
      expect(result.success).toBeTruthy();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    test('should return 409 for duplicate email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/signup`, {
        data: {
          name: 'Test User',
          email: CUSTOMER_EMAIL,
          password: 'TestPassword123!',
          otp: '123456',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(409);
    });

    test('should return 400 for missing fields', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/signup`, {
        data: {
          email: 'test@example.com',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for weak password', async ({ request }) => {
      const email = `weakpw${Date.now()}@playwright.local`;

      // Send and verify OTP first
      await request.post(`${API_BASE_URL}/api/customer/send-otp`, { data: { email } });
      await request.post(`${API_BASE_URL}/api/customer/verify-otp`, { data: { email, otp: '123456' } });

      const response = await request.post(`${API_BASE_URL}/api/customer/signup`, {
        data: {
          name: 'Weak Password User',
          email,
          password: '123',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD,
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.success).toBeTruthy();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    test('should return 401 for invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: CUSTOMER_EMAIL,
          password: 'WrongPassword123!',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return 400 for missing email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          password: CUSTOMER_PASSWORD,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for missing password', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: CUSTOMER_EMAIL,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return JWT token on successful login', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD,
        },
      });

      const result = await response.json();
      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3); // JWT format
    });
  });

  test.describe('Profile', () => {
    test('should get current user profile', async ({ request }) => {
      // Login to get token
      const loginResponse = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD,
        },
      });
      const loginResult = await loginResponse.json();
      const token = loginResult.token;

      // Get profile
      const response = await request.get(`${API_BASE_URL}/api/customer/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result.success).toBeTruthy();
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('email');
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/customer/me`);
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return 401 for invalid token', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/customer/me`, {
        headers: { Authorization: 'Bearer invalidtoken123' },
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should update user profile', async ({ request }) => {
      // Login to get token
      const loginResponse = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD,
        },
      });
      const loginResult = await loginResponse.json();
      const token = loginResult.token;

      // Update profile
      const response = await request.put(
        `${API_BASE_URL}/api/customer/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { name: 'Updated Playwright Customer' },
        }
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Logout', () => {
    test('should logout user', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/logout`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/forgot-password`, {
        data: { email: CUSTOMER_EMAIL },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should return 200 for non-existent email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/forgot-password`, {
        data: { email: 'nonexistent@example.com' },
      });

      // Should still return 200 for security (don't reveal if email exists)
      expect(response.ok()).toBeTruthy();
    });

    test('should return 400 for missing email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/forgot-password`, {
        data: {},
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('OTP Edge Cases', () => {
    test('should return 400 for missing email on send-otp', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/send-otp`, {
        data: {},
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for wrong OTP', async ({ request }) => {
      const email = `wrongotp${Date.now()}@playwright.local`;
      await request.post(`${API_BASE_URL}/api/customer/send-otp`, { data: { email } });

      const response = await request.post(`${API_BASE_URL}/api/customer/verify-otp`, {
        data: { email, otp: '000000' },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for missing OTP fields', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/verify-otp`, {
        data: {},
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for signup without OTP verification', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/signup`, {
        data: {
          name: 'No OTP User',
          email: `nootp${Date.now()}@playwright.local`,
          password: 'TestPassword123!',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Login Edge Cases', () => {
    test('should return 400 for empty body', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {},
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 401 for non-existent email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: {
          email: `nonexist${Date.now()}@example.com`,
          password: 'SomePassword123!',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Profile Edge Cases', () => {
    test('should return 401 for expired token', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/customer/me`, {
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0eXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.invalid' },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return 401 for missing Bearer prefix', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/api/customer/login`, {
        data: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD },
      });
      const { token } = await loginResponse.json();

      const response = await request.get(`${API_BASE_URL}/api/customer/me`, {
        headers: { Authorization: token },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });
});
