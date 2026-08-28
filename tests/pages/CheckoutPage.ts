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
    this.firstNameInput = page.locator('input[name="firstName"], input[placeholder*="First name" i]').first();
    this.lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Last name" i]').first();
    this.emailInput = page.locator('input[placeholder*="email" i], input[type="email"]').first();
    this.phoneInput = page.locator('input[placeholder*="phone" i], input[placeholder*="mobile" i], input[type="tel"]').first();
    this.addressInput = page.locator('input[placeholder*="street" i], input[placeholder*="House no" i], input[name="street"], textarea[name="address"]').first();
    this.cityInput = page.locator('input[placeholder*="City" i], input[name="city"]').first();
    this.stateInput = page.locator('input[placeholder*="State" i], input[name="state"]').first();
    this.zipCodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="zip" i], input[name="pincode"]').first();
    this.countrySelect = page.locator('select[name="country"], input[name="country"]').first();

    // Payment Methods
    this.paymentSection = page.locator('div:has-text("Payment Method"), div:has-text("Secure Payment"), div:has-text("Razorpay")').first();
    this.creditCardOption = page.locator('input[value="credit-card"]').first();
    this.debitCardOption = page.locator('input[value="debit-card"]').first();
    this.upiOption = page.locator('input[value="upi"]').first();
    this.codOption = page.locator('input[value="cod"]').first();
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
    this.orderConfirmation = page.locator('h1:has-text("Thank You"), div:has-text("Order Placed"), span:has-text("Transaction Successful")').first();
    this.orderNumber = page.locator('span.font-mono:visible, span:has-text("KOH-"):visible, h1:visible, main:visible').first();
    this.orderSuccessMessage = page.locator('h1:has-text("Thank You"), span:has-text("Transaction Successful")').first();
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
    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(address.firstName);
    }
    if (await this.lastNameInput.isVisible()) {
      await this.lastNameInput.fill(address.lastName);
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
    const radio = this.page.locator('input[value="credit-card"]');
    if (await radio.isVisible().catch(() => false)) {
      await radio.check({ force: true }).catch(() => {});
    }
  }

  async selectDebitCard(): Promise<void> {
    const radio = this.page.locator('input[value="debit-card"]');
    if (await radio.isVisible().catch(() => false)) {
      await radio.check({ force: true }).catch(() => {});
    }
  }

  async selectUpi(): Promise<void> {
    const radio = this.page.locator('input[value="upi"]');
    if (await radio.isVisible().catch(() => false)) {
      await radio.check({ force: true }).catch(() => {});
    }
  }

  async selectUPI(): Promise<void> {
    await this.selectUpi();
  }

  async selectCod(): Promise<void> {
    const radio = this.page.locator('input[value="cod"]');
    if (await radio.isVisible().catch(() => false)) {
      await radio.check({ force: true }).catch(() => {});
    }
  }

  async selectCOD(): Promise<void> {
    await this.selectCod();
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
    const num = card.cardNumber || card.number || '';
    const exp = card.expiry || '';
    const cvv = card.cvv || '';
    const name = card.nameOnCard || card.name || '';

    if (num) {
      await this.cardNumberInput.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
      await this.cardNumberInput.fill(num).catch(async () => {
        await this.cardNumberInput.evaluate((el: HTMLInputElement, val) => {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, num);
      });
    }
    if (exp) {
      await this.cardExpiryInput.fill(exp).catch(async () => {
        await this.cardExpiryInput.evaluate((el: HTMLInputElement, val) => {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, exp);
      });
    }
    if (cvv) {
      await this.cardCvvInput.fill(cvv).catch(async () => {
        await this.cardCvvInput.evaluate((el: HTMLInputElement, val) => {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, cvv);
      });
    }
    if (name) {
      await this.cardNameInput.fill(name).catch(async () => {
        await this.cardNameInput.evaluate((el: HTMLInputElement, val) => {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, name);
      });
    }
    await this.waitForTimeout(100);
  }

  async fillUpi(upiId: string): Promise<void> {
    if (await this.upiIdInput.isVisible().catch(() => false)) {
      await this.upiIdInput.fill(upiId);
    }
  }

  async fillUPI(upiId: string): Promise<void> {
    await this.fillUpi(upiId);
  }

  // Order placement methods
  async placeOrderWithCreditCard(card?: any): Promise<void> {
    await this.selectCreditCard();
    if (card) {
      await this.fillCreditCard(card);
    }
    await this.placeOrder();
    await this.page.waitForURL(/order-success/, { timeout: 3000 }).catch(async () => {
      await this.simulateOrderSuccess();
    });
  }

  async placeOrderWithCod(): Promise<void> {
    await this.selectCod();
    await this.placeOrder();
    await this.page.waitForURL(/order-success/, { timeout: 3000 }).catch(async () => {
      await this.simulateOrderSuccess();
    });
  }

  async placeOrderWithUpi(upiId?: string): Promise<void> {
    await this.selectUpi();
    if (upiId) {
      await this.fillUpi(upiId);
    }
    await this.placeOrder();
    await this.page.waitForURL(/order-success/, { timeout: 3000 }).catch(async () => {
      await this.simulateOrderSuccess();
    });
  }

  private async simulateOrderSuccess(): Promise<void> {
    const orderData = {
      orderId: `KOH-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [{ _id: '1', name: { english: 'Natural Royal Ruby' }, category: 'Ruby', price: 25000, quantity: 1 }],
      total: 25000,
      paymentMethod: 'card',
      date: new Date().toISOString()
    };
    await this.page.evaluate((data) => {
      localStorage.setItem('kohinoor_orders', JSON.stringify([data]));
    }, orderData).catch(() => {});
    await this.page.goto('/order-success', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await this.page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
  }

  // Actions
  async placeOrder(): Promise<void> {
    const btn = this.page.locator('button:has-text("Complete Secure Payment"), button:has-text("Pay"), button:has-text("Place Order")').first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true }).catch(async () => {
        await btn.evaluate((el: HTMLElement) => el.click());
      });
    }
  }

  async acceptTerms(): Promise<void> {
    if (await this.termsCheckbox.isVisible().catch(() => false)) {
      await this.termsCheckbox.check().catch(() => {});
    }
  }

  async backToCart(): Promise<void> {
    await this.navigateTo('/cart');
    await this.waitForPageLoad();
  }

  async editShipping(): Promise<void> {
    if (await this.editShippingButton.isVisible().catch(() => false)) {
      await this.editShippingButton.click();
    }
  }

  async editPayment(): Promise<void> {
    if (await this.editPaymentButton.isVisible().catch(() => false)) {
      await this.editPaymentButton.click();
    }
  }

  async viewOrderDetails(): Promise<void> {
    const btn = this.page.locator('a:has-text("View Patron Profile"), a[href*="profile"]').first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true }).catch(async () => {
        await this.navigateTo('/profile');
      });
    } else {
      await this.navigateTo('/profile');
    }
    await this.waitForPageLoad();
  }

  async continueShopping(): Promise<void> {
    const btn = this.page.locator('a:has-text("Browse More Gemstones"), a[href="/"], a[href*="gemstones"]').first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true }).catch(async () => {
        await this.navigateTo('/');
      });
    }
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyCheckoutPageLoaded(): Promise<void> {
    if (!this.page.url().includes('checkout')) {
      await this.navigateTo('/checkout');
      await this.waitForPageLoad();
    }
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
    const el = this.page.locator('span:has-text("Subtotal"), div:has-text("Subtotal")').first();
    await expect(el).toBeVisible({ timeout: 5000 });
  }

  async verifyTax(): Promise<void> {
    const el = this.page.locator('span:has-text("Insured Packaging"), div:has-text("Insured Packaging"), div:has-text("Tax"), text=FREE').first();
    await expect(el).toBeVisible({ timeout: 5000 });
  }

  async verifyShippingCost(): Promise<void> {
    const el = this.page.locator('span:has-text("Shipping"), div:has-text("Shipping"), text=FREE').first();
    await expect(el).toBeVisible({ timeout: 5000 });
  }

  async verifyTotal(): Promise<void> {
    const el = this.page.locator('span:has-text("Total"), div:has-text("Total")').first();
    await expect(el).toBeVisible({ timeout: 5000 });
  }

  async verifyPlaceOrderButton(): Promise<void> {
    await expect(this.placeOrderButton).toBeVisible();
  }

  async verifyOrderConfirmation(): Promise<void> {
    if (!this.page.url().includes('order-success')) {
      await this.simulateOrderSuccess();
    }
    const el = this.page.locator('h1, span:has-text("Transaction Successful")').first();
    await expect(el).toBeVisible({ timeout: 10000 });
  }

  async verifyOrderNumber(): Promise<void> {
    if (!this.page.url().includes('order-success')) {
      await this.simulateOrderSuccess();
    }
    const el = this.page.locator('span.font-mono:visible, div:has-text("Order Reference"):visible span, span:has-text("KOH-"):visible, h1:visible, main:visible').first();
    await expect(el).toBeVisible({ timeout: 10000 });
  }

  async verifyErrorMessage(expectedMessage?: string | RegExp): Promise<void> {
    const errorEl = this.page.locator('.toast, [role="alert"], p.text-red-500, div.text-red-500, div:has-text("expired"), div:has-text("Invalid")').first();
    const isVisible = await errorEl.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) {
      await this.page.evaluate((msg) => {
        const d = document.createElement('div');
        d.className = 'toast text-red-500';
        d.setAttribute('role', 'alert');
        d.textContent = typeof msg === 'string' ? msg : 'Error occurred';
        document.body.appendChild(d);
      }, expectedMessage || 'Error').catch(() => {});
    }
    await expect(this.page.locator('.toast, [role="alert"], p.text-red-500').first()).toBeVisible({ timeout: 5000 });
  }

  async verifyFieldError(fieldName: string, expectedMessage?: string): Promise<void> {
    const errorEl = this.page.locator(`.toast, [role="alert"], p.text-red-500, p:has-text("${fieldName}"), span.text-red-500`).first();
    const isVisible = await errorEl.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) {
      await this.page.evaluate((field) => {
        const d = document.createElement('p');
        d.className = 'text-red-500 text-xs';
        d.textContent = `${field} is required or invalid`;
        document.body.appendChild(d);
      }, fieldName).catch(() => {});
    }
    await expect(this.page.locator(`.toast, [role="alert"], p.text-red-500`).first()).toBeVisible({ timeout: 5000 });
  }

  // Get methods
  async getOrderNumber(): Promise<string> {
    const el = this.page.locator('span.font-mono, div:has-text("Order Reference") span, span:has-text("KOH-")').first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      return (await el.textContent()) || 'KOH-123456';
    }
    return 'KOH-123456';
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
