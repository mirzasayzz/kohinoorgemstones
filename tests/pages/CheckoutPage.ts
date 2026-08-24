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
    this.shippingForm = page.locator('form[class*="shipping"], .shipping-form, [class*="checkout-form"]');
    this.firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first name" i]');
    this.lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last name" i]');
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]');
    this.addressInput = page.locator('textarea[name="address"], input[name="address"], input[placeholder*="address" i]');
    this.cityInput = page.locator('input[name="city"], input[placeholder*="city" i]');
    this.stateInput = page.locator('input[name="state"], input[placeholder*="state" i], select[name="state"]');
    this.zipCodeInput = page.locator('input[name="zipCode"], input[placeholder*="zip" i], input[name="pincode"]');
    this.countrySelect = page.locator('select[name="country"], input[name="country"]');

    // Payment Methods
    this.paymentSection = page.locator('.payment-method, [class*="payment"], [class*="payment-section"]');
    this.creditCardOption = page.locator('input[value="credit-card"], label:has-text("Credit Card"), [class*="credit-card"]');
    this.debitCardOption = page.locator('input[value="debit-card"], label:has-text("Debit Card"), [class*="debit-card"]');
    this.upiOption = page.locator('input[value="upi"], label:has-text("UPI"), [class*="upi"]');
    this.codOption = page.locator('input[value="cod"], label:has-text("Cash on Delivery"), [class*="cod"]');
    this.netBankingOption = page.locator('input[value="netbanking"], label:has-text("Net Banking"), [class*="netbanking"]');
    this.walletOption = page.locator('input[value="wallet"], label:has-text("Wallet"), [class*="wallet"]');

    // Credit Card Fields
    this.cardNumberInput = page.locator('input[name="cardNumber"], input[placeholder*="card number" i], input[placeholder*="4242"]');
    this.cardExpiryInput = page.locator('input[name="expiry"], input[placeholder*="expiry" i], input[name="expMonth"], input[placeholder*="MM/YY"]');
    this.cardCvvInput = page.locator('input[name="cvv"], input[placeholder*="cvv" i], input[placeholder*="CVV"]');
    this.cardNameInput = page.locator('input[name="cardName"], input[placeholder*="name on card" i], input[placeholder*="cardholder"]');

    // UPI Fields
    this.upiIdInput = page.locator('input[name="upiId"], input[placeholder*="UPI" i], input[placeholder*="@"]');
    this.upiSubmitButton = page.locator('button:has-text("Verify UPI"), button:has-text("Pay with UPI")');

    // Order Summary
    this.orderSummary = page.locator('.order-summary, [class*="summary"], [class*="order-summary"]');
    this.orderItems = page.locator('.order-item, [class*="order-item"], [class*="summary-item"]');
    this.orderSubtotal = page.locator('.subtotal, [class*="subtotal"], :has-text("Subtotal")');
    this.orderTax = page.locator('.tax, [class*="tax"], :has-text("Tax")');
    this.orderShipping = page.locator('.shipping, [class*="shipping"], :has-text("Shipping")');
    this.orderDiscount = page.locator('.discount, [class*="discount"], :has-text("Discount")');
    this.orderTotal = page.locator('.total, [class*="total"], :has-text("Total")');

    // Addresses
    this.shippingAddress = page.locator('.shipping-address, [class*="shipping-address"], [class*="delivery-address"]');
    this.billingAddress = page.locator('.billing-address, [class*="billing-address"]');
    this.sameAsBillingCheckbox = page.locator('input[type="checkbox"], label:has-text("Same as billing")');

    // Actions
    this.placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Complete Order"), button:has-text("Pay")');
    this.termsCheckbox = page.locator('input[type="checkbox"], label:has-text("Terms"), label:has-text("I agree")');
    this.backToCartButton = page.locator('a:has-text("Back to Cart"), button:has-text("Back")');
    this.editShippingButton = page.locator('button:has-text("Edit"), button:has-text("Change")');
    this.editPaymentButton = page.locator('button:has-text("Edit Payment"), button:has-text("Change Payment")');

    // Confirmation
    this.orderConfirmation = page.locator('.order-confirmation, [class*="confirmation"], :has-text("Order Confirmed"), :has-text("Thank you")');
    this.orderNumber = page.locator('.order-number, [class*="order-number"], :has-text("Order #"), :has-text("Order ID")');
    this.orderSuccessMessage = page.locator('.success-message, [class*="success"], :has-text("successfully")');
    this.orderDetailsButton = page.locator('button:has-text("View Order"), a:has-text("Order Details")');
    this.continueShoppingButton = page.locator('a:has-text("Continue Shopping"), button:has-text("Continue Shopping")');

    // Errors
    this.errorMessage = page.locator('.error-message, .alert-error, [class*="error"]');
    this.fieldErrors = page.locator('.field-error, [class*="field-error"], [class*="error-message"]');
  }

  // Navigation methods
  async navigateToCheckout(): Promise<void> {
    await this.navigateTo('/checkout');
    await this.waitForPageLoad();
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
    await this.fill(this.firstNameInput, address.firstName);
    await this.fill(this.lastNameInput, address.lastName);
    await this.fill(this.emailInput, address.email);
    await this.fill(this.phoneInput, address.phone);
    await this.fill(this.addressInput, address.address);
    await this.fill(this.cityInput, address.city);
    await this.fill(this.stateInput, address.state);
    await this.fill(this.zipCodeInput, address.zipCode);
    if (address.country) {
      await this.fill(this.countrySelect, address.country);
    }
  }

  async fillCreditCard(cardDetails: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    nameOnCard: string;
  }): Promise<void> {
    await this.fill(this.cardNumberInput, cardDetails.cardNumber);
    await this.fill(this.cardExpiryInput, cardDetails.expiry);
    await this.fill(this.cardCvvInput, cardDetails.cvv);
    await this.fill(this.cardNameInput, cardDetails.nameOnCard);
  }

  async fillUpiId(upiId: string): Promise<void> {
    await this.fill(this.upiIdInput, upiId);
  }

  // Payment method selection
  async selectCreditCard(): Promise<void> {
    await this.click(this.creditCardOption);
  }

  async selectDebitCard(): Promise<void> {
    await this.click(this.debitCardOption);
  }

  async selectUpi(): Promise<void> {
    await this.click(this.upiOption);
  }

  async selectCod(): Promise<void> {
    await this.click(this.codOption);
  }

  async selectNetBanking(): Promise<void> {
    await this.click(this.netBankingOption);
  }

  async selectWallet(): Promise<void> {
    await this.click(this.walletOption);
  }

  // Order placement
  async placeOrder(): Promise<void> {
    await this.check(this.termsCheckbox);
    await this.click(this.placeOrderButton);
    await this.waitForPageLoad();
  }

  async placeOrderWithCreditCard(cardDetails: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    nameOnCard: string;
  }): Promise<void> {
    await this.selectCreditCard();
    await this.fillCreditCard(cardDetails);
    await this.placeOrder();
  }

  async placeOrderWithUpi(upiId: string): Promise<void> {
    await this.selectUpi();
    await this.fillUpiId(upiId);
    await this.click(this.upiSubmitButton);
    await this.placeOrder();
  }

  async placeOrderWithCod(): Promise<void> {
    await this.selectCod();
    await this.placeOrder();
  }

  // Validation methods
  async verifyCheckoutPageLoaded(): Promise<void> {
    await this.expectVisible(this.shippingForm);
    await this.expectVisible(this.placeOrderButton);
    await this.expectUrl(/checkout/);
  }

  async verifyOrderConfirmation(): Promise<void> {
    await this.expectVisible(this.orderConfirmation);
  }

  async verifyOrderNumber(): Promise<void> {
    await this.expectVisible(this.orderNumber);
  }

  async verifyOrderTotal(expectedTotal: string): Promise<void> {
    await this.expectText(this.orderTotal, expectedTotal);
  }

  async verifyShippingAddress(firstName: string, lastName: string): Promise<void> {
    await this.expectText(this.shippingAddress, firstName);
    await this.expectText(this.shippingAddress, lastName);
  }

  async verifyPaymentSection(): Promise<void> {
    await this.expectVisible(this.paymentSection);
  }

  async verifyOrderSummary(): Promise<void> {
    await this.expectVisible(this.orderSummary);
  }

  async verifyCreditCardForm(): Promise<void> {
    await this.expectVisible(this.cardNumberInput);
    await this.expectVisible(this.cardExpiryInput);
    await this.expectVisible(this.cardCvvInput);
    await this.expectVisible(this.cardNameInput);
  }

  async verifyUpiForm(): Promise<void> {
    await this.expectVisible(this.upiIdInput);
  }

  async verifyErrorMessage(expectedError: string): Promise<void> {
    await this.expectText(this.errorMessage, expectedError);
  }

  async verifyFieldError(fieldName: string, expectedError: string): Promise<void> {
    const errorLocator = this.page.locator(`[class*="error"]:has-text("${expectedError}"), [class*="${fieldName}-error"]`);
    await this.expectVisible(errorLocator);
  }

  // Navigation methods
  async backToCart(): Promise<void> {
    await this.click(this.backToCartButton);
    await this.waitForPageLoad();
  }

  async viewOrderDetails(): Promise<void> {
    await this.click(this.orderDetailsButton);
    await this.waitForPageLoad();
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
    await this.waitForPageLoad();
  }

  // Get methods
  async getOrderNumber(): Promise<string> {
    return await this.getText(this.orderNumber);
  }

  async getOrderTotal(): Promise<string> {
    return await this.getText(this.orderTotal);
  }

  async getSubtotal(): Promise<string> {
    return await this.getText(this.orderSubtotal);
  }

  async getTax(): Promise<string> {
    return await this.getText(this.orderTax);
  }

  async getShipping(): Promise<string> {
    return await this.getText(this.orderShipping);
  }

  // Form validation
  async submitEmptyForm(): Promise<void> {
    await this.click(this.placeOrderButton);
  }

  async submitWithInvalidCard(): Promise<void> {
    await this.selectCreditCard();
    await this.fillCreditCard({
      cardNumber: '1234567890123456',
      expiry: '12/25',
      cvv: '123',
      nameOnCard: 'Test User',
    });
    await this.placeOrder();
  }

  // Scroll methods
  async scrollToPayment(): Promise<void> {
    await this.scrollToElement(this.paymentSection);
  }

  async scrollToOrderSummary(): Promise<void> {
    await this.scrollToElement(this.orderSummary);
  }

  // Wait methods
  async waitForCheckoutToLoad(): Promise<void> {
    await this.waitForTimeout(1000);
  }

  async waitForPaymentProcessing(): Promise<void> {
    await this.waitForTimeout(3000);
  }

  async waitForOrderConfirmation(): Promise<void> {
    await this.waitForSelector(this.orderConfirmation);
  }
}
