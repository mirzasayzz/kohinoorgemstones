import { Page } from '@playwright/test';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalResources: number;
  totalTransferSize: number;
}

export async function measurePagePerformance(page: Page): Promise<PerformanceMetrics> {
  const startTime = Date.now();

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource');

    const fcp = paint.find((entry) => entry.name === 'first-contentful-paint');
    const lcp = paint.find((entry) => entry.name === 'largest-contentful-paint');

    const totalTransferSize = resources.reduce((acc, r) => acc + ((r as PerformanceResourceTiming).transferSize || 0), 0);

    return {
      loadTime: navigation.loadEventEnd - navigation.startTime,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      largestContentfulPaint: lcp ? lcp.startTime : 0,
      timeToInteractive: navigation.domInteractive - navigation.startTime,
      totalResources: resources.length,
      totalTransferSize,
    };
  });

  return {
    ...metrics,
    loadTime: Date.now() - startTime,
  };
}

export async function checkCoreWebVitals(page: Page) {
  const lcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      setTimeout(() => resolve(0), 5000);
    });
  });

  const cls = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let score = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            score += (entry as any).value;
          }
        }
        resolve(score);
      }).observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => resolve(score), 3000);
    });
  });

  return { lcp, cls };
}

export async function checkResourceLoadTimes(page: Page) {
  return await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.map((r) => ({
      name: r.name.split('/').pop() || r.name,
      type: r.initiatorType,
      duration: r.duration,
      size: r.transferSize,
    })).sort((a, b) => b.duration - a.duration);
  });
}

export async function assertPerformanceBudget(page: Page, budget: {
  maxLoadTime?: number;
  maxLCP?: number;
  maxCLS?: number;
  maxResources?: number;
}) {
  const metrics = await measurePagePerformance(page);
  const vitals = await checkCoreWebVitals(page);

  const violations: string[] = [];

  const maxLoad = process.env.CI && budget.maxLoadTime ? Math.max(budget.maxLoadTime, 10000) : budget.maxLoadTime;
  if (maxLoad && metrics.loadTime > maxLoad) {
    violations.push(`Load time ${metrics.loadTime}ms exceeds budget ${budget.maxLoadTime}ms`);
  }

  const maxLCP = process.env.CI && budget.maxLCP ? Math.max(budget.maxLCP, 8000) : budget.maxLCP;
  if (maxLCP && vitals.lcp > maxLCP) {
    violations.push(`LCP ${vitals.lcp}ms exceeds budget ${budget.maxLCP}ms`);
  }

  if (budget.maxCLS && vitals.cls > budget.maxCLS) {
    violations.push(`CLS ${vitals.cls} exceeds budget ${budget.maxCLS}`);
  }

  if (budget.maxResources && metrics.totalResources > budget.maxResources) {
    violations.push(`Resource count ${metrics.totalResources} exceeds budget ${budget.maxResources}`);
  }

  return { metrics, vitals, violations };
}
