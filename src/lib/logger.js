import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
  formatters: {
    level(label) {
      return { level: label }
    },
  },
  base: { service: 'clearclaim-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'req.headers.authorization', 'req.headers.cookie'],
    censor: '[REDACTED]',
  },
})

/**
 * Creates a child logger bound to a specific request context.
 * @param {{ requestId: string, route?: string, userId?: string }} ctx
 */
export function createRequestLogger(ctx) {
  return logger.child({
    requestId: ctx.requestId,
    ...(ctx.route && { route: ctx.route }),
    ...(ctx.userId && { userId: ctx.userId }),
  })
}

export default logger
