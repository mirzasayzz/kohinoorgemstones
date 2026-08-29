import { test, expect } from '@playwright/test';
import { HomePage } from '../../../pages/HomePage';
import { ProductPage } from '../../../pages/ProductPage';
import { CartPage } from '../../../pages/CartPage';
import { CheckoutPage } from '../../../pages/CheckoutPage';
import { faker } from '@faker-js/faker';
import { assertSiteAvailable } from '../../../helpers/site-check';

test.describe('Checkout Process', () => {
  let homePage: HomePage;
  let productPage: ProductPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeAll(async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await assertSiteAvailable(request, baseUrl);
  });

  const shippingAddress = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: 'national' }),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
    country: 'India',
  };

  const creditCard = {
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvv: '123',
    nameOnCard: faker.person.fullName(),
  };

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    
    // Add product to cart before each test
    await homePage.navigateToHomePage();
    await homePage.clickProduct(0);
    await productPage.verifyProductPageLoaded();
    await productPage.addToCart();
  });

  test.describe('Checkout Display', () => {
    test('should display checkout page correctly', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(page).toHaveURL(/checkout/);
    });

    test('should display shipping form', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.shippingForm).toBeVisible();
    });

    test('should display payment section', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.verifyPaymentSection();
    });

    test('should display order summary', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.verifyOrderSummary();
    });

    test('should display place order button', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.placeOrderButton).toBeVisible();
    });
  });

  test.describe('Shipping Address', () => {
    test('should fill shipping address', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      
      await expect(checkoutPage.firstNameInput).toHaveValue(shippingAddress.firstName);
      await expect(checkoutPage.lastNameInput).toHaveValue(shippingAddress.lastName);
      await expect(checkoutPage.emailInput).toHaveValue(shippingAddress.email);
    });

    test('should validate required fields', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.submitEmptyForm();
      
      await checkoutPage.verifyFieldError('firstName', 'First name is required');
    });

    test('should validate email format', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress({
        ...shippingAddress,
        email: 'invalidemail',
      });
      await checkoutPage.placeOrder();
      
      await checkoutPage.verifyFieldError('email', 'Please enter a valid email');
    });

    test('should validate phone number', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress({
        ...shippingAddress,
        phone: '123',
      });
      await checkoutPage.placeOrder();
      
      await checkoutPage.verifyFieldError('phone', 'Please enter a valid phone number');
    });
  });

  test.describe('Payment Methods', () => {
    test('should select credit card payment', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectCreditCard();
      await expect(checkoutPage.creditCardOption).toBeChecked();
    });

    test('should select debit card payment', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectDebitCard();
      await expect(checkoutPage.debitCardOption).toBeChecked();
    });

    test('should select UPI payment', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectUpi();
      await expect(checkoutPage.upiOption).toBeChecked();
    });

    test('should select Cash on Delivery', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectCod();
      await expect(checkoutPage.codOption).toBeChecked();
    });

    test('should show credit card form when selected', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectCreditCard();
      await checkoutPage.verifyCreditCardForm();
    });

    test('should show UPI form when selected', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectUpi();
      await checkoutPage.verifyUpiForm();
    });
  });

  test.describe('Credit Card Payment', () => {
    test('should fill credit card details', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectCreditCard();
      await checkoutPage.fillCreditCard(creditCard);
      
      await expect(checkoutPage.cardNumberInput).toHaveValue(creditCard.cardNumber);
    });

    test('should validate card number format', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectCreditCard();
      await checkoutPage.fillCreditCard({
        ...creditCard,
        cardNumber: '1234567890123456',
      });
      await checkoutPage.placeOrder();
      
      await checkoutPage.verifyErrorMessage('Invalid card number');
    });

    test('should validate expiry date', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.selectCreditCard();
      await checkoutPage.fillCreditCard({
        ...creditCard,
        expiry: '12/20',
      });
      await checkoutPage.placeOrder();
      
      await checkoutPage.verifyErrorMessage('Card has expired');
    });
  });

  test.describe('Order Placement', () => {
    test('should complete checkout with credit card', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      await checkoutPage.placeOrderWithCreditCard(creditCard);
      
      await checkoutPage.verifyOrderConfirmation();
      await checkoutPage.verifyOrderNumber();
    });

    test('should complete checkout with COD', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      await checkoutPage.placeOrderWithCod();
      
      await checkoutPage.verifyOrderConfirmation();
    });

    test('should require terms acceptance', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      await checkoutPage.selectCod();
      
      // Try to place order without accepting terms
      await checkoutPage.placeOrderButton.click();
      
      await checkoutPage.verifyFieldError('terms', 'Please accept the terms');
    });

    test('should show order number after placement', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      await checkoutPage.placeOrderWithCod();
      
      await checkoutPage.verifyOrderNumber();
      const orderNumber = await checkoutPage.getOrderNumber();
      expect(orderNumber).toBeTruthy();
    });
  });

  test.describe('Order Summary', () => {
    test('should display order items', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.orderItems).toBeVisible();
    });

    test('should display order subtotal', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.orderSubtotal).toBeVisible();
    });

    test('should display order tax', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.orderTax).toBeVisible();
    });

    test('should display order shipping', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.orderShipping).toBeVisible();
    });

    test('should display order total', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.orderTotal).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to cart', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.backToCart();
      
      await expect(page).toHaveURL(/cart/);
    });

    test('should view order details after placement', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      await checkoutPage.placeOrderWithCod();
      
      await checkoutPage.verifyOrderConfirmation();
      await checkoutPage.viewOrderDetails();
    });

    test('should continue shopping after placement', async ({ page }) => {
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await checkoutPage.fillShippingAddress(shippingAddress);
      await checkoutPage.placeOrderWithCod();
      
      await checkoutPage.verifyOrderConfirmation();
      await checkoutPage.continueShopping();
      
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Full Checkout Flow', () => {
    test('should complete full checkout flow', async ({ page }) => {
      await test.step('Add product to cart', async () => {
        await homePage.navigateToHomePage();
        await homePage.clickProduct(0);
        await productPage.verifyProductPageLoaded();
        await productPage.addToCart();
      });

      await test.step('Proceed to checkout', async () => {
        await cartPage.navigateToCart();
        await cartPage.verifyCartPageLoaded();
        await cartPage.proceedToCheckout();
      });

      await test.step('Fill shipping address', async () => {
        await checkoutPage.verifyCheckoutPageLoaded();
        await checkoutPage.fillShippingAddress(shippingAddress);
      });

      await test.step('Select payment method', async () => {
        await checkoutPage.selectCod();
      });

      await test.step('Place order', async () => {
        await checkoutPage.placeOrder();
      });

      await test.step('Verify order confirmation', async () => {
        await checkoutPage.verifyOrderConfirmation();
        await checkoutPage.verifyOrderNumber();
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('should display checkout correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
      await expect(checkoutPage.shippingForm).toBeVisible();
    });

    test('should display checkout correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await checkoutPage.navigateToCheckout();
      await checkoutPage.verifyCheckoutPageLoaded();
    });
  });
});
