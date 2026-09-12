/**
 * Custom Base API Error Class
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors = []) {
    super(400, message, errors);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access', errors = []) {
    super(401, message, errors);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden resource access', errors = []) {
    super(403, message, errors);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', errors = []) {
    super(404, message, errors);
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', errors = []) {
    super(409, message, errors);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', errors = []) {
    super(500, message, errors, false);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
