import { squadFetch } from './client';

/**
 * Generates a dynamic virtual account.
 * Note: Actual production requires a mapped GTB account and specific profiling.
 * 
 * @param {string} firstName - Custom DVA business first name (optional).
 * @param {string} lastName - Custom DVA business last name (optional).
 * @returns {Promise<object>} Virtual account creation response.
 */
export async function createDynamicVirtualAccount(firstName = '', lastName = '') {
  const payload = {};
  
  if (firstName && lastName) {
    payload.first_name = firstName;
    payload.last_name = lastName;
  }

  const response = await squadFetch('/virtual-account/create-dynamic-virtual-account', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return response;
}

/**
 * Assigns an account from the pool for a specific transaction collection.
 * 
 * @param {number} amount - Amount to collect.
 * @param {string} transactionRef - Unique transaction reference.
 * @param {number} duration - Time to live in seconds (e.g. 600 for 10 minutes).
 * @param {string} email - Customer email.
 * @returns {Promise<object>} Assigned DVA details.
 */
export async function initiateDynamicVirtualAccount({ amount, transactionRef, duration, email }) {
  const payload = {
    amount,
    transaction_ref: transactionRef,
    duration,
    email
  };

  const response = await squadFetch('/virtual-account/initiate-dynamic-virtual-account', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return response;
}
