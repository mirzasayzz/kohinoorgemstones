import { Page, expect } from '@playwright/test';

export async function takeFullPageScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

export async function takeElementScreenshot(page: Page, selector: string, name: string) {
  const element = page.locator(selector);
  await expect(element).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: 0.01,
  });
}

export async function compareScreenshots(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
  });
}

export async function captureResponsiveScreenshots(page: Page, path: string) {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `test-results/screenshots/${path}-${viewport.name}.png`,
      fullPage: true,
    });
  }
}

export async function checkLayoutShifts(page: Page) {
  const shifts = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => resolve(cls), 2000);
    });
  });

  return shifts;
}
