/**
 * Payment Service classes for different gateways.
 * In a production app, these would implement a common interface
 * and communicate with the respective provider APIs.
 */

export interface PaymentProvider {
  initDeposit(amount: number, currency: string): Promise<any>;
  verifyTransaction(ref: string): Promise<boolean>;
  payout(recipient: string, amount: number): Promise<any>;
}

export class FlutterwaveService implements PaymentProvider {
  async initDeposit(amount: number, currency: string) { return { status: 'success', data: { link: '...' } }; }
  async verifyTransaction(ref: string) { return true; }
  async payout(recipient: string, amount: number) { return { status: 'queued' }; }
}

export class MobileMoneyService implements PaymentProvider {
  async initDeposit(amount: number, currency: string) { return { status: 'success' }; }
  async verifyTransaction(ref: string) { return true; }
  async payout(recipient: string, amount: number) { return { status: 'queued' }; }
}

export class PayPalService implements PaymentProvider {
  async initDeposit(amount: number, currency: string) { return { status: 'pending' }; }
  async verifyTransaction(ref: string) { return true; }
  async payout(recipient: string, amount: number) { return { status: 'queued' }; }
}
