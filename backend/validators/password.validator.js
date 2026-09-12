const { body } = require('express-validator');

/**
 * Reusable express-validator chain for password strength validation.
 * Enforces: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char,
 * and rejects passwords containing the user's email local-part or name.
 */
const passwordStrengthRules = (fieldName = 'password') => {
  return body(fieldName)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[\W_]/)
    .withMessage('Password must contain at least one special character')
    .custom((value, { req }) => {
      const email = req.body?.email || req.user?.email;
      if (email && typeof email === 'string') {
        const localPart = email.split('@')[0].toLowerCase();
        if (localPart && localPart.length >= 3 && value.toLowerCase().includes(localPart)) {
          throw new Error('Password cannot contain parts of your email address');
        }
      }

      const fullName = req.body?.fullName || req.user?.fullName || req.user?.name;
      if (fullName && typeof fullName === 'string') {
        const nameParts = fullName.toLowerCase().split(/\s+/);
        for (const part of nameParts) {
          if (part.length >= 3 && value.toLowerCase().includes(part)) {
            throw new Error('Password cannot contain parts of your name');
          }
        }
      }

      return true;
    });
};

module.exports = passwordStrengthRules;
