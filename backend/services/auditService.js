const firestoreService = require('./firestoreService');
const { paginateArray } = require('../utils/pagination');

const AUDIT_COLLECTION = 'admin_audit_logs';

/**
 * Service for managing immutable administrative audit logs.
 */
const auditService = {
  /**
   * Log an administrative action.
   * @param {Object} params
   * @param {string} params.action - Descriptive action code e.g. USER_SUSPEND, KYC_APPROVE
   * @param {string} params.adminId - ID of the admin performing the action
   * @param {string} params.adminEmail - Email of the admin
   * @param {string} [params.targetId] - ID of target entity (e.g. user ID, KYC ID)
   * @param {Object} [params.details] - Arbitrary JSON context of the action
   * @param {string} [params.ipAddress] - IP address of the request
   */
  logAction: async ({ action, adminId, adminEmail, targetId = null, details = {}, ipAddress = null }) => {
    try {
      const logEntry = {
        action,
        adminId: String(adminId || 'system'),
        adminEmail: adminEmail || 'system@crypto.local',
        targetId: targetId ? String(targetId) : null,
        details,
        ipAddress: ipAddress || '127.0.0.1',
        createdAt: new Date().toISOString(),
      };

      return await firestoreService.create(AUDIT_COLLECTION, logEntry);
    } catch (err) {
      console.error('Failed to log admin action:', err);
      // Non-blocking fallback return for audit logging to prevent breaking admin flows
      return {
        id: `local-log-${Date.now()}`,
        action,
        adminId,
        adminEmail,
        targetId,
        details,
        createdAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch audit logs with search, action filtering, date range, and pagination.
   */
  getAuditLogs: async ({ adminId, action, targetId, search = '', startDate = '', endDate = '', page = 1, limit = 10 } = {}) => {
    try {
      let logs = await firestoreService.getAll(AUDIT_COLLECTION);

      if (adminId) {
        logs = logs.filter((log) => String(log.adminId).toLowerCase() === String(adminId).toLowerCase());
      }

      if (action && action !== 'all') {
        logs = logs.filter((log) => String(log.action).toLowerCase() === action.toLowerCase());
      }

      if (targetId) {
        logs = logs.filter((log) => String(log.targetId).toLowerCase() === String(targetId).toLowerCase());
      }

      if (startDate) {
        const start = new Date(startDate);
        logs = logs.filter((log) => new Date(log.createdAt) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        logs = logs.filter((log) => new Date(log.createdAt) <= end);
      }

      if (search) {
        const q = search.toLowerCase();
        logs = logs.filter(
          (log) =>
            (log.adminEmail && log.adminEmail.toLowerCase().includes(q)) ||
            (log.adminId && log.adminId.toLowerCase().includes(q)) ||
            (log.targetId && log.targetId.toLowerCase().includes(q)) ||
            (log.action && log.action.toLowerCase().includes(q)) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(q))
        );
      }

      // Sort by newest first
      logs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      return paginateArray(logs, page, limit);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      return paginateArray([], page, limit);
    }
  },
};

module.exports = auditService;
