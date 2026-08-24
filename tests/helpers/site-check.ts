import { APIRequestContext } from '@playwright/test';

export async function checkSiteAvailable(request: APIRequestContext, baseUrl: string): Promise<boolean> {
  try {
    // Check if the site loads
    const response = await request.get(baseUrl, { timeout: 15000 });
    if (!response.ok()) return false;

    // Also check if the API backend is reachable (not just the frontend)
    const apiBase = process.env.API_BASE_URL || baseUrl;
    try {
      const apiResponse = await request.get(`${apiBase}/api/products`, { timeout: 10000 });
      const text = await apiResponse.text();
      // If API returns "Route not found", the backend endpoints don't exist on this server
      if (text.includes('Route') && text.includes('not found')) return false;
      return apiResponse.status() < 500;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}
