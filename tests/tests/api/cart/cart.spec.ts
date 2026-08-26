import { test, expect } from '@playwright/test';
import { assertApiAvailable } from '../../../helpers/api-check';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Pre-seeded customer credentials (from seed-ci.js)
const CUSTOMER_EMAIL = 'customer@playwright.local';
const CUSTOMER_PASSWORD = 'PlaywrightPassword123';

test.describe('Cart API', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    await assertApiAvailable(request, API_BASE_URL);

    // Login to get auth token
    const loginResponse = await request.post(`${API_BASE_URL}/api/customer/login`, {
      data: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD },
    });
    const loginResult = await loginResponse.json();
    authToken = loginResult.token;
  });

  test.describe('Get Cart', () => {
    test('should get user cart', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const cart = await response.json();
      expect(cart).toHaveProperty('items');
      expect(cart).toHaveProperty('total');
      expect(Array.isArray(cart.items)).toBeTruthy();
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/cart`);
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return empty cart for new user', async ({ request }) => {
      // Clear cart first
      await request.delete(`${API_BASE_URL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const response = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const cart = await response.json();
      expect(cart.items).toBeDefined();
      expect(cart.items.length).toBe(0);
    });
  });

  test.describe('Add to Cart', () => {
    test('should add item to cart', async ({ request }) => {
      // Get a gemstone ID
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 1 },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('items');
      expect(result.items.length).toBeGreaterThan(0);
    });

    test('should add multiple quantities', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 3 },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should return 404 for non-existent product', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: '507f1f77bcf86cd799439011', quantity: 1 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 400 for invalid quantity', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: -1 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for zero quantity', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 0 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        data: { productId: '507f1f77bcf86cd799439011', quantity: 1 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Update Cart', () => {
    test('should update cart item quantity', async ({ request }) => {
      // Get cart to find item ID
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cart = await cartResponse.json();

      if (cart.items.length > 0) {
        const itemId = cart.items[0]._id;
        const response = await request.put(
          `${API_BASE_URL}/api/cart/update/${itemId}`,
          { headers: { Authorization: `Bearer ${authToken}` }, data: { quantity: 5 } }
        );

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      }
    });

    test('should return 404 for non-existent item', async ({ request }) => {
      const response = await request.put(
        `${API_BASE_URL}/api/cart/update/507f1f77bcf86cd799439011`,
        { headers: { Authorization: `Bearer ${authToken}` }, data: { quantity: 3 } }
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 400 for invalid quantity', async ({ request }) => {
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cart = await cartResponse.json();

      if (cart.items.length > 0) {
        const itemId = cart.items[0]._id;
        const response = await request.put(
          `${API_BASE_URL}/api/cart/update/${itemId}`,
          { headers: { Authorization: `Bearer ${authToken}` }, data: { quantity: -1 } }
        );

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
      }
    });
  });

  test.describe('Remove from Cart', () => {
    test('should remove item from cart', async ({ request }) => {
      // Add an item first
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 1 },
      });

      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cart = await cartResponse.json();

      if (cart.items.length > 0) {
        const itemId = cart.items[0]._id;
        const response = await request.delete(`${API_BASE_URL}/api/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      }
    });

    test('should return 404 for non-existent item', async ({ request }) => {
      const response = await request.delete(
        `${API_BASE_URL}/api/cart/remove/507f1f77bcf86cd799439011`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/remove/507f1f77bcf86cd799439011`);
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Clear Cart', () => {
    test('should clear entire cart', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/clear`);
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Cart Calculations', () => {
    test('should calculate cart total correctly', async ({ request }) => {
      // Clear cart first
      await request.delete(`${API_BASE_URL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Get gemstone with known price
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstone = gemstonesBody.data.gemstones[0];
      const gemstoneId = gemstone._id;

      // Add item
      await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 2 },
      });

      // Get cart
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cart = await cartResponse.json();
      expect(cart.total).toBeGreaterThan(0);
    });

    test('should update total when quantity changes', async ({ request }) => {
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cart = await cartResponse.json();

      if (cart.items.length > 0) {
        const initialTotal = cart.total;
        const itemId = cart.items[0]._id;

        await request.put(
          `${API_BASE_URL}/api/cart/update/${itemId}`,
          { headers: { Authorization: `Bearer ${authToken}` }, data: { quantity: 10 } }
        );

        const updatedCartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const updatedCart = await updatedCartResponse.json();
        expect(updatedCart.total).not.toBe(initialTotal);
      }
    });
  });

  test.describe('Cart Validation', () => {
    test('should validate product exists when adding', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: '507f1f77bcf86cd799439011', quantity: 1 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should validate quantity is positive', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: -5 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should validate quantity is not zero', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 0 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for missing product ID', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { quantity: 1 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for non-numeric quantity', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 'abc' },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for decimal quantity', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 1.5 },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Cart Edge Cases', () => {
    test('should return 401 for update without auth', async ({ request }) => {
      const response = await request.put(
        `${API_BASE_URL}/api/cart/update/507f1f77bcf86cd799439011`,
        { data: { quantity: 1 } }
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should return 401 for clear without auth', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/clear`);
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });

    test('should handle large quantity', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 100 },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should handle adding same product multiple times', async ({ request }) => {
      const gemstonesResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const gemstonesBody = await gemstonesResponse.json();
      const gemstoneId = gemstonesBody.data.gemstones[0]._id;

      // Add twice
      await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 1 },
      });
      await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId: gemstoneId, quantity: 1 },
      });

      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cart = await cartResponse.json();

      // Should have quantity 2, not 2 items
      const item = cart.items.find((i: { product: string }) => i.product === gemstoneId);
      if (item) {
        expect(item.quantity).toBe(2);
      }
    });
  });
});
