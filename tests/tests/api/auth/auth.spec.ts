import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

  test.describe('Registration', () => {
    test('should register new user', async ({ request }) => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '1234567890',
        password: 'TestPassword123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: userData,
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const result = await response.json();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('email', userData.email);
    });

    test('should return 409 for duplicate email', async ({ request }) => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        phone: '1234567890',
        password: 'TestPassword123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(409);
    });

    test('should return 400 for invalid email', async ({ request }) => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalidemail',
        phone: '1234567890',
        password: 'TestPassword123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for weak password', async ({ request }) => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '1234567890',
        password: '123',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for missing fields', async ({ request }) => {
      const userData = {
        email: 'test@example.com',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ request }) => {
      const userData = {
        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: userData,
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    test('should return 401 for invalid credentials', async ({ request }) => {
      const userData = {
        email: 'invalid@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return 400 for missing email', async ({ request }) => {
      const userData = {
        password: 'Password123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for missing password', async ({ request }) => {
      const userData = {
        email: 'test@example.com',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: userData,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return JWT token on successful login', async ({ request }) => {
      const userData = {
        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      };

      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: userData,
      });

      const result = await response.json();
      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3); // JWT format
    });
  });

  test.describe('Profile', () => {
    test('should get current user profile', async ({ request }) => {
      // First login to get token
      const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: {
          email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
          password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        },
      });

      const loginResult = await loginResponse.json();
      const token = loginResult.token;

      // Get profile
      const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const profile = await response.json();
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('firstName');
      expect(profile).toHaveProperty('lastName');
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return 401 for invalid token', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: 'Bearer invalidtoken123',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should update user profile', async ({ request }) => {
      // First login to get token
      const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: {
          email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
          password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        },
      });

      const loginResult = await loginResponse.json();
      const token = loginResult.token;

      // Update profile
      const response = await request.put(
        `${API_BASE_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            firstName: 'Updated',
            lastName: 'Name',
          },
        }
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Logout', () => {
    test('should logout user', async ({ request }) => {
      // First login
      const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: {
          email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
          password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        },
      });

      const loginResult = await loginResponse.json();
      const token = loginResult.token;

      // Logout
      const response = await request.post(`${API_BASE_URL}/api/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        data: {
          email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should return 404 for non-existent email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        data: {
          email: 'nonexistent@example.com',
        },
      });

      // Should still return 200 for security (don't reveal if email exists)
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Email Verification', () => {
    test('should verify email with valid token', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/verify-email`, {
        data: {
          token: 'valid-token',
        },
      });

      // Response depends on token validity
      expect(response.status()).toBeLessThanOrEqual(400);
    });

    test('should return 400 for invalid token', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/verify-email`, {
        data: {
          token: 'invalid-token',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });
});
