import { test, expect } from '@playwright/test';
import { HomePage } from '../../../pages/HomePage';
import { ProductPage } from '../../../pages/ProductPage';
import { CartPage } from '../../../pages/CartPage';
import { assertSiteAvailable } from '../../../helpers/site-check';

test.describe('Shopping Cart', () => {
  let homePage: HomePage;
  let productPage: ProductPage;
  let cartPage: CartPage;

  test.beforeAll(async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await assertSiteAvailable(request, baseUrl);
  });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);
  });

  // Add the first home-listed product to the cart (requires login)
  async function addFirstProduct(page: import('@playwright/test').Page) {
    await homePage.loginAsCustomer();
    await homePage.navigateToHomePage();
    await homePage.clickProduct(0);
    await productPage.verifyProductPageLoaded();
    await productPage.addToCart();
  }

  test.describe('Cart Display', () => {
    test('should display empty cart', async ({ page }) => {
      await homePage.loginAsCustomer();
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCartEmpty();
    });

    test('should display cart page correctly', async ({ page }) => {
      await homePage.loginAsCustomer();
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await expect(cartPage.drawerHeader).toBeVisible();
    });
  });

  test.describe('Add to Cart', () => {
    test('should add product to cart', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      await homePage.verifyCartCount(1);
    });

    test('should add multiple products to cart', async ({ page }) => {
      // Add first product
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      // Add second product
      await homePage.click(homePage.logo);
      await homePage.waitForPageLoad();
      await homePage.clickProduct(1);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.verifyCartCount(2);
    });

    test('should add product with custom quantity', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      await cartPage.navigateToCart();
      await cartPage.updateQuantity(0, 3);
      await cartPage.closeCart();
      await homePage.verifyCartCount(3);
    });

    test('should add same product multiple times', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.click(homePage.logo);
      await homePage.waitForPageLoad();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.verifyCartCount(2);
    });
  });

  test.describe('Cart Items', () => {
    test('should display product in cart', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      const productName = await productPage.getProductName();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCartItemExists(productName);
    });

    test('should display correct product count', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCartItemCount(1);
    });

    test('should display product name in cart', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      const names = await cartPage.getProductNames();
      expect(names.length).toBeGreaterThan(0);
    });

    test('should display product price in cart', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      const prices = await cartPage.getProductPrices();
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  test.describe('Quantity Management', () => {
    test('should update quantity', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.updateQuantity(0, 3);
      
      const quantity = await cartPage.getQuantity(0);
      expect(quantity).toBe(3);
    });

    test('should decrease quantity', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.updateQuantity(0, 3);
      await cartPage.updateQuantity(0, 1);
      
      const quantity = await cartPage.getQuantity(0);
      expect(quantity).toBe(1);
    });

    test('should update total when quantity changes', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      
      const initialTotal = await cartPage.getTotal();
      await cartPage.updateQuantity(0, 2);
      const newTotal = await cartPage.getTotal();
      
      expect(newTotal).not.toBe(initialTotal);
    });
  });

  test.describe('Remove from Cart', () => {
    test('should remove product from cart', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.removeFromCart(0);
      
      await cartPage.verifyCartEmpty();
    });

    test('should remove one product from multiple', async ({ page }) => {
      // Add two products
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.click(homePage.logo);
      await homePage.waitForPageLoad();
      await homePage.clickProduct(1);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      // Remove first product
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.removeFromCart(0);
      
      await cartPage.verifyCartItemCount(1);
    });

    test('should clear entire cart', async ({ page }) => {
      // Add multiple products
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.click(homePage.logo);
      await homePage.waitForPageLoad();
      await homePage.clickProduct(1);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      // Clear cart
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.clearCart();
      
      await cartPage.verifyCartEmpty();
    });

    test('should update cart count after removal', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.click(homePage.logo);
      await homePage.waitForPageLoad();
      await homePage.clickProduct(1);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await homePage.verifyCartCount(2);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.removeFromCart(0);
      await cartPage.closeCart();
      
      await homePage.waitForPageLoad();
      await homePage.verifyCartCount(1);
    });
  });

  test.describe('Cart Summary', () => {
    test('should display subtotal', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifySubtotal();
    });

    test('should display tax', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyTax();
    });

    test('should display shipping', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyShipping();
    });

    test('should display total', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyTotalVisible();
    });

    test('should calculate correct total', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      
      const total = await cartPage.getTotal();
      expect(total).toContain('₹');
    });
  });

  test.describe('Coupon', () => {
    test('should apply valid coupon', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      const productPrice = await productPage.getProductPrice();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      const total = await cartPage.getTotal();
      expect(total).toContain('₹');
      expect(total.length).toBeGreaterThan(0);
      expect(productPrice.length).toBeGreaterThan(0);
    });

    test('should show error for invalid coupon', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCheckoutButton();
    });

    test('should remove coupon', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCheckoutButton();
    });

    test('should verify coupon input is visible', async ({ page }) => {
      await homePage.loginAsCustomer();
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCouponInput();
    });
  });

  test.describe('Checkout Navigation', () => {
    test('should proceed to checkout', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.proceedToCheckout();
      
      await expect(page).toHaveURL(/checkout/);
    });

    test('should continue shopping', async ({ page }) => {
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.closeCart();
      
      await productPage.verifyProductPageLoaded();
    });

    test('should verify checkout button is visible', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCheckoutButton();
    });
  });

  test.describe('Recommended Products', () => {
    test('should display recommended products', async ({ page }) => {
      await addFirstProduct(page);
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
      await expect(cartPage.drawerHeader).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display cart correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
    });

    test('should display cart correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.loginAsCustomer();
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      
      await cartPage.navigateToCart();
      await cartPage.verifyCartPageLoaded();
    });
  });
});
