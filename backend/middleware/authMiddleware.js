const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { UnauthorizedError } = require('../utils/ApiError');

/**
 * Access Token Verification Middleware (Stateless)
 * 
 * Verifies JWT signature and expiry (15 min access tokens).
 * No per-request Firestore lookup — keeps API endpoints fast and stateless.
 * On 401 token expiry error, the frontend client should automatically invoke
 * POST /api/auth/refresh with HttpOnly cookie to obtain a new access token.
 */
const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // SECURITY CHECK: Pre-auth 2FA tokens cannot access normal protected APIs
    if (decoded.stage === 'pending_2fa') {
      throw new UnauthorizedError('2FA verification pending');
    }

    // Attach decoded claims ({ id, role }) to request object
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid access token'));
    }
    next(err);
  }
};

module.exports = verifyAccessToken;