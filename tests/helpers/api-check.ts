import { APIRequestContext } from '@playwright/test';

export async function assertApiAvailable(request: APIRequestContext, baseUrl: string): Promise<void> {
  const response = await request.get(`${baseUrl}/api/health`, { timeout: 5000 });
  if (!response.ok()) {
    throw new Error(`API health check failed with status ${response.status()}`);
  }
}
