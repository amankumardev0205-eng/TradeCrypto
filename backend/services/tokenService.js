const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const firestoreService = require('./firestoreService');
const config = require('../config/env');
const { UnauthorizedError } = require('../utils/ApiError');
const { db } = require('../config/firebase');

const tokenService = {
  /**
   * Generate short-lived (15m) JWT Access Token
   */
  generateAccessToken: (user) => {
    return jwt.sign(
      { id: String(user.id), role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtAccessExpiresIn }
    );
  },

  /**
   * Generate short-lived (5m) Pre-Auth JWT for 2FA verification/setup
   */
  generatePreAuthToken: (userId) => {
    return jwt.sign(
      { id: String(userId), stage: 'pending_2fa' },
      config.jwtSecret,
      { expiresIn: '5m' }
    );
  },

  /**
   * Verify Pre-Auth JWT (must have stage === 'pending_2fa')
   */
  verifyPreAuthToken: (token) => {
    if (!token) throw new UnauthorizedError('Pre-auth token required');
    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.stage !== 'pending_2fa') {
      throw new UnauthorizedError('Invalid pre-auth token stage');
    }
    return decoded;
  },

  /**
   * SHA-256 Hash helper for refresh tokens (never store raw tokens)
   */
  hashToken: (token) => {
    return crypto.createHash('sha256').update(String(token)).digest('hex');
  },

  /**
   * Create new opaque Refresh Token document in Firestore
   */
  createRefreshTokenDoc: async (userId, familyId = null, userAgent = '', ipAddress = '') => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenId = tokenService.hashToken(rawToken);
    const famId = familyId || crypto.randomUUID();

    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + config.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const docData = {
      tokenId,
      userId: String(userId),
      familyId: famId,
      issuedAt,
      expiresAt,
      revoked: false,
      replacedBy: null,
      userAgent: userAgent || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
    };

    await firestoreService.create('refreshTokens', docData, tokenId);
    return { rawToken, tokenId, familyId: famId, docData };
  },

  /**
   * Set Refresh Token HTTP-only cookie on response object
   */
  setRefreshCookie: (res, rawToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAgeMs = config.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000;

    res.cookie('refreshToken', rawToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      path: '/api/auth',
      maxAge: maxAgeMs,
    });
  },

  /**
   * Clear Refresh Token cookie on response object
   */
  clearRefreshCookie: (res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      path: '/api/auth',
    });
  },

  /**
   * Rotate Refresh Token atomically using Firestore transaction
   * Includes 10-second grace period for concurrent requests and account status check
   */
  rotateRefreshToken: async (rawToken, userAgent = '', ipAddress = '') => {
    if (!rawToken) {
      throw new UnauthorizedError('Refresh token cookie missing');
    }

    const tokenId = tokenService.hashToken(rawToken);

    return await db.runTransaction(async (transaction) => {
      const tokenRef = db.collection('refreshTokens').doc(tokenId);
      const tokenSnap = await transaction.get(tokenRef);

      if (!tokenSnap.exists) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const tokenDoc = { id: tokenSnap.id, ...tokenSnap.data() };

      // Expiry Check
      if (new Date(tokenDoc.expiresAt) < new Date()) {
        throw new UnauthorizedError('Refresh token expired');
      }

      // Reuse Detection & Grace Period Handling
      if (tokenDoc.revoked) {
        const now = new Date().getTime();
        const revokedTime = tokenDoc.revokedAt ? new Date(tokenDoc.revokedAt).getTime() : 0;
        const timeDiffMs = Math.abs(now - revokedTime);

        // Grace period (10 seconds) for concurrent requests (e.g., multi-tab browser refresh)
        if (tokenDoc.revokedAt && tokenDoc.replacedBy && timeDiffMs <= 10000) {
          const replacementRef = db.collection('refreshTokens').doc(tokenDoc.replacedBy);
          const replacementSnap = await transaction.get(replacementRef);

          if (replacementSnap.exists) {
            const replacementDoc = replacementSnap.data();
            if (!replacementDoc.revoked && new Date(replacementDoc.expiresAt) > new Date()) {
              const userRef = db.collection('users').doc(tokenDoc.userId);
              const userSnap = await transaction.get(userRef);

              if (userSnap.exists) {
                const user = { id: userSnap.id, ...userSnap.data() };

                // Account Status Check during grace window
                if (user.status === 'suspended' || user.status === 'banned') {
                  await tokenService.revokeAllUserTokens(user.id);
                  throw new UnauthorizedError('Account access has been restricted');
                }

                const accessToken = tokenService.generateAccessToken(user);
                return { accessToken, rawRefreshToken: null, isGraceWindow: true, user };
              }
            }
          }
        }

        // REUSE ATTACK DETECTED: Revoke entire token family
        await tokenService.revokeFamily(tokenDoc.familyId);
        console.warn(`[SECURITY EVENT] Refresh token reuse detected for family ${tokenDoc.familyId}, userId ${tokenDoc.userId}`);

        throw new UnauthorizedError('Token reuse detected. All sessions in this family have been revoked for security.');
      }

      // Account Status Check
      const userRef = db.collection('users').doc(tokenDoc.userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new UnauthorizedError('User associated with token not found');
      }

      const user = { id: userSnap.id, ...userSnap.data() };

      if (user.status === 'suspended' || user.status === 'banned') {
        await tokenService.revokeAllUserTokens(user.id);
        throw new UnauthorizedError('Account access has been restricted');
      }

      // Legitimate Refresh: Generate new token details
      const rawNewToken = crypto.randomBytes(32).toString('hex');
      const newTokenId = tokenService.hashToken(rawNewToken);
      const famId = tokenDoc.familyId;
      const issuedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + config.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000).toISOString();

      const newDocRef = db.collection('refreshTokens').doc(newTokenId);
      const newDocData = {
        tokenId: newTokenId,
        userId: String(tokenDoc.userId),
        familyId: famId,
        issuedAt,
        expiresAt,
        revoked: false,
        replacedBy: null,
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || 'Unknown',
      };

      // Atomic Writes within Transaction
      transaction.set(newDocRef, newDocData);
      transaction.update(tokenRef, {
        revoked: true,
        replacedBy: newTokenId,
        revokedAt: new Date().toISOString(),
      });

      const accessToken = tokenService.generateAccessToken(user);
      return { accessToken, rawRefreshToken: rawNewToken, user };
    });
  },

  /**
   * Revoke all tokens belonging to a specific family ID
   */
  revokeFamily: async (familyId) => {
    if (!familyId) return;
    const tokens = await firestoreService.getWhere('refreshTokens', 'familyId', '==', familyId);
    for (const t of tokens) {
      if (!t.revoked) {
        await firestoreService.update('refreshTokens', t.id, { revoked: true });
      }
    }
  },

  /**
   * Revoke all token families belonging to a specific User ID (Logout everywhere)
   */
  revokeAllUserTokens: async (userId) => {
    if (!userId) return;
    const tokens = await firestoreService.getWhere('refreshTokens', 'userId', '==', String(userId));
    for (const t of tokens) {
      if (!t.revoked) {
        await firestoreService.update('refreshTokens', t.id, { revoked: true });
      }
    }
  },

  /**
   * Purge expired/revoked token documents from Firestore
   */
  purgeExpiredTokens: async () => {
    const allTokens = await firestoreService.getAll('refreshTokens');
    const now = new Date();
    let count = 0;

    for (const t of allTokens) {
      if (new Date(t.expiresAt) < now || t.revoked) {
        await firestoreService.delete('refreshTokens', t.id);
        count++;
      }
    }
    return count;
  },
};

module.exports = tokenService;
