const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const firestoreService = require('../services/firestoreService');
const adminService = require('../services/adminService');
const auditService = require('../services/auditService');
const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/ApiError');
const validate = require('../middleware/validate');
const { adminKycVerifyRules, adminKycRejectRules } = require('../middleware/validationRules');

const privateKycDir = path.resolve(__dirname, '../private-uploads/kyc');

/**
 * @route   GET /api/admin/health
 * @desc    Admin subsystem status check
 * @access  Private, Admin
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    return ApiResponse.success(
      res,
      {
        status: 'HEALTHY',
        adminUser: req.adminUser ? req.adminUser.email : req.user.email,
        timestamp: new Date().toISOString(),
      },
      'Admin subsystem operational'
    );
  })
);

/**
 * @route   GET /api/admin/summary
 * @desc    Get summary KPI metrics of the platform
 * @access  Private, Admin
 */
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const summary = await adminService.getSystemSummary();
    return ApiResponse.success(res, summary, 'System summary retrieved successfully');
  })
);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get detailed platform analytics including NAV, trends, holdings distribution & KPIs
 * @access  Private, Admin
 */
router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const { timeframe } = req.query;
    const analytics = await adminService.getAnalyticsData({ timeframe });
    return ApiResponse.success(res, analytics, 'Platform analytics retrieved successfully');
  })
);

/**
 * @route   GET /api/admin/reports/data
 * @desc    Get report dataset and columns for admin preview
 * @access  Private, Admin
 */
router.get(
  '/reports/data',
  asyncHandler(async (req, res) => {
    const { type = 'users', startDate, endDate, status, role, coin, side, pair, search } = req.query;
    const report = await reportService.generateReport(type, {
      startDate,
      endDate,
      status,
      role,
      coin,
      side,
      pair,
      search,
    });
    return ApiResponse.success(res, report, 'Report data generated successfully');
  })
);

/**
 * @route   GET /api/admin/reports/export
 * @desc    Export report directly as RFC-4180 CSV file attachment
 * @access  Private, Admin
 */
