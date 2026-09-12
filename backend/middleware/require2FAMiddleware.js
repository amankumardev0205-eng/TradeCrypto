const firestoreService = require('../services/firestoreService');
const { ForbiddenError, UnauthorizedError } = require('../utils/ApiError');

/**
 * Middleware to enforce 2FA activation on sensitive operations (trading, withdrawals).
 * Runs ONLY AFTER authMiddleware has verified the normal Access Token.
 * Checks persisted database state (user.twoFactorEnabled in Firestore) to prevent client forgery.
 */
const require2FA = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Always fetch persisted user state from Firestore database
    const user = await firestoreService.getById('users', req.user.id);
    if (!user) {
      return next(new UnauthorizedError('User account not found'));
    }

    if (!user.twoFactorEnabled) {
      return next(new ForbiddenError('2FA setup is required to access trading and withdrawal functionality. Please enable 2FA in your account settings.'));
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = require2FA;
