import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class WishlistPage extends BasePage {
  // Wishlist items
  readonly wishlistItems: Locator;
  readonly emptyWishlistMessage: Locator;
  readonly wishlistCount: Locator;

  // Actions
  readonly moveToCartButton: Locator;
  readonly removeFromWishlistButton: Locator;
  readonly clearWishlistButton: Locator;

  // Product info
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productImages: Locator;

  // Navigation
  readonly continueShoppingLink: Locator;
  readonly cartLink: Locator;

  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Wishlist items
    this.wishlistItems = page.locator('[class*="wishlist-item"], [class*="wishlist-card"], .wishlist-item');
    this.emptyWishlistMessage = page.locator('text=/wishlist is empty|no items/i');
    this.wishlistCount = page.locator('[class*="wishlist-count"], .badge');

    // Actions
    this.moveToCartButton = page.locator('button:has-text("Move to Cart"), button:has-text("Add to Cart")');
    this.removeFromWishlistButton = page.locator('button:has-text("Remove"), button[aria-label*="remove" i]');
    this.clearWishlistButton = page.locator('button:has-text("Clear Wishlist"), button:has-text("Remove All")');

    // Product info
    this.productNames = page.locator('[class*="product-name"], [class*="product-title"]');
    this.productPrices = page.locator('[class*="product-price"], [class*="price"]');
    this.productImages = page.locator('[class*="product-image"] img, [class*="wishlist-item"] img');

    // Navigation
    this.continueShoppingLink = page.locator('a:has-text("Continue Shopping"), a:has-text("Browse")');
    this.cartLink = page.locator('a[href="/cart"], a:has-text("View Cart")');

    // Messages
    this.successMessage = page.locator('[class*="success"], [class*="toast"]');
    this.errorMessage = page.locator('[class*="error"], [class*="alert-danger"]');
  }

  // Navigation
  async navigateToWishlist(): Promise<void> {
    await this.navigateTo('/wishlist');
    await this.waitForPageLoad();
  }

  // Verify
  async verifyWishlistPageLoaded(): Promise<void> {
    await this.expectUrl(/wishlist/);
  }

  async verifyWishlistEmpty(): Promise<void> {
    await this.expectVisible(this.emptyWishlistMessage);
  }

  async verifyWishlistNotEmpty(): Promise<void> {
    const count = await this.wishlistItems.count();
    expect(count).toBeGreaterThan(0);
  }

  // Actions
  async removeFromWishlist(index: number): Promise<void> {
    await this.removeFromWishlistButton.nth(index).click();
    await this.waitForPageLoad();
  }

  async moveToCart(index: number): Promise<void> {
    await this.moveToCartButton.nth(index).click();
    await this.waitForPageLoad();
  }

  async clearWishlist(): Promise<void> {
    await this.click(this.clearWishlistButton);
    await this.waitForPageLoad();
  }

  // Getters
  async getWishlistCount(): Promise<number> {
    return await this.wishlistItems.count();
  }

  async getProductName(index: number): Promise<string> {
    return await this.getText(this.productNames.nth(index));
  }

  async getProductPrice(index: number): Promise<string> {
    return await this.getText(this.productPrices.nth(index));
  }

  // Navigation
  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingLink);
    await this.waitForPageLoad();
  }

  async goToCart(): Promise<void> {
    await this.click(this.cartLink);
    await this.waitForPageLoad();
  }
}
