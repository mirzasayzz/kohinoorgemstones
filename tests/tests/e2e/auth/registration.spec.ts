import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../../pages/RegisterPage';
import { assertSiteAvailable } from '../../../helpers/site-check';
import { checkFormAccessibility } from '../../../helpers/accessibility';

test.describe('Registration Functionality', () => {
  let registerPage: RegisterPage;

  test.beforeAll(async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await assertSiteAvailable(request, baseUrl);
  });

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
  });

  test.describe('UI Validation', () => {
    test('should display registration page correctly', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
      await expect(page).toHaveTitle(/register|sign up/i);
    });

    test('should have email input and send OTP button', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.sendOtpButton).toBeVisible();
    });

    test('should display signin link', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await expect(registerPage.signinLink).toBeVisible();
    });

    test('should have proper form accessibility', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      const issues = await checkFormAccessibility(page, 'form');
      expect(issues).toHaveLength(0);
    });

    test('should have accessible email input', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      const ariaLabel = await registerPage.emailInput.getAttribute('aria-label');
      const placeholder = await registerPage.emailInput.getAttribute('placeholder');
      expect(ariaLabel || placeholder).toBeTruthy();
    });
  });

  test.describe('Successful Registration', () => {
    test('should register with valid data via OTP flow', async ({ page }) => {
      const email = `testuser${Date.now()}@playwright.local`;

      await registerPage.navigateToRegisterPage();
      await registerPage.register(email, '123456', {
        name: 'Test User',
        phone: '9876543210',
        password: 'TestPassword123!',
      });
      await registerPage.verifyRegistrationSuccessful();
    });

    test('should redirect to home after registration', async ({ page }) => {
      const email = `testuser${Date.now()}@playwright.local`;

      await registerPage.navigateToRegisterPage();
      await registerPage.register(email, '123456', {
        name: 'Redirect User',
        password: 'TestPassword123!',
      });
      await expect(page).toHaveURL('/');
    });

    test('should register without phone number', async ({ page }) => {
      const email = `nophone${Date.now()}@playwright.local`;

      await registerPage.navigateToRegisterPage();
      await registerPage.register(email, '123456', {
        name: 'No Phone User',
        password: 'TestPassword123!',
      });
      await registerPage.verifyRegistrationSuccessful();
    });
  });

  test.describe('Failed Registration', () => {
    test('should show error with existing email', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.sendOtp('customer@playwright.local');
      await registerPage.verifyErrorMessage(/already|exist/i);
    });

    test('should show error with empty email', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.submitEmptyForm();
    });

    test('should show error with invalid email format', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await registerPage.fill(registerPage.emailInput, 'invalidemail');
      await registerPage.click(registerPage.sendOtpButton);
    });
  });

  test.describe('OTP Flow', () => {
    test('should progress through all steps', async ({ page }) => {
      const email = `otpflow${Date.now()}@playwright.local`;

      await registerPage.navigateToRegisterPage();

      await registerPage.sendOtp(email);
      await registerPage.verifyStep2Loaded();

      await registerPage.verifyOtp('123456');
      await registerPage.verifyStep3Loaded();

      await registerPage.completeProfile({
        name: 'OTP Flow User',
        password: 'TestPassword123!',
      });
      await registerPage.verifyRegistrationSuccessful();
    });

    test('should show error with invalid OTP', async ({ page }) => {
      const email = `invalidotp${Date.now()}@playwright.local`;

      await registerPage.navigateToRegisterPage();
      await registerPage.sendOtp(email);
      await registerPage.verifyStep2Loaded();

      await registerPage.verifyOtp('000000');
      await registerPage.verifyErrorMessage(/invalid|expired/i);
    });

    test('should allow changing email on step 2', async ({ page }) => {
      const email1 = `change1${Date.now()}@playwright.local`;

      await registerPage.navigateToRegisterPage();
      await registerPage.sendOtp(email1);
      await registerPage.verifyStep2Loaded();

      await registerPage.click(registerPage.changeEmailButton);
      await registerPage.verifyRegisterPageLoaded();
    });

    test('should show step indicators', async ({ page }) => {
      await registerPage.navigateToRegisterPage();
      await expect(page.locator('text=1')).toBeVisible();
      await expect(page.locator('text=2')).toBeVisible();
      await expect(page.locator('text=3')).toBeVisible();
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

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
      await expect(registerPage.emailInput).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await registerPage.navigateToRegisterPage();
      await registerPage.verifyRegisterPageLoaded();
    });
  });
});
