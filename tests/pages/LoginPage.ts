import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Form Elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordButton: Locator;
  readonly createAccountLink: Locator;

  // Logo
  readonly logo: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);

    // Form Elements
    this.emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    this.loginButton = page.locator('button[type="submit"]');
    this.forgotPasswordButton = page.locator('button:has-text("Forgot password")');
    this.createAccountLink = page.locator('a:has-text("Create an account"), a:has-text("Sign Up"), a[href*="signup"]');

    // Logo
    this.logo = page.locator('a[href="/"] img, .logo, [class*="logo"]');

    // Messages
    this.errorMessage = page.locator('[class*="error"], [class*="alert-danger"]');
    this.successMessage = page.locator('[class*="success"], [class*="alert-success"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"]');
  }

  // Navigation methods
  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo('/signin');
    await this.waitForPageLoad();
  }

  async clickLogo(): Promise<void> {
    await this.click(this.logo);
    await this.waitForPageLoad();
  }

  // Login methods
  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyLoginPageLoaded(): Promise<void> {
    await this.expectVisible(this.emailInput);
    await this.expectVisible(this.passwordInput);
    await this.expectVisible(this.loginButton);
    await this.expectUrl(/signin|login/);
  }

  async verifyErrorMessage(expectedMessage: string | RegExp): Promise<void> {
    await this.expectVisible(this.errorMessage);
    if (typeof expectedMessage === 'string') {
      await this.expectText(this.errorMessage, expectedMessage);
    } else {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }

  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.successMessage);
    await this.expectText(this.successMessage, expectedMessage);
  }

  async verifyLoginSuccessful(): Promise<void> {
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).not.toContain('/signin');
    expect(currentUrl).not.toContain('/login');
  }

  // Navigation methods
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordButton);
  }

  async clickSignup(): Promise<void> {
    await this.click(this.createAccountLink);
    await this.waitForPageLoad();
  }

  // Form validation
  async submitEmptyForm(): Promise<void> {
    await this.click(this.loginButton);
  }

  async submitWithInvalidEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.click(this.loginButton);
  }

  // Get methods
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    return await this.getText(this.successMessage);
  }

  // Wait methods
  async waitForLoginComplete(): Promise<void> {
    await this.waitForTimeout(2000);
    await this.waitForPageLoad();
  }
}
