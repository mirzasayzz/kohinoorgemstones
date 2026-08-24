import { test, expect } from '@playwright/test';

test.describe('Cart API', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      },
    });

    const loginResult = await loginResponse.json();
    authToken = loginResult.token;
  });

  test.describe('Get Cart', () => {
    test('should get user cart', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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
      const response = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const cart = await response.json();
      expect(cart.items).toBeDefined();
    });
  });

  test.describe('Add to Cart', () => {
    test('should add item to cart', async ({ request }) => {
      // First get a product ID
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: 1,
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('items');
    });

    test('should add multiple quantities', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: 3,
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should return 404 for non-existent product', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: 'nonexistentid',
          quantity: 1,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 400 for invalid quantity', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: -1,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 400 for zero quantity', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: 0,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        data: {
          productId: 'someid',
          quantity: 1,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Update Cart', () => {
    test('should update cart item quantity', async ({ request }) => {
      // First get cart to get item ID
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const cart = await cartResponse.json();
      if (cart.items.length > 0) {
        const itemId = cart.items[0]._id;

        const response = await request.put(`${API_BASE_URL}/api/cart/update/${itemId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          data: {
            quantity: 3,
          },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      }
    });

    test('should return 404 for non-existent item', async ({ request }) => {
      const response = await request.put(`${API_BASE_URL}/api/cart/update/nonexistentid`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          quantity: 3,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 400 for invalid quantity', async ({ request }) => {
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const cart = await cartResponse.json();
      if (cart.items.length > 0) {
        const itemId = cart.items[0]._id;

        const response = await request.put(`${API_BASE_URL}/api/cart/update/${itemId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          data: {
            quantity: -1,
          },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
      }
    });
  });

  test.describe('Remove from Cart', () => {
    test('should remove item from cart', async ({ request }) => {
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const cart = await cartResponse.json();
      if (cart.items.length > 0) {
        const itemId = cart.items[0]._id;

        const response = await request.delete(`${API_BASE_URL}/api/cart/remove/${itemId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      }
    });

    test('should return 404 for non-existent item', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/remove/nonexistentid`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 401 for unauthorized request', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/remove/someid`);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Clear Cart', () => {
    test('should clear entire cart', async ({ request }) => {
      const response = await request.delete(`${API_BASE_URL}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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
      // Add item to cart
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;
      const productPrice = products[0].price;

      await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: 2,
        },
      });

      // Get cart
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const cart = await cartResponse.json();
      expect(cart.total).toBeGreaterThanOrEqual(productPrice * 2);
    });

    test('should update total when quantity changes', async ({ request }) => {
      const cartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const cart = await cartResponse.json();
      if (cart.items.length > 0) {
        const initialTotal = cart.total;
        const itemId = cart.items[0]._id;

        await request.put(`${API_BASE_URL}/api/cart/update/${itemId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          data: {
            quantity: 5,
          },
        });

        const updatedCartResponse = await request.get(`${API_BASE_URL}/api/cart`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const updatedCart = await updatedCartResponse.json();
        expect(updatedCart.total).not.toBe(initialTotal);
      }
    });
  });

  test.describe('Cart Validation', () => {
    test('should validate product exists when adding', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: 'nonexistentid',
          quantity: 1,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should validate quantity is positive', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: -5,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });

    test('should validate quantity is not zero', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await productsResponse.json();
      const productId = products[0]._id;

      const response = await request.post(`${API_BASE_URL}/api/cart/add`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          productId: productId,
          quantity: 0,
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });
});
