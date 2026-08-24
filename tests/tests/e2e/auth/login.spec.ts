import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { HomePage } from '../../../pages/HomePage';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

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
      await expect(loginPage.forgotPasswordLink).toBeVisible();
    });

    test('should display signup link', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await expect(loginPage.signupLink).toBeVisible();
    });

    test('should have remember me checkbox', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await expect(loginPage.rememberMeCheckbox).toBeVisible();
    });
  });

  test.describe('Successful Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      );
      await loginPage.verifyLoginSuccessful();
      await expect(page).not.toHaveURL(/login|signin/);
    });

    test('should login with remember me', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.loginWithRememberMe(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      );
      await loginPage.verifyLoginSuccessful();
    });

    test('should redirect to homepage after login', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      );
      await expect(page).toHaveURL('/');
    });

    test('should show user menu after login', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      );
      await homePage.verifyUserLoggedIn();
    });
  });

  test.describe('Failed Login', () => {
    test('should show error with invalid credentials', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login('invalid@example.com', 'WrongPassword123!');
      await loginPage.verifyErrorMessage('Invalid credentials');
    });

    test('should show error with empty fields', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.submitEmptyForm();
      await loginPage.verifyErrorMessage('Please fill in all fields');
    });

    test('should show error with invalid email format', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.submitWithInvalidEmail('invalidemail');
      await loginPage.verifyErrorMessage('Please enter a valid email');
    });

    test('should show error with incorrect password', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        'IncorrectPassword123!'
      );
      await loginPage.verifyErrorMessage('Invalid credentials');
    });

    test('should show error with non-existent email', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login('nonexistent@example.com', 'Password123!');
      await loginPage.verifyErrorMessage('Invalid credentials');
    });

    test('should show error with empty email', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.passwordInput, 'Password123!');
      await loginPage.click(loginPage.loginButton);
      await loginPage.verifyErrorMessage('Please enter your email');
    });

    test('should show error with empty password', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, 'test@example.com');
      await loginPage.click(loginPage.loginButton);
      await loginPage.verifyErrorMessage('Please enter your password');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to register page', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.clickSignup();
      await expect(page).toHaveURL(/signup|register/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.clickForgotPassword();
      await expect(page).toHaveURL(/forgot-password/);
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
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      );
      await loginPage.verifyLoginSuccessful();

      // Logout
      await homePage.openUserMenu();
      await homePage.clickLogout();

      // Verify logout
      await homePage.verifyUserLoggedOut();
    });

    test('should clear session after logout', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(
        process.env.TEST_USER_EMAIL || 'testuser@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      );
      await loginPage.verifyLoginSuccessful();

      // Logout
      await homePage.openUserMenu();
      await homePage.clickLogout();

      // Try to access protected page
      await page.goto('/profile');
      await expect(page).toHaveURL(/signin|login/);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate email format in real-time', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, 'invalidemail');
      await loginPage.click(loginPage.loginButton);
      await loginPage.verifyEmailFieldError('Please enter a valid email');
    });

    test('should validate password requirements', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.passwordInput, '123');
      await loginPage.click(loginPage.loginButton);
      await loginPage.verifyPasswordFieldError('Password must be at least 8 characters');
    });

    test('should trim whitespace from email', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, '  test@example.com  ');
      await loginPage.fill(loginPage.passwordInput, 'Password123!');
      await loginPage.click(loginPage.loginButton);
      await loginPage.verifyLoginSuccessful();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      const emailLabel = await loginPage.emailInput.getAttribute('aria-label');
      const passwordLabel = await loginPage.passwordInput.getAttribute('aria-label');
      expect(emailLabel || passwordLabel).toBeTruthy();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await page.keyboard.press('Tab');
      await expect(loginPage.emailInput).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(loginPage.loginButton).toBeFocused();
    });

    test('should submit form with Enter key', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.fill(loginPage.emailInput, 'test@example.com');
      await loginPage.fill(loginPage.passwordInput, 'Password123!');
      await loginPage.passwordInput.press('Enter');
      await loginPage.waitForPageLoad();
    });
  });

  test.describe('Security', () => {
    test('should mask password input', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      const passwordType = await loginPage.passwordInput.getAttribute('type');
      expect(passwordType).toBe('password');
    });

    test('should not expose password in URL', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      await loginPage.login('test@example.com', 'Password123!');
      const url = page.url();
      expect(url).not.toContain('Password123!');
    });

    test('should rate limit failed attempts', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await loginPage.login('invalid@example.com', 'WrongPassword!');
        await loginPage.waitForTimeout(500);
      }
      
      // Check for rate limiting message
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Too many attempts');
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
