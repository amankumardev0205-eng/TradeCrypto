const request = require('supertest');
const app = require('../../server');
const firestoreService = require('../../services/firestoreService');
const tokenService = require('../../services/tokenService');

describe('Admin API Integration & RBAC Tests (/api/admin)', () => {
  let regularToken;
  let adminWithout2FAToken;
  let validAdminToken;

  beforeEach(async () => {
    firestoreService.clearMemoryStore();

    // 1. Regular non-admin user
    await firestoreService.create('users', {
      id: 'usr-regular',
      email: 'regular@crypto.local',
      role: 'user',
      status: 'active',
      twoFactorEnabled: false,
    });
    regularToken = tokenService.generateAccessToken({ id: 'usr-regular', role: 'user' });

    // 2. Admin user without 2FA enabled
    await firestoreService.create('users', {
      id: 'usr-admin-no2fa',
      email: 'adminno2fa@crypto.local',
      role: 'admin',
      status: 'active',
      twoFactorEnabled: false,
    });
    adminWithout2FAToken = tokenService.generateAccessToken({ id: 'usr-admin-no2fa', role: 'admin' });

    // 3. Admin user with 2FA enabled
    await firestoreService.create('users', {
      id: 'usr-admin-valid',
      email: 'adminvalid@crypto.local',
      role: 'admin',
      status: 'active',
      twoFactorEnabled: true,
    });
    validAdminToken = tokenService.generateAccessToken({ id: 'usr-admin-valid', role: 'admin' });
  });

  describe('RBAC & 2FA Enforcement', () => {
    it('returns 401 when no token is supplied', async () => {
      const res = await request(app).get('/api/admin/summary');
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 Forbidden when non-admin user attempts admin access', async () => {
      const res = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Admin privileges required');
    });

    it('returns 403 Forbidden when admin user has not enabled mandatory 2FA', async () => {
      const res = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${adminWithout2FAToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('2FA setup is mandatory for admin accounts');
    });
  });

  describe('Admin Endpoints (with valid 2FA Admin)', () => {
    it('GET /api/admin/summary returns system KPI metrics', async () => {
      const res = await request(app)
        .get('/api/admin/summary')
        .set('Authorization', `Bearer ${validAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('systemStatus', 'ONLINE');
    });

    it('GET /api/admin/users returns paginated list of users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${validAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/admin/audit-logs returns administrative audit trail', async () => {
      const res = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${validAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/admin/reports/export downloads RFC-4180 CSV report', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export?type=users')
        .set('Authorization', `Bearer ${validAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('"User ID","Full Name"');
    });
  });
});
