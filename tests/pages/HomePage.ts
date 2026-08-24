import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Navigation & Header
  readonly logo: Locator;
  readonly navigationMenu: Locator;
  readonly homeLink: Locator;
  readonly gemstonesLink: Locator;
  readonly aboutLink: Locator;
  readonly contactLink: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchResults: Locator;
  readonly userMenu: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;
  readonly profileLink: Locator;
  readonly wishlistLink: Locator;
  readonly logoutButton: Locator;
  readonly cartIcon: Locator;
  readonly cartCount: Locator;

  // Hero Section
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly heroCTAButton: Locator;
  readonly heroImage: Locator;

  // Featured Products
  readonly featuredSection: Locator;
  readonly featuredTitle: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productImages: Locator;
  readonly viewAllButton: Locator;

  // Categories
  readonly categoriesSection: Locator;
  readonly categoryCards: Locator;
  readonly emeraldCategory: Locator;
  readonly rubyCategory: Locator;
  readonly diamondCategory: Locator;

  // Testimonials
  readonly testimonialsSection: Locator;
  readonly testimonialCards: Locator;

  // Newsletter
  readonly newsletterSection: Locator;
  readonly newsletterInput: Locator;
  readonly subscribeButton: Locator;

  // Footer
  readonly footerSection: Locator;
  readonly footerLinks: Locator;
  readonly socialMediaLinks: Locator;
  readonly copyrightText: Locator;

  // Chat Widget
  readonly chatButton: Locator;
  readonly chatWindow: Locator;
  readonly chatInput: Locator;
  readonly chatSendButton: Locator;

  // Loading & Toast
  readonly loadingSpinner: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation & Header
    this.logo = page.locator('a[href="/"] img, .logo, [class*="logo"]');
    this.navigationMenu = page.locator('nav, .navbar, [class*="nav"]');
    this.homeLink = page.locator('a[href="/"], a:has-text("Home")');
    this.gemstonesLink = page.locator('a[href*="gemstones"], a[href*="shop"], a:has-text("Gemstones")');
    this.aboutLink = page.locator('a[href*="about"], a:has-text("About")');
    this.contactLink = page.locator('a[href*="contact"], a:has-text("Contact")');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
    this.searchButton = page.locator('button[type="submit"], button:has-text("Search"), button[aria-label*="search" i]');
    this.searchResults = page.locator('.search-results, [class*="search-result"]');
    this.userMenu = page.locator('.user-menu, [class*="user-menu"], [class*="dropdown"]');
    this.loginButton = page.locator('a[href="/signin"], a[href="/login"], button:has-text("Login"), a:has-text("Sign In")');
    this.signupButton = page.locator('a[href="/signup"], a[href="/register"], button:has-text("Sign Up"), a:has-text("Register")');
    this.profileLink = page.locator('a[href="/profile"], a:has-text("Profile")');
    this.wishlistLink = page.locator('a[href="/wishlist"], a:has-text("Wishlist")');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    this.cartIcon = page.locator('a[href="/cart"], .cart-icon, [class*="cart"]');
    this.cartCount = page.locator('.cart-count, .badge, [class*="cart-count"]');

    // Hero Section
    this.heroSection = page.locator('.hero, [class*="hero"], section:first-of-type');
    this.heroTitle = page.locator('.hero h1, [class*="hero"] h1, h1');
    this.heroSubtitle = page.locator('.hero p, [class*="hero"] p, .subtitle');
    this.heroCTAButton = page.locator('.hero button, .hero a, [class*="hero"] button, [class*="hero"] a');
    this.heroImage = page.locator('.hero img, [class*="hero"] img');

    // Featured Products
    this.featuredSection = page.locator('.featured, [class*="featured"], [class*="products"]');
    this.featuredTitle = page.locator('.featured h2, [class*="featured"] h2, h2:has-text("Featured")');
    this.productCards = page.locator('.product-card, [class*="product-card"], [class*="product-item"]');
    this.productNames = page.locator('.product-name, [class*="product-name"], [class*="product-title"]');
    this.productPrices = page.locator('.product-price, [class*="product-price"], [class*="price"]');
    this.productImages = page.locator('.product-image img, [class*="product-image"] img, [class*="product-card"] img');
    this.viewAllButton = page.locator('a:has-text("View All"), button:has-text("View All"), a:has-text("See All")');

    // Categories
    this.categoriesSection = page.locator('.categories, [class*="categories"], [class*="category-section"]');
    this.categoryCards = page.locator('.category-card, [class*="category-card"], [class*="category-item"]');
    this.emeraldCategory = page.locator('a:has-text("Emerald"), [class*="emerald"]');
    this.rubyCategory = page.locator('a:has-text("Ruby"), [class*="ruby"]');
    this.diamondCategory = page.locator('a:has-text("Diamond"), [class*="diamond"]');

    // Testimonials
    this.testimonialsSection = page.locator('.testimonials, [class*="testimonials"], [class*="reviews"]');
    this.testimonialCards = page.locator('.testimonial-card, [class*="testimonial"]');

    // Newsletter
    this.newsletterSection = page.locator('.newsletter, [class*="newsletter"], [class*="subscribe"]');
    this.newsletterInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    this.subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Join")');

    // Footer
    this.footerSection = page.locator('footer, .footer, [class*="footer"]');
    this.footerLinks = page.locator('footer a, .footer a, [class*="footer"] a');
    this.socialMediaLinks = page.locator('footer a[href*="facebook"], footer a[href*="twitter"], footer a[href*="instagram"]');
    this.copyrightText = page.locator('footer p, .footer p, [class*="copyright"]');

    // Chat Widget
    this.chatButton = page.locator('button:has-text("Chat"), .chat-button, [class*="chat-button"], [class*="chat-widget"]');
    this.chatWindow = page.locator('.chat-window, [class*="chat-window"], [class*="chat-popup"]');
    this.chatInput = page.locator('.chat-input, [class*="chat-input"] input, [class*="chat-window"] input');
    this.chatSendButton = page.locator('.chat-send, [class*="chat-send"], [class*="chat-window"] button');

    // Loading & Toast
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"]');
    this.toastMessage = page.locator('.toast, .alert, [class*="toast"], [class*="alert"]');
  }

  // Navigation methods
  async navigateToHomePage(): Promise<void> {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  async clickLogo(): Promise<void> {
    await this.click(this.logo);
    await this.waitForPageLoad();
  }

  async clickHome(): Promise<void> {
    await this.click(this.homeLink);
    await this.waitForPageLoad();
  }

  async clickGemstones(): Promise<void> {
    await this.click(this.gemstonesLink);
    await this.waitForPageLoad();
  }

  async clickAbout(): Promise<void> {
    await this.click(this.aboutLink);
    await this.waitForPageLoad();
  }

  async clickContact(): Promise<void> {
    await this.click(this.contactLink);
    await this.waitForPageLoad();
  }

  // Search methods
  async searchProduct(productName: string): Promise<void> {
    await this.fill(this.searchInput, productName);
    await this.click(this.searchButton);
    await this.waitForPageLoad();
  }

  async searchWithEnter(productName: string): Promise<void> {
    await this.fill(this.searchInput, productName);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async getSearchValue(): Promise<string> {
    return await this.getValue(this.searchInput);
  }

  // Auth methods
  async clickLogin(): Promise<void> {
    await this.click(this.loginButton);
    await this.waitForPageLoad();
  }

  async clickSignup(): Promise<void> {
    await this.click(this.signupButton);
    await this.waitForPageLoad();
  }

  async clickProfile(): Promise<void> {
    await this.click(this.profileLink);
    await this.waitForPageLoad();
  }

  async clickWishlist(): Promise<void> {
    await this.click(this.wishlistLink);
    await this.waitForPageLoad();
  }

  async clickLogout(): Promise<void> {
    await this.click(this.logoutButton);
    await this.waitForPageLoad();
  }

  async openUserMenu(): Promise<void> {
    await this.click(this.userMenu);
  }

  // Cart methods
  async clickCart(): Promise<void> {
    await this.click(this.cartIcon);
    await this.waitForPageLoad();
  }

  async getCartCount(): Promise<number> {
    const count = await this.getText(this.cartCount);
    return parseInt(count) || 0;
  }

  async verifyCartCount(expectedCount: number): Promise<void> {
    await expect(this.cartCount).toContainText(expectedCount.toString());
  }

  // Product methods
  async getProductCount(): Promise<number> {
    return await this.getElementCount(this.productCards);
  }

  async clickProduct(index: number): Promise<void> {
    await this.productCards.nth(index).click();
    await this.waitForPageLoad();
  }

  async clickProductByName(name: string): Promise<void> {
    const product = this.page.locator(`[class*="product-card"]:has-text("${name}"), [class*="product-item"]:has-text("${name}")`).first();
    await product.click();
    await this.waitForPageLoad();
  }

  async getProductName(index: number): Promise<string> {
    return await this.getText(this.productNames.nth(index));
  }

  async getProductPrice(index: number): Promise<string> {
    return await this.getText(this.productPrices.nth(index));
  }

  async hoverProduct(index: number): Promise<void> {
    await this.hover(this.productCards.nth(index));
  }

  // Category methods
  async clickCategory(categoryName: string): Promise<void> {
    const category = this.page.locator(`a:has-text("${categoryName}"), [class*="category"]:has-text("${categoryName}")`).first();
    await category.click();
    await this.waitForPageLoad();
  }

  async clickEmeraldCategory(): Promise<void> {
    await this.click(this.emeraldCategory);
    await this.waitForPageLoad();
  }

  async clickRubyCategory(): Promise<void> {
    await this.click(this.rubyCategory);
    await this.waitForPageLoad();
  }

  async clickDiamondCategory(): Promise<void> {
    await this.click(this.diamondCategory);
    await this.waitForPageLoad();
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string): Promise<void> {
    await this.fill(this.newsletterInput, email);
    await this.click(this.subscribeButton);
  }

  // Chat methods
  async openChat(): Promise<void> {
    await this.click(this.chatButton);
    await this.waitForSelector(this.chatWindow);
  }

  async sendChatMessage(message: string): Promise<void> {
    await this.fill(this.chatInput, message);
    await this.click(this.chatSendButton);
  }

  // Validation methods
  async verifyHomePageLoaded(): Promise<void> {
    await this.expectVisible(this.logo);
    await this.expectVisible(this.navigationMenu);
    await this.expectUrl('/');
  }

  async verifyHeroSection(): Promise<void> {
    await this.expectVisible(this.heroSection);
    await this.expectVisible(this.heroTitle);
  }

  async verifyFeaturedProducts(): Promise<void> {
    await this.expectVisible(this.featuredSection);
    const count = await this.getProductCount();
    expect(count).toBeGreaterThan(0);
  }

  async verifyCategories(): Promise<void> {
    await this.expectVisible(this.categoriesSection);
  }

  async verifyFooter(): Promise<void> {
    await this.expectVisible(this.footerSection);
  }

  async verifySearchResultsVisible(): Promise<void> {
    await this.expectVisible(this.productCards.first());
  }

  async verifyUserLoggedIn(): Promise<void> {
    await this.expectVisible(this.profileLink);
    await this.expectHidden(this.loginButton);
  }

  async verifyUserLoggedOut(): Promise<void> {
    await this.expectVisible(this.loginButton);
    await this.expectHidden(this.profileLink);
  }

  // Scroll methods
  async scrollToFeaturedProducts(): Promise<void> {
    await this.scrollToElement(this.featuredSection);
  }

  async scrollToCategories(): Promise<void> {
    await this.scrollToElement(this.categoriesSection);
  }

  async scrollToTestimonials(): Promise<void> {
    await this.scrollToElement(this.testimonialsSection);
  }

  async scrollToNewsletter(): Promise<void> {
    await this.scrollToElement(this.newsletterSection);
  }

  async scrollToFooter(): Promise<void> {
    await this.scrollToElement(this.footerSection);
  }

  // Wait methods
  async waitForProductsToLoad(): Promise<void> {
    await this.waitForSelector(this.productCards.first());
    await this.waitForTimeout(1000);
  }

  async waitForSearchResults(): Promise<void> {
    await this.waitForSelector(this.searchResults);
  }
}
