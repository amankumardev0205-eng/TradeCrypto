const request = require('supertest');
const app = require('../../server');
const firestoreService = require('../../services/firestoreService');
const tokenService = require('../../services/tokenService');
const bcrypt = require('bcryptjs');

describe('User API Integration Tests (/api/user)', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    firestoreService.clearMemoryStore();

    const hashedPassword = await bcrypt.hash('Secr3t!Password123', 10);
    const user = await firestoreService.create('users', {
      id: 'usr-userapi-1',
      email: 'userapi@crypto.local',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: 'user',
      status: 'active',
      kycStatus: 'not_submitted',
      twoFactorEnabled: false,
    });

    userId = user.id;
    userToken = tokenService.generateAccessToken({ id: userId, role: 'user' });
  });

  describe('GET /api/user/profile', () => {
    it('returns 401 Unauthorized if no Authorization header is sent', async () => {
      const res = await request(app).get('/api/user/profile');
      expect(res.statusCode).toBe(401);
    });

    it('returns authenticated user profile object without sensitive fields', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('email', 'userapi@crypto.local');
      expect(res.body.data).toHaveProperty('firstName', 'John');
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('twoFactorSecret');
    });
  });

  describe('PUT /api/user/profile', () => {
    it('updates user profile fields successfully', async () => {
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Johnny',
          lastName: 'Smith',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('firstName', 'Johnny');
      expect(res.body.data).toHaveProperty('lastName', 'Smith');

      const updated = await firestoreService.getById('users', userId);
      expect(updated.firstName).toBe('Johnny');
    });
  });

  describe('PUT /api/user/change-password', () => {
    it('rejects password change if current password is wrong', async () => {
      const res = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword!123',
          newPassword: 'BrandNewPassword!99',
          confirmNewPassword: 'BrandNewPassword!99',
        });

      expect(res.statusCode).toBe(400);
    });

    it('changes password successfully when current password is correct', async () => {
      const res = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'Secr3t!Password123',
          newPassword: 'BrandNewPassword!99',
          confirmNewPassword: 'BrandNewPassword!99',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });
});
