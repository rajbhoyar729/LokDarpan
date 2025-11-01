/**
 * Custom Error Classes and Error Handling Utilities
 */

/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, data = null) {
    super(message, 400, data);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', data = null) {
    super(message, 401, data);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized to perform this action', data = null) {
    super(message, 403, data);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', data = null) {
    super(`${resource} not found`, 404, data);
    this.name = 'NotFoundError';
  }
}

/**
 * Format error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const data = error.data || null;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
    });
  }

  return {
    statusCode,
    error: {
      message,
      ...(data && { data }),
    },
  };
}

/**
 * Handle Fastify validation errors
 * @param {FastifyError} error - Fastify validation error
 * @returns {Object} Formatted validation error response
 */
export function handleValidationError(error) {
  if (error.validation) {
    return {
      statusCode: 400,
      error: {
        message: 'Validation error',
        data: error.validation,
      },
    };
  }
  return formatErrorResponse(error);
}

