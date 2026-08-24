import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  // Profile Info
  readonly profileHeader: Locator;
  readonly profileImage: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly editProfileButton: Locator;

  // Tabs
  readonly personalInfoTab: Locator;
  readonly ordersTab: Locator;
  readonly wishlistTab: Locator;
  readonly addressesTab: Locator;
  readonly settingsTab: Locator;

  // Personal Info Form
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Orders
  readonly ordersList: Locator;
  readonly orderCards: Locator;
  readonly orderStatus: Locator;
  readonly orderDate: Locator;
  readonly orderTotal: Locator;
  readonly viewOrderButton: Locator;
  readonly trackOrderButton: Locator;
  readonly emptyOrdersMessage: Locator;

  // Wishlist
  readonly wishlistItems: Locator;
  readonly wishlistCards: Locator;
  readonly removeFromWishlistButton: Locator;
  readonly addToCartButton: Locator;
  readonly emptyWishlistMessage: Locator;

  // Addresses
  readonly addressesList: Locator;
  readonly addressCards: Locator;
  readonly addAddressButton: Locator;
  readonly editAddressButton: Locator;
  readonly deleteAddressButton: Locator;
  readonly defaultAddressBadge: Locator;
  readonly emptyAddressesMessage: Locator;

  // Settings
  readonly changePasswordSection: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updatePasswordButton: Locator;
  readonly deleteAccountSection: Locator;
  readonly deleteAccountButton: Locator;
  readonly notificationSettings: Locator;
  readonly emailNotificationsCheckbox: Locator;
  readonly smsNotificationsCheckbox: Locator;

  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Profile Info
    this.profileHeader = page.locator('.profile-header, [class*="profile-header"], [class*="profile-info"]');
    this.profileImage = page.locator('.profile-image, [class*="profile-image"], [class*="avatar"]');
    this.userName = page.locator('.user-name, [class*="user-name"], [class*="display-name"]');
    this.userEmail = page.locator('.user-email, [class*="user-email"], [class*="email"]');
    this.editProfileButton = page.locator('button:has-text("Edit Profile"), button:has-text("Edit")');

    // Tabs
    this.personalInfoTab = page.locator('button:has-text("Personal Info"), [class*="personal-tab"]');
    this.ordersTab = page.locator('button:has-text("Orders"), [class*="orders-tab"]');
    this.wishlistTab = page.locator('button:has-text("Wishlist"), [class*="wishlist-tab"]');
    this.addressesTab = page.locator('button:has-text("Addresses"), [class*="addresses-tab"]');
    this.settingsTab = page.locator('button:has-text("Settings"), [class*="settings-tab"]');

    // Personal Info Form
    this.firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first name" i]');
    this.lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last name" i]');
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"]');
    this.saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
    this.cancelButton = page.locator('button:has-text("Cancel")');

    // Orders
    this.ordersList = page.locator('.orders-list, [class*="orders-list"], [class*="order-history"]');
    this.orderCards = page.locator('.order-card, [class*="order-card"], [class*="order-item"]');
    this.orderStatus = page.locator('.order-status, [class*="order-status"], [class*="status"]');
    this.orderDate = page.locator('.order-date, [class*="order-date"], [class*="date"]');
    this.orderTotal = page.locator('.order-total, [class*="order-total"]');
    this.viewOrderButton = page.locator('button:has-text("View Order"), a:has-text("View Order")');
    this.trackOrderButton = page.locator('button:has-text("Track"), a:has-text("Track")');
    this.emptyOrdersMessage = page.locator('.empty-orders, [class*="empty"], :has-text("No orders yet")');

    // Wishlist
    this.wishlistItems = page.locator('.wishlist-item, [class*="wishlist-item"], [class*="wishlist-card"]');
    this.wishlistCards = page.locator('.wishlist-card, [class*="wishlist-card"]');
    this.removeFromWishlistButton = page.locator('button:has-text("Remove"), button[aria-label*="remove"]');
    this.addToCartButton = page.locator('button:has-text("Add to Cart")');
    this.emptyWishlistMessage = page.locator('.empty-wishlist, [class*="empty"], :has-text("Wishlist is empty")');

    // Addresses
    this.addressesList = page.locator('.addresses-list, [class*="addresses-list"]');
    this.addressCards = page.locator('.address-card, [class*="address-card"], [class*="address-item"]');
    this.addAddressButton = page.locator('button:has-text("Add Address"), button:has-text("Add New")');
    this.editAddressButton = page.locator('button:has-text("Edit Address"), button:has-text("Edit")');
    this.deleteAddressButton = page.locator('button:has-text("Delete Address"), button:has-text("Delete")');
    this.defaultAddressBadge = page.locator('.default-badge, [class*="default"], :has-text("Default")');
    this.emptyAddressesMessage = page.locator('.empty-addresses, [class*="empty"], :has-text("No addresses")');

    // Settings
    this.changePasswordSection = page.locator('.change-password, [class*="change-password"]');
    this.currentPasswordInput = page.locator('input[name="currentPassword"], input[placeholder*="current password" i]');
    this.newPasswordInput = page.locator('input[name="newPassword"], input[placeholder*="new password" i]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="confirm password" i]');
    this.updatePasswordButton = page.locator('button:has-text("Update Password"), button:has-text("Change Password")');
    this.deleteAccountSection = page.locator('.delete-account, [class*="delete-account"]');
    this.deleteAccountButton = page.locator('button:has-text("Delete Account"), button:has-text("Delete My Account")');
    this.notificationSettings = page.locator('.notification-settings, [class*="notification"]');
    this.emailNotificationsCheckbox = page.locator('input[type="checkbox"], label:has-text("Email notifications")');
    this.smsNotificationsCheckbox = page.locator('input[type="checkbox"], label:has-text("SMS notifications")');

    // Messages
    this.successMessage = page.locator('.success-message, [class*="success"], :has-text("successfully")');
    this.errorMessage = page.locator('.error-message, [class*="error"]');
  }

  // Navigation methods
  async navigateToProfile(): Promise<void> {
    await this.navigateTo('/profile');
    await this.waitForPageLoad();
  }

  // Tab navigation
  async clickPersonalInfoTab(): Promise<void> {
    await this.click(this.personalInfoTab);
  }

  async clickOrdersTab(): Promise<void> {
    await this.click(this.ordersTab);
  }

  async clickWishlistTab(): Promise<void> {
    await this.click(this.wishlistTab);
  }

  async clickAddressesTab(): Promise<void> {
    await this.click(this.addressesTab);
  }

  async clickSettingsTab(): Promise<void> {
    await this.click(this.settingsTab);
  }

  // Profile editing
  async editProfile(userData: {
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<void> {
    await this.click(this.editProfileButton);
    await this.fill(this.firstNameInput, userData.firstName);
    await this.fill(this.lastNameInput, userData.lastName);
    await this.fill(this.phoneInput, userData.phone);
    await this.click(this.saveButton);
    await this.waitForTimeout(1000);
  }

  // Password change
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.click(this.settingsTab);
    await this.fill(this.currentPasswordInput, currentPassword);
    await this.fill(this.newPasswordInput, newPassword);
    await this.fill(this.confirmPasswordInput, newPassword);
    await this.click(this.updatePasswordButton);
    await this.waitForTimeout(1000);
  }

  // Address management
  async addAddress(address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  }): Promise<void> {
    await this.click(this.addressesTab);
    await this.click(this.addAddressButton);
    await this.fill(this.page.locator('input[name="firstName"]'), address.firstName);
    await this.fill(this.page.locator('input[name="lastName"]'), address.lastName);
    await this.fill(this.page.locator('input[name="address"]'), address.address);
    await this.fill(this.page.locator('input[name="city"]'), address.city);
    await this.fill(this.page.locator('input[name="state"]'), address.state);
    await this.fill(this.page.locator('input[name="zipCode"]'), address.zipCode);
    await this.fill(this.page.locator('input[name="phone"]'), address.phone);
    await this.click(this.page.locator('button:has-text("Save Address")'));
    await this.waitForTimeout(1000);
  }

  async editAddress(index: number, address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<void> {
    await this.click(this.addressesTab);
    await this.editAddressButton.nth(index).click();
    await this.fill(this.page.locator('input[name="address"]'), address.address);
    await this.fill(this.page.locator('input[name="city"]'), address.city);
    await this.fill(this.page.locator('input[name="state"]'), address.state);
    await this.fill(this.page.locator('input[name="zipCode"]'), address.zipCode);
    await this.click(this.page.locator('button:has-text("Save Address")'));
    await this.waitForTimeout(1000);
  }

  async deleteAddress(index: number): Promise<void> {
    await this.click(this.addressesTab);
    await this.deleteAddressButton.nth(index).click();
    await this.waitForTimeout(1000);
  }

  // Wishlist operations
  async removeFromWishlist(index: number): Promise<void> {
    await this.click(this.wishlistTab);
    await this.removeFromWishlistButton.nth(index).click();
    await this.waitForTimeout(1000);
  }

  async addToCartFromWishlist(index: number): Promise<void> {
    await this.click(this.wishlistTab);
    await this.addToCartButton.nth(index).click();
    await this.waitForTimeout(1000);
  }

  // Order operations
  async viewOrder(index: number): Promise<void> {
    await this.click(this.ordersTab);
    await this.viewOrderButton.nth(index).click();
    await this.waitForPageLoad();
  }

  async trackOrder(index: number): Promise<void> {
    await this.click(this.ordersTab);
    await this.trackOrderButton.nth(index).click();
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyProfilePageLoaded(): Promise<void> {
    await this.expectVisible(this.profileHeader);
    await this.expectUrl(/profile/);
  }

  async verifyUserInfo(firstName: string, lastName: string): Promise<void> {
    await this.expectText(this.userName, firstName);
    await this.expectText(this.userName, lastName);
  }

  async verifyOrdersTab(): Promise<void> {
    await this.click(this.ordersTab);
    await this.expectVisible(this.ordersList);
  }

  async verifyWishlistTab(): Promise<void> {
    await this.click(this.wishlistTab);
    await this.expectVisible(this.wishlistItems);
  }

  async verifyAddressesTab(): Promise<void> {
    await this.click(this.addressesTab);
    await this.expectVisible(this.addressesList);
  }

  async verifySettingsTab(): Promise<void> {
    await this.click(this.settingsTab);
    await this.expectVisible(this.changePasswordSection);
  }

  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.successMessage);
    await this.expectText(this.successMessage, expectedMessage);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.errorMessage);
    await this.expectText(this.errorMessage, expectedMessage);
  }

  async verifyEmptyOrders(): Promise<void> {
    await this.click(this.ordersTab);
    await this.expectVisible(this.emptyOrdersMessage);
  }

  async verifyEmptyWishlist(): Promise<void> {
    await this.click(this.wishlistTab);
    await this.expectVisible(this.emptyWishlistMessage);
  }

  async verifyEmptyAddresses(): Promise<void> {
    await this.click(this.addressesTab);
    await this.expectVisible(this.emptyAddressesMessage);
  }

  // Get methods
  async getUserName(): Promise<string> {
    return await this.getText(this.userName);
  }

  async getUserEmail(): Promise<string> {
    return await this.getText(this.userEmail);
  }

  async getOrderCount(): Promise<number> {
    return await this.getElementCount(this.orderCards);
  }

  async getWishlistCount(): Promise<number> {
    return await this.getElementCount(this.wishlistItems);
  }

  async getAddressCount(): Promise<number> {
    return await this.getElementCount(this.addressCards);
  }

  async getOrderStatus(index: number): Promise<string> {
    return await this.getText(this.orderStatus.nth(index));
  }

  // Scroll methods
  async scrollToOrders(): Promise<void> {
    await this.scrollToElement(this.ordersList);
  }

  async scrollToWishlist(): Promise<void> {
    await this.scrollToElement(this.wishlistItems);
  }

  // Wait methods
  async waitForProfileToLoad(): Promise<void> {
    await this.waitForSelector(this.profileHeader);
    await this.waitForTimeout(1000);
  }

  async waitForOrdersToLoad(): Promise<void> {
    await this.waitForSelector(this.ordersList);
  }

  async waitForWishlistToLoad(): Promise<void> {
    await this.waitForSelector(this.wishlistItems);
  }
}
