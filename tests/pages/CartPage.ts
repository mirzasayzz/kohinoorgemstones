import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Cart Items
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productImages: Locator;
  readonly quantityInputs: Locator;
  readonly removeButtons: Locator;
  readonly updateButtons: Locator;

  // Cart Summary
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly shipping: Locator;
  readonly discount: Locator;
  readonly total: Locator;
  readonly itemCount: Locator;

  // Actions
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly clearCartButton: Locator;
  readonly applyCouponButton: Locator;
  readonly couponInput: Locator;
  readonly couponMessage: Locator;
  readonly couponRemoveButton: Locator;

  // Recommended Products
  readonly recommendedProducts: Locator;
  readonly recommendedSection: Locator;

  constructor(page: Page) {
    super(page);

    // Cart Items
    this.cartItems = page.locator('.cart-item, [class*="cart-item"], [class*="cart"] [class*="item"]');
    this.emptyCartMessage = page.locator('.empty-cart, [class*="empty"], :has-text("Your cart is empty"), :has-text("Cart is empty")');
    this.productNames = page.locator('.product-name, [class*="product-name"], [class*="item-name"]');
    this.productPrices = page.locator('.product-price, [class*="price"], [class*="item-price"]');
    this.productImages = page.locator('.product-image img, [class*="product-image"] img');
    this.quantityInputs = page.locator('input[type="number"], input[name="quantity"]');
    this.removeButtons = page.locator('button:has-text("Remove"), button:has-text("Delete"), [class*="remove"], [class*="delete"]');
    this.updateButtons = page.locator('button:has-text("Update"), button:has-text("Refresh")');

    // Cart Summary
    this.subtotal = page.locator('.subtotal, [class*="subtotal"], :has-text("Subtotal")');
    this.tax = page.locator('.tax, [class*="tax"], :has-text("Tax")');
    this.shipping = page.locator('.shipping, [class*="shipping"], :has-text("Shipping")');
    this.discount = page.locator('.discount, [class*="discount"], :has-text("Discount")');
    this.total = page.locator('.total, [class*="total"], :has-text("Total")');
    this.itemCount = page.locator('.item-count, [class*="item-count"], [class*="cart-count"]');

    // Actions
    this.checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout"), [class*="checkout"]');
    this.continueShoppingButton = page.locator('a:has-text("Continue Shopping"), button:has-text("Continue Shopping")');
    this.clearCartButton = page.locator('button:has-text("Clear"), button:has-text("Empty Cart"), [class*="clear-cart"]');
    this.applyCouponButton = page.locator('button:has-text("Apply"), button:has-text("Coupon")');
    this.couponInput = page.locator('input[placeholder*="coupon" i], input[name="coupon"], input[placeholder*="promo" i]');
    this.couponMessage = page.locator('.coupon-message, [class*="coupon-message"], [class*="coupon-error"], [class*="coupon-success"]');
    this.couponRemoveButton = page.locator('button:has-text("Remove Coupon"), [class*="remove-coupon"]');

    // Recommended Products
    this.recommendedProducts = page.locator('.recommended-products, [class*="recommended"], [class*="you-may-also-like"]');
    this.recommendedSection = page.locator('.recommended-section, [class*="recommended-section"]');
  }

  // Navigation methods
  async navigateToCart(): Promise<void> {
    await this.navigateTo('/cart');
    await this.waitForPageLoad();
  }

  // Cart operations
  async removeFromCart(index: number): Promise<void> {
    await this.removeButtons.nth(index).click();
    await this.waitForTimeout(1000);
  }

  async removeAllItems(): Promise<void> {
    while ((await this.cartItems.count()) > 0) {
      await this.removeButtons.first().click();
      await this.waitForTimeout(500);
    }
  }

  async updateQuantity(index: number, quantity: number): Promise<void> {
    await this.quantityInputs.nth(index).fill(quantity.toString());
    await this.updateButtons.nth(index).click();
    await this.waitForTimeout(1000);
  }

  async clearCart(): Promise<void> {
    await this.click(this.clearCartButton);
    await this.waitForTimeout(1000);
  }

  // Coupon methods
  async applyCoupon(couponCode: string): Promise<void> {
    await this.fill(this.couponInput, couponCode);
    await this.click(this.applyCouponButton);
    await this.waitForTimeout(1000);
  }

  async removeCoupon(): Promise<void> {
    await this.click(this.couponRemoveButton);
    await this.waitForTimeout(1000);
  }

  async verifyCouponApplied(expectedMessage: string): Promise<void> {
    await this.expectText(this.couponMessage, expectedMessage);
  }

  async verifyCouponFailed(expectedMessage: string): Promise<void> {
    await this.expectText(this.couponMessage, expectedMessage);
  }

  // Checkout methods
  async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
    await this.waitForPageLoad();
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyCartPageLoaded(): Promise<void> {
    await this.expectUrl(/cart/);
  }

  async verifyCartEmpty(): Promise<void> {
    await this.expectVisible(this.emptyCartMessage);
  }

  async verifyCartNotEmpty(): Promise<void> {
    await this.expectVisible(this.cartItems.first());
  }

  async verifyCartItemExists(productName: string): Promise<void> {
    const item = this.page.locator(`[class*="cart-item"]:has-text("${productName}"), [class*="item"]:has-text("${productName}")`);
    await this.expectVisible(item);
  }

  async verifyCartItemCount(expectedCount: number): Promise<void> {
    const count = await this.cartItems.count();
    expect(count).toBe(expectedCount);
  }

  async verifyProductPrice(index: number, expectedPrice: string): Promise<void> {
    await this.expectText(this.productPrices.nth(index), expectedPrice);
  }

  async verifyTotal(expectedTotal: string): Promise<void> {
    await this.expectText(this.total, expectedTotal);
  }

  async verifySubtotal(): Promise<void> {
    await this.expectVisible(this.subtotal);
  }

  async verifyTax(): Promise<void> {
    await this.expectVisible(this.tax);
  }

  async verifyShipping(): Promise<void> {
    await this.expectVisible(this.shipping);
  }

  async verifyTotalVisible(): Promise<void> {
    await this.expectVisible(this.total);
  }

  async verifyCheckoutButton(): Promise<void> {
    await this.expectVisible(this.checkoutButton);
  }

  async verifyCouponInput(): Promise<void> {
    await this.expectVisible(this.couponInput);
  }

  // Get methods
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productNames.count();
    for (let i = 0; i < count; i++) {
      const name = await this.productNames.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async getProductPrices(): Promise<string[]> {
    const prices: string[] = [];
    const count = await this.productPrices.count();
    for (let i = 0; i < count; i++) {
      const price = await this.productPrices.nth(i).textContent();
      if (price) prices.push(price.trim());
    }
    return prices;
  }

  async getSubtotal(): Promise<string> {
    return await this.getText(this.subtotal);
  }

  async getTax(): Promise<string> {
    return await this.getText(this.tax);
  }

  async getShipping(): Promise<string> {
    return await this.getText(this.shipping);
  }

  async getTotal(): Promise<string> {
    return await this.getText(this.total);
  }

  async getQuantity(index: number): Promise<number> {
    const quantity = await this.quantityInputs.nth(index).inputValue();
    return parseInt(quantity) || 1;
  }

  async getItemCount(): Promise<string> {
    return await this.getText(this.itemCount);
  }

  // Scroll methods
  async scrollToRecommended(): Promise<void> {
    await this.scrollToElement(this.recommendedProducts);
  }

  // Wait methods
  async waitForCartToLoad(): Promise<void> {
    await this.waitForTimeout(1000);
  }

  async waitForCouponMessage(): Promise<void> {
    await this.waitForSelector(this.couponMessage);
  }
}
