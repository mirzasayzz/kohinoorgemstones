import { test, expect } from '@playwright/test';

test.describe('Products API', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

  test.describe('Get All Products', () => {
    test('should get all products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);
    });

    test('should return products with required fields', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products`);
      const products = await response.json();

      const product = products[0];
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('category');
    });

    test('should validate product schema', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products`);
      const products = await response.json();

      const product = products[0];
      
      // Validate types
      expect(typeof product._id).toBe('string');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.description).toBe('string');
      expect(Array.isArray(product.images)).toBeTruthy();
      expect(typeof product.category).toBe('string');
      
      // Validate required fields are not empty
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
      expect(product.description.length).toBeGreaterThan(0);
    });
  });

  test.describe('Get Product by ID', () => {
    test('should get product by ID', async ({ request }) => {
      // First get all products to get a valid ID
      const listResponse = await request.get(`${API_BASE_URL}/api/products`);
      const products = await listResponse.json();
      const productId = products[0]._id;

      const response = await request.get(`${API_BASE_URL}/api/products/${productId}`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const product = await response.json();
      expect(product).toHaveProperty('_id', productId);
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
    });

    test('should return 404 for non-existent product', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products/nonexistentid`);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should return 400 for invalid ID format', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products/invalid`);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Search Products', () => {
    test('should search products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?search=emerald`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
    });

    test('should return empty array for no results', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?search=xyznonexistent`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBe(0);
    });

    test('should handle empty search', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?search=`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Filter Products', () => {
    test('should filter products by category', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?category=emerald`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
    });

    test('should filter products by price range', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?minPrice=10000&maxPrice=50000`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
    });

    test('should filter products by multiple criteria', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/products?category=emerald&minPrice=10000&maxPrice=50000`
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Pagination', () => {
    test('should paginate products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?page=1&limit=10`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('products');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('pages');
    });

    test('should return correct page size', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?page=1&limit=5`);
      const data = await response.json();

      expect(data.products.length).toBeLessThanOrEqual(5);
    });

    test('should handle page beyond total', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?page=100&limit=10`);
      const data = await response.json();

      expect(data.products.length).toBe(0);
    });
  });

  test.describe('Categories', () => {
    test('should get product categories', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/categories`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const categories = await response.json();
      expect(Array.isArray(categories)).toBeTruthy();
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should get featured products', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products/featured`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
    });
  });

  test.describe('Sorting', () => {
    test('should sort products by price ascending', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?sort=price_asc`);
      const products = await response.json();

      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeGreaterThanOrEqual(products[i - 1].price);
      }
    });

    test('should sort products by price descending', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?sort=price_desc`);
      const products = await response.json();

      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeLessThanOrEqual(products[i - 1].price);
      }
    });

    test('should sort products by name', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?sort=name`);
      const products = await response.json();

      for (let i = 1; i < products.length; i++) {
        expect(products[i].name.localeCompare(products[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid query parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products?page=invalid&limit=invalid`);

      // Should still return 200 or handle gracefully
      expect(response.status()).toBeLessThanOrEqual(400);
    });

    test('should handle missing required parameters', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/products`);

      expect(response.ok()).toBeTruthy();
    });

    test('should handle server errors gracefully', async ({ request }) => {
      // This test checks error handling structure
      const response = await request.get(`${API_BASE_URL}/api/products`);

      if (!response.ok()) {
        const error = await response.json();
        expect(error).toHaveProperty('message');
      }
    });
  });
});
