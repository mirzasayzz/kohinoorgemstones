import { APIRequestContext } from '@playwright/test';

export async function checkApiAvailable(request: APIRequestContext, baseUrl: string): Promise<boolean> {
  try {
    const response = await request.get(`${baseUrl}/api/products`, { timeout: 5000 });
    const text = await response.text();
    // If we get a JSON response with products array, API is available
    if (response.ok()) {
      const data = JSON.parse(text);
      return Array.isArray(data) || (data && typeof data === 'object');
    }
    // If we get a "Route not found" error, the API endpoints don't exist on this server
    if (text.includes('Route') && text.includes('not found')) {
      return false;
    }
    // Any other response means server is up but might have different routes
    return response.status() < 500;
  } catch {
    return false;
  }
}
