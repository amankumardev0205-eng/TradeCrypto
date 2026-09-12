const auditService = require('../../services/auditService');
const notificationService = require('../../services/notificationService');
const livenessService = require('../../services/livenessService');
const reportService = require('../../services/reportService');
const adminService = require('../../services/adminService');
const firestoreService = require('../../services/firestoreService');

describe('Core Backend Services Unit Tests', () => {
  beforeEach(() => {
    firestoreService.clearMemoryStore();
  });

  describe('auditService', () => {
    it('creates immutable admin audit log entries', async () => {
      const log = await auditService.logAction({
        action: 'USER_SUSPEND',
        adminId: 'admin-1',
        adminEmail: 'admin@crypto.local',
        targetId: 'user-99',
        details: { reason: 'Policy violation' },
        ipAddress: '192.168.1.1',
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('USER_SUSPEND');
      expect(log.adminId).toBe('admin-1');
      expect(log.targetId).toBe('user-99');
    });

    it('queries and filters audit logs with pagination and search', async () => {
      await auditService.logAction({ action: 'KYC_APPROVE', adminId: 'admin-1', targetId: 'user-1' });
      await auditService.logAction({ action: 'KYC_REJECT', adminId: 'admin-2', targetId: 'user-2' });

      const res1 = await auditService.getAuditLogs({ action: 'KYC_APPROVE' });
      expect(res1.items).toHaveLength(1);
      expect(res1.items[0].targetId).toBe('user-1');

      const res2 = await auditService.getAuditLogs({ search: 'admin-2' });
      expect(res2.items).toHaveLength(1);
      expect(res2.items[0].action).toBe('KYC_REJECT');
    });
  });

  describe('notificationService', () => {
    it('creates in-app notifications and tracks unread count', async () => {
      const notif1 = await notificationService.createNotification({
        userId: 'user-100',
        type: 'SECURITY',
        title: 'New Login',
        message: 'New login detected from IP 127.0.0.1',
      });

      expect(notif1.userId).toBe('user-100');
      expect(notif1.read).toBe(false);

      const unread = await notificationService.getUnreadCount('user-100');
      expect(unread).toBe(1);

      const userNotifs = await notificationService.getUserNotifications('user-100');
      expect(userNotifs.notifications).toHaveLength(1);
      expect(userNotifs.unreadCount).toBe(1);
    });

    it('marks single and all notifications as read', async () => {
      const n1 = await notificationService.createNotification({ userId: 'user-200', title: 'T1', message: 'M1' });
      const n2 = await notificationService.createNotification({ userId: 'user-200', title: 'T2', message: 'M2' });

      await notificationService.markAsRead(n1.id, 'user-200');

      let unread = await notificationService.getUnreadCount('user-200');
      expect(unread).toBe(1);

      await notificationService.markAllAsRead('user-200');
      unread = await notificationService.getUnreadCount('user-200');
      expect(unread).toBe(0);
    });
  });

  describe('livenessService', () => {
    it('generates anti-replay liveness recording sessions', () => {
      const session = livenessService.generateSession('user-300');

      expect(session).toHaveProperty('sessionId');
      expect(session.userId).toBe('user-300');
      expect(session.promptText).toContain('Please state your full name');
      expect(session.code).toBeGreaterThanOrEqual(1000);
    });

    it('verifies valid session and consumes it to prevent replay attacks', () => {
      const session = livenessService.generateSession('user-400');
      const verify1 = livenessService.verifySession(session.sessionId, 'user-400');

      expect(verify1.valid).toBe(true);

      // Second verification attempt fails because session was consumed
      const verify2 = livenessService.verifySession(session.sessionId, 'user-400');
      expect(verify2.valid).toBe(false);
      expect(verify2.reason).toContain('Invalid or expired');
    });

    it('rejects session verification when user mismatch occurs', () => {
      const session = livenessService.generateSession('user-500');
      const verify = livenessService.verifySession(session.sessionId, 'user-600');

      expect(verify.valid).toBe(false);
      expect(verify.reason).toBe('Session user mismatch');
    });
  });

  describe('reportService RFC-4180 CSV Generator', () => {
    it('escapes CSV cells with double quotes and RFC-4180 rules', () => {
      expect(reportService.escapeCSVCell('normal')).toBe('"normal"');
      expect(reportService.escapeCSVCell('value, with comma')).toBe('"value, with comma"');
      expect(reportService.escapeCSVCell('value "with quotes"')).toBe('"value ""with quotes"""');
      expect(reportService.escapeCSVCell(null)).toBe('""');
    });

    it('converts array of objects into RFC-4180 compliant CSV string', () => {
      const columns = [
        { key: 'id', header: 'User ID' },
        { key: 'name', header: 'Name' },
      ];
      const data = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob, Smith' },
      ];

      const csv = reportService.convertToCSV(columns, data);
      expect(csv).toContain('"User ID","Name"');
      expect(csv).toContain('"1","Alice"');
      expect(csv).toContain('"2","Bob, Smith"');
    });

    it('builds user report with filtering and export format', async () => {
      await firestoreService.create('users', {
        id: 'u1',
        email: 'u1@test.com',
        fullName: 'User One',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      const report = await reportService.buildUserReport();
      expect(report.records).toHaveLength(1);
      expect(report.csvData).toContain('"u1@test.com"');
    });
  });

  describe('adminService', () => {
    it('calculates platform KPI summary correctly', async () => {
      await firestoreService.create('users', { id: 'u1', status: 'active', kycStatus: 'APPROVED' });
      await firestoreService.create('users', { id: 'u2', status: 'active', kycStatus: 'PENDING' });
      await firestoreService.create('orders', { id: 'o1', price: 100, amount: 2 });

      const summary = await adminService.getSystemSummary();
      expect(summary.totalUsers).toBe(2);
      expect(summary.verifiedUsers).toBe(1);
      expect(summary.pendingKyc).toBe(1);
      expect(summary.totalVolume).toBe(200);
      expect(summary.systemStatus).toBe('ONLINE');
    });
  });
});
