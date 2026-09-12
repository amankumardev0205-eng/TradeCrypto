const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/ApiError');

/**
 * Express middleware runner for express-validator chains.
 * If validation fails, throws a formatted BadRequestError.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validation chains
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(new BadRequestError('Validation failed', formattedErrors));
  };
};

module.exports = validate;
