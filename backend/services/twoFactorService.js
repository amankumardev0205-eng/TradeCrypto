const crypto = require('crypto');
const { generateSecret: generateOtplibSecret, generateURI, verifySync } = require('otplib');
const qrcode = require('qrcode');

// In-memory sliding-window rate limiter for 2FA verification attempts
// Limits to 5 failed attempts per key (user ID or IP) per 15 minutes
const failedAttempts = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const twoFactorService = {
  /**
   * Check if a key (userId or IP) is rate-limited
   */
  isRateLimited: (key) => {
    const record = failedAttempts.get(key);
    if (!record) return false;

    const now = Date.now();
    if (now - record.firstAttemptTime > RATE_LIMIT_WINDOW_MS) {
      // Window expired, reset
      failedAttempts.delete(key);
      return false;
    }

    return record.count >= RATE_LIMIT_MAX;
  },

  /**
   * Record a failed 2FA verification attempt
   */
  recordFailedAttempt: (key) => {
    const now = Date.now();
    const record = failedAttempts.get(key);

    if (!record || now - record.firstAttemptTime > RATE_LIMIT_WINDOW_MS) {
      failedAttempts.set(key, { count: 1, firstAttemptTime: now });
    } else {
      record.count += 1;
    }
  },

  /**
   * Reset rate limit counter on successful verification
   */
  resetRateLimit: (key) => {
    failedAttempts.delete(key);
  },

  /**
   * Generate TOTP secret and QR code Data URL
   */
  generateSecret: async (userEmail) => {
    const secret = generateOtplibSecret();
    const serviceName = 'NEXUS PRO Crypto';
    const otpauthUrl = generateURI({
      secret,
      label: userEmail || 'trader',
      issuer: serviceName,
    });
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrCodeUrl };
  },

  /**
   * Verify 6-digit TOTP token against secret
   */
  verifyTOTP: (token, secret) => {
    if (!token || !secret) return false;
    try {
      const cleanToken = String(token).replace(/\s+/g, '');
      const result = verifySync({ token: cleanToken, secret });
      return Boolean(result && result.valid);
    } catch (err) {
      console.error('TOTP verification error:', err);
      return false;
    }
  },

  /**
   * Normalize recovery code format
   */
  normalizeRecoveryCode: (code) => {
    if (!code) return '';
    return String(code).replace(/[\s-]/g, '').toUpperCase();
  },

  /**
   * Hash a recovery code with SHA-256
   */
  hashRecoveryCode: (code) => {
    const normalized = twoFactorService.normalizeRecoveryCode(code);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  },

  /**
   * Generate 8 single-use recovery codes
   */
  generateRecoveryCodes: () => {
    const rawCodes = [];
    const hashedCodes = [];

    for (let i = 0; i < 8; i++) {
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const rawCode = `${part1}-${part2}`;
      const hashed = twoFactorService.hashRecoveryCode(rawCode);

      rawCodes.push(rawCode);
      hashedCodes.push(hashed);
    }

    return { rawCodes, hashedCodes };
  },
};

module.exports = twoFactorService;
