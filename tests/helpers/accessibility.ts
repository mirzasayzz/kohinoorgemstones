import { Page, expect } from '@playwright/test';

export interface A11yIssue {
  type: 'error' | 'warning' | 'notice';
  message: string;
  element?: string;
  impact?: string;
}

export async function checkFormAccessibility(page: Page, formSelector: string) {
  const issues: string[] = [];

  // Check all inputs have labels
  const inputs = await page.locator(`${formSelector} input, ${formSelector} select, ${formSelector} textarea`).all();
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');
    const placeholder = await input.getAttribute('placeholder');

    if (!id && !ariaLabel && !ariaLabelledby && !placeholder) {
      const name = await input.getAttribute('name') || 'unknown';
      issues.push(`Input "${name}" has no associated label or aria-label`);
    }

    // Check required fields have aria-required
    const required = await input.getAttribute('required');
    const ariaRequired = await input.getAttribute('aria-required');
    if (required !== null && ariaRequired === null) {
      issues.push(`Required input "${await input.getAttribute('name')}" should have aria-required="true"`);
    }
  }

  // Check all buttons have accessible names
  const buttons = await page.locator(`${formSelector} button, ${formSelector} [role="button"]`).all();
  for (const button of buttons) {
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');
    if (!text?.trim() && !ariaLabel) {
      issues.push('Button has no accessible name');
    }
  }

  return issues;
}

export async function checkImageAccessibility(page: Page) {
  const images = await page.locator('img').all();
  const issues: string[] = [];

  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const ariaHidden = await img.getAttribute('aria-hidden');

    if (!alt && ariaHidden !== 'true') {
      const src = await img.getAttribute('src');
      issues.push(`Image "${src?.substring(0, 50)}" missing alt text`);
    }
  }

  return issues;
}

export async function checkHeadingHierarchy(page: Page) {
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  const levels: number[] = [];

  for (const heading of headings) {
    const tag = await heading.evaluate((el) => el.tagName);
    levels.push(parseInt(tag.charAt(1)));
  }

  const issues: string[] = [];
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      issues.push(`Heading level skip: h${levels[i - 1]} -> h${levels[i]}`);
    }
  }

  return { levels, issues };
}

export async function checkKeyboardNavigation(page: Page, startSelector: string) {
  const focusableElements: string[] = [];
  let currentElement = await page.locator(startSelector);

  for (let i = 0; i < 20; i++) {
    const tagName = await currentElement.evaluate((el) => el.tagName);
    const text = await currentElement.textContent();
    focusableElements.push(`${tagName}: ${text?.trim().substring(0, 30) || 'no text'}`);

    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    if (!focused || focused === 'BODY') break;
  }

  return focusableElements;
}

export async function checkColorContrast(page: Page, selector: string) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return { error: 'Element not found' };

    const style = window.getComputedStyle(element);
    const color = style.color;
    const bgColor = style.backgroundColor;

    const parseRGB = (str: string) => {
      const match = str.match(/\d+/g);
      return match ? match.map(Number) : [0, 0, 0];
    };

    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fg = parseRGB(color);
    const bg = parseRGB(bgColor);

    const l1 = Math.max(luminance(fg), luminance(bg));
    const l2 = Math.min(luminance(fg), luminance(bg));
    const ratio = (l1 + 0.05) / (l2 + 0.05);

    return {
      color,
      bgColor,
      ratio: Math.round(ratio * 100) / 100,
      passes: ratio >= 4.5,
      passesLargeText: ratio >= 3,
    };
  }, selector);
}

export async function checkAriaAttributes(page: Page) {
  const ariaElements = await page.locator('[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-live]').all();
  const issues: string[] = [];

  for (const el of ariaElements) {
    const role = await el.getAttribute('role');
    const ariaLabel = await el.getAttribute('aria-label');
    const ariaLabelledby = await el.getAttribute('aria-labelledby');

    if (role && !ariaLabel && !ariaLabelledby) {
      const text = await el.textContent();
      if (!text?.trim()) {
        issues.push(`Element with role="${role}" has no accessible name`);
      }
    }
  }

  return issues;
}
