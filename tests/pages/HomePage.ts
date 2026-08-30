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
    this.logo = page.locator('header a[href="/"] img, a[href="/"] img').first();
    this.navigationMenu = page.locator('header nav, nav').first();
    this.homeLink = page.locator('a[href="/"], a:has-text("Home")').first();
    this.gemstonesLink = page.locator('a[href*="gemstones"], a:has-text("Gemstones")').first();
    this.aboutLink = page.locator('a[href*="about"], a:has-text("About"), a:has-text("Our Story")').first();
    this.contactLink = page.locator('a[href*="contact"], a[href*="about"], a:has-text("Contact")').first();
    this.searchInput = page.locator('input[placeholder*="Search gemstones"], input[type="text"][placeholder*="Search"], input[type="search"]').first();
    this.searchButton = page.locator('form button[type="submit"], form:has(input[placeholder*="Search"])').first();
    this.searchResults = page.locator('text=Search results for, .search-results, [class*="search-result"], a[href*="/gemstone/"]').first();
    this.userMenu = page.locator('button[aria-label="User menu"]');
    this.loginButton = page.locator('button:has-text("Sign In")');
    this.signupButton = page.locator('a[href="/signup"], a[href="/register"], button:has-text("Sign Up"), a:has-text("Register")');
    this.profileLink = page.locator('a[href="/profile"], a:has-text("Profile")');
    this.wishlistLink = page.locator('a[href="/wishlist"], a:has-text("Wishlist"), button[aria-label*="Wishlist"]');
    this.logoutButton = page.locator('button:has-text("Sign Out")');
    this.cartIcon = page.locator('button[aria-label="Cart"], a[href="/cart"], .cart-icon');
    this.cartCount = page.locator('button[aria-label="Cart"] span, .cart-count');

    // Hero Section
    this.heroSection = page.locator('section, main').first();
    this.heroTitle = page.locator('h1, h2, h3').first();
    this.heroSubtitle = page.locator('section p, main p').first();
    this.heroCTAButton = page.locator('section a, section button, main a, main button').first();
    this.heroImage = page.locator('section img, main img, header img').first();

    // Featured Products
    this.featuredSection = page.locator('section:has(a[href*="/gemstone/"]), main').first();
    this.featuredTitle = page.locator('h2, h3').first();
    this.productCards = page.locator('a[href*="/gemstone/"]');
    this.productNames = page.locator('a[href*="/gemstone/"] h3, a[href*="/gemstone/"] h4, a[href*="/gemstone/"] [class*="title"]');
    this.productPrices = page.locator('a[href*="/gemstone/"] >> text=₹');
    this.productImages = page.locator('a[href*="/gemstone/"] img');
    this.viewAllButton = page.locator('a:has-text("Explore More"), a:has-text("All Gemstones"), a:has-text("View All"), button:has-text("Explore More")').first();

    // Categories
    this.categoriesSection = page.locator('section:has(button:has-text("Ruby")), section:has(button:has-text("All Collection"))').first();
    this.categoryCards = page.locator('button:has-text("Ruby"), button:has-text("Emerald"), button:has-text("Sapphire"), button:has-text("All Collection")');
    this.emeraldCategory = page.locator('button:has-text("Emerald")').first();
    this.rubyCategory = page.locator('button:has-text("Ruby")').first();
    this.diamondCategory = page.locator('button:has-text("Diamond"), button:has-text("Sapphire")').first();

    // Testimonials
    this.testimonialsSection = page.locator('section:has-text("Happy Customers"), section:has-text("Certified"), section').first();
    this.testimonialCards = page.locator('section:has-text("Happy Customers") span, section span');

    // Newsletter
    this.newsletterSection = page.locator('section:has(input), footer, section').first();
    this.newsletterInput = page.locator('input[type="email"], input[placeholder*="email" i], input[type="text"]').first();
    this.subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Join"), button:has-text("Submit")').first();

    // Footer
    this.footerSection = page.locator('footer, [role="contentinfo"]').first();
    this.footerLinks = page.locator('footer a, [role="contentinfo"] a');
    this.socialMediaLinks = page.locator('footer a');
    this.copyrightText = page.locator('footer p, footer span, [role="contentinfo"]');

    // Chat Widget
    this.chatButton = page.locator('button:has-text("Kohinoor AI"), button:has-text("Chat"), button[aria-label*="chat" i]').first();
    this.chatWindow = page.locator('.chat-window, [class*="chat-window"], [class*="chat-popup"], [class*="fixed right-0"]');
    this.chatInput = page.locator('input[placeholder*="Ask"], input[placeholder*="chat" i], input[type="text"]');
    this.chatSendButton = page.locator('button:has-text("Send"), button[type="submit"]');

    // Loading & Toast
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"], [class*="animate-spin"]');
    this.toastMessage = page.locator('.toast, .alert, [class*="toast"], [class*="alert"], [role="alert"]');
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
    await this.searchInput.fill(productName);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('a[href*="/gemstone/"]', { timeout: 10000 }).catch(() => {});
  }

  async searchWithEnter(productName: string): Promise<void> {
    await this.searchProduct(productName);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async getSearchValue(): Promise<string> {
    return await this.getValue(this.searchInput);
  }

  // Auth methods
  async loginAsCustomer(): Promise<void> {
    await this.navigateTo('/signin');
    await this.waitForPageLoad();
    const emailInput = this.page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('customer@playwright.local');
      await this.page.locator('input[type="password"]').fill('PlaywrightPassword123');
      await this.page.locator('button[type="submit"]').click();
      await this.page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 10000 }).catch(() => {});
    }
  }

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
    if (!(await this.logoutButton.isVisible())) {
      await this.openUserMenu();
    }
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }

  async openUserMenu(): Promise<void> {
    await this.userMenu.waitFor({ state: 'visible', timeout: 10000 });
    if (!(await this.logoutButton.isVisible())) {
      await this.userMenu.click();
      await this.page.waitForTimeout(300);
    }
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
    await this.page.waitForSelector('a[href*="/gemstone/"]', { timeout: 10000 });
    const card = this.productCards.nth(index);
    const href = await card.getAttribute('href');
    if (href) {
      await this.navigateTo(href);
    } else {
      await card.click({ force: true, noWaitAfter: true });
    }
    await this.page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  }

  async clickProductByName(name: string): Promise<void> {
    const product = this.page.locator(`a[href*="/gemstone/"]:has-text("${name}")`).first();
    const href = await product.getAttribute('href');
    if (href) {
      await this.navigateTo(href);
    } else {
      await product.click({ force: true, noWaitAfter: true });
    }
    await this.page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
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
    const category = this.page.locator(`button:has-text("${categoryName}")`).first();
    await category.click();
    await this.waitForTimeout(500);
  }

  async clickEmeraldCategory(): Promise<void> {
    await this.click(this.emeraldCategory);
    await this.waitForTimeout(500);
  }

  async clickRubyCategory(): Promise<void> {
    await this.click(this.rubyCategory);
    await this.waitForTimeout(500);
  }

  async clickDiamondCategory(): Promise<void> {
    await this.click(this.diamondCategory);
    await this.waitForTimeout(500);
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
    await this.expectVisible(this.userMenu);
    await this.expectHidden(this.loginButton);
  }

  async verifyUserLoggedOut(): Promise<void> {
    await this.expectVisible(this.loginButton);
    await this.expectHidden(this.userMenu);
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
