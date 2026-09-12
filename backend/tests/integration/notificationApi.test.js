const request = require('supertest');
const app = require('../../server');
const firestoreService = require('../../services/firestoreService');
const notificationService = require('../../services/notificationService');
const tokenService = require('../../services/tokenService');

describe('Notification API Integration Tests (/api/notifications)', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    firestoreService.clearMemoryStore();

    const user = await firestoreService.create('users', {
      id: 'usr-notif-1',
      email: 'notif@crypto.local',
      role: 'user',
      status: 'active',
    });

    userId = user.id;
    userToken = tokenService.generateAccessToken({ id: userId, role: 'user' });
  });

  describe('GET /api/notifications', () => {
    it('returns unauthenticated 401 when no token is present', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.statusCode).toBe(401);
    });

    it('returns notifications array and unread count for authenticated user', async () => {
      await notificationService.createNotification({
        userId,
        type: 'SYSTEM',
        title: 'Welcome',
        message: 'Welcome to CryptoMarket!',
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('notifications');
      expect(res.body.data.notifications).toHaveLength(1);
      expect(res.body.data).toHaveProperty('unreadCount', 1);
    });
  });

  describe('PATCH /api/notifications/:id/read & read-all', () => {
    it('marks single notification as read', async () => {
      const n = await notificationService.createNotification({
        userId,
        type: 'WALLET',
        title: 'Deposit Received',
        message: '0.5 BTC deposited to your wallet',
      });

      const res = await request(app)
        .patch(`/api/notifications/${n.id}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.read).toBe(true);
    });

    it('marks all notifications as read for current user', async () => {
      await notificationService.createNotification({ userId, title: 'N1', message: 'M1' });
      await notificationService.createNotification({ userId, title: 'N2', message: 'M2' });

      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('markedCount', 2);
    });
  });
});
