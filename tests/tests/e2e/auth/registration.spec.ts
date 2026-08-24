import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../../pages/RegisterPage';
import { LoginPage } from '../../../pages/LoginPage';
import { faker } from '@faker-js/faker';
import { checkSiteAvailable } from '../../../helpers/site-check';

test.describe('Registration Functionality', () => {
  let registerPage: RegisterPage;
  let loginPage: LoginPage;

  test.beforeAll(async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const available = await checkSiteAvailable(request, baseUrl);
    test.skip(!available, 'Site is not reachable - skipping E2E tests');
  });

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);
  });

  test.describe('UI Validation', () => {
    test('should display registration page correctly', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
      await expect(page).toHaveTitle(/register|sign up/i);
    });

    test('should have all required form fields', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
      
      await expect(registerPage.firstNameInput).toBeVisible();
      await expect(registerPage.lastNameInput).toBeVisible();
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.phoneInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.confirmPasswordInput).toBeVisible();
      await expect(registerPage.registerButton).toBeVisible();
    });

    test('should display terms checkbox', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await expect(registerPage.termsCheckbox).toBeVisible();
    });

    test('should display signin link', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await expect(registerPage.signinLink).toBeVisible();
    });
  });

  test.describe('Successful Registration', () => {
    test('should register with valid data', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.register(userData);
      await registerPage.verifyRegistrationSuccessful();
    });

    test('should redirect to login after registration', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.register(userData);
      await expect(page).toHaveURL(/signin|login/);
    });

    test('should send verification email', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.register(userData);
      await registerPage.verifySuccessMessage('Verification email sent');
    });
  });

  test.describe('Failed Registration', () => {
    test('should show error with existing email', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.register(userData);
      await registerPage.verifyErrorMessage('Email already registered');
    });

    test('should show error with empty fields', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.submitEmptyForm();
      await registerPage.verifyErrorMessage('Please fill in all required fields');
    });

    test('should show error with mismatched passwords', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.submitWithMismatchedPasswords();
      await registerPage.verifyErrorMessage('Passwords do not match');
    });

    test('should show error with weak password', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.submitWithWeakPassword();
      await registerPage.verifyErrorMessage('Password is too weak');
    });

    test('should show error with invalid email format', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: 'invalidemail',
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.register(userData);
      await registerPage.verifyErrorMessage('Please enter a valid email');
    });

    test('should show error with invalid phone number', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: '123',
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.register(userData);
      await registerPage.verifyErrorMessage('Please enter a valid phone number');
    });

    test('should show error without accepting terms', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.registerWithoutTerms(userData);
      await registerPage.verifyErrorMessage('Please accept the terms');
    });
  });

  test.describe('Field Validation', () => {
    test('should validate first name is required', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.lastNameInput, 'Doe');
      await registerPage.fill(registerPage.emailInput, 'test@example.com');
      await registerPage.fill(registerPage.phoneInput, '1234567890');
      await registerPage.fill(registerPage.passwordInput, 'Password123!');
      await registerPage.fill(registerPage.confirmPasswordInput, 'Password123!');
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.click(registerPage.registerButton);
      await registerPage.verifyFirstNameFieldError('First name is required');
    });

    test('should validate last name is required', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, 'John');
      await registerPage.fill(registerPage.emailInput, 'test@example.com');
      await registerPage.fill(registerPage.phoneInput, '1234567890');
      await registerPage.fill(registerPage.passwordInput, 'Password123!');
      await registerPage.fill(registerPage.confirmPasswordInput, 'Password123!');
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.click(registerPage.registerButton);
      await registerPage.verifyLastNameFieldError('Last name is required');
    });

    test('should validate email is required', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, 'John');
      await registerPage.fill(registerPage.lastNameInput, 'Doe');
      await registerPage.fill(registerPage.phoneInput, '1234567890');
      await registerPage.fill(registerPage.passwordInput, 'Password123!');
      await registerPage.fill(registerPage.confirmPasswordInput, 'Password123!');
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.click(registerPage.registerButton);
      await registerPage.verifyEmailFieldError('Email is required');
    });

    test('should validate phone is required', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, 'John');
      await registerPage.fill(registerPage.lastNameInput, 'Doe');
      await registerPage.fill(registerPage.emailInput, 'test@example.com');
      await registerPage.fill(registerPage.passwordInput, 'Password123!');
      await registerPage.fill(registerPage.confirmPasswordInput, 'Password123!');
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.click(registerPage.registerButton);
      await registerPage.verifyPhoneFieldError('Phone number is required');
    });

    test('should validate password is required', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, 'John');
      await registerPage.fill(registerPage.lastNameInput, 'Doe');
      await registerPage.fill(registerPage.emailInput, 'test@example.com');
      await registerPage.fill(registerPage.phoneInput, '1234567890');
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.click(registerPage.registerButton);
      await registerPage.verifyPasswordFieldError('Password is required');
    });

    test('should validate confirm password is required', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, 'John');
      await registerPage.fill(registerPage.lastNameInput, 'Doe');
      await registerPage.fill(registerPage.emailInput, 'test@example.com');
      await registerPage.fill(registerPage.phoneInput, '1234567890');
      await registerPage.fill(registerPage.passwordInput, 'Password123!');
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.click(registerPage.registerButton);
      await registerPage.verifyConfirmPasswordFieldError('Please confirm your password');
    });
  });

  test.describe('Password Strength', () => {
    test('should display password strength indicator', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.passwordInput, 'Weak');
      await registerPage.verifyPasswordStrength('Weak');
      
      await registerPage.fill(registerPage.passwordInput, 'Medium123');
      await registerPage.verifyPasswordStrength('Medium');
      
      await registerPage.fill(registerPage.passwordInput, 'StrongPassword123!');
      await registerPage.verifyPasswordStrength('Strong');
    });

    test('should show password requirements', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.click(registerPage.passwordInput);
      await registerPage.verifyPasswordRequirements();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to login page', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.clickSignin();
      await expect(page).toHaveURL(/signin|login/);
    });

    test('should go back to home page', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.clickLogo();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Form Interactions', () => {
    test('should clear form fields', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, 'John');
      await registerPage.fill(registerPage.lastNameInput, 'Doe');
      await registerPage.clearAll();
      
      await expect(registerPage.firstNameInput).toHaveValue('');
      await expect(registerPage.lastNameInput).toHaveValue('');
    });

    test('should submit form with Enter key', async ({ page }) => {
      const userData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'national' }),
        password: 'TestPassword123!',
      };

      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.firstNameInput, userData.firstName);
      await registerPage.fill(registerPage.lastNameInput, userData.lastName);
      await registerPage.fill(registerPage.emailInput, userData.email);
      await registerPage.fill(registerPage.phoneInput, userData.phone);
      await registerPage.fill(registerPage.passwordInput, userData.password);
      await registerPage.fill(registerPage.confirmPasswordInput, userData.password);
      await registerPage.check(registerPage.termsCheckbox);
      await registerPage.confirmPasswordInput.press('Enter');
      await registerPage.waitForPageLoad();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
      await expect(registerPage.firstNameInput).toBeVisible();
      await expect(registerPage.lastNameInput).toBeVisible();
      await expect(registerPage.emailInput).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
    });
  });
});
