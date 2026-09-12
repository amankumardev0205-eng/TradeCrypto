const firestoreService = require('./firestoreService');
const auditService = require('./auditService');
const notificationService = require('./notificationService');
const emailService = require('./emailService');
const { paginateArray } = require('../utils/pagination');

/**
 * Core Modular Admin Service handling user management, KYC, metrics, and audit log processing.
 */
class AdminService {
  /**
   * Summary overview of platform metrics for admin header cards.
   */
  async getSystemSummary() {
    const users = await firestoreService.getAll('users');
    const orders = await firestoreService.getAll('orders');
    const transactions = await firestoreService.getAll('transactions');

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status !== 'deactivated' && u.status !== 'suspended' && u.status !== 'SUSPENDED').length;
    const verifiedUsers = users.filter((u) => u.kycStatus === 'APPROVED' || u.kycStatus === 'approved').length;
    const pendingKyc = users.filter((u) => u.kycStatus === 'PENDING' || u.kycStatus === 'pending' || u.kycStatus === 'under_review').length;

    const totalVolume = orders.reduce((sum, o) => sum + (Number(o.price || 0) * Number(o.amount || 0)), 0);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      pendingKyc,
      totalOrders: orders.length,
      totalTransactions: transactions.length,
      totalVolume,
      systemStatus: 'ONLINE',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Query users list with search, filter, and pagination.
   */
  async getUsers({ search = '', role = '', status = '', kycStatus = '', page = 1, limit = 10 } = {}) {
    let users = await firestoreService.getAll('users');

    // Remove sensitive fields
    users = users.map(({ password, refreshToken, ...u }) => u);

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
      );
    }

    if (role) {
      users = users.filter((u) => u.role === role);
    }

    if (status) {
      users = users.filter((u) => String(u.status).toLowerCase() === status.toLowerCase());
    }

    if (kycStatus) {
      users = users.filter((u) => String(u.kycStatus).toLowerCase() === kycStatus.toLowerCase());
    }

    // Sort by createdAt descending
    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return paginateArray(users, page, limit);
  }

  /**
   * Fetch single user details including wallet, order stats, transaction stats, and audit logs.
   */
  async getUserById(userId) {
    const user = await firestoreService.getById('users', userId);
    if (!user) return null;

    const { password, refreshToken, ...sanitizedUser } = user;

    // Fetch user wallet holdings
    const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
    const wallet = wallets.length > 0 ? wallets[0] : { balances: [] };

    // Fetch user orders & transactions count
    const orders = await firestoreService.getWhere('orders', 'userId', '==', userId);
    const transactions = await firestoreService.getWhere('transactions', 'userId', '==', userId);

    // Fetch user audit history
    const auditLogs = await auditService.getAuditLogs({ targetId: userId, limit: 20 });

    return {
      ...sanitizedUser,
      wallet,
      stats: {
        totalOrders: orders.length,
        totalTransactions: transactions.length,
      },
      auditLogs,
    };
  }

  /**
   * Update user status (active, suspended, deactivated - soft deletion)
   */
  async updateUserStatus(userId, status, reason = '', adminUser = null) {
    const user = await firestoreService.getById('users', userId);
    if (!user) return null;

    const normalizedStatus = String(status).toLowerCase();
    const updatedUser = await firestoreService.update('users', userId, {
      status: normalizedStatus,
      statusUpdatedAt: new Date().toISOString(),
      statusReason: reason || null,
    });

    // Log admin audit action
    const actionType = normalizedStatus === 'deactivated' ? 'USER_DEACTIVATED' : 'USER_STATUS_UPDATE';
    await auditService.logAction({
      action: actionType,
      adminId: adminUser ? adminUser.id : 'system',
      adminEmail: adminUser ? adminUser.email : 'system@crypto.local',
      targetId: userId,
      details: {
        previousStatus: user.status,
        newStatus: normalizedStatus,
        reason,
      },
    });

    const { password, refreshToken, ...sanitized } = updatedUser;
    return sanitized;
  }

  /**
   * Update user role (user, admin)
   */
  async updateUserRole(userId, role, adminUser = null) {
    const user = await firestoreService.getById('users', userId);
    if (!user) return null;

    const updatedUser = await firestoreService.update('users', userId, {
      role,
      roleUpdatedAt: new Date().toISOString(),
    });

    await auditService.logAction({
      action: 'USER_ROLE_UPDATE',
      adminId: adminUser ? adminUser.id : 'system',
      adminEmail: adminUser ? adminUser.email : 'system@crypto.local',
      targetId: userId,
      details: {
        previousRole: user.role,
        newRole: role,
      },
    });

    const { password, refreshToken, ...sanitized } = updatedUser;
    return sanitized;
  }

  /**
   * Query KYC Requests Queue with status filter (pending, approved, rejected, all) and search.
   */
  async getKycRequests({ status = 'pending', search = '', page = 1, limit = 10 } = {}) {
    let users = await firestoreService.getAll('users');

    // Filter users with KYC submissions or status
    let kycList = users.filter((u) => u.kycStatus || u.kycSubmittedAt || u.bankDetails);

    if (status && status !== 'all') {
      const targetStatus = status.toLowerCase();
      kycList = kycList.filter((u) => {
        const s = String(u.kycStatus || '').toLowerCase();
        if (targetStatus === 'pending' || targetStatus === 'under_review') {
          return s === 'pending' || s === 'under_review';
        }
        if (targetStatus === 'approved') {
          return s === 'approved';
        }
        if (targetStatus === 'rejected') {
          return s === 'rejected';
        }
        return s === targetStatus;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      kycList = kycList.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
      );
    }

    // Sort by submission timestamp or creation timestamp
    kycList.sort((a, b) => new Date(b.kycSubmittedAt || b.createdAt || 0) - new Date(a.kycSubmittedAt || a.createdAt || 0));

    return paginateArray(kycList, page, limit);
  }

  /**
   * One-click Approve KYC application.
   */
  async approveKyc(userId, notes = '', adminUser = null) {
    const user = await firestoreService.getById('users', userId);
    if (!user) return null;

    const timestamp = new Date().toISOString();
    const reviewerId = adminUser ? adminUser.id : 'admin';
    const reviewerEmail = adminUser ? adminUser.email : 'system@crypto.local';

    const updatedUser = await firestoreService.update('users', userId, {
      kycStatus: 'APPROVED',
      kycLevel: 'Level 2 Verified',
      kycApprovedAt: timestamp,
      kycApprovedBy: reviewerId,
    });

    // Write to kyc_audits collection
    await firestoreService.create('kyc_audits', {
      userId,
      action: 'approved',
      reviewerId,
      reviewerEmail,
      notes: notes || 'KYC Documents & Identity Approved',
      timestamp,
    });

    // Write to admin_audit_logs collection
    await auditService.logAction({
      action: 'KYC_APPROVE',
      adminId: reviewerId,
      adminEmail: reviewerEmail,
      targetId: userId,
      details: {
        notes,
        previousStatus: user.kycStatus,
      },
    });

    // Dispatch in-app notification to applicant
    notificationService.createNotification({
      userId,
      type: 'KYC',
      title: 'KYC Level 2 Verified',
      message: 'Your identity verification documents have been approved by platform compliance.',
      metadata: { notes },
    }).catch((err) => console.error('KYC approval notification error:', err));

    // Dispatch KYC Approval Email
    if (user && user.email) {
      emailService.sendKycStatusEmail({
        to: user.email,
        status: 'APPROVED',
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      }).catch((err) => console.error('KYC approval email error:', err));
    }

    const { password, refreshToken, ...sanitized } = updatedUser;
    return sanitized;
  }

  /**
   * One-click Reject KYC application (Requires mandatory rejection reason).
   */
  async rejectKyc(userId, rejectionReason, adminUser = null) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Rejection reason is required');
    }

    const user = await firestoreService.getById('users', userId);
    if (!user) return null;

    const timestamp = new Date().toISOString();
    const reviewerId = adminUser ? adminUser.id : 'admin';
    const reviewerEmail = adminUser ? adminUser.email : 'system@crypto.local';

    const updatedUser = await firestoreService.update('users', userId, {
      kycStatus: 'REJECTED',
      kycRejectionReason: rejectionReason.trim(),
      kycRejectedAt: timestamp,
      kycRejectedBy: reviewerId,
    });

    // Write to kyc_audits collection
    await firestoreService.create('kyc_audits', {
      userId,
      action: 'rejected',
      reviewerId,
      reviewerEmail,
      rejectionReason: rejectionReason.trim(),
      timestamp,
    });

    // Write to admin_audit_logs collection
    await auditService.logAction({
      action: 'KYC_REJECT',
      adminId: reviewerId,
      adminEmail: reviewerEmail,
      targetId: userId,
      details: {
        rejectionReason: rejectionReason.trim(),
        previousStatus: user.kycStatus,
      },
    });

    // Dispatch in-app notification to applicant
    notificationService.createNotification({
      userId,
      type: 'KYC',
      title: 'KYC Submission Update',
      message: `Your KYC application requires attention. Reason: ${rejectionReason.trim()}`,
      metadata: { rejectionReason: rejectionReason.trim() },
    }).catch((err) => console.error('KYC rejection notification error:', err));

    // Dispatch KYC Rejection Email
    if (user && user.email) {
      emailService.sendKycStatusEmail({
        to: user.email,
        status: 'REJECTED',
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        reason: rejectionReason.trim(),
      }).catch((err) => console.error('KYC rejection email error:', err));
    }

    const { password, refreshToken, ...sanitized } = updatedUser;
    return sanitized;
  }

  /**
   * Fetch complete KYC audit history timeline for a user.
   */
  async getKycAuditHistory(userId) {
    const history = await firestoreService.getWhere('kyc_audits', 'userId', '==', String(userId));
    history.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
    return history;
  }

  /**
   * Log administrative audit action wrapper.
   */
  async logAdminAction(params) {
    return await auditService.logAction(params);
  }

  /**
   * Aggregate platform metrics, time-series volume/registrations, NAV, and asset holdings breakdown.
   */
  async getAnalyticsData({ timeframe = '30d' } = {}) {
    const users = await firestoreService.getAll('users');
    const orders = await firestoreService.getAll('orders');
    const transactions = await firestoreService.getAll('transactions');
    const wallets = await firestoreService.getAll('wallets');

    // Baseline coin price references for USD NAV estimation
    const priceMap = {
      USD: 1.0,
      USDT: 1.0,
      BTC: 65000.0,
      ETH: 3500.0,
      SOL: 145.0,
      XRP: 0.55,
      ADA: 0.45,
      DOGE: 0.12,
    };

    // 1. KPI Aggregation
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status !== 'deactivated' && u.status !== 'suspended' && u.status !== 'SUSPENDED').length;
    const verifiedUsers = users.filter((u) => u.kycStatus === 'APPROVED' || u.kycStatus === 'approved').length;
    const pendingKyc = users.filter((u) => u.kycStatus === 'PENDING' || u.kycStatus === 'pending' || u.kycStatus === 'under_review').length;
    const rejectedKyc = users.filter((u) => u.kycStatus === 'REJECTED' || u.kycStatus === 'rejected').length;

    const totalOrders = orders.length;
    const buyOrders = orders.filter((o) => String(o.side || o.type).toUpperCase() === 'BUY').length;
    const sellOrders = orders.filter((o) => String(o.side || o.type).toUpperCase() === 'SELL').length;

    const totalTradingVolume = orders.reduce((sum, o) => sum + (Number(o.price || 0) * Number(o.amount || o.quantity || 0)), 0);

    const deposits = transactions.filter((t) => String(t.type).toLowerCase() === 'deposit');
    const withdrawals = transactions.filter((t) => String(t.type).toLowerCase() === 'withdrawal' || String(t.type).toLowerCase() === 'withdraw');

    const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.total || t.amount || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Number(t.total || t.amount || 0), 0);

    // 2. Asset Holdings Distribution & Net Asset Value (NAV)
    const assetHoldings = {};
    let platformNavUsd = 0;

    wallets.forEach((w) => {
      (w.balances || []).forEach((b) => {
        const coin = String(b.coin).toUpperCase();
        const totalAmount = Number(b.available || 0) + Number(b.locked || 0);
        if (!assetHoldings[coin]) {
          assetHoldings[coin] = { coin, amount: 0, usdValue: 0 };
        }
        assetHoldings[coin].amount += totalAmount;
      });
    });

    Object.keys(assetHoldings).forEach((coin) => {
      const price = priceMap[coin] || 1.0;
      assetHoldings[coin].usdValue = assetHoldings[coin].amount * price;
      platformNavUsd += assetHoldings[coin].usdValue;
    });

    const holdingsList = Object.values(assetHoldings).map((h) => ({
      ...h,
      percentage: platformNavUsd > 0 ? Number(((h.usdValue / platformNavUsd) * 100).toFixed(2)) : 0,
    }));
    holdingsList.sort((a, b) => b.usdValue - a.usdValue);

    // 3. Time Series Trends Binned by Date
    const daysCount = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : timeframe === 'all' ? 180 : 30;
    const now = new Date();
    const trendData = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = `${d.getMonth() + 1}/${d.getDate()}`;

      // Cumulative user count up to dateStr
      const usersUpToDate = users.filter((u) => {
        const created = u.createdAt ? new Date(u.createdAt) : null;
        return created && created <= d;
      }).length;

      // Volume executed on dateStr
      const volumeOnDate = orders
        .filter((o) => {
          const created = o.createdAt ? new Date(o.createdAt) : null;
          return created && created.toISOString().split('T')[0] === dateStr;
        })
        .reduce((sum, o) => sum + Number(o.price || 0) * Number(o.amount || o.quantity || 0), 0);

      // Deposit amount on dateStr
      const depositOnDate = deposits
        .filter((t) => {
          const created = t.timestamp || t.createdAt ? new Date(t.timestamp || t.createdAt) : null;
          return created && created.toISOString().split('T')[0] === dateStr;
        })
        .reduce((sum, t) => sum + Number(t.total || t.amount || 0), 0);

      trendData.push({
        date: dateStr,
        label: displayLabel,
        users: usersUpToDate || Math.max(1, totalUsers - i),
        volume: Number(volumeOnDate.toFixed(2)),
        deposits: Number(depositOnDate.toFixed(2)),
      });
    }

    return {
      timeframe,
      summary: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        pendingKyc,
        rejectedKyc,
        totalOrders,
        buyOrders,
        sellOrders,
        totalTradingVolume: Number(totalTradingVolume.toFixed(2)),
        totalDeposits: Number(totalDeposits.toFixed(2)),
        totalWithdrawals: Number(totalWithdrawals.toFixed(2)),
        platformNavUsd: Number(platformNavUsd.toFixed(2)),
        verificationRate: totalUsers > 0 ? Number(((verifiedUsers / totalUsers) * 100).toFixed(1)) : 0,
        activeRate: totalUsers > 0 ? Number(((activeUsers / totalUsers) * 100).toFixed(1)) : 0,
      },
      holdings: holdingsList,
      trend: trendData,
      updatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AdminService();
