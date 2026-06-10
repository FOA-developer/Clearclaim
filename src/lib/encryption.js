import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import logger from '@/lib/logger'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

/**
 * Lazily resolved 32-byte encryption key derived from the
 * BVN_ENCRYPTION_KEY environment variable.
 *
 * Accepts either:
 *   - A 64-character hex string (decoded to 32 bytes)
 *   - A 32-character raw string (used directly as 32 bytes via UTF-8)
 */
function getKey() {
  const raw = process.env.BVN_ENCRYPTION_KEY
  if (!raw) {
    throw new Error('BVN_ENCRYPTION_KEY is not set')
  }

  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, 'hex')
  }

  if (raw.length === 32) {
    return Buffer.from(raw, 'utf8')
  }

  throw new Error(
    'BVN_ENCRYPTION_KEY must be either a 64-character hex string or a 32-character string',
  )
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * @param {string} plaintext
 * @returns {string} Base64-encoded JSON containing iv, ciphertext, and auth tag.
 */
export function encryptBVN(plaintext) {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  const payload = {
    iv: iv.toString('base64'),
    ciphertext: encrypted.toString('base64'),
    tag: tag.toString('base64'),
  }

  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Decrypts a BVN previously encrypted with encryptBVN.
 *
 * @param {string} encryptedBase64 - Base64-encoded JSON from encryptBVN.
 * @returns {string} The original plaintext BVN.
 */
export function decryptBVN(encryptedBase64) {
  const key = getKey()

  let parsed
  try {
    parsed = JSON.parse(Buffer.from(encryptedBase64, 'base64').toString('utf8'))
  } catch {
    logger.error('Failed to parse encrypted BVN payload')
    throw new Error('Invalid encrypted BVN format')
  }

  const iv = Buffer.from(parsed.iv, 'base64')
  const ciphertext = Buffer.from(parsed.ciphertext, 'base64')
  const tag = Buffer.from(parsed.tag, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Produces a deterministic SHA-256 hex digest for deduplication lookups.
 * Never store raw BVN — use this hash for uniqueness checks.
 *
 * @param {string} plaintext
 * @returns {string} Hex-encoded SHA-256 hash.
 */
export function hashSHA256(plaintext) {
  return createHash('sha256').update(plaintext, 'utf8').digest('hex')
}
