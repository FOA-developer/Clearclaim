/**
 * Squad Transfer API integration.
 *
 * Docs: https://docs.squadco.com/Transfer-API/transfer-apis
 *
 * Env vars:
 *   SQUAD_SECRET_KEY  – Bearer token for API calls
 *   SQUAD_MERCHANT_ID – Used to prefix transaction references
 *   NEXT_PUBLIC_SQUAD_ENV – "sandbox" | "production"
 */

const BASE_URL =
  (process.env.NEXT_PUBLIC_SQUAD_ENV === 'production'
    ? 'https://api-d.squadco.com'
    : 'https://sandbox-api-d.squadco.com')

function apiHeaders() {
  return {
    Authorization: `Bearer ${process.env.SQUAD_SECRET_KEY ?? ''}`,
    'Content-Type': 'application/json',
  }
}

function buildTxRef(suffix) {
  const merchantId = process.env.SQUAD_MERCHANT_ID ?? 'CLEARCLAIM'
  return `${merchantId}_${suffix}`
}

/**
 * Account Lookup – confirm account name before transferring.
 *
 * @param {{ bankCode: string, accountNumber: string }} params
 * @returns {Promise<{ accountName: string, accountNumber: string }>}
 */
export async function lookupAccount({ bankCode, accountNumber }) {
  const res = await fetch(`${BASE_URL}/payout/account/lookup`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      bank_code: bankCode,
      account_number: accountNumber,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `Account lookup failed (${res.status})`)
    err.status = res.status
    err.data = body
    throw err
  }

  const json = await res.json()
  if (!json.success || !json.data) {
    const err = new Error(json.message || 'Account lookup returned no data')
    err.status = 422
    err.data = json
    throw err
  }

  return {
    accountName: json.data.account_name,
    accountNumber: json.data.account_number,
  }
}

/**
 * Fund Transfer – move money from Squad wallet to a bank account.
 *
 * Amount is in KOBO (e.g. ₦1,000 = "100000").
 *
 * @param {{
 *   bankCode: string,
 *   accountNumber: string,
 *   accountName: string,
 *   amountKobo: string,
 *   remark: string,
 *   transactionRef: string,
 * }} params
 * @returns {Promise<{ transactionRef: string, nipRef: string, status: string }>}
 */
export async function transferFunds({
  bankCode,
  accountNumber,
  accountName,
  amountKobo,
  remark,
  transactionRef,
}) {
  const txRef = buildTxRef(transactionRef)

  const res = await fetch(`${BASE_URL}/payout/transfer`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: accountName,
      amount: amountKobo,
      currency_id: 'NGN',
      remark,
      transaction_reference: txRef,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `Transfer failed (${res.status})`)
    err.status = res.status
    err.data = body
    throw err
  }

  const json = await res.json()
  if (!json.success) {
    const err = new Error(json.message || 'Transfer was not successful')
    err.status = 422
    err.data = json
    throw err
  }

  return {
    transactionRef: txRef,
    nipRef: json.data?.nip_transaction_reference ?? '',
    status: json.data?.response_description ?? 'unknown',
  }
}

/**
 * Re-query Transfer – check final status of a transfer.
 *
 * @param {{ transactionRef: string }} params
 * @returns {Promise<{ status: string, data: object }>}
 */
export async function requeryTransfer({ transactionRef }) {
  const res = await fetch(`${BASE_URL}/payout/requery`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      transaction_reference: transactionRef,
    }),
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(json.message || `Requery failed (${res.status})`)
    err.status = res.status
    err.data = json
    throw err
  }

  return {
    status: json.success ? 'success' : 'failed',
    data: json,
  }
}
