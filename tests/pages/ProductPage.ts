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
    this.productName = page.locator('h1, .product-title, [class*="product-title"], [class*="product-name"]');
    this.productPrice = page.locator('.price, [class*="price"], span:has-text("₹"), [class*="product-price"]');
    this.productDescription = page.locator('.description, [class*="description"], [class*="product-desc"]');
    this.productImages = page.locator('img[class*="product"], .product-image, [class*="gallery"] img');
    this.mainImage = page.locator('.main-image, [class*="main-image"], [class*="primary-image"]');
    this.thumbnailImages = page.locator('.thumbnail, [class*="thumbnail"], [class*="gallery"] img');
    this.productCategory = page.locator('.category, [class*="category"], [class*="product-category"]');
    this.productSKU = page.locator('.sku, [class*="sku"], [class*="product-sku"]');
    this.productRating = page.locator('.rating, [class*="rating"], [class*="stars"]');
    this.productReviews = page.locator('.reviews, [class*="review"], [class*="product-review"]');

    // Quantity & Cart
    this.quantityInput = page.locator('input[type="number"], input[name="quantity"], input[placeholder*="quantity" i]');
    this.quantityIncreaseButton = page.locator('button:has-text("+"), button[aria-label*="increase"], [class*="increase"]');
    this.quantityDecreaseButton = page.locator('button:has-text("-"), button[aria-label*="decrease"], [class*="decrease"]');
    this.addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Cart"), [class*="add-to-cart"]');
    this.buyNowButton = page.locator('button:has-text("Buy Now"), button:has-text("Purchase"), [class*="buy-now"]');

    // Wishlist & Share
    this.wishlistButton = page.locator('button:has-text("Wishlist"), button:has-text("Save"), [class*="wishlist"], button[aria-label*="wishlist"]');
    this.shareButton = page.locator('button:has-text("Share"), [class*="share"], button[aria-label*="share"]');
    this.compareButton = page.locator('button:has-text("Compare"), [class*="compare"]');

    // Details Tabs
    this.detailsTab = page.locator('button:has-text("Details"), [class*="details-tab"]');
    this.specificationsTab = page.locator('button:has-text("Specifications"), [class*="specs-tab"]');
    this.reviewsTab = page.locator('button:has-text("Reviews"), [class*="reviews-tab"]');
    this.shippingTab = page.locator('button:has-text("Shipping"), [class*="shipping-tab"]');

    // Related Products
    this.relatedProducts = page.locator('.related-products, [class*="related"], [class*="you-may-also-like"]');
    this.relatedProductCards = page.locator('.related-product-card, [class*="related"] .product-card, [class*="related"] [class*="product"]');

    // Certification
    this.certificationBadge = page.locator('.certification, [class*="certif"], [class*="badge"], [class*="authenticity"]');
    this.certificationDetails = page.locator('.certification-details, [class*="certification-info"]');

    // Chat
    this.chatWithUsButton = page.locator('button:has-text("Chat with us"), [class*="chat-button"]');

    // Breadcrumb
    this.breadcrumb = page.locator('.breadcrumb, [class*="breadcrumb"], nav[aria-label="breadcrumb"]');
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
    await this.click(this.addToCartButton);
    await this.waitForTimeout(1000);
  }

  async buyNow(): Promise<void> {
    await this.click(this.buyNowButton);
    await this.waitForPageLoad();
  }

  async addToWishlist(): Promise<void> {
    await this.click(this.wishlistButton);
    await this.waitForTimeout(500);
  }

  async removeFromWishlist(): Promise<void> {
    await this.click(this.wishlistButton);
    await this.waitForTimeout(500);
  }

  async shareProduct(): Promise<void> {
    await this.click(this.shareButton);
  }

  async compareProduct(): Promise<void> {
    await this.click(this.compareButton);
  }

  async chatWithUs(): Promise<void> {
    await this.click(this.chatWithUsButton);
  }

  // Quantity methods
  async increaseQuantity(): Promise<void> {
    await this.click(this.quantityIncreaseButton);
  }

  async decreaseQuantity(): Promise<void> {
    await this.click(this.quantityDecreaseButton);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.fill(this.quantityInput, quantity.toString());
  }

  async getQuantity(): Promise<number> {
    const quantity = await this.getValue(this.quantityInput);
    return parseInt(quantity) || 1;
  }

  // Image methods
  async clickThumbnail(index: number): Promise<void> {
    await this.thumbnailImages.nth(index).click();
  }

  async zoomImage(): Promise<void> {
    await this.click(this.mainImage);
  }

  async getImageCount(): Promise<number> {
    return await this.getElementCount(this.productImages);
  }

  // Tab methods
  async clickDetailsTab(): Promise<void> {
    await this.click(this.detailsTab);
  }

  async clickSpecificationsTab(): Promise<void> {
    await this.click(this.specificationsTab);
  }

  async clickReviewsTab(): Promise<void> {
    await this.click(this.reviewsTab);
  }

  async clickShippingTab(): Promise<void> {
    await this.click(this.shippingTab);
  }

  // Validation methods
  async verifyProductPageLoaded(): Promise<void> {
    await this.expectVisible(this.productName);
    await this.expectVisible(this.productPrice);
    await this.expectVisible(this.addToCartButton);
  }

  async verifyProductName(expectedName: string): Promise<void> {
    await this.expectText(this.productName, expectedName);
  }

  async verifyProductPrice(expectedPrice: string): Promise<void> {
    await this.expectText(this.productPrice, expectedPrice);
  }

  async verifyProductDescription(): Promise<void> {
    await this.expectVisible(this.productDescription);
  }

  async verifyProductImages(): Promise<void> {
    const imageCount = await this.getImageCount();
    expect(imageCount).toBeGreaterThan(0);
  }

  async verifyCertificationBadge(): Promise<void> {
    await this.expectVisible(this.certificationBadge);
  }

  async verifyRelatedProducts(): Promise<void> {
    await this.expectVisible(this.relatedProducts);
  }

  async verifyBreadcrumb(): Promise<void> {
    await this.expectVisible(this.breadcrumb);
  }

  async verifyQuantityInput(): Promise<void> {
    await this.expectVisible(this.quantityInput);
  }

  async verifyAddToCartButton(): Promise<void> {
    await this.expectVisible(this.addToCartButton);
  }

  async verifyBuyNowButton(): Promise<void> {
    await this.expectVisible(this.buyNowButton);
  }

  async verifyWishlistButton(): Promise<void> {
    await this.expectVisible(this.wishlistButton);
  }

  // Get methods
  async getProductName(): Promise<string> {
    return await this.getText(this.productName);
  }

  async getProductPrice(): Promise<string> {
    return await this.getText(this.productPrice);
  }

  async getProductDescription(): Promise<string> {
    return await this.getText(this.productDescription);
  }

  async getProductCategory(): Promise<string> {
    return await this.getText(this.productCategory);
  }

  async getProductSKU(): Promise<string> {
    return await this.getText(this.productSKU);
  }

  async getProductRating(): Promise<string> {
    return await this.getText(this.productRating);
  }

  async getRelatedProductCount(): Promise<number> {
    return await this.getElementCount(this.relatedProductCards);
  }

  async clickRelatedProduct(index: number): Promise<void> {
    await this.relatedProductCards.nth(index).click();
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
