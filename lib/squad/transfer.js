import { squadFetch } from './client';

/**
 * Performs an account lookup to verify the recipient account.
 * 
 * @param {string} bankCode - The bank code (e.g., '000013' for GTBank).
 * @param {string} accountNumber - The 10-digit account number.
 * @returns {Promise<object>} Account lookup details.
 */
export async function lookupAccount(bankCode, accountNumber) {
  const payload = {
    bank_code: bankCode,
    account_number: accountNumber
  };

  const response = await squadFetch('/payout/account/lookup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return response;
}

/**
 * Transfers funds from the Squad Ledger to a bank account.
 * Used for refunds or releasing escrowed funds.
 * 
 * @param {string} remark - Description/remark for the transfer.
 * @param {string} bankCode - Recipient bank code.
 * @param {string} amount - Transfer amount (string representation of number).
 * @param {string} accountNumber - Recipient account number.
 * @param {string} transactionReference - Unique reference (must append merchant ID).
 * @param {string} accountName - Validated account name of recipient.
 * @returns {Promise<object>} Transfer result.
 */
export async function transferFunds({ remark, bankCode, amount, accountNumber, transactionReference, accountName }) {
  const payload = {
    remark,
    bank_code: bankCode,
    currency_id: 'NGN',
    amount,
    account_number: accountNumber,
    transaction_reference: transactionReference,
    account_name: accountName
  };

  const response = await squadFetch('/payout/transfer', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return response;
}

/**
 * Gets the merchant's Squad ledger balance.
 * Returns balance in Kobo.
 * 
 * @returns {Promise<object>} Balance details.
 */
export async function getLedgerBalance() {
  const response = await squadFetch('/merchant/balance', {
    method: 'GET'
  });

  return response;
}
