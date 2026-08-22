// Environment Configuration for Kohinoor Gemstone QA Automation
// Centralizes environment variable access and validation

export interface TestEnvironment {
  baseUrl: string;
  apiBaseUrl: string;
  isCI: boolean;
  isLocal: boolean;
  browser: string;
}

// Get test environment configuration
export function getTestEnvironment(): TestEnvironment {
  return {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    isCI: !!process.env.CI,
    isLocal: !process.env.CI,
    browser: process.env.BROWSER || 'chromium',
  };
}

// Validate required environment variables
export function validateEnvironment(): void {
  const required = ['API_BASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && !getTestEnvironment().isLocal) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
}

// Get API base URL with fallback
export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL || 'http://localhost:3001';
}

// Get frontend base URL with fallback
export function getBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:5173';
}

// Check if running in CI environment
export function isCI(): boolean {
  return !!process.env.CI;
}

// Get test timeout based on environment
export function getTimeout(): number {
  return isCI() ? 30000 : 15000;
}

// Get retry count based on environment
export function getRetries(): number {
  return isCI() ? 1 : 0;
}

// Get worker count based on environment
export function getWorkers(): number | undefined {
  return isCI() ? 2 : undefined;
}
