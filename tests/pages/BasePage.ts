import { Page, Locator, expect, BrowserContext } from '@playwright/test';

export class BasePage {
  protected page: Page;
  protected context: BrowserContext;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }

  // Navigation methods
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  // Common element interactions
  async click(locator: Locator, options?: Parameters<Locator['click']>[0]): Promise<void> {
    await locator.click({ noWaitAfter: true, ...options });
  }

  async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  async rightClick(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  async clearAndFill(locator: Locator, text: string): Promise<void> {
    await locator.clear();
    await locator.fill(text);
  }

  async type(locator: Locator, text: string, options?: { delay?: number }): Promise<void> {
    await locator.pressSequentially(text, options);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async check(locator: Locator): Promise<void> {
    await locator.check();
  }

  async uncheck(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  async dragAndDrop(source: Locator, target: Locator): Promise<void> {
    await source.dragTo(target);
  }

  // Assertion methods
  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  async expectText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  async expectValue(locator: Locator, value: string): Promise<void> {
    await expect(locator).toHaveValue(value);
  }

  async expectEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  async expectDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  async expectChecked(locator: Locator): Promise<void> {
    await expect(locator).toBeChecked();
  }

  async expectNotChecked(locator: Locator): Promise<void> {
    await expect(locator).not.toBeChecked();
  }

  async expectAttribute(locator: Locator, attribute: string, value: string): Promise<void> {
    await expect(locator).toHaveAttribute(attribute, value);
  }

  async expectClass(locator: Locator, className: string): Promise<void> {
    await expect(locator).toHaveClass(new RegExp(className));
  }

  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectTitle(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(pattern);
  }

  // Wait methods
  async waitForSelector(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await locator.waitFor(options);
  }

  async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  async waitForResponse(url: string | RegExp): Promise<void> {
    await this.page.waitForResponse(url);
  }

  async waitForRequest(url: string | RegExp): Promise<void> {
    await this.page.waitForRequest(url);
  }

  // Screenshot methods
  async takeScreenshot(name: string, options?: { fullPage?: boolean }): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: options?.fullPage ?? true,
    });
  }

  async takeElementScreenshot(locator: Locator, name: string): Promise<void> {
    await locator.screenshot({ path: `screenshots/${name}.png` });
  }

  // Get text methods
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  async getInnerHtml(locator: Locator): Promise<string> {
    return await locator.innerHTML();
  }

  async getOuterHtml(locator: Locator): Promise<string> {
    return await locator.evaluate((el) => el.outerHTML);
  }

  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  async getValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  async getSelectedOptions(locator: Locator): Promise<string[]> {
    return await locator.evaluateAll((elements) => {
      const el = elements[0] as HTMLSelectElement;
      if (!el || !el.selectedOptions) return [];
      return Array.from(el.selectedOptions).map((opt) => opt.value);
    });
  }

  // Check if element exists
  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async isElementHidden(locator: Locator): Promise<boolean> {
    return await locator.isHidden();
  }

  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async isElementDisabled(locator: Locator): Promise<boolean> {
    return await locator.isDisabled();
  }

  async isElementChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }

  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  // Scroll methods
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollBy(x: number, y: number): Promise<void> {
    await this.page.evaluate(({ x, y }) => window.scrollBy(x, y), { x, y });
  }

  // Form methods
  async fillForm(formData: Record<string, string>): Promise<void> {
    for (const [fieldName, value] of Object.entries(formData)) {
      const field = this.page.locator(`[name="${fieldName}"], [id="${fieldName}"], [placeholder*="${fieldName}" i]`);
      await this.fill(field, value);
    }
  }

  async submitForm(formLocator: Locator): Promise<void> {
    await formLocator.evaluate((form) => (form as HTMLFormElement).submit());
  }

  async resetForm(formLocator: Locator): Promise<void> {
    await formLocator.evaluate((form) => (form as HTMLFormElement).reset());
  }

  // Alert handling
  async handleDialog(action: 'accept' | 'dismiss', text?: string): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      if (action === 'accept') {
        await dialog.accept(text);
      } else {
        await dialog.dismiss();
      }
    });
  }

  async expectDialog(message: string): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(message);
      await dialog.accept();
    });
  }

  // Get current URL
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // Get page title
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  // Get page content
  async getPageContent(): Promise<string> {
    return await this.page.content();
  }

  // Cookie methods
  async getCookies(): Promise<any[]> {
    return await this.context.cookies();
  }

  async addCookie(cookie: Record<string, unknown>): Promise<void> {
    await this.context.addCookies([cookie as any]);
  }

  async clearCookies(): Promise<void> {
    await this.context.clearCookies();
  }

  // Local Storage methods
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((key) => localStorage.getItem(key), key);
  }

  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
      key,
      value,
    });
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Session Storage methods
  async getSessionStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((key) => sessionStorage.getItem(key), key);
  }

  async setSessionStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ key, value }) => sessionStorage.setItem(key, value), {
      key,
      value,
    });
  }

  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  // JavaScript execution
  async evaluateScript(script: string): Promise<unknown> {
    return await this.page.evaluate(script);
  }

  async evaluateFunction<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return await this.page.evaluate(fn, ...args);
  }

  // Frame handling
  async getFrame(nameOrUrl: string): Promise<ReturnType<Page['frame']>> {
    return this.page.frame(nameOrUrl);
  }

  // File upload
  async uploadFile(inputLocator: Locator, filePath: string): Promise<void> {
    await inputLocator.setInputFiles(filePath);
  }

  async uploadFiles(inputLocator: Locator, filePaths: string[]): Promise<void> {
    await inputLocator.setInputFiles(filePaths);
  }

  // Download handling
  async expectDownload(trigger: () => Promise<void>): Promise<any> {
    const download = this.page.waitForEvent('download');
    await trigger();
    return download;
  }
}
