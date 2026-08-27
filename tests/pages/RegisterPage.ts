import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  // Step 1: Email
  readonly emailInput: Locator;
  readonly sendOtpButton: Locator;

  // Step 2: OTP
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;
  readonly resendOtpLink: Locator;
  readonly changeEmailButton: Locator;

  // Step 3: Complete Profile
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;

  // Navigation
  readonly signinLink: Locator;
  readonly logo: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);

    // Step 1: Email
    this.emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    this.sendOtpButton = page.locator('button[type="submit"]:has-text("Send OTP")');

    // Step 2: OTP
    this.otpInput = page.locator('input[name="otp"], input[placeholder="000000"]');
    this.verifyOtpButton = page.locator('button[type="submit"]:has-text("Verify OTP")');
    this.resendOtpLink = page.locator('button:has-text("Resend OTP")');
    this.changeEmailButton = page.locator('button:has-text("Change email")');

    // Step 3: Complete Profile
    this.nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]:first-of-type');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[type="password"]:last-of-type');
    this.createAccountButton = page.locator('button[type="submit"]:has-text("Create Account")');

    // Navigation
    this.signinLink = page.locator('a:has-text("Sign In"), a[href*="signin"]');
    this.logo = page.locator('a[href="/"] img, .logo, [class*="logo"]');

    // Messages
    this.errorMessage = page.locator('[class*="error"], [class*="alert-danger"]');
    this.successMessage = page.locator('[class*="success"], [class*="alert-success"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"]');
  }

  // Navigation
  async navigateToRegisterPage(): Promise<void> {
    await this.navigateTo('/signup');
    await this.waitForPageLoad();
  }

  async clickLogo(): Promise<void> {
    await this.click(this.logo);
    await this.waitForPageLoad();
  }

  // Step 1: Send OTP
  async sendOtp(email: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.click(this.sendOtpButton);
    await this.waitForPageLoad();
  }

  // Step 2: Verify OTP
  async verifyOtp(otp: string): Promise<void> {
    await this.fill(this.otpInput, otp);
    await this.click(this.verifyOtpButton);
    await this.waitForPageLoad();
  }

  // Step 3: Complete profile
  async completeProfile(data: { name: string; phone?: string; password: string }): Promise<void> {
    await this.fill(this.nameInput, data.name);
    if (data.phone) {
      await this.fill(this.phoneInput, data.phone);
    }
    await this.fill(this.passwordInput, data.password);
    await this.fill(this.confirmPasswordInput, data.password);
    await this.click(this.createAccountButton);
    await this.waitForPageLoad();
  }

  // Full registration flow
  async register(email: string, otp: string, data: { name: string; phone?: string; password: string }): Promise<void> {
    await this.sendOtp(email);
    await this.verifyOtp(otp);
    await this.completeProfile(data);
  }

  // Validation methods
  async verifyRegisterPageLoaded(): Promise<void> {
    await this.expectVisible(this.emailInput);
    await this.expectVisible(this.sendOtpButton);
    await this.expectUrl(/signup|register/);
  }

  async verifyStep2Loaded(): Promise<void> {
    await this.expectVisible(this.otpInput);
    await this.expectVisible(this.verifyOtpButton);
  }

  async verifyStep3Loaded(): Promise<void> {
    await this.expectVisible(this.nameInput);
    await this.expectVisible(this.passwordInput);
    await this.expectVisible(this.createAccountButton);
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

  async verifyRegistrationSuccessful(): Promise<void> {
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).not.toContain('/signup');
    expect(currentUrl).not.toContain('/register');
  }

  // Navigation methods
  async clickSignin(): Promise<void> {
    await this.click(this.signinLink);
    await this.waitForPageLoad();
  }

  // Form validation
  async submitEmptyForm(): Promise<void> {
    await this.click(this.sendOtpButton);
  }

  // Get methods
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    return await this.getText(this.successMessage);
  }

  // Wait methods
  async waitForRegistrationComplete(): Promise<void> {
    await this.waitForTimeout(2000);
    await this.waitForPageLoad();
  }
}
