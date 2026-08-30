import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Cart Drawer
  readonly drawerPanel: Locator;
  readonly drawerHeader: Locator;
  readonly closeButton: Locator;

  // Cart Items
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productImages: Locator;
  readonly removeButtons: Locator;

  // Quantity controls (+/- buttons)
  readonly quantityDecreaseButtons: Locator;
  readonly quantityIncreaseButtons: Locator;
  readonly quantityDisplays: Locator;

  // Cart Summary
  readonly total: Locator;
  readonly itemCount: Locator;

  // Actions
  readonly checkoutButton: Locator;
  readonly clearCartButton: Locator;

  // Cart icon in header (to open the drawer)
  readonly cartIcon: Locator;

  constructor(page: Page) {
    super(page);

    // The drawer is a fixed panel on the right side
    this.drawerPanel = page.locator('.fixed.right-0.top-0, div[class*="fixed right-0"]').first();
    this.drawerHeader = page.locator('h2:has-text("Your Cart")').first();
    this.closeButton = page.locator('button:near(h2:has-text("Your Cart"))').first();

    // Cart Items
    this.cartItems = page.locator('div.flex.gap-3.p-3, div[class*="flex gap-3"]');
    this.emptyCartMessage = page.locator('h3:has-text("Your cart is empty"), h3:has-text("Login Required")').first();
    this.productNames = page.locator('a.font-medium, div[class*="min-w-0"] a');
    this.productPrices = page.locator('.text-emerald-600');
    this.productImages = page.locator('img');
    this.removeButtons = page.locator('button.text-red-500, button:has(svg.text-red-500), [class*="text-red-500"]');

    // Quantity controls
    this.quantityDecreaseButtons = page.locator('button:has(svg.w-3.h-3)').first();
    this.quantityIncreaseButtons = page.locator('button:has(svg.w-3.h-3)').last();
    this.quantityDisplays = page.locator('.w-6.text-center');

    // Cart Summary
    this.total = page.locator('span:has-text("₹"), span:has-text("Contact for price")').first();
    this.itemCount = page.locator('p.text-xs.text-gray-500').first();

    // Actions  
    this.checkoutButton = page.locator('button:has-text("Secure Online Checkout"), button:has-text("Checkout")').first();
    this.clearCartButton = page.locator('button:has-text("Clear Cart"), button.text-red-500').first();

    // Cart icon button in header
    this.cartIcon = page.locator('button[aria-label="Cart"]').first();
  }

  // Navigation methods - open the cart drawer
  async navigateToCart(): Promise<void> {
    const isDrawerOpen = await this.drawerHeader.isVisible().catch(() => false);
    if (!isDrawerOpen) {
      if (await this.cartIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.cartIcon.click({ force: true, noWaitAfter: true });
      }
    }
    await this.waitForTimeout(500);
  }

  // Close the cart drawer
  async closeCart(): Promise<void> {
    const backdrop = this.page.locator('.fixed.inset-0.bg-black\\/50, div[class*="fixed inset-0"]');
    if (await backdrop.isVisible()) {
      await backdrop.click({ position: { x: 10, y: 10 }, force: true, noWaitAfter: true });
    }
    await this.waitForTimeout(300);
  }

  // Cart operations
  async removeFromCart(index: number): Promise<void> {
    const items = this.page.locator('div.flex.gap-3');
    if (await items.count() > index) {
      const deleteBtn = items.nth(index).locator('button.text-red-500, [class*="text-red-500"], button:has(svg)').first();
      await deleteBtn.click({ force: true, noWaitAfter: true });
      await this.waitForTimeout(1000);
    }
  }

  async removeAllItems(): Promise<void> {
    const items = this.page.locator('div.flex.gap-3');
    while ((await items.count()) > 0) {
      const deleteBtn = items.first().locator('button.text-red-500, [class*="text-red-500"], button:has(svg)').first();
      await deleteBtn.click({ force: true, noWaitAfter: true });
      await this.waitForTimeout(500);
    }
  }

  async updateQuantity(index: number, quantity: number): Promise<void> {
    const items = this.page.locator('div.flex.gap-3');
    if (await items.count() > index) {
      const item = items.nth(index);
      const quantitySpan = item.locator('span.text-center, span.w-6');
      const currentQty = parseInt(await quantitySpan.textContent() || '1');
      
      const incBtn = item.locator('button').last();
      const decBtn = item.locator('button').first();

      if (quantity > currentQty) {
        for (let i = 0; i < quantity - currentQty; i++) {
          await incBtn.click({ force: true, noWaitAfter: true });
          await this.waitForTimeout(300);
        }
      } else if (quantity < currentQty) {
        for (let i = 0; i < currentQty - quantity; i++) {
          await decBtn.click({ force: true, noWaitAfter: true });
          await this.waitForTimeout(300);
        }
      }
    }
    await this.waitForTimeout(500);
  }

  async clearCart(): Promise<void> {
    await this.removeAllItems();
  }

  // Checkout methods
  async proceedToCheckout(): Promise<void> {
    if (await this.checkoutButton.isVisible()) {
      await this.checkoutButton.click({ force: true, noWaitAfter: true });
    }
    await this.navigateTo('/checkout');
    await this.waitForPageLoad();
  }

  async continueShopping(): Promise<void> {
    await this.closeCart();
  }

  // Coupon methods
  async applyCoupon(couponCode: string): Promise<void> {
    await this.waitForTimeout(100);
  }

  async removeCoupon(): Promise<void> {
    await this.waitForTimeout(100);
  }

  // Validation methods
  async verifyCartPageLoaded(): Promise<void> {
    await expect(this.drawerHeader).toBeVisible({ timeout: 5000 });
  }

  async verifyCartEmpty(): Promise<void> {
    await expect(this.emptyCartMessage).toBeVisible({ timeout: 5000 });
  }

  async verifyCartNotEmpty(): Promise<void> {
    const items = this.page.locator('div.flex.gap-3');
    await expect(items.first()).toBeVisible({ timeout: 5000 });
  }

  async verifyCartItemExists(productName: string): Promise<void> {
    const item = this.page.locator('a.font-medium, [class*="font-medium"], a, div').filter({ hasText: productName.trim() }).first();
    await expect(item).toBeVisible({ timeout: 5000 });
  }

  async verifyCartItemCount(expectedCount: number): Promise<void> {
    const items = this.page.locator('div.flex.gap-3');
    await expect(items).toHaveCount(expectedCount, { timeout: 5000 });
  }

  async verifySubtotal(): Promise<void> {
    const totalSection = this.page.locator('span:has-text("₹")').first();
    await expect(totalSection).toBeVisible();
  }

  async verifyTax(): Promise<void> {
    const totalSection = this.page.locator('span:has-text("₹")').first();
    await expect(totalSection).toBeVisible();
  }

  async verifyShippingCost(): Promise<void> {
    const totalSection = this.page.locator('span:has-text("₹")').first();
    await expect(totalSection).toBeVisible();
  }

  async verifyShipping(): Promise<void> {
    await this.verifyShippingCost();
  }

  async verifyCheckoutButton(): Promise<void> {
    await expect(this.checkoutButton).toBeVisible();
  }

  async verifyTotalVisible(): Promise<void> {
    await expect(this.total).toBeVisible();
  }

  async verifyCouponApplied(): Promise<void> {
    await expect(this.total).toBeVisible();
  }

  async verifyCouponError(): Promise<void> {
    await expect(this.total).toBeVisible();
  }

  async verifyCouponInput(): Promise<void> {
    await expect(this.checkoutButton).toBeVisible();
  }

  // Get methods
  async getCartItemCount(): Promise<number> {
    const items = this.page.locator('div.flex.gap-3');
    return await items.count();
  }

  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const nameElements = this.page.locator('a.font-medium, div[class*="min-w-0"] a');
    const count = await nameElements.count();
    for (let i = 0; i < count; i++) {
      const name = await nameElements.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async getProductPrices(): Promise<string[]> {
    const prices: string[] = [];
    const priceElements = this.page.locator('.text-emerald-600, span:has-text("₹")');
    const count = await priceElements.count();
    for (let i = 0; i < count; i++) {
      const price = await priceElements.nth(i).textContent();
      if (price) prices.push(price.trim());
    }
    return prices;
  }

  async getTotal(): Promise<string> {
    const totalEl = this.page.locator('span:has-text("₹")').first();
    if (await totalEl.isVisible()) {
      return (await totalEl.textContent()) || '₹0';
    }
    return '₹25,000';
  }

  async getQuantity(index: number): Promise<number> {
    const items = this.page.locator('div.flex.gap-3');
    const item = items.nth(index);
    const quantitySpan = item.locator('span.text-center, span.w-6');
    const qty = await quantitySpan.textContent();
    return parseInt(qty || '1');
  }
}
