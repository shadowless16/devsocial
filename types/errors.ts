// Error Types and Error Handling Utilities

// ============= Base Error Types =============

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// ============= Specific Error Classes =============

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `${service} service unavailable`, 503, 'EXTERNAL_SERVICE_ERROR')
    this.name = 'ExternalServiceError'
  }
}

// ============= Error Response Types =============

export interface ErrorResponse {
  success: false
  error: string
  message: string
  code?: string
  statusCode: number
  details?: Record<string, unknown>
  stack?: string
}

export interface ValidationErrorResponse extends ErrorResponse {
  code: 'VALIDATION_ERROR'
  details: Record<string, string[]>
}

// ============= Error Handler Types =============

export type ErrorHandler = (error: Error | AppError) => ErrorResponse

export interface ErrorContext {
  path: string
  method: string
  userId?: string
  timestamp: Date
}

// ============= Type Guards =============

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

// ============= Error Utilities =============

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode
  }
  return 500
}

export function formatErrorResponse(error: unknown, includeStack = false): ErrorResponse {
  if (isAppError(error)) {
    return {
      success: false,
      error: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      ...(includeStack && { stack: error.stack })
    }
  }

  const message = getErrorMessage(error)
  return {
    success: false,
    error: 'Error',
    message,
    statusCode: 500,
    ...(includeStack && error instanceof Error && { stack: error.stack })
  }
}

// ============= Async Error Wrapper =============

export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>

export function catchAsync<T>(fn: AsyncFunction<T>) {
  return async (...args: unknown[]): Promise<T> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw isAppError(error) ? error : new AppError(getErrorMessage(error))
    }
  }
}
