const firestoreService = require('./firestoreService');

/**
 * Core RFC-4180 Compliant CSV Generator & Administrative Report Engine.
 */
class ReportService {
  /**
   * Escape and format a single CSV cell value per RFC-4180 standard.
   */
  escapeCSVCell(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }
    return `"${str}"`;
  }

  /**
   * Convert array of objects to RFC-4180 CSV text string.
   * @param {Array<{key: string, header: string}>} columns
   * @param {Array<Object>} data
   */
  convertToCSV(columns, data) {
    if (!columns || columns.length === 0) return '';

    const headerRow = columns.map((col) => this.escapeCSVCell(col.header || col.key)).join(',');
    const dataRows = (data || []).map((row) =>
      columns.map((col) => this.escapeCSVCell(row[col.key])).join(',')
    );

    return [headerRow, ...dataRows].join('\r\n');
  }

  /**
   * Filter records array by Date Range (startDate, endDate) checking candidate field.
   */
  filterByDateRange(records, startDate, endDate, dateField = 'createdAt') {
    if (!startDate && !endDate) return records;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return records.filter((r) => {
      const rawDate = r[dateField] || r.createdAt || r.timestamp;
      if (!rawDate) return true;
      const d = new Date(rawDate);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  /**
   * 1. User Management Report Builder
   */
  async buildUserReport({ startDate = '', endDate = '', status = '', role = '', search = '' } = {}) {
    let users = await firestoreService.getAll('users');
    let filtered = this.filterByDateRange(users, startDate, endDate, 'createdAt');

    if (status) {
      filtered = filtered.filter((u) => String(u.status).toLowerCase() === status.toLowerCase());
    }

    if (role) {
      filtered = filtered.filter((u) => String(u.role).toLowerCase() === role.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const records = filtered.map((u) => ({
      id: u.id || '',
      fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Trader',
      email: u.email || '',
      role: u.role || 'user',
      status: u.status || 'active',
      kycStatus: u.kycStatus || 'not_submitted',
      twoFactorEnabled: u.twoFactorEnabled ? 'ENABLED' : 'DISABLED',
      isEmailVerified: u.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED',
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
    }));

    const columns = [
      { key: 'id', header: 'User ID' },
      { key: 'fullName', header: 'Full Name' },
      { key: 'email', header: 'Email Address' },
      { key: 'role', header: 'Role' },
      { key: 'status', header: 'Account Status' },
      { key: 'kycStatus', header: 'KYC Status' },
      { key: 'twoFactorEnabled', header: '2FA Protection' },
      { key: 'isEmailVerified', header: 'Email Verification' },
      { key: 'createdAt', header: 'Registration Date' },
    ];

    const csvData = this.convertToCSV(columns, records);

    return {
      type: 'users',
      totalRecords: records.length,
      columns,
      records,
      csvData,
    };
  }

  /**
   * 2. KYC Submissions & Compliance Report Builder
   */
  async buildKycReport({ startDate = '', endDate = '', status = '', search = '' } = {}) {
    let users = await firestoreService.getAll('users');
    let kycUsers = users.filter((u) => u.kycStatus || u.kycSubmittedAt || u.bankDetails);
    let filtered = this.filterByDateRange(kycUsers, startDate, endDate, 'kycSubmittedAt');

    if (status && status !== 'all') {
      filtered = filtered.filter((u) => String(u.kycStatus).toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.kycSubmittedAt || b.createdAt || 0) - new Date(a.kycSubmittedAt || a.createdAt || 0));

    const records = filtered.map((u) => ({
      userId: u.id || '',
      fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Trader',
      email: u.email || '',
      kycLevel: u.kycLevel || 'Unverified',
      kycStatus: u.kycStatus || 'PENDING',
      submittedAt: u.kycSubmittedAt || u.createdAt || '',
      reviewedAt: u.kycApprovedAt || u.kycRejectedAt || '',
      reviewerId: u.kycApprovedBy || u.kycRejectedBy || 'N/A',
      rejectionReason: u.kycRejectionReason || 'N/A',
    }));

    const columns = [
      { key: 'userId', header: 'User ID' },
      { key: 'fullName', header: 'Full Name' },
      { key: 'email', header: 'Email Address' },
      { key: 'kycLevel', header: 'KYC Level' },
      { key: 'kycStatus', header: 'KYC Verification Status' },
      { key: 'submittedAt', header: 'Submission Date' },
      { key: 'reviewedAt', header: 'Review Date' },
      { key: 'reviewerId', header: 'Reviewer ID' },
      { key: 'rejectionReason', header: 'Rejection Reason' },
    ];

    const csvData = this.convertToCSV(columns, records);

    return {
      type: 'kyc',
      totalRecords: records.length,
      columns,
      records,
      csvData,
    };
  }

  /**
   * 3. Financial Transactions Report Builder (Deposits & Withdrawals)
   */
  async buildFinancialReport({ startDate = '', endDate = '', type = '', coin = '', search = '' } = {}) {
    let transactions = await firestoreService.getAll('transactions');
    let filtered = this.filterByDateRange(transactions, startDate, endDate, 'timestamp');

    if (type) {
      filtered = filtered.filter((t) => String(t.type).toLowerCase() === type.toLowerCase());
    }

    if (coin) {
      filtered = filtered.filter((t) => String(t.coin).toUpperCase() === coin.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.user && String(t.user).toLowerCase().includes(q)) ||
          (t.coin && t.coin.toLowerCase().includes(q)) ||
          (t.txHash && t.txHash.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

    let totalAmountUsd = 0;
    const records = filtered.map((t) => {
      const amt = Number(t.total || t.amount || 0);
      totalAmountUsd += amt;

      return {
        id: t.id || '',
        userId: t.user || t.userId || '',
        type: String(t.type || 'deposit').toUpperCase(),
        coin: String(t.coin || 'USD').toUpperCase(),
        amount: amt,
        fee: Number(t.fee || 0),
        status: String(t.status || 'COMPLETED').toUpperCase(),
        txHash: t.txHash || 'N/A',
        address: t.address || 'N/A',
        timestamp: t.timestamp || t.createdAt || '',
      };
    });

    const columns = [
      { key: 'id', header: 'Transaction ID' },
      { key: 'userId', header: 'User ID' },
      { key: 'type', header: 'Type' },
      { key: 'coin', header: 'Asset Coin' },
      { key: 'amount', header: 'Amount' },
      { key: 'fee', header: 'Fee' },
      { key: 'status', header: 'Status' },
      { key: 'txHash', header: 'Transaction Hash' },
      { key: 'address', header: 'Destination Address' },
      { key: 'timestamp', header: 'Date & Time' },
    ];

    const csvData = this.convertToCSV(columns, records);

    return {
      type: 'financial',
      totalRecords: records.length,
      totalAmountUsd: Number(totalAmountUsd.toFixed(2)),
      columns,
      records,
      csvData,
    };
  }

  /**
   * 4. Trading Activity & Orders Report Builder
   */
  async buildTradingReport({ startDate = '', endDate = '', side = '', pair = '', search = '' } = {}) {
    let orders = await firestoreService.getAll('orders');
    let filtered = this.filterByDateRange(orders, startDate, endDate, 'createdAt');

    if (side) {
      filtered = filtered.filter((o) => String(o.side || o.type).toLowerCase() === side.toLowerCase());
    }

    if (pair) {
      filtered = filtered.filter((o) => String(o.pair).toUpperCase() === pair.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          (o.userId && String(o.userId).toLowerCase().includes(q)) ||
          (o.pair && o.pair.toLowerCase().includes(q)) ||
          (o.id && o.id.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    let totalVolumeUsd = 0;
    const records = filtered.map((o) => {
      const price = Number(o.price || 0);
      const qty = Number(o.amount || o.quantity || 0);
      const total = price * qty;
      totalVolumeUsd += total;

      return {
        id: o.id || '',
        userId: o.userId || o.user || '',
        pair: o.pair || 'BTC/USDT',
        side: String(o.side || o.type || 'BUY').toUpperCase(),
        price: price,
        quantity: qty,
        total: Number(total.toFixed(2)),
        fee: Number(o.fee || (total * 0.002).toFixed(2)),
        status: String(o.status || 'COMPLETED').toUpperCase(),
        timestamp: o.createdAt || new Date().toISOString(),
      };
    });

    const columns = [
      { key: 'id', header: 'Order ID' },
      { key: 'userId', header: 'User ID' },
      { key: 'pair', header: 'Trading Pair' },
      { key: 'side', header: 'Side (BUY/SELL)' },
      { key: 'price', header: 'Execution Price ($)' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'total', header: 'Total Value ($)' },
      { key: 'fee', header: 'Trading Fee ($)' },
      { key: 'status', header: 'Order Status' },
      { key: 'timestamp', header: 'Order Timestamp' },
    ];

    const csvData = this.convertToCSV(columns, records);

    return {
      type: 'trading',
      totalRecords: records.length,
      totalVolumeUsd: Number(totalVolumeUsd.toFixed(2)),
      columns,
      records,
      csvData,
    };
  }

  /**
   * Main Report Dispatcher
   */
  async generateReport(reportType, filters = {}) {
    const type = String(reportType).toLowerCase();
    switch (type) {
      case 'users':
        return await this.buildUserReport(filters);
      case 'kyc':
        return await this.buildKycReport(filters);
      case 'financial':
      case 'financials':
      case 'transactions':
        return await this.buildFinancialReport(filters);
      case 'trading':
      case 'trades':
      case 'orders':
        return await this.buildTradingReport(filters);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

module.exports = new ReportService();
