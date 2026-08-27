import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { HomePage } from '../../../pages/HomePage';
import { assertSiteAvailable } from '../../../helpers/site-check';
import { checkFormAccessibility, checkKeyboardNavigation } from '../../../helpers/accessibility';

const CUSTOMER_EMAIL = 'customer@playwright.local';
const CUSTOMER_PASSWORD = 'PlaywrightPassword123';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeAll(async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await assertSiteAvailable(request, baseUrl);
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
  });

  test.describe('UI Validation', () => {
    test('should display login page correctly', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.verifyLoginPageLoaded();
      await expect(page).toHaveTitle(/login|sign in/i);
    });

    test('should have all required form elements', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.verifyLoginPageLoaded();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('should display forgot password link', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await expect(loginPage.forgotPasswordButton).toBeVisible();
    });

    test('should display signup link', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await expect(loginPage.createAccountLink).toBeVisible();
    });

    test('should have proper form accessibility', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      const issues = await checkFormAccessibility(page, 'form');
      expect(issues).toHaveLength(0);
    });

    test('should be keyboard navigable', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      const focusable = await checkKeyboardNavigation(page, 'input[type="email"]');
      expect(focusable.length).toBeGreaterThan(0);
    });
  });

  test.describe('Successful Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      await loginPage.verifyLoginSuccessful();
      await expect(page).not.toHaveURL(/signin|login/);
    });

    test('should redirect to homepage after login', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      await expect(page).toHaveURL('/');
    });

    test('should show user menu after login', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      await homePage.verifyUserLoggedIn();
    });
  });

  test.describe('Failed Login', () => {
    test('should show error with invalid credentials', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login('invalid@example.com', 'WrongPassword123!');
      await loginPage.verifyErrorMessage(/invalid|incorrect|no account/i);
    });

    test('should show error with empty fields', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.submitEmptyForm();
    });

    test('should show error with incorrect password', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(CUSTOMER_EMAIL, 'IncorrectPassword123!');
      await loginPage.verifyErrorMessage(/invalid|incorrect|password/i);
    });

    test('should show error with non-existent email', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login('nonexistent@example.com', 'Password123!');
      await loginPage.verifyErrorMessage(/invalid|no account|not found/i);
    });

    test('should show error with empty email', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.passwordInput, 'Password123!');
      await loginPage.click(loginPage.loginButton);
    });

    test('should show error with empty password', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, 'test@example.com');
      await loginPage.click(loginPage.loginButton);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to register page', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.clickSignup();
      await expect(page).toHaveURL(/signup|register/);
    });

    test('should go back to home page', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.clickLogo();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Logout', () => {
    test('should login and logout successfully', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      await loginPage.verifyLoginSuccessful();

      await homePage.openUserMenu();
      await homePage.clickLogout();

      await homePage.verifyUserLoggedOut();
    });
  });

  test.describe('Form Interactions', () => {
    test('should mask password input', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      const passwordType = await loginPage.passwordInput.getAttribute('type');
      expect(passwordType).toBe('password');
    });

    test('should not expose password in URL', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, 'test@example.com');
      await loginPage.fill(loginPage.passwordInput, 'Password123!');
      await loginPage.click(loginPage.loginButton);
      const url = page.url();
      expect(url).not.toContain('Password123!');
    });

    test('should submit form with Enter key', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, CUSTOMER_EMAIL);
      await loginPage.fill(loginPage.passwordInput, CUSTOMER_PASSWORD);
      await loginPage.passwordInput.press('Enter');
      await loginPage.waitForPageLoad();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await loginPage.navigateToLoginPage();
      await loginPage.verifyLoginPageLoaded();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.navigateToLoginPage();
      await loginPage.verifyLoginPageLoaded();
    });
  });
});
