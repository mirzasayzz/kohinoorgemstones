import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Form Elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;

  // OTP Elements
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;
  readonly resendOtpLink: Locator;

  // Social Login
  readonly googleLoginButton: Locator;
  readonly githubLoginButton: Locator;

  // Logo
  readonly logo: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  // Validation
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);

    // Form Elements
    this.emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    this.rememberMeCheckbox = page.locator('input[type="checkbox"], label:has-text("Remember")');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a[href*="forgot"]');
    this.signupLink = page.locator('a:has-text("Sign Up"), a:has-text("Register"), a[href*="signup"]');

    // OTP Elements
    this.otpInput = page.locator('input[name="otp"], input[placeholder*="OTP" i], input[type="tel"]');
    this.verifyOtpButton = page.locator('button:has-text("Verify"), button:has-text("OTP")');
    this.resendOtpLink = page.locator('a:has-text("Resend"), button:has-text("Resend")');

    // Social Login
    this.googleLoginButton = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
    this.githubLoginButton = page.locator('button:has-text("GitHub"), button:has-text("Continue with GitHub")');

    // Logo
    this.logo = page.locator('a[href="/"] img, .logo, [class*="logo"]');

    // Messages
    this.errorMessage = page.locator('.error-message, .alert-error, [class*="error"], [class*="alert-danger"]');
    this.successMessage = page.locator('.success-message, .alert-success, [class*="success"], [class*="alert-success"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"]');

    // Validation
    this.emailError = page.locator('[class*="email-error"], [class*="error"]:has-text("email")');
    this.passwordError = page.locator('[class*="password-error"], [class*="error"]:has-text("password")');
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

  async loginWithRememberMe(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.check(this.rememberMeCheckbox);
    await this.click(this.loginButton);
    await this.waitForPageLoad();
  }

  async loginWithOtp(email: string, password: string, otp: string): Promise<void> {
    await this.login(email, password);
    await this.fill(this.otpInput, otp);
    await this.click(this.verifyOtpButton);
    await this.waitForPageLoad();
  }

  async loginWithGoogle(): Promise<void> {
    await this.click(this.googleLoginButton);
    await this.waitForPageLoad();
  }

  async loginWithGithub(): Promise<void> {
    await this.click(this.githubLoginButton);
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyLoginPageLoaded(): Promise<void> {
    await this.expectVisible(this.emailInput);
    await this.expectVisible(this.passwordInput);
    await this.expectVisible(this.loginButton);
    await this.expectUrl(/signin|login/);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.errorMessage);
    await this.expectText(this.errorMessage, expectedMessage);
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

  async verifyEmailFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.emailError);
    await this.expectText(this.emailError, expectedError);
  }

  async verifyPasswordFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.passwordError);
    await this.expectText(this.passwordError, expectedError);
  }

  // Navigation methods
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
    await this.waitForPageLoad();
  }

  async clickSignup(): Promise<void> {
    await this.click(this.signupLink);
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

  async submitWithInvalidPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  // Get methods
  async getEmailValue(): Promise<string> {
    return await this.getValue(this.emailInput);
  }

  async getPasswordValue(): Promise<string> {
    return await this.getValue(this.passwordInput);
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    return await this.getText(this.successMessage);
  }

  // Clear methods
  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async clearAll(): Promise<void> {
    await this.clearEmail();
    await this.clearPassword();
  }

  // Wait methods
  async waitForLoginComplete(): Promise<void> {
    await this.waitForTimeout(2000);
    await this.waitForPageLoad();
  }

  async waitForOtpInput(): Promise<void> {
    await this.waitForSelector(this.otpInput);
  }
}
