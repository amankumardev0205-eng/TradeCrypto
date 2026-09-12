const crypto = require('crypto');
const config = require('../config/env');

// In-memory active liveness session cache (10 min TTL)
const activeSessions = new Map();

/**
 * Liveness Anti-Replay Verification Service.
 * Generates randomized phrases and session tokens to prevent video replay attacks.
 */
const livenessService = {
  /**
   * Generate a new liveness recording session for a user.
   * @param {string} userId
   */
  generateSession: (userId) => {
    // Generate a random 4-digit code (e.g. 7492)
    const code = Math.floor(1000 + Math.random() * 9000);
    const sessionId = `live-sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

    const promptText = `Please state your full name and clearly read aloud: ${code.toString().split('').join(' ')}`;

    const sessionData = {
      sessionId,
      userId: String(userId),
      code,
      promptText,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    activeSessions.set(sessionId, sessionData);

    // Auto cleanup expired session after 10 min
    setTimeout(() => {
      activeSessions.delete(sessionId);
    }, 10 * 60 * 1000);

    return sessionData;
  },

  /**
   * Verify an active liveness session token.
   * @param {string} sessionId
   * @param {string} userId
   */
  verifySession: (sessionId, userId) => {
    if (!sessionId) return { valid: false, reason: 'Session ID is required' };

    const session = activeSessions.get(sessionId);
    if (!session) {
      return { valid: false, reason: 'Invalid or expired liveness session' };
    }

    if (session.userId !== String(userId)) {
      return { valid: false, reason: 'Session user mismatch' };
    }

    if (Date.now() > session.expiresAt) {
      activeSessions.delete(sessionId);
      return { valid: false, reason: 'Liveness session expired' };
    }

    // Session valid, consume it so it cannot be reused
    activeSessions.delete(sessionId);
    return { valid: true, session };
  },
};

module.exports = livenessService;
