const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const firestoreService = require('../services/firestoreService');
const livenessService = require('../services/livenessService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { BadRequestError, NotFoundError, ForbiddenError, UnauthorizedError } = require('../utils/ApiError');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const verifyOwnership = require('../middleware/verifyOwnership');
const {
  kycUploadRules,
  adminKycVerifyRules,
  adminKycApproveRules,
  adminKycRejectRules,
} = require('../middleware/validationRules');

// Private directory for storing KYC documents securely (not served via static Express middleware)
const privateKycDir = path.join(__dirname, '../private-uploads/kyc');
if (!fs.existsSync(privateKycDir)) {
  fs.mkdirSync(privateKycDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, privateKycDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '') || '.webm';
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

/**
 * @route   GET /api/kyc/liveness/session
 * @desc    Generate anti-replay randomized prompt & session token
 * @access  Private
 */
router.get(
  '/liveness/session',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const session = livenessService.generateSession(userId);

    return ApiResponse.success(res, session, 'Liveness verification session initialized');
  })
);

/**
 * @route   POST /api/kyc/liveness/upload
 * @desc    Upload recorded MediaRecorder video blob with anti-replay verification
 * @access  Private
 */
router.post(
  '/liveness/upload',
  authMiddleware,
  upload.single('video'),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new BadRequestError('Liveness sessionId is required');
    }

    const verification = livenessService.verifySession(sessionId, userId);
    if (!verification.valid) {
      throw new BadRequestError(verification.reason || 'Liveness anti-replay session verification failed');
    }

    const kycVideoUrl = req.file ? req.file.path : null;
    const timestamp = new Date().toISOString();

    const updatedUser = await firestoreService.update('users', userId, {
      kycVideoUrl,
      kycStatus: 'under_review',
      livenessSessionId: sessionId,
      livenessCode: verification.session.code,
      livenessPromptText: verification.session.promptText,
      kycSubmittedAt: timestamp,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    // Create audit record
    await firestoreService.create('kyc_audits', {
      userId,
      action: 'liveness_video_uploaded',
      kycVideoUrl,
      sessionId,
      code: verification.session.code,
      timestamp,
    });

    return ApiResponse.success(
      res,
      {
        userId,
        kycStatus: 'under_review',
        videoRecorded: true,
      },
      'Liveness verification video uploaded successfully'
    );
  })
);

// User KYC Submission Upload (Standard Form Upload)
router.post(
  '/upload',
  upload.single('video'),
  validate(kycUploadRules),
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const { bankName, accountNumber, ifsc } = req.body;
    const kycVideoUrl = req.file ? req.file.path : null;

    const timestamp = new Date().toISOString();
    const updatedUser = await firestoreService.update('users', userId, {
      bankDetails: { bankName, accountNumber, ifsc },
      kycVideoUrl: kycVideoUrl || user.kycVideoUrl,
      kycStatus: 'under_review',
      kycSubmittedAt: timestamp,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    // Create KYC submission audit entry
    await firestoreService.create('kyc_audits', {
      userId,
      action: 'submitted',
      kycVideoUrl,
      bankDetails: { bankName, accountNumber, ifsc },
      timestamp,
    });

    return ApiResponse.success(res, { userId, kycStatus: 'under_review' }, 'KYC submitted successfully');
  })
);

// Authenticated Stream for Audit Record KYC Media
router.get(
  '/media/audit/:auditId',
  authMiddleware,
  verifyOwnership('kyc_audits', 'userId', 'auditId'),
  asyncHandler(async (req, res) => {
    const audit = req.resource;
    if (!audit.kycVideoUrl) {
      throw new NotFoundError('KYC media file not recorded');
    }

    const absolutePath = path.resolve(audit.kycVideoUrl);
    const resolvedPrivateDir = path.resolve(privateKycDir);
    if (!absolutePath.startsWith(resolvedPrivateDir)) {
      throw new ForbiddenError('Invalid file path');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError('KYC media file does not exist on disk');
    }

    res.sendFile(absolutePath);
  })
);

// Authenticated Stream for User Profile KYC Media
router.get(
  '/media/user/:userId',
  authMiddleware,
  verifyOwnership('users', 'id', 'userId'),
  asyncHandler(async (req, res) => {
    const user = req.resource;
    if (!user.kycVideoUrl) {
      throw new NotFoundError('User KYC media file not recorded');
    }

    const absolutePath = path.resolve(user.kycVideoUrl);
    const resolvedPrivateDir = path.resolve(privateKycDir);
    if (!absolutePath.startsWith(resolvedPrivateDir)) {
      throw new ForbiddenError('Invalid file path');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError('KYC media file does not exist on disk');
    }

    res.sendFile(absolutePath);
  })
);

// User KYC History
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestError('User ID required');

    const history = await firestoreService.getWhere('kyc_audits', 'userId', '==', String(userId));
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return ApiResponse.success(res, history, 'KYC history retrieved successfully');
  })
);

// Admin Pending Review List
router.get(
  '/admin/pending',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const pendingUsers = await firestoreService.getWhere('users', 'kycStatus', '==', 'under_review');
    return ApiResponse.success(res, pendingUsers, 'Pending KYC applications retrieved');
  })
);

// Admin Status Verification
router.post(
  '/admin/verify',
  adminMiddleware,
  validate(adminKycVerifyRules),
  asyncHandler(async (req, res) => {
    const { userId, status } = req.body;

    const updated = await firestoreService.update('users', userId, { kycStatus: status });
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return ApiResponse.success(res, { userId, kycStatus: status }, `KYC Status updated to ${status}`);
  })
);

// Admin KYC Approval
router.post(
  '/admin/approve',
  adminMiddleware,
  validate(adminKycApproveRules),
  asyncHandler(async (req, res) => {
    const { userId, notes } = req.body;
    const reviewerId = req.user?.id || 'admin';
    const timestamp = new Date().toISOString();

    const updated = await firestoreService.update('users', userId, {
      kycStatus: 'approved',
      kycLevel: 'Level 2 Verified',
      kycApprovedAt: timestamp,
      kycApprovedBy: reviewerId,
    });

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    await firestoreService.create('kyc_audits', {
      userId,
      action: 'approved',
      reviewerId,
      notes: notes || 'KYC Documents approved',
      timestamp,
    });

    return ApiResponse.success(res, { userId, kycStatus: 'approved', kycLevel: 'Level 2 Verified' }, 'KYC Approved successfully');
  })
);

// Admin KYC Rejection
router.post(
  '/admin/reject',
  adminMiddleware,
  validate(adminKycRejectRules),
  asyncHandler(async (req, res) => {
    const { userId, rejectionReason } = req.body;
    const reviewerId = req.user?.id || 'admin';
    const timestamp = new Date().toISOString();

    const updated = await firestoreService.update('users', userId, {
      kycStatus: 'rejected',
      kycRejectionReason: rejectionReason,
      kycRejectedAt: timestamp,
      kycRejectedBy: reviewerId,
    });

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    await firestoreService.create('kyc_audits', {
      userId,
      action: 'rejected',
      reviewerId,
      rejectionReason,
      timestamp,
    });

    return ApiResponse.success(res, { userId, kycStatus: 'rejected', rejectionReason }, 'KYC Rejected successfully');
  })
);

module.exports = router;