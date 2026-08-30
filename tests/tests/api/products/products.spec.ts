import { test, expect } from '@playwright/test';
import { assertApiAvailable } from '../../../helpers/api-check';

test.describe('Products API', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

  test.beforeAll(async ({ request }) => {
    await assertApiAvailable(request, API_BASE_URL);
  });

  test.describe('Get All Products', () => {
    test('should get all products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBeTruthy();
      expect(Array.isArray(body.data.gemstones)).toBeTruthy();
      expect(body.data.gemstones.length).toBeGreaterThan(0);
    });

    test('should return products with required fields', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones`);
      const body = await response.json();

      const gemstone = body.data.gemstones[0];
      expect(gemstone).toHaveProperty('_id');
      expect(gemstone).toHaveProperty('name');
      expect(gemstone).toHaveProperty('category');
      expect(gemstone).toHaveProperty('price');
      expect(gemstone).toHaveProperty('description');
      expect(gemstone).toHaveProperty('images');
    });

    test('should validate product schema', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones`);
      const body = await response.json();

      const gemstone = body.data.gemstones[0];

      expect(typeof gemstone._id).toBe('string');
      expect(typeof gemstone.name?.english).toBe('string');
      expect(typeof gemstone.category).toBe('string');
      expect(gemstone.name.english.length).toBeGreaterThan(0);
      expect(gemstone.summary.length).toBeGreaterThan(0);
      expect(gemstone.description.length).toBeGreaterThan(0);
      expect(gemstone.price).toBeGreaterThan(0);
    });
  });

  test.describe('Get Product by ID', () => {
    test('should get product by ID', async ({ request }) => {
      const listResponse = await request.get(`${API_BASE_URL}/api/gemstones`);
      const listBody = await listResponse.json();
      const gemstoneId = listBody.data.gemstones[0]._id;

      const response = await request.get(`${API_BASE_URL}/api/gemstones/${gemstoneId}`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const product = await response.json();
      expect(product.data.gemstone).toHaveProperty('_id', gemstoneId);
      expect(product.data.gemstone).toHaveProperty('name');
      expect(product.data.gemstone).toHaveProperty('price');
    });

    test('should return 404 for non-existent product', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones/nonexistentid`);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 400 for invalid ID format', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones/not_an_id!!`);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Search Products', () => {
    test('should search products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?search=emerald`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products.data.gemstones)).toBeTruthy();
    });

    test('should return empty array for no results', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?search=xyznonexistent`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products.data.gemstones)).toBeTruthy();
      expect(products.data.gemstones.length).toBe(0);
    });

    test('should handle empty search', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?search=`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Filter Products', () => {
    test('should filter products by category', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?category=Emerald`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products.data.gemstones)).toBeTruthy();
    });

    test('should filter products by price range', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?minPrice=10000&maxPrice=50000`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products.data.gemstones)).toBeTruthy();
    });

    test('should filter products by multiple criteria', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/gemstones?category=Emerald&minPrice=10000&maxPrice=50000`
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Pagination', () => {
    test('should paginate products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?page=1&limit=10`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data).toHaveProperty('gemstones');
      expect(data).toHaveProperty('total');
    });

    test('should return correct page size', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?page=1&limit=5`);
      const data = await response.json();

      expect(data.data.gemstones.length).toBeLessThanOrEqual(5);
    });

    test('should handle page beyond total', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?page=100&limit=10`);
      const data = await response.json();

      expect(data.data.gemstones.length).toBe(0);
    });
  });

  test.describe('Categories', () => {
    test('should get product categories', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones/categories`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const categories = await response.json();
      expect(Array.isArray(categories.data.categories)).toBeTruthy();
      expect(categories.data.categories.length).toBeGreaterThan(0);
    });

    test('should get featured products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones/featured`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products.data.gemstones)).toBeTruthy();
    });
  });

  test.describe('Sorting', () => {
    test('should sort products by price ascending', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?sort=price_asc`);
      const products = await response.json();

      const prices = products.data.gemstones.map((g: { price: number }) => g.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    test('should sort products by price descending', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?sort=price_desc`);
      const products = await response.json();

      const prices = products.data.gemstones.map((g: { price: number }) => g.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    test('should sort products by name', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?sort=name`);
      const products = await response.json();

      const names = products.data.gemstones.map((g: { name: { english: string } }) => g.name.english);
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid query parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones?page=invalid&limit=invalid`);

      expect(response.status()).toBeLessThanOrEqual(400);
    });

    test('should handle missing required parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones`);

      expect(response.ok()).toBeTruthy();
    });

    test('should handle server errors gracefully', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/gemstones`);

      if (!response.ok()) {
        const error = await response.json();
        expect(error).toHaveProperty('message');
      }
    });
  });
});