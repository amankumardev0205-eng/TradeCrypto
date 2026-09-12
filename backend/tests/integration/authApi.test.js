const request = require('supertest');
const app = require('../../server');
const firestoreService = require('../../services/firestoreService');
const tokenService = require('../../services/tokenService');
const bcrypt = require('bcryptjs');

describe('Auth API Integration Tests (/api/auth)', () => {
  beforeEach(() => {
    firestoreService.clearMemoryStore();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully with strong password', async () => {
      const payload = {
        email: 'trader1@crypto.local',
        password: 'Secr3t!Password123',
        fullName: 'Trader One',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.user).toHaveProperty('email', 'trader1@crypto.local');
      expect(res.body.data.user).toHaveProperty('role', 'user');

      // Check user saved in memory store
      const users = await firestoreService.getWhere('users', 'email', '==', 'trader1@crypto.local');
      expect(users).toHaveLength(1);
    });

    it('rejects registration with weak password (missing special char or uppercase)', async () => {
      const payload = {
        email: 'weak@crypto.local',
        password: 'weakpassword',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('rejects registration when email already exists', async () => {
      await firestoreService.create('users', {
        email: 'duplicate@crypto.local',
        password: 'hashedpassword',
      });

      const payload = {
        email: 'duplicate@crypto.local',
        password: 'Secr3t!Password123',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in user with valid credentials and sets HTTP-Only refresh cookie', async () => {
      const hashedPassword = await bcrypt.hash('Secr3t!Password123', 10);
      await firestoreService.create('users', {
        id: 'usr-login-1',
        email: 'login@crypto.local',
        password: hashedPassword,
        role: 'user',
        status: 'active',
        twoFactorEnabled: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@crypto.local',
          password: 'Secr3t!Password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('refreshToken=');
    });

    it('returns preAuthToken when user has 2FA enabled', async () => {
      const hashedPassword = await bcrypt.hash('Secr3t!Password123', 10);
      await firestoreService.create('users', {
        id: 'usr-2fa-login',
        email: '2fa@crypto.local',
        password: hashedPassword,
        role: 'user',
        status: 'active',
        twoFactorEnabled: true,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '2fa@crypto.local',
          password: 'Secr3t!Password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('requires2FA', true);
      expect(res.body.data).toHaveProperty('preAuthToken');
    });

    it('rejects login with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('Secr3t!Password123', 10);
      await firestoreService.create('users', {
        email: 'wrongpass@crypto.local',
        password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@crypto.local',
          password: 'WrongPassword!999',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 when HTTP-Only refresh cookie is missing', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.statusCode).toBe(401);
    });

    it('rotates refresh token and issues new access token when valid cookie is presented', async () => {
      await firestoreService.create('users', {
        id: 'usr-refresh-1',
        email: 'refresh@crypto.local',
        role: 'user',
        status: 'active',
      });

      const { rawToken } = await tokenService.createRefreshTokenDoc('usr-refresh-1');

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${rawToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears refresh token cookie and returns 200 OK', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
