const { ApiError } = require('../utils/ApiError');

/**
 * Global Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired');
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], false, err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors && error.errors.length > 0 ? error.errors : null,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, error.message);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
