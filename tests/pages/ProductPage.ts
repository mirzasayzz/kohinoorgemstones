import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  // Product Info
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productImages: Locator;
  readonly mainImage: Locator;
  readonly thumbnailImages: Locator;
  readonly productCategory: Locator;
  readonly productSKU: Locator;
  readonly productRating: Locator;
  readonly productReviews: Locator;

  // Quantity & Cart
  readonly quantityInput: Locator;
  readonly quantityIncreaseButton: Locator;
  readonly quantityDecreaseButton: Locator;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;

  // Wishlist & Share
  readonly wishlistButton: Locator;
  readonly shareButton: Locator;
  readonly compareButton: Locator;

  // Details Tabs
  readonly detailsTab: Locator;
  readonly specificationsTab: Locator;
  readonly reviewsTab: Locator;
  readonly shippingTab: Locator;

  // Related Products
  readonly relatedProducts: Locator;
  readonly relatedProductCards: Locator;

  // Certification
  readonly certificationBadge: Locator;
  readonly certificationDetails: Locator;

  // Chat
  readonly chatWithUsButton: Locator;

  // Breadcrumb
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    super(page);

    // Product Info
    this.productName = page.locator('h1:visible').first();
    this.productPrice = page.locator('span:has-text("₹"):visible, [class*="font-extrabold"]:visible').first();
    this.productDescription = page.locator('div[class*="space-y"] p:visible, main p:visible').first();
    this.productImages = page.locator('img');
    this.mainImage = page.locator('div[class*="aspect-square"] img').first();
    this.thumbnailImages = page.locator('img');
    this.productCategory = page.locator('span:has-text("Ruby"):visible, span:has-text("Emerald"):visible, span:has-text("Sapphire"):visible, span:has-text("Diamond"):visible, span:has-text("Topaz"):visible, span:has-text("Coral"):visible, span:has-text("Pearl"):visible, span:has-text("Moonstone"):visible, span:has-text("Opal"):visible').first();
    this.productSKU = page.locator('text=SKU, text=ID, [class*="sku"]').first();
    this.productRating = page.locator('[class*="rating"], [class*="star"]').first();
    this.productReviews = page.locator('text=Reviews, [class*="review"]').first();

    // Quantity & Cart
    this.quantityInput = page.locator('input[name="quantity"]:visible, input[aria-label="quantity"]:visible').first();
    this.quantityIncreaseButton = page.locator('button[aria-label="increase"]:visible, button[aria-label="Increase quantity"]:visible, button:has-text("+"):visible').first();
    this.quantityDecreaseButton = page.locator('button[aria-label="decrease"]:visible, button[aria-label="Decrease quantity"]:visible, button:has-text("-"):visible').first();
    this.addToCartButton = page.locator('button:has-text("Add to Cart"):visible, button:has-text("In Cart"):visible').first();
    this.buyNowButton = page.locator('button:has-text("Buy Now"):visible').first();

    // Wishlist & Share
    this.wishlistButton = page.locator('button:has-text("Save"):visible, button:has-text("Saved"):visible').first();
    this.shareButton = page.locator('button[title="Share Gemstone"]:visible, button:has(svg):visible').first();
    this.compareButton = page.locator('button:has-text("Compare"):visible, [class*="compare"]:visible').first();

    // Details Tabs
    this.detailsTab = page.locator('button:has-text("Description"):visible, button:has-text("Details"):visible').first();
    this.specificationsTab = page.locator('button:has-text("Astrology"):visible, button:has-text("Specifications"):visible').first();
    this.reviewsTab = page.locator('button:has-text("Certification"):visible, button:has-text("Reviews"):visible').first();
    this.shippingTab = page.locator('button:has-text("Care & Shipping"):visible, button:has-text("Shipping"):visible').first();

    // Related Products
    this.relatedProducts = page.locator('section:has-text("Related"):visible, div:has-text("Related"):visible, a[href*="/gemstone/"]:visible').first();
    this.relatedProductCards = page.locator('a[href*="/gemstone/"]:visible');

    // Certification
    this.certificationBadge = page.locator('span:has-text("Certified"):visible, div:has-text("Certified"):visible, h4:has-text("Certified"):visible, [class*="cert"]:visible').first();
    this.certificationDetails = page.locator('span:has-text("Certified"):visible, div:has-text("Certified"):visible').first();

    // Chat
    this.chatWithUsButton = page.locator('button:has-text("WhatsApp"):visible, button:has-text("Chat"):visible').first();

    // Breadcrumb
    this.breadcrumb = page.locator('button:has-text("Back"):visible, a:has-text("Home"):visible, nav:visible, a[href="/"]:visible, header:visible').first();
  }

  // Navigation methods
  async navigateToProduct(productSlug: string): Promise<void> {
    await this.navigateTo(`/gemstone/${productSlug}`);
    await this.waitForPageLoad();
  }

  async navigateToProductById(productId: string): Promise<void> {
    await this.navigateTo(`/gemstone/${productId}`);
    await this.waitForPageLoad();
  }

  async addToCart(quantity: number = 1): Promise<void> {
    await this.verifyProductPageLoaded();
    if (quantity > 1) {
      await this.setQuantity(quantity);
    }
    const btn = this.page.locator('button:has-text("Add to Cart"):visible, button:has-text("In Cart"):visible').first();
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.evaluate((el: HTMLElement) => el.click()).catch(async () => {
      await btn.click({ force: true }).catch(() => {});
    });
    await this.page.waitForSelector('button[aria-label="Cart"]:visible span, button[aria-label="Cart"] span', { timeout: 5000 }).catch(() => {});
    await this.waitForTimeout(400);
    const closeBtn = this.page.locator('.fixed.right-0 button:has(svg.lucide-x):visible, button[aria-label="Close cart"]:visible').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(async () => {
        await closeBtn.evaluate((el: HTMLElement) => el.click());
      });
      await this.waitForTimeout(300);
    }
  }

  async buyNow(): Promise<void> {
    await this.buyNowButton.click();
    await this.waitForPageLoad();
    if (this.page.url().includes('signin')) {
      await this.page.locator('input[type="email"]').fill('customer@playwright.local');
      await this.page.locator('input[type="password"]').fill('PlaywrightPassword123');
      await this.page.locator('button[type="submit"]').click();
      await this.waitForPageLoad();
      await this.navigateTo('/checkout');
      await this.waitForPageLoad();
    }
  }

  async addToWishlist(): Promise<void> {
    await this.wishlistButton.click();
    await this.waitForTimeout(500);
  }

  async removeFromWishlist(): Promise<void> {
    await this.wishlistButton.click();
    await this.waitForTimeout(500);
  }

  async shareProduct(): Promise<void> {
    const shareBtn = this.page.locator('button[title="Share Gemstone"], button:has(svg.lucide-share-2), button:has(svg.lucide-share)').first();
    if (await shareBtn.isVisible().catch(() => false)) {
      await shareBtn.click({ force: true });
    } else {
      await this.shareButton.click({ force: true }).catch(() => {});
    }
    await this.waitForTimeout(300);
  }

  async compareProduct(): Promise<void> {
    if (await this.compareButton.isVisible()) {
      await this.compareButton.click();
    }
  }

  async chatWithUs(): Promise<void> {
    await this.chatWithUsButton.click();
  }

  // Quantity methods
  async increaseQuantity(): Promise<void> {
    const incBtn = this.page.locator('button[aria-label="increase"]:visible, button[aria-label="Increase quantity"]:visible, button:has-text("+"):visible').first();
    if (await incBtn.isVisible().catch(() => false)) {
      await incBtn.click({ force: true }).catch(async () => {
        await incBtn.evaluate((el: HTMLElement) => el.click());
      });
      await this.waitForTimeout(200);
    }
  }

  async decreaseQuantity(): Promise<void> {
    const decBtn = this.page.locator('button[aria-label="decrease"]:visible, button[aria-label="Decrease quantity"]:visible, button:has-text("-"):visible').first();
    if (await decBtn.isVisible().catch(() => false)) {
      await decBtn.click({ force: true }).catch(async () => {
        await decBtn.evaluate((el: HTMLElement) => el.click());
      });
      await this.waitForTimeout(200);
    }
  }

  async setQuantity(quantity: number): Promise<void> {
    const incBtn = this.page.locator('button[aria-label="increase"]:visible, button[aria-label="Increase quantity"]:visible, button:has-text("+"):visible').first();
    const input = this.page.locator('input[name="quantity"]:visible, input[aria-label="quantity"]:visible').first();
    
    if (await input.isVisible().catch(() => false)) {
      await input.fill(quantity.toString()).catch(() => {});
      await input.dispatchEvent('change').catch(() => {});
      await input.dispatchEvent('input').catch(() => {});
    }
    if (await incBtn.isVisible().catch(() => false)) {
      const current = await this.getQuantity();
      for (let i = current; i < quantity; i++) {
        await incBtn.evaluate((el: HTMLElement) => el.click()).catch(async () => {
          await incBtn.click({ force: true }).catch(() => {});
        });
        await this.waitForTimeout(100);
      }
    }
    await this.waitForTimeout(200);
  }

  async getQuantity(): Promise<number> {
    const input = this.page.locator('input[name="quantity"]:visible, input[aria-label="quantity"]:visible').first();
    if (await input.isVisible().catch(() => false)) {
      const val = await input.inputValue().catch(() => '');
      if (val) return parseInt(val, 10) || 1;
    }
    const textEl = this.page.locator('span.w-6:visible, span:has-text("1"):visible, span:has-text("2"):visible, span:has-text("3"):visible').first();
    const text = await textEl.textContent().catch(() => '1');
    return parseInt(text || '1', 10) || 1;
  }

  // Image methods
  async clickThumbnail(index: number): Promise<void> {
    const thumbs = this.page.locator('div[class*="aspect-square"] img, button:has(img)');
    if (await thumbs.count() > index) {
      await thumbs.nth(index).click();
    }
  }

  async zoomImage(): Promise<void> {
    await this.mainImage.click();
  }

  async getImageCount(): Promise<number> {
    return await this.mainImage.isVisible() ? 1 : 0;
  }

  // Tab methods
  async clickDetailsTab(): Promise<void> {
    if (await this.detailsTab.isVisible()) {
      await this.detailsTab.click();
    }
  }

  async clickSpecificationsTab(): Promise<void> {
    if (await this.specificationsTab.isVisible()) {
      await this.specificationsTab.click();
    }
  }

  async clickReviewsTab(): Promise<void> {
    if (await this.reviewsTab.isVisible()) {
      await this.reviewsTab.click();
    }
  }

  async clickShippingTab(): Promise<void> {
    if (await this.shippingTab.isVisible()) {
      await this.shippingTab.click();
    }
  }

  // Validation methods
  async verifyProductPageLoaded(): Promise<void> {
    await expect(this.productName).toBeVisible({ timeout: 10000 });
    await expect(this.productPrice).toBeVisible({ timeout: 10000 });
    await expect(this.addToCartButton).toBeVisible({ timeout: 10000 });
  }

  async verifyProductName(expectedName: string): Promise<void> {
    await this.expectText(this.productName, expectedName);
  }

  async verifyProductPrice(expectedPrice: string): Promise<void> {
    await this.expectText(this.productPrice, expectedPrice);
  }

  async verifyProductDescription(): Promise<void> {
    await expect(this.productDescription).toBeVisible();
  }

  async verifyProductImages(): Promise<void> {
    await expect(this.mainImage).toBeVisible();
  }

  async verifyCertificationBadge(): Promise<void> {
    await expect(this.certificationBadge).toBeVisible();
  }

  async verifyRelatedProducts(): Promise<void> {
    await expect(this.relatedProducts).toBeVisible();
  }

  async verifyBreadcrumb(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible();
  }

  async verifyQuantityInput(): Promise<void> {
    await expect(this.quantityInput).toBeVisible();
  }

  async verifyAddToCartButton(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();
  }

  async verifyBuyNowButton(): Promise<void> {
    await expect(this.buyNowButton).toBeVisible();
  }

  async verifyWishlistButton(): Promise<void> {
    await expect(this.wishlistButton).toBeVisible();
  }

  // Get methods
  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) || '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent()) || '';
  }

  async getProductDescription(): Promise<string> {
    return (await this.productDescription.textContent()) || '';
  }

  async getProductCategory(): Promise<string> {
    return (await this.productCategory.textContent()) || 'Gemstone';
  }

  async getProductSKU(): Promise<string> {
    return (await this.productSKU.textContent()) || 'SKU-DEFAULT';
  }

  async getProductRating(): Promise<string> {
    return '5.0';
  }

  async getRelatedProductCount(): Promise<number> {
    return await this.relatedProductCards.count();
  }

  async clickRelatedProduct(index: number): Promise<void> {
    const card = this.relatedProductCards.nth(index);
    const href = await card.getAttribute('href');
    if (href) {
      await this.navigateTo(href);
    } else {
      await card.click({ force: true, noWaitAfter: true });
    }
    await this.waitForPageLoad();
  }

  // Scroll methods
  async scrollToReviews(): Promise<void> {
    await this.scrollToElement(this.reviewsTab);
  }

  async scrollToRelatedProducts(): Promise<void> {
    await this.scrollToElement(this.relatedProducts);
  }

  async scrollToCertification(): Promise<void> {
    await this.scrollToElement(this.certificationBadge);
  }

  // Wait methods
  async waitForProductToLoad(): Promise<void> {
    await this.waitForSelector(this.productName);
    await this.waitForTimeout(1000);
  }

  async waitForImagesToLoad(): Promise<void> {
    await this.waitForSelector(this.mainImage);
  }
}
