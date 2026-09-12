const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const firestoreService = require('../services/firestoreService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const tokenService = require('../services/tokenService');
const twoFactorService = require('../services/twoFactorService');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../utils/ApiError');
const validate = require('../middleware/validate');
const { updateProfileRules, changePasswordRules } = require('../middleware/validationRules');

// -------------------- GET /api/user/profile --------------------
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const user = await firestoreService.getById('users', req.user.id);
  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  const { password, twoFactorSecret, twoFactorTempSecret, twoFactorRecoveryCodes, ...userProfile } = user;
  return ApiResponse.success(res, userProfile, 'Profile retrieved successfully');
}));

// -------------------- PUT /api/user/profile --------------------
router.put('/profile', authMiddleware, validate(updateProfileRules), asyncHandler(async (req, res) => {
  const { firstName, lastName, fullName, mobile } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (fullName !== undefined) updateData.fullName = fullName;
  if (mobile !== undefined) updateData.mobile = mobile;

  if (Object.keys(updateData).length === 0) {
    throw new BadRequestError('No profile fields provided for update');
  }

  const updatedUser = await firestoreService.update('users', userId, updateData);
  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  const { password, twoFactorSecret, twoFactorTempSecret, twoFactorRecoveryCodes, ...userProfile } = updatedUser;
  return ApiResponse.success(res, userProfile, 'Profile updated successfully');
}));

// -------------------- PUT /api/user/change-password --------------------
router.put('/change-password', authMiddleware, validate(changePasswordRules), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user.id;

  // 1. Verify confirmNewPassword matches newPassword
  if (newPassword !== confirmNewPassword) {
    throw new BadRequestError('New password and confirm password do not match');
  }

  // 2. Reject no-op password changes (newPassword === currentPassword)
  if (currentPassword === newPassword) {
    throw new BadRequestError('New password cannot be the same as your current password');
  }

  // 3. Fetch user and verify current password
  const user = await firestoreService.getById('users', userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestError('Current password does not match');
  }

  // 4. Hash new password and update user document
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  await firestoreService.update('users', userId, { password: newHashedPassword });

  // Dispatch SECURITY notification & Security Email
  notificationService.createNotification({
    userId,
    type: 'SECURITY',
    title: 'Security Alert: Password Changed',
    message: 'Your account password was updated successfully. All active sessions have been signed out.',
  }).catch((err) => console.error('Password change notification error:', err));

  if (user && user.email) {
    emailService.sendPasswordChangeAlertEmail({
      to: user.email,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      ip: req.ip || req.socket?.remoteAddress || 'Unknown',
      timestamp: new Date().toISOString(),
    }).catch((err) => console.error('Password change email alert error:', err));
  }

  // 5. SECURITY: Revoke all refresh token sessions across all devices & clear current cookie
  await tokenService.revokeAllUserTokens(userId);
  tokenService.clearRefreshCookie(res);

  // Return success message requiring user to log in again
  return ApiResponse.success(res, null, 'Password changed successfully. All active sessions have been logged out for security. Please log in again.');
}));

// -------------------- Disable 2FA (POST /api/user/2fa/disable) --------------------
router.post('/2fa/disable', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, code, recoveryCode } = req.body;
  const userId = req.user.id;

  if (!currentPassword) {
    throw new BadRequestError('Current password is required to disable 2FA');
  }

  const user = await firestoreService.getById('users', userId);
  if (!user) throw new NotFoundError('User account not found');

  if (!user.twoFactorEnabled) {
    throw new BadRequestError('2FA is not currently enabled for this account');
  }

  // Mandatory admin check: admins cannot disable 2FA
  if (user.role === 'admin') {
    throw new ForbiddenError('2FA is mandatory for admin accounts and cannot be disabled.');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestError('Current password does not match');
  }

  // Verify TOTP code or recovery code
  let isVerified = false;
  if (code) {
    isVerified = twoFactorService.verifyTOTP(code, user.twoFactorSecret);
  } else if (recoveryCode) {
    const hashedInput = twoFactorService.hashRecoveryCode(recoveryCode);
    isVerified = (user.twoFactorRecoveryCodes || []).includes(hashedInput);
  }

  if (!isVerified) {
    throw new BadRequestError('Invalid authenticator code or recovery code');
  }

  // Disable 2FA in Firestore
  await firestoreService.update('users', userId, {
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorTempSecret: null,
    twoFactorRecoveryCodes: [],
    twoFactorDisabledAt: new Date().toISOString(),
  });

  // Revoke refresh token sessions on 2FA disable for security
  await tokenService.revokeAllUserTokens(userId);
  tokenService.clearRefreshCookie(res);

  return ApiResponse.success(res, null, '2FA has been disabled successfully. Please log in again.');
}));

// -------------------- Regenerate Recovery Codes (POST /api/user/2fa/regenerate-recovery-codes) --------------------
router.post('/2fa/regenerate-recovery-codes', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, code } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !code) {
    throw new BadRequestError('Current password and authenticator code are required');
  }

  const user = await firestoreService.getById('users', userId);
  if (!user) throw new NotFoundError('User account not found');

  if (!user.twoFactorEnabled) {
    throw new BadRequestError('2FA is not enabled for this account');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestError('Current password does not match');
  }

  // Verify TOTP code
  const isVerified = twoFactorService.verifyTOTP(code, user.twoFactorSecret);
  if (!isVerified) {
    throw new BadRequestError('Invalid authenticator code');
  }

  // Generate 8 new recovery codes and overwrite previous hashes (invalidating old codes!)
  const { rawCodes, hashedCodes } = twoFactorService.generateRecoveryCodes();
  await firestoreService.update('users', userId, {
    twoFactorRecoveryCodes: hashedCodes,
    recoveryCodesRegeneratedAt: new Date().toISOString(),
  });

  return ApiResponse.success(res, { recoveryCodes: rawCodes }, 'New recovery codes generated successfully. Previous codes are now invalid.');
}));

// -------------------- POST /api/user/deactivate --------------------
router.post('/deactivate', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await firestoreService.update('users', userId, { status: 'deactivated' });
  await tokenService.revokeAllUserTokens(userId);
  tokenService.clearRefreshCookie(res);

  return ApiResponse.success(res, null, 'Account deactivated successfully');
}));

module.exports = router;