router.get(
  '/reports/export',
  asyncHandler(async (req, res) => {
    const { type = 'users', startDate, endDate, status, role, coin, side, pair, search } = req.query;
    const report = await reportService.generateReport(type, {
      startDate,
      endDate,
      status,
      role,
      coin,
      side,
      pair,
      search,
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `nexustrade-${type}-report-${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(report.csvData);
  })
);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get paginated administrative audit logs with search, action, date range filters
 * @access  Private, Admin
 */
router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const { action, search, startDate, endDate, page, limit } = req.query;
    const result = await auditService.getAuditLogs({
      action,
      search,
      startDate,
      endDate,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    });

    return ApiResponse.success(res, result.items, 'Audit logs retrieved successfully', 200, result.pagination);
  })
);

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated users list with search & filters
 * @access  Private, Admin
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { search, role, status, kycStatus, page, limit } = req.query;
    const result = await adminService.getUsers({
      search,
      role,
      status,
      kycStatus,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    });

    return ApiResponse.success(res, result.items, 'Users list retrieved successfully', 200, result.pagination);
  })
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed user profile, holdings, and activity
 * @access  Private, Admin
 */
router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userDetail = await adminService.getUserById(id);

    if (!userDetail) {
      throw new NotFoundError('User not found');
    }

    return ApiResponse.success(res, userDetail, 'User detail retrieved successfully');
  })
);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status (active, suspended, deactivated)
 * @access  Private, Admin
 */
router.patch(
  '/users/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status || !['active', 'suspended', 'deactivated'].includes(String(status).toLowerCase())) {
      throw new BadRequestError('Invalid status. Allowed values: active, suspended, deactivated');
    }

    const updatedUser = await adminService.updateUserStatus(id, status, reason, req.adminUser);

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return ApiResponse.success(res, updatedUser, `User account status updated to ${status}`);
  })
);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role (user, admin)
 * @access  Private, Admin
 */
router.patch(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(String(role).toLowerCase())) {
      throw new BadRequestError('Invalid role. Allowed values: user, admin');
    }

    const updatedUser = await adminService.updateUserRole(id, role, req.adminUser);

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return ApiResponse.success(res, updatedUser, `User role updated to ${role}`);
  })
);

/**
 * @route   GET /api/admin/kyc/requests
 * @desc    Get paginated KYC request list with tabbed status & search filters
 * @access  Private, Admin
 */
router.get(
  '/kyc/requests',
  asyncHandler(async (req, res) => {
    const { status, search, page, limit } = req.query;
    const result = await adminService.getKycRequests({
      status: status || 'pending',
      search: search || '',
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    });

    return ApiResponse.success(res, result.items, 'KYC request list retrieved successfully', 200, result.pagination);
  })
);

/**
 * @route   GET /api/admin/kyc/requests/:userId
 * @desc    Get detailed KYC application & audit history for user
 * @access  Private, Admin
 */
router.get(
  '/kyc/requests/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userDetail = await adminService.getUserById(userId);

    if (!userDetail) {
      throw new NotFoundError('User not found');
    }

    const kycHistory = await adminService.getKycAuditHistory(userId);

    return ApiResponse.success(
      res,
      {
        user: userDetail,
        kycHistory,
      },
      'KYC application details retrieved successfully'
    );
  })
);

/**
 * @route   GET /api/admin/kyc/:id/video
 * @desc    Secure backend proxy stream for user KYC liveness video (No direct public URLs exposed)
 * @access  Private, Admin
 */
router.get(
  '/kyc/:id/video',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await firestoreService.getById('users', id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.kycVideoUrl) {
      throw new NotFoundError('KYC liveness video not recorded for this applicant');
    }

    const absolutePath = path.resolve(user.kycVideoUrl);
    if (!absolutePath.startsWith(privateKycDir)) {
      throw new ForbiddenError('Access denied: Video file outside authorized storage path');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError('Video file does not exist on disk');
    }

    // Set appropriate video content headers and send file securely
    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = ext === '.mp4' ? 'video/mp4' : 'video/webm';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    return res.sendFile(absolutePath);
  })
);

/**
 * @route   POST /api/admin/kyc/approve
 * @desc    One-click KYC approval handler
 * @access  Private, Admin
 */
router.post(
  '/kyc/approve',
  asyncHandler(async (req, res) => {
    const { userId, notes } = req.body;
    if (!userId) {
      throw new BadRequestError('userId is required');
    }

    const updatedUser = await adminService.approveKyc(userId, notes, req.adminUser);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return ApiResponse.success(res, updatedUser, 'KYC approved successfully');
  })
);

/**
 * @route   POST /api/admin/kyc/reject
 * @desc    One-click KYC rejection handler with required rejectionReason
 * @access  Private, Admin
 */
router.post(
  '/kyc/reject',
  asyncHandler(async (req, res) => {
    const { userId, rejectionReason } = req.body;
    if (!userId) {
      throw new BadRequestError('userId is required');
    }
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new BadRequestError('Rejection reason is required');
    }

    const updatedUser = await adminService.rejectKyc(userId, rejectionReason, req.adminUser);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return ApiResponse.success(res, updatedUser, 'KYC rejected successfully');
  })
);

/**
 * @route   GET /api/admin/kyc/audits/:userId
 * @desc    Get KYC audit history timeline for user
 * @access  Private, Admin
 */
router.get(
  '/kyc/audits/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const history = await adminService.getKycAuditHistory(userId);
    return ApiResponse.success(res, history, 'KYC audit history retrieved successfully');
  })
);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get administrative audit logs
 * @access  Private, Admin
 */
router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const { adminId, action, targetId, limit } = req.query;
    const logs = await auditService.getAuditLogs({
      adminId,
      action,
      targetId,
      limit: parseInt(limit, 10) || 20,
    });

    return ApiResponse.success(res, logs, 'Audit logs retrieved successfully');
  })
);

module.exports = router;