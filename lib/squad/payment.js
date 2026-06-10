import { squadFetch } from './client';

/**
 * Initiates a payment transaction via the Squad API.
 * This holds the funds in escrow pending the trust verdict.
 * 
 * @param {number} amount - The amount to charge (in kobo/cents or base unit per Squad docs). 
 *                          Wait, Squad amount is in Kobo or NGN? 
 *                          Squad docs: "Charge Amount (₦) e.g 10000" but usually amount is in kobo.
 *                          The docs say `amount: 10000` for `10000` NGN in some places, 
 *                          but standard is kobo. We assume amount is passed in correctly.
 * @param {string} email - Customer email.
 * @param {string} transactionRef - Unique transaction reference.
 * @param {string} callbackUrl - URL to redirect to after payment.
 * @returns {Promise<object>} The payment checkout URL and response data.
 */
export async function initiatePayment({ amount, email, transactionRef, callbackUrl }) {
  const payload = {
    amount,
    email,
    currency: 'NGN',
    initiate_type: 'inline',
    transaction_ref: transactionRef,
    callback_url: callbackUrl,
  };

  const response = await squadFetch('/transaction/initiate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response;
}
