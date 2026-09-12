const request = require('supertest');
const app = require('../../server');
const firestoreService = require('../../services/firestoreService');
const tokenService = require('../../services/tokenService');

describe('KYC API Integration Tests (/api/kyc)', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    firestoreService.clearMemoryStore();

    const user = await firestoreService.create('users', {
      id: 'usr-kycapi-1',
      email: 'kycapi@crypto.local',
      role: 'user',
      status: 'active',
      kycStatus: 'not_submitted',
    });

    userId = user.id;
    userToken = tokenService.generateAccessToken({ id: userId, role: 'user' });
  });

  describe('GET /api/kyc/liveness/session', () => {
    it('returns 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/kyc/liveness/session');
      expect(res.statusCode).toBe(401);
    });

    it('generates anti-replay liveness session token for authenticated user', async () => {
      const res = await request(app)
        .get('/api/kyc/liveness/session')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('sessionId');
      expect(res.body.data).toHaveProperty('promptText');
      expect(res.body.data).toHaveProperty('code');
    });
  });

  describe('GET /api/kyc/history', () => {
    it('returns KYC audit history array for user', async () => {
      const res = await request(app)
        .get('/api/kyc/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
