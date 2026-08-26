import { APIRequestContext } from '@playwright/test';

export async function assertSiteAvailable(request: APIRequestContext, baseUrl: string): Promise<void> {
  const response = await request.get(baseUrl, { timeout: 10000 });
  if (!response.ok()) {
    throw new Error(`Frontend health check failed with status ${response.status()}`);
  }
}
