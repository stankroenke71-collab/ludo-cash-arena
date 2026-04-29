/**
 * Mock Payment Service for Mobile Money (Momo) and Orange Money
 * In production, this would use fetch() or axios to call actual payment gateway APIs
 * like Flutterwave, Paystack, or direct telco APIs.
 */

export interface PaymentRequest {
  phoneNumber: string;
  amount: number;
  provider: 'momo' | 'orange';
  reference: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

export const paymentService = {
  /**
   * Simulates a deposit request where the user is prompted on their phone
   * to enter their PIN (Push Notification / USSD prompt)
   */
  async requestDeposit(req: PaymentRequest): Promise<PaymentResponse> {
    console.log(`[PaymentService] Requesting deposit of ${req.amount} via ${req.provider} to ${req.phoneNumber}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (90% of the time)
    const isSuccess = Math.random() > 0.1;

    return {
      success: isSuccess,
      transactionId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      message: isSuccess ? 'Deposit prompt sent to device. Awaiting PIN.' : 'Payment gateway unreachable.'
    };
  },

  /**
   * Simulates a withdrawal payout from the business wallet to a user device
   */
  async processPayout(req: PaymentRequest): Promise<PaymentResponse> {
    console.log(`[PaymentService] Processing payout of ${req.amount} via ${req.provider} to ${req.phoneNumber}`);
    
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate success
    return {
      success: true,
      transactionId: `OUT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      message: 'Funds successfully transferred to recipient.'
    };
  }
};
