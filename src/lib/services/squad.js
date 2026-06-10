import { createHmac } from 'crypto'
import { AppError } from '@/lib/errors/AppError'
import logger from '@/lib/logger'

const SQUAD_TIMEOUT_MS = 10_000

const BASE_URLS = {
  sandbox: 'https://sandbox-api-d.squadco.com',
  production: 'https://api-d.squadco.com',
}

function getConfig() {
  const env = process.env.NEXT_PUBLIC_SQUAD_ENV || 'sandbox'
  const secretKey = process.env.SQUAD_SECRET_KEY

  if (!secretKey) {
    throw AppError.internal('SQUAD_SECRET_KEY is not configured')
  }

  const baseUrl = BASE_URLS[env] ?? BASE_URLS.sandbox
  return { baseUrl, secretKey, env }
}

/**
 * Low-level fetch wrapper for the Squad API.
 * Applies auth headers, timeout, and structured error handling.
 *
 * @param {string} endpoint - e.g. '/virtual-account/business'
 * @param {object} options  - fetch options (method, body, etc.)
 * @param {object} [log]    - optional child logger for request context
 * @returns {Promise<object>} Parsed JSON response body.
 */
async function squadFetch(endpoint, options = {}, log = logger) {
  const { baseUrl, secretKey } = getConfig()
  const url = `${baseUrl}${endpoint}`

  const startMs = performance.now()

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(SQUAD_TIMEOUT_MS),
    })
  } catch (err) {
    const durationMs = Math.round(performance.now() - startMs)

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      log.error({ endpoint, durationMs }, 'Squad API request timed out')
      throw AppError.serviceUnavailable('Squad API timed out — please try again later')
    }

    log.error({ err, endpoint, durationMs }, 'Squad API network error')
    throw AppError.serviceUnavailable('Unable to reach Squad API')
  }

  const data = await response.json().catch(() => null)
  const durationMs = Math.round(performance.now() - startMs)

  if (!response.ok || data?.success === false) {
    const message = data?.message || `Squad API returned ${response.status}`

    log.warn(
      { endpoint, status: response.status, squadMessage: message, durationMs },
      'Squad API error response',
    )

    if (response.status === 401 || response.status === 403) {
      throw AppError.internal('Squad API authentication failed — check API keys')
    }
    if (response.status === 400) {
      throw AppError.badRequest(`Squad validation error: ${message}`)
    }
    if (response.status === 424) {
      throw AppError.badRequest(`Squad dependency error: ${message}`)
    }

    throw AppError.serviceUnavailable(`Squad API error: ${message}`)
  }

  log.info({ endpoint, durationMs }, 'Squad API call succeeded')
  return data
}

/**
 * Creates a virtual account for a business using the Squad B2B model.
 *
 * POST /virtual-account/business
 *
 * @param {object} params
 * @param {string} params.bvn              - 11-digit Bank Verification Number
 * @param {string} params.businessName     - Registered business name
 * @param {string} params.customerIdentifier - Unique identifier in our system (e.g. CC_{companyId})
 * @param {string} params.mobileNum        - 11-digit Nigerian phone number
 * @param {string} [params.beneficiaryAccount] - 10-digit GTBank settlement account
 * @param {object} [log]                   - child logger with request context
 * @returns {Promise<{virtualAccountNumber: string, bankCode: string, rawResponse: object}>}
 */
export async function createBusinessVirtualAccount(
  { bvn, businessName, customerIdentifier, mobileNum, beneficiaryAccount },
  log = logger,
) {
  log.info(
    {
      businessName,
      customerIdentifier,
      bvn: `***${bvn.slice(-4)}`,
    },
    'creating Squad business virtual account',
  )

  const body = {
    bvn,
    business_name: businessName,
    customer_identifier: customerIdentifier,
    mobile_num: mobileNum,
  }

  if (beneficiaryAccount) {
    body.beneficiary_account = beneficiaryAccount
  }

  const result = await squadFetch(
    '/virtual-account/business',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    log,
  )

  const account = result.data ?? {}

  return {
    virtualAccountNumber: account.virtual_account_number ?? null,
    bankCode: account.bank_code ?? null,
    beneficiaryAccount: account.beneficiary_account ?? null,
    rawResponse: result,
  }
}

