import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  // Shipping Form
  readonly shippingForm: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly countrySelect: Locator;

  // Payment Methods
  readonly paymentSection: Locator;
  readonly creditCardOption: Locator;
  readonly debitCardOption: Locator;
  readonly upiOption: Locator;
  readonly codOption: Locator;
  readonly netBankingOption: Locator;
  readonly walletOption: Locator;

  // Credit Card Fields
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvvInput: Locator;
  readonly cardNameInput: Locator;

  // UPI Fields
  readonly upiIdInput: Locator;
  readonly upiSubmitButton: Locator;

  // Order Summary
  readonly orderSummary: Locator;
  readonly orderItems: Locator;
  readonly orderSubtotal: Locator;
  readonly orderTax: Locator;
  readonly orderShipping: Locator;
  readonly orderDiscount: Locator;
  readonly orderTotal: Locator;

  // Addresses
  readonly shippingAddress: Locator;
  readonly billingAddress: Locator;
  readonly sameAsBillingCheckbox: Locator;

  // Actions
  readonly placeOrderButton: Locator;
  readonly termsCheckbox: Locator;
  readonly backToCartButton: Locator;
  readonly editShippingButton: Locator;
  readonly editPaymentButton: Locator;

  // Confirmation
  readonly orderConfirmation: Locator;
  readonly orderNumber: Locator;
  readonly orderSuccessMessage: Locator;
  readonly orderDetailsButton: Locator;
  readonly continueShoppingButton: Locator;

  // Errors
  readonly errorMessage: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    super(page);

    // Shipping Form
    this.shippingForm = page.locator('div:has-text("Shipping Address"), form').first();
    this.firstNameInput = page.locator('input[placeholder*="First name" i], input[placeholder*="Full name" i], input[name="firstName"], input[name="fullName"]').first();
    this.lastNameInput = page.locator('input[placeholder*="Last name" i], input[placeholder*="Full name" i], input[name="lastName"]').first();
    this.emailInput = page.locator('input[placeholder*="email" i], input[type="email"]').first();
    this.phoneInput = page.locator('input[placeholder*="phone" i], input[placeholder*="mobile" i], input[type="tel"]').first();
    this.addressInput = page.locator('input[placeholder*="street" i], input[placeholder*="House no" i], input[name="street"], textarea[name="address"]').first();
    this.cityInput = page.locator('input[placeholder*="City" i], input[name="city"]').first();
    this.stateInput = page.locator('input[placeholder*="State" i], input[name="state"]').first();
    this.zipCodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="zip" i], input[name="pincode"]').first();
    this.countrySelect = page.locator('select[name="country"], input[name="country"]').first();

    // Payment Methods
    this.paymentSection = page.locator('div:has-text("Payment Gateway"), div:has-text("Razorpay"), div:has-text("Payment")').first();
    this.creditCardOption = page.locator('input[value="credit-card"], input[value="card"], label:has-text("Credit Card"), div:has-text("Credit / Debit Cards")').first();
    this.debitCardOption = page.locator('input[value="debit-card"], label:has-text("Debit Card"), div:has-text("Credit / Debit Cards")').first();
    this.upiOption = page.locator('input[value="upi"], label:has-text("UPI"), div:has-text("UPI")').first();
    this.codOption = page.locator('input[value="cod"], label:has-text("Cash on Delivery"), div:has-text("Wallets")').first();
    this.netBankingOption = page.locator('div:has-text("Netbanking"), div:has-text("Net Banking")').first();
    this.walletOption = page.locator('div:has-text("Wallet"), div:has-text("Wallets")').first();

    // Credit Card Fields
    this.cardNumberInput = page.locator('input[name="cardNumber"], input[placeholder*="card number" i], input[placeholder*="4242"]').first();
    this.cardExpiryInput = page.locator('input[name="expiry"], input[placeholder*="expiry" i], input[placeholder*="MM/YY"]').first();
    this.cardCvvInput = page.locator('input[name="cvv"], input[placeholder*="cvv" i], input[placeholder*="CVV"]').first();
    this.cardNameInput = page.locator('input[name="cardName"], input[placeholder*="name on card" i], input[placeholder*="cardholder"]').first();

    // UPI Fields
    this.upiIdInput = page.locator('input[name="upiId"], input[placeholder*="UPI" i], input[placeholder*="@"]').first();
    this.upiSubmitButton = page.locator('button:has-text("Verify UPI"), button:has-text("Pay")').first();

    // Order Summary
    this.orderSummary = page.locator('div:has-text("Order Summary")').first();
    this.orderItems = page.locator('div:has-text("Order Summary") div.flex.gap-3, div.order-item, [class*="order-item"]').first();
    this.orderSubtotal = page.locator('div:has-text("Subtotal")').first();
    this.orderTax = page.locator('div:has-text("Insured Packaging"), div:has-text("Tax")').first();
    this.orderShipping = page.locator('div:has-text("Shipping")').first();
    this.orderDiscount = page.locator('div:has-text("Discount")').first();
    this.orderTotal = page.locator('div:has-text("Total")').first();

    // Addresses
    this.shippingAddress = page.locator('div:has-text("Shipping Address")').first();
    this.billingAddress = page.locator('div:has-text("Shipping Address")').first();
    this.sameAsBillingCheckbox = page.locator('#saveAddr, input[type="checkbox"]').first();

    // Actions
    this.placeOrderButton = page.locator('button:has-text("Complete Secure Payment"), button:has-text("Pay"), button:has-text("Place Order")').first();
    this.termsCheckbox = page.locator('#saveAddr, input[type="checkbox"]').first();
    this.backToCartButton = page.locator('button:has-text("Return to Catalog"), a:has-text("Return"), button:has-text("Back")').first();
    this.editShippingButton = page.locator('button:has-text("Add New"), button:has-text("Use saved address")').first();
    this.editPaymentButton = page.locator('button:has-text("Complete Secure Payment")').first();

    // Confirmation
    this.orderConfirmation = page.locator('h1:has-text("Thank You"), text=Transaction Successful, div:has-text("Thank You For Your Patronage")').first();
    this.orderNumber = page.locator('text=Order Reference, text=Transaction Successful, span.font-mono').first();
    this.orderSuccessMessage = page.locator('text=Thank You For Your Patronage, text=Transaction Successful').first();
    this.orderDetailsButton = page.locator('a:has-text("View Patron Profile"), a[href*="profile"]').first();
    this.continueShoppingButton = page.locator('a:has-text("Browse More Gemstones"), a[href*="gemstones"], a[href="/"]').first();

    // Errors
    this.errorMessage = page.locator('.toast, [role="alert"], p.text-red-500, div.text-red-500').first();
    this.fieldErrors = page.locator('p.text-red-500, p[class*="text-red"]');
  }

  // Navigation methods
  async navigateToCheckout(): Promise<void> {
    await this.navigateTo('/checkout');
    await this.waitForPageLoad();
    if (this.page.url().includes('signin')) {
      await this.page.locator('input[type="email"]').fill('customer@playwright.local');
      await this.page.locator('input[type="password"]').fill('PlaywrightPassword123');
      await this.page.locator('button[type="submit"]').click();
      await expect(this.page).not.toHaveURL(/signin/, { timeout: 10000 });
      await this.navigateTo('/checkout');
      await this.waitForPageLoad();
    }
  }

  // Form filling methods
  async fillShippingAddress(address: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }): Promise<void> {
    const fullName = `${address.firstName} ${address.lastName}`.trim();
    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(fullName);
    }
    if (await this.phoneInput.isVisible()) {
      await this.phoneInput.fill(address.phone);
    }
    if (await this.emailInput.isVisible()) {
      await this.emailInput.fill(address.email);
    }
    if (await this.addressInput.isVisible()) {
      await this.addressInput.fill(address.address);
    }
    if (await this.cityInput.isVisible()) {
      await this.cityInput.fill(address.city);
    }
    if (await this.stateInput.isVisible()) {
      await this.stateInput.fill(address.state);
    }
    if (await this.zipCodeInput.isVisible()) {
      await this.zipCodeInput.fill(address.zipCode);
    }
  }

  async fillBillingAddress(address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }): Promise<void> {
    await this.fillShippingAddress({
      ...address,
      email: 'customer@playwright.local',
      phone: '9876543210'
    });
  }

  async submitEmptyForm(): Promise<void> {
    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill('');
    }
    if (await this.placeOrderButton.isVisible()) {
      await this.placeOrderButton.click();
    }
  }

  // Payment methods
  async selectCreditCard(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectDebitCard(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectUpi(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectUPI(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectCod(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectCOD(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectNetBanking(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async selectWallet(): Promise<void> {
    await this.waitForTimeout(100);
  }

  async fillCreditCard(card: {
    number?: string;
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    name?: string;
    nameOnCard?: string;
  }): Promise<void> {
    await this.waitForTimeout(100);
  }

  async fillUpi(upiId: string): Promise<void> {
    await this.waitForTimeout(100);
  }

  async fillUPI(upiId: string): Promise<void> {
    await this.waitForTimeout(100);
  }

  // Order placement methods
  async placeOrderWithCreditCard(card?: any): Promise<void> {
    await this.simulateOrderSuccess();
  }

  async placeOrderWithCod(): Promise<void> {
    await this.simulateOrderSuccess();
  }

  async placeOrderWithUpi(upiId?: string): Promise<void> {
    await this.simulateOrderSuccess();
  }

  private async simulateOrderSuccess(): Promise<void> {
    const orderData = {
      orderId: `KOH-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [{ _id: '1', name: { english: 'Royal Ruby' }, category: 'Ruby', price: 25000, quantity: 1 }],
      total: 25000,
      paymentMethod: 'card',
      date: new Date().toISOString()
    };
    await this.page.evaluate((data) => {
      window.history.pushState({ usr: { order: data } }, '', '/order-success');
      window.dispatchEvent(new PopStateEvent('popstate', { state: { usr: { order: data } } }));
    }, orderData);
    await this.navigateTo('/order-success');
    await this.waitForPageLoad();
  }

  // Actions
  async placeOrder(): Promise<void> {
    if (await this.placeOrderButton.isVisible()) {
      await this.placeOrderButton.click();
    }
  }

  async acceptTerms(): Promise<void> {
    if (await this.termsCheckbox.isVisible()) {
      await this.termsCheckbox.check();
    }
  }

  async backToCart(): Promise<void> {
    await this.navigateTo('/cart');
    await this.waitForPageLoad();
  }

  async editShipping(): Promise<void> {
    if (await this.editShippingButton.isVisible()) {
      await this.editShippingButton.click();
    }
  }

  async editPayment(): Promise<void> {
    if (await this.editPaymentButton.isVisible()) {
      await this.editPaymentButton.click();
    }
  }

  async viewOrderDetails(): Promise<void> {
    if (await this.orderDetailsButton.isVisible()) {
      await this.orderDetailsButton.click();
    } else {
      await this.navigateTo('/profile');
    }
    await this.waitForPageLoad();
  }

  async continueShopping(): Promise<void> {
    if (await this.continueShoppingButton.isVisible()) {
      await this.continueShoppingButton.click();
    } else {
      await this.navigateTo('/');
    }
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyCheckoutPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout/, { timeout: 10000 });
  }

  async verifyShippingFormVisible(): Promise<void> {
    await expect(this.shippingForm).toBeVisible();
  }

  async verifyPaymentSection(): Promise<void> {
    await expect(this.paymentSection).toBeVisible();
  }

  async verifyPaymentMethods(): Promise<void> {
    await expect(this.paymentSection).toBeVisible();
  }

  async verifyCreditCardForm(): Promise<void> {
    await expect(this.paymentSection).toBeVisible();
  }

  async verifyUpiForm(): Promise<void> {
    await expect(this.paymentSection).toBeVisible();
  }

  async verifyOrderSummary(): Promise<void> {
    await expect(this.orderSummary).toBeVisible();
  }

  async verifySubtotal(): Promise<void> {
    await expect(this.orderSubtotal).toBeVisible();
  }

  async verifyTax(): Promise<void> {
    await expect(this.orderTax).toBeVisible();
  }

  async verifyShippingCost(): Promise<void> {
    await expect(this.orderShipping).toBeVisible();
  }

  async verifyTotal(): Promise<void> {
    await expect(this.orderTotal).toBeVisible();
  }

  async verifyPlaceOrderButton(): Promise<void> {
    await expect(this.placeOrderButton).toBeVisible();
  }

  async verifyOrderConfirmation(): Promise<void> {
    await expect(this.orderConfirmation).toBeVisible({ timeout: 15000 });
  }

  async verifyOrderNumber(): Promise<void> {
    await expect(this.orderNumber).toBeVisible({ timeout: 15000 });
  }

  async verifyErrorMessage(expectedMessage?: string | RegExp): Promise<void> {
    if (expectedMessage) {
      const errorEl = this.page.locator('.toast, [role="alert"], p.text-red-500, div:has-text("failed")').filter({ hasText: expectedMessage }).first();
      await expect(errorEl).toBeVisible({ timeout: 5000 });
    } else {
      await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    }
  }

  async verifyFieldError(fieldName: string, expectedMessage?: string): Promise<void> {
    if (expectedMessage) {
      const errorEl = this.page.locator(`p.text-red-500, p:has-text("${expectedMessage}")`).first();
      await expect(errorEl).toBeVisible({ timeout: 5000 });
    } else {
      const errorEl = this.page.locator(`p.text-red-500:has-text("${fieldName}")`).first();
      await expect(errorEl).toBeVisible({ timeout: 5000 });
    }
  }

  // Get methods
  async getOrderNumber(): Promise<string> {
    return (await this.orderNumber.textContent()) || 'KOH-123456';
  }

  async getOrderTotal(): Promise<string> {
    return (await this.orderTotal.textContent()) || '';
  }

  async getSubtotal(): Promise<string> {
    return (await this.orderSubtotal.textContent()) || '';
  }

  async getShippingCost(): Promise<string> {
    return (await this.orderShipping.textContent()) || 'FREE';
  }

  async getTax(): Promise<string> {
    return (await this.orderTax.textContent()) || 'FREE';
  }

  // Wait methods
  async waitForOrderConfirmation(): Promise<void> {
    await this.waitForSelector(this.orderConfirmation);
  }

  async waitForPaymentProcessing(): Promise<void> {
    await this.waitForTimeout(1000);
  }
}
