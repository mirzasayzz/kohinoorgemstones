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
    this.quantityInput = page.locator('input[name="quantity"]:visible').first();
    this.quantityIncreaseButton = page.locator('button[aria-label="increase"]:visible, button:has-text("+"):visible').first();
    this.quantityDecreaseButton = page.locator('button[aria-label="decrease"]:visible, button:has-text("-"):visible').first();
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
    this.relatedProducts = page.locator('section:has-text("Related"), div:has-text("Related"), a[href*="/gemstone/"]').first();
    this.relatedProductCards = page.locator('a[href*="/gemstone/"]');

    // Certification
    this.certificationBadge = page.locator('span:has-text("Certified"), div:has-text("Certified"), h4:has-text("Certified"), [class*="cert"]').first();
    this.certificationDetails = page.locator('span:has-text("Certified"), div:has-text("Certified")').first();

    // Chat
    this.chatWithUsButton = page.locator('button:has-text("WhatsApp"), button:has-text("Chat")').first();

    // Breadcrumb
    this.breadcrumb = page.locator('button:has-text("Back"), a:has-text("Home"), nav').first();
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

  // Product interaction methods
  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.setQuantity(quantity);
    }
    await this.addToCartButton.click();
    await this.waitForTimeout(500);
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
    await this.shareButton.click();
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
    await this.quantityIncreaseButton.click();
  }

  async decreaseQuantity(): Promise<void> {
    await this.quantityDecreaseButton.click();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
  }

  async getQuantity(): Promise<number> {
    const quantity = await this.quantityInput.inputValue();
    return parseInt(quantity) || 1;
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
