const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
}

export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} code
   * @param {Record<string, unknown>} [context]
   */
  constructor(message, statusCode, code, context = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.context = context
    this.isOperational = true
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(process.env.NODE_ENV !== 'production' && { context: this.context }),
      },
    }
  }

  static badRequest(message, context) {
    return new AppError(message, ERROR_CODES.BAD_REQUEST, 'BAD_REQUEST', context)
  }

  static unauthorized(message = 'Authentication required', context) {
    return new AppError(message, ERROR_CODES.UNAUTHORIZED, 'UNAUTHORIZED', context)
  }

  static forbidden(message = 'Insufficient permissions', context) {
    return new AppError(message, ERROR_CODES.FORBIDDEN, 'FORBIDDEN', context)
  }

  static notFound(message = 'Resource not found', context) {
    return new AppError(message, ERROR_CODES.NOT_FOUND, 'NOT_FOUND', context)
  }

  static conflict(message, context) {
    return new AppError(message, ERROR_CODES.CONFLICT, 'CONFLICT', context)
  }

  static rateLimited(message = 'Too many requests', context) {
    return new AppError(message, ERROR_CODES.RATE_LIMITED, 'RATE_LIMITED', context)
  }

  static internal(message = 'Internal server error', context) {
    return new AppError(message, ERROR_CODES.INTERNAL, 'INTERNAL', context)
  }

  static serviceUnavailable(message = 'Service temporarily unavailable', context) {
    return new AppError(message, ERROR_CODES.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE', context)
  }

  static fromSupabaseError(error) {
    const message = error?.message ?? 'Authentication failed'
    const status = error?.status ?? 400

    if (status === 422 || message.includes('Invalid login credentials')) {
      return AppError.unauthorized('Invalid email or password')
    }
    if (status === 429 || message.includes('rate limit')) {
      return AppError.rateLimited('Too many login attempts. Please try again later.')
    }
    if (message.includes('Email not confirmed')) {
      return AppError.forbidden('Please confirm your email address before logging in')
    }

    return new AppError(message, status >= 500 ? 500 : 400, 'AUTH_ERROR')
  }
}
