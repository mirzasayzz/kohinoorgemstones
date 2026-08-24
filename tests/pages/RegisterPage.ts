import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  // Form Elements
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly termsCheckbox: Locator;
  readonly signinLink: Locator;

  // OTP Elements
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;
  readonly resendOtpLink: Locator;

  // Password Strength
  readonly passwordStrengthIndicator: Locator;
  readonly passwordRequirements: Locator;

  // Logo
  readonly logo: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  // Validation
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly phoneError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly termsError: Locator;

  constructor(page: Page) {
    super(page);

    // Form Elements
    this.firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first name" i]');
    this.lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last name" i]');
    this.emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]');
    this.passwordInput = page.locator('input[type="password"]:first-of-type, input[name="password"], input[placeholder*="password" i]');
    this.confirmPasswordInput = page.locator('input[type="password"]:last-of-type, input[name="confirmPassword"], input[placeholder*="confirm password" i]');
    this.registerButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
    this.termsCheckbox = page.locator('input[type="checkbox"], label:has-text("Terms")');
    this.signinLink = page.locator('a:has-text("Sign In"), a:has-text("Login"), a[href*="signin"]');

    // OTP Elements
    this.otpInput = page.locator('input[name="otp"], input[placeholder*="OTP" i], input[type="tel"]');
    this.verifyOtpButton = page.locator('button:has-text("Verify"), button:has-text("OTP")');
    this.resendOtpLink = page.locator('a:has-text("Resend"), button:has-text("Resend")');

    // Password Strength
    this.passwordStrengthIndicator = page.locator('.password-strength, [class*="strength"], [class*="password-indicator"]');
    this.passwordRequirements = page.locator('.password-requirements, [class*="requirements"], ul:has-text("Password must")');

    // Logo
    this.logo = page.locator('a[href="/"] img, .logo, [class*="logo"]');

    // Messages
    this.errorMessage = page.locator('.error-message, .alert-error, [class*="error"], [class*="alert-danger"]');
    this.successMessage = page.locator('.success-message, .alert-success, [class*="success"], [class*="alert-success"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"]');

    // Validation
    this.firstNameError = page.locator('[class*="first-name-error"], [class*="error"]:has-text("first name")');
    this.lastNameError = page.locator('[class*="last-name-error"], [class*="error"]:has-text("last name")');
    this.emailError = page.locator('[class*="email-error"], [class*="error"]:has-text("email")');
    this.phoneError = page.locator('[class*="phone-error"], [class*="error"]:has-text("phone")');
    this.passwordError = page.locator('[class*="password-error"], [class*="error"]:has-text("password")');
    this.confirmPasswordError = page.locator('[class*="confirm-password-error"], [class*="error"]:has-text("confirm")');
    this.termsError = page.locator('[class*="terms-error"], [class*="error"]:has-text("terms")');
  }

  // Navigation methods
  async navigateToRegisterPage(): Promise<void> {
    await this.navigateTo('/signup');
    await this.waitForPageLoad();
  }

  async clickLogo(): Promise<void> {
    await this.click(this.logo);
    await this.waitForPageLoad();
  }

  // Registration methods
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<void> {
    await this.fill(this.firstNameInput, userData.firstName);
    await this.fill(this.lastNameInput, userData.lastName);
    await this.fill(this.emailInput, userData.email);
    await this.fill(this.phoneInput, userData.phone);
    await this.fill(this.passwordInput, userData.password);
    await this.fill(this.confirmPasswordInput, userData.password);
    await this.check(this.termsCheckbox);
    await this.click(this.registerButton);
    await this.waitForPageLoad();
  }

  async registerWithOtp(
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
    },
    otp: string
  ): Promise<void> {
    await this.register(userData);
    await this.waitForOtpInput();
    await this.fill(this.otpInput, otp);
    await this.click(this.verifyOtpButton);
    await this.waitForPageLoad();
  }

  async registerWithoutTerms(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<void> {
    await this.fill(this.firstNameInput, userData.firstName);
    await this.fill(this.lastNameInput, userData.lastName);
    await this.fill(this.emailInput, userData.email);
    await this.fill(this.phoneInput, userData.phone);
    await this.fill(this.passwordInput, userData.password);
    await this.fill(this.confirmPasswordInput, userData.password);
    await this.click(this.registerButton);
  }

  // Validation methods
  async verifyRegisterPageLoaded(): Promise<void> {
    await this.expectVisible(this.firstNameInput);
    await this.expectVisible(this.lastNameInput);
    await this.expectVisible(this.emailInput);
    await this.expectVisible(this.phoneInput);
    await this.expectVisible(this.passwordInput);
    await this.expectVisible(this.confirmPasswordInput);
    await this.expectVisible(this.registerButton);
    await this.expectUrl(/signup|register/);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.errorMessage);
    await this.expectText(this.errorMessage, expectedMessage);
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

  async verifyPasswordStrength(expectedStrength: string): Promise<void> {
    await this.expectText(this.passwordStrengthIndicator, expectedStrength);
  }

  async verifyPasswordRequirements(): Promise<void> {
    await this.expectVisible(this.passwordRequirements);
  }

  async verifyFirstNameFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.firstNameError);
    await this.expectText(this.firstNameError, expectedError);
  }

  async verifyLastNameFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.lastNameError);
    await this.expectText(this.lastNameError, expectedError);
  }

  async verifyEmailFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.emailError);
    await this.expectText(this.emailError, expectedError);
  }

  async verifyPhoneFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.phoneError);
    await this.expectText(this.phoneError, expectedError);
  }

  async verifyPasswordFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.passwordError);
    await this.expectText(this.passwordError, expectedError);
  }

  async verifyConfirmPasswordFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.confirmPasswordError);
    await this.expectText(this.confirmPasswordError, expectedError);
  }

  async verifyTermsFieldError(expectedError: string): Promise<void> {
    await this.expectVisible(this.termsError);
    await this.expectText(this.termsError, expectedError);
  }

  // Navigation methods
  async clickSignin(): Promise<void> {
    await this.click(this.signinLink);
    await this.waitForPageLoad();
  }

  // Form validation
  async submitEmptyForm(): Promise<void> {
    await this.click(this.registerButton);
  }

  async submitWithMismatchedPasswords(): Promise<void> {
    await this.fill(this.passwordInput, 'Password123!');
    await this.fill(this.confirmPasswordInput, 'DifferentPassword456!');
    await this.click(this.registerButton);
  }

  async submitWithWeakPassword(): Promise<void> {
    await this.fill(this.passwordInput, '123');
    await this.fill(this.confirmPasswordInput, '123');
    await this.click(this.registerButton);
  }

  // Get methods
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    return await this.getText(this.successMessage);
  }

  async getFirstNameValue(): Promise<string> {
    return await this.getValue(this.firstNameInput);
  }

  async getLastNameValue(): Promise<string> {
    return await this.getValue(this.lastNameInput);
  }

  async getEmailValue(): Promise<string> {
    return await this.getValue(this.emailInput);
  }

  async getPhoneValue(): Promise<string> {
    return await this.getValue(this.phoneInput);
  }

  // Clear methods
  async clearAll(): Promise<void> {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.emailInput.clear();
    await this.phoneInput.clear();
    await this.passwordInput.clear();
    await this.confirmPasswordInput.clear();
  }

  // Wait methods
  async waitForRegistrationComplete(): Promise<void> {
    await this.waitForTimeout(2000);
    await this.waitForPageLoad();
  }

  async waitForOtpInput(): Promise<void> {
    await this.waitForSelector(this.otpInput);
  }

  async waitForPasswordStrengthUpdate(): Promise<void> {
    await this.waitForTimeout(500);
  }
}
