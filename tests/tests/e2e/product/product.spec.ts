import { test, expect } from '@playwright/test';
import { HomePage } from '../../../pages/HomePage';
import { ProductPage } from '../../../pages/ProductPage';

test.describe('Product Browsing', () => {
  let homePage: HomePage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productPage = new ProductPage(page);
  });

  test.describe('Homepage', () => {
    test('should display homepage correctly', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.verifyHomePageLoaded();
      await expect(page).toHaveTitle(/kohinoor|gemstone/i);
    });

    test('should display hero section', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.verifyHeroSection();
    });

    test('should display featured products', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.verifyFeaturedProducts();
    });

    test('should display categories', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.verifyCategories();
    });

    test('should display footer', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.scrollToFooter();
      await homePage.verifyFooter();
    });
  });

  test.describe('Product Search', () => {
    test('should search for products', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.searchProduct('emerald');
      await homePage.verifySearchResultsVisible();
    });

    test('should search and press enter', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.searchWithEnter('ruby');
      await homePage.verifySearchResultsVisible();
    });

    test('should display search results', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.searchProduct('ring');
      const productCount = await homePage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    test('should clear search', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.fill(homePage.searchInput, 'emerald');
      await homePage.clearSearch();
      await expect(homePage.searchInput).toHaveValue('');
    });

    test('should handle empty search', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.searchProduct('');
      await homePage.waitForPageLoad();
    });

    test('should handle no results search', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.searchProduct('xyznonexistent');
      await homePage.waitForPageLoad();
    });
  });

  test.describe('Product Details', () => {
    test('should click on product and view details', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
    });

    test('should click on product by name', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProductByName('Emerald');
      await productPage.verifyProductPageLoaded();
    });

    test('should display product name', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      const name = await productPage.getProductName();
      expect(name).toBeTruthy();
    });

    test('should display product price', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      const price = await productPage.getProductPrice();
      expect(price).toContain('₹');
    });

    test('should display product description', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.verifyProductDescription();
    });

    test('should display product images', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.verifyProductImages();
    });

    test('should display product category', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      const category = await productPage.getProductCategory();
      expect(category).toBeTruthy();
    });

    test('should display breadcrumb', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.verifyBreadcrumb();
    });
  });

  test.describe('Product Images', () => {
    test('should click on thumbnail to change main image', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      
      const imageCount = await productPage.getImageCount();
      if (imageCount > 1) {
        await productPage.clickThumbnail(1);
        await productPage.waitForTimeout(500);
      }
    });

    test('should zoom image on click', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.zoomImage();
    });
  });

  test.describe('Product Tabs', () => {
    test('should click details tab', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.clickDetailsTab();
    });

    test('should click specifications tab', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.clickSpecificationsTab();
    });

    test('should click reviews tab', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.clickReviewsTab();
    });

    test('should click shipping tab', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.clickShippingTab();
    });
  });

  test.describe('Product Actions', () => {
    test('should add product to cart', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToCart();
      await homePage.verifyCartCount(1);
    });

    test('should add product to wishlist', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.addToWishlist();
    });

    test('should share product', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.shareProduct();
    });

    test('should buy now', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.buyNow();
      await expect(page).toHaveURL(/checkout/);
    });
  });

  test.describe('Quantity Selection', () => {
    test('should increase quantity', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.increaseQuantity();
      const quantity = await productPage.getQuantity();
      expect(quantity).toBe(2);
    });

    test('should decrease quantity', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.setQuantity(3);
      await productPage.decreaseQuantity();
      const quantity = await productPage.getQuantity();
      expect(quantity).toBe(2);
    });

    test('should set custom quantity', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.setQuantity(5);
      const quantity = await productPage.getQuantity();
      expect(quantity).toBe(5);
    });

    test('should add multiple quantities to cart', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.setQuantity(3);
      await productPage.addToCart();
      await homePage.verifyCartCount(3);
    });
  });

  test.describe('Related Products', () => {
    test('should display related products', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.verifyRelatedProducts();
    });

    test('should click on related product', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      
      const relatedCount = await productPage.getRelatedProductCount();
      if (relatedCount > 0) {
        await productPage.clickRelatedProduct(0);
        await productPage.verifyProductPageLoaded();
      }
    });
  });

  test.describe('Certification', () => {
    test('should display certification badge', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
      await productPage.verifyCertificationBadge();
    });
  });

  test.describe('Category Navigation', () => {
    test('should navigate to category page', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickCategory('emerald');
      await homePage.verifySearchResultsVisible();
    });

    test('should click emerald category', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickEmeraldCategory();
      await homePage.verifySearchResultsVisible();
    });

    test('should click ruby category', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickRubyCategory();
      await homePage.verifySearchResultsVisible();
    });

    test('should click diamond category', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.clickDiamondCategory();
      await homePage.verifySearchResultsVisible();
    });
  });

  test.describe('Scroll Interactions', () => {
    test('should scroll to featured products', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.scrollToFeaturedProducts();
      await expect(homePage.featuredSection).toBeInViewport();
    });

    test('should scroll to categories', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.scrollToCategories();
      await expect(homePage.categoriesSection).toBeInViewport();
    });

    test('should scroll to footer', async ({ page }) => {
      await homePage.navigateToHomePage();
      await homePage.scrollToFooter();
      await expect(homePage.footerSection).toBeInViewport();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display products correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await homePage.navigateToHomePage();
      await homePage.verifyFeaturedProducts();
      const productCount = await homePage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    test('should display products correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.navigateToHomePage();
      await homePage.verifyFeaturedProducts();
    });

    test('should display product details correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await homePage.navigateToHomePage();
      await homePage.clickProduct(0);
      await productPage.verifyProductPageLoaded();
    });
  });
});