/**
 * Retrieves customer/virtual-account details by customer identifier.
 *
 * GET /virtual-account/{customer_identifier}
 *
 * @param {string} customerIdentifier
 * @param {object} [log]
 * @returns {Promise<object>}
 */
export async function getVirtualAccountByIdentifier(customerIdentifier, log = logger) {
  return squadFetch(
    `/virtual-account/${encodeURIComponent(customerIdentifier)}`,
    { method: 'GET' },
    log,
  )
}

/**
 * Gets the merchant's Squad wallet ledger balance.
 * Balance is returned in KOBO.
 *
 * GET /merchant/balance?currency_id=NGN
 *
 * @param {object} [log]
 * @returns {Promise<{balanceKobo: number, currencyId: string, merchantId: string}>}
 */
export async function getLedgerBalance(log = logger) {
  const result = await squadFetch(
    '/merchant/balance?currency_id=NGN',
    { method: 'GET' },
    log,
  )

  const data = result.data ?? {}
  return {
    balanceKobo: parseInt(data.balance ?? '0', 10),
    currencyId: data.currency_id ?? 'NGN',
    merchantId: data.merchant_id ?? null,
  }
}

/**
 * Looks up a bank account to verify the recipient before transfer.
 *
 * POST /payout/account/lookup
 *
 * @param {string} bankCode     - NIP bank code (e.g. '000013' for GTBank)
 * @param {string} accountNumber - 10-digit NUBAN account number
 * @param {object} [log]
 * @returns {Promise<{accountName: string, accountNumber: string}>}
 */
export async function lookupAccount(bankCode, accountNumber, log = logger) {
  const result = await squadFetch(
    '/payout/account/lookup',
    {
      method: 'POST',
      body: JSON.stringify({
        bank_code: bankCode,
        account_number: accountNumber,
      }),
    },
    log,
  )

  const data = result.data ?? {}
  return {
    accountName: data.account_name ?? '',
    accountNumber: data.account_number ?? accountNumber,
  }
}

/**
 * Transfers funds from the Squad wallet to a bank account.
 * Amount is in KOBO.
 *
 * POST /payout/transfer
 *
 * @param {object} params
 * @param {string} params.transactionReference - Must include merchant ID prefix
 * @param {string} params.amount               - Amount in kobo as string
 * @param {string} params.bankCode
 * @param {string} params.accountNumber
 * @param {string} params.accountName          - Verified account name from lookup
 * @param {string} params.remark
 * @param {object} [log]
 * @returns {Promise<{transactionReference: string, nipReference: string|null, destinationBank: string|null, rawResponse: object}>}
 */
export async function transferFunds(
  { transactionReference, amount, bankCode, accountNumber, accountName, remark },
  log = logger,
) {
  log.info(
    { transactionReference, amount, bankCode, accountNumber: `***${accountNumber.slice(-4)}` },
    'initiating Squad fund transfer',
  )

  const result = await squadFetch(
    '/payout/transfer',
    {
      method: 'POST',
      body: JSON.stringify({
        transaction_reference: transactionReference,
        amount,
        bank_code: bankCode,
        currency_id: 'NGN',
        account_number: accountNumber,
        account_name: accountName,
        remark: remark || 'ClearClaim Transfer',
      }),
    },
    log,
  )

  const data = result.data ?? {}
  return {
    transactionReference: data.transaction_reference ?? transactionReference,
    nipReference: data.nip_transaction_reference ?? null,
    destinationBank: data.destination_institution_name ?? null,
    rawResponse: result,
  }
}

/**
 * Re-queries the status of a transfer.
 *
 * POST /payout/requery
 *
 * @param {string} transactionReference
 * @param {object} [log]
 * @returns {Promise<object>}
 */
export async function requeryTransfer(transactionReference, log = logger) {
  return squadFetch(
    '/payout/requery',
    {
      method: 'POST',
      body: JSON.stringify({ transaction_reference: transactionReference }),
    },
    log,
  )
}

export function validateWebhookSignature(payload, signature) {
  if (!payload || !signature) return false

  const { secretKey } = getConfig()

  const dataToHash = [
    payload.transaction_reference,
    payload.virtual_account_number,
    payload.currency,
    payload.principal_amount,
    payload.settled_amount,
    payload.customer_identifier,
  ].join('|')

  const computed = createHmac('sha512', secretKey)
    .update(dataToHash)
    .digest('hex')

  return computed.toLowerCase() === signature.toLowerCase()
}
