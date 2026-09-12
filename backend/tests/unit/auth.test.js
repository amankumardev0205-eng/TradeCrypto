const tokenService = require('../../services/tokenService');
const twoFactorService = require('../../services/twoFactorService');
const passwordStrengthRules = require('../../validators/password.validator');
const firestoreService = require('../../services/firestoreService');
const { validationResult } = require('express-validator');

describe('Auth Utilities & Security Unit Tests', () => {
  beforeEach(() => {
    firestoreService.clearMemoryStore();
  });

  describe('tokenService', () => {
    it('generates a valid short-lived JWT access token with user claims', () => {
      const user = { id: 'usr-123', role: 'trader' };
      const token = tokenService.generateAccessToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('generates and verifies pre-auth tokens for 2FA flows', () => {
      const userId = 'usr-456';
      const preAuthToken = tokenService.generatePreAuthToken(userId);

      expect(preAuthToken).toBeDefined();
      const decoded = tokenService.verifyPreAuthToken(preAuthToken);
      expect(decoded.id).toBe('usr-456');
      expect(decoded.stage).toBe('pending_2fa');
    });

    it('throws UnauthorizedError when verifying invalid or missing pre-auth tokens', () => {
      expect(() => tokenService.verifyPreAuthToken(null)).toThrow();
      expect(() => tokenService.verifyPreAuthToken('invalid.token.string')).toThrow();
    });

    it('hashes tokens consistently using SHA-256', () => {
      const raw = 'test-token-string';
      const hash1 = tokenService.hashToken(raw);
      const hash2 = tokenService.hashToken(raw);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('creates a refresh token document in firestoreService', async () => {
      const { rawToken, tokenId, familyId, docData } = await tokenService.createRefreshTokenDoc('usr-789', null, 'Jest/Vitest', '127.0.0.1');

      expect(rawToken).toBeDefined();
      expect(tokenId).toBe(tokenService.hashToken(rawToken));
      expect(familyId).toBeDefined();
      expect(docData.userId).toBe('usr-789');
      expect(docData.revoked).toBe(false);

      const saved = await firestoreService.getById('refreshTokens', tokenId);
      expect(saved).toBeDefined();
      expect(saved.userId).toBe('usr-789');
    });

    it('revokes all tokens belonging to a specific family ID', async () => {
      const { familyId, tokenId: id1 } = await tokenService.createRefreshTokenDoc('usr-100');
      const { tokenId: id2 } = await tokenService.createRefreshTokenDoc('usr-100', familyId);

      await tokenService.revokeFamily(familyId);

      const t1 = await firestoreService.getById('refreshTokens', id1);
      const t2 = await firestoreService.getById('refreshTokens', id2);

      expect(t1.revoked).toBe(true);
      expect(t2.revoked).toBe(true);
    });

    it('revokes all tokens belonging to a user ID', async () => {
      const { tokenId: id1 } = await tokenService.createRefreshTokenDoc('usr-200');
      const { tokenId: id2 } = await tokenService.createRefreshTokenDoc('usr-200');

      await tokenService.revokeAllUserTokens('usr-200');

      const t1 = await firestoreService.getById('refreshTokens', id1);
      const t2 = await firestoreService.getById('refreshTokens', id2);

      expect(t1.revoked).toBe(true);
      expect(t2.revoked).toBe(true);
    });

    it('purges expired and revoked tokens from memory store', async () => {
      const { tokenId: activeId } = await tokenService.createRefreshTokenDoc('usr-300');
      
      // Create revoked token
      const { tokenId: revokedId } = await tokenService.createRefreshTokenDoc('usr-300');
      await firestoreService.update('refreshTokens', revokedId, { revoked: true });

      // Create expired token
      const expiredDate = new Date(Date.now() - 10000).toISOString();
      const { tokenId: expiredId } = await tokenService.createRefreshTokenDoc('usr-300');
      await firestoreService.update('refreshTokens', expiredId, { expiresAt: expiredDate });

      const purgedCount = await tokenService.purgeExpiredTokens();
      expect(purgedCount).toBe(2);

      const active = await firestoreService.getById('refreshTokens', activeId);
      const revoked = await firestoreService.getById('refreshTokens', revokedId);
      const expired = await firestoreService.getById('refreshTokens', expiredId);

      expect(active).not.toBeNull();
      expect(revoked).toBeNull();
      expect(expired).toBeNull();
    });
  });

  describe('twoFactorService', () => {
    it('generates TOTP secret, otpauth URL, and QR code data URL', async () => {
      const result = await twoFactorService.generateSecret('trader@example.com');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('otpauthUrl');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result.otpauthUrl).toContain('trader%40example.com');
      expect(result.qrCodeUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('handles TOTP verification gracefully for invalid tokens', () => {
      const isValid = twoFactorService.verifyTOTP('123456', 'INVALIDSECRET321');
      expect(isValid).toBe(false);
    });

    it('generates 8 raw and hashed single-use recovery codes', () => {
      const { rawCodes, hashedCodes } = twoFactorService.generateRecoveryCodes();

      expect(rawCodes).toHaveLength(8);
      expect(hashedCodes).toHaveLength(8);
      expect(rawCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(hashedCodes[0]).toHaveLength(64);
    });

    it('normalizes and hashes recovery codes reliably', () => {
      const raw = 'a1b2-c3d4';
      const normalized = twoFactorService.normalizeRecoveryCode(raw);
      expect(normalized).toBe('A1B2C3D4');

      const hash1 = twoFactorService.hashRecoveryCode('A1B2-C3D4');
      const hash2 = twoFactorService.hashRecoveryCode('a1b2c3d4');
      expect(hash1).toBe(hash2);
    });

    it('tracks failed 2FA verification attempts and rate-limits after threshold', () => {
      const key = 'test-ip-127.0.0.1';

      expect(twoFactorService.isRateLimited(key)).toBe(false);

      for (let i = 0; i < 5; i++) {
        twoFactorService.recordFailedAttempt(key);
      }

      expect(twoFactorService.isRateLimited(key)).toBe(true);

      twoFactorService.resetRateLimit(key);
      expect(twoFactorService.isRateLimited(key)).toBe(false);
    });
  });

  describe('passwordStrengthRules', () => {
    const runPasswordValidation = async (password, reqContext = {}) => {
      const req = {
        body: { password, ...reqContext.body },
        user: reqContext.user,
      };
      const chain = passwordStrengthRules('password');
      await chain.run(req);
      return validationResult(req);
    };

    it('passes for strong password meeting all criteria', async () => {
      const result = await runPasswordValidation('Secr3t!Passcode');
      expect(result.isEmpty()).toBe(true);
    });

    it('fails when password is too short (<8 chars)', async () => {
      const result = await runPasswordValidation('Short1!');
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toContain('at least 8 characters');
    });

    it('fails when missing uppercase, lowercase, number, or special character', async () => {
      const res1 = await runPasswordValidation('lowercase1!');
      expect(res1.isEmpty()).toBe(false);

      const res2 = await runPasswordValidation('UPPERCASE1!');
      expect(res2.isEmpty()).toBe(false);

      const res3 = await runPasswordValidation('NoNumbers!');
      expect(res3.isEmpty()).toBe(false);

      const res4 = await runPasswordValidation('NoSpecialChar123');
      expect(res4.isEmpty()).toBe(false);
    });

    it('fails when password contains email local-part or name', async () => {
      const res1 = await runPasswordValidation('Aman123!Password', { body: { email: 'aman@crypto.com' } });
      expect(res1.isEmpty()).toBe(false);
      expect(res1.array()[0].msg).toContain('email address');

      const res2 = await runPasswordValidation('Trader123!Pass', { body: { fullName: 'Trader Joe' } });
      expect(res2.isEmpty()).toBe(false);
      expect(res2.array()[0].msg).toContain('name');
    });
  });
});
