const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const firestoreService = require('../services/firestoreService');
const emailService = require('../services/emailService');
const tokenService = require('../services/tokenService');
const twoFactorService = require('../services/twoFactorService');
const config = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } = require('../utils/ApiError');
const validate = require('../middleware/validate');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, verifyEmailRules, resendVerificationRules } = require('../middleware/validationRules');
const verifyAccessToken = require('../middleware/authMiddleware');

// -------------------- Register --------------------
router.post('/register', validate(registerRules), asyncHandler(async (req, res) => {
  const { email, mobile, password, firstName, lastName, fullName } = req.body;

  const userEmail = email ? email.toLowerCase().trim() : null;
  const userMobile = mobile ? String(mobile).trim() : null;

  if (!userEmail && !userMobile) {
    throw new BadRequestError('Email or mobile number is required');
  }

  // 1. Check if user already exists
  if (userEmail) {
    const existingEmail = await firestoreService.getWhere('users', 'email', '==', userEmail);
    if (existingEmail.length > 0) {
      throw new BadRequestError('Email address already registered');
    }
  }

  if (userMobile) {
    const existingMobile = await firestoreService.getWhere('users', 'mobile', '==', userMobile);
    if (existingMobile.length > 0) {
      throw new BadRequestError('Mobile number already registered');
    }
  }

  // Parse names
  let userFirstName = firstName || '';
  let userLastName = lastName || '';
  if (!userFirstName && fullName) {
    const parts = fullName.trim().split(' ');
    userFirstName = parts[0];
    userLastName = parts.slice(1).join(' ') || '';
  }

  // 2. Hash password and save to Firestore
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = (userEmail && userEmail.includes('admin')) ? 'admin' : 'user';

  const newUser = await firestoreService.create('users', {
    email: userEmail || `${userMobile}@nexustrade.io`,
    mobile: userMobile || null,
    password: hashedPassword,
    firstName: userFirstName || 'Trader',
    lastName: userLastName || '',
    fullName: fullName || `${userFirstName} ${userLastName}`.trim(),
    role: userRole,
    status: 'active',
    kycStatus: 'not_submitted',
    kycLevel: 'Unverified',
    twoFactorEnabled: false,
    isEmailVerified: false,
  });

  // Generate initial email verification record
  if (userEmail) {
    const initCode = String(Math.floor(100000 + Math.random() * 900000));
    const initHashedToken = tokenService.hashToken(initCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await firestoreService.create(
      'email_verifications',
      {
        userId: newUser.id,
        email: userEmail,
        token: initHashedToken,
        expiresAt,
        used: false,
        createdAt: new Date().toISOString(),
      },
      initHashedToken
    );

    // Dispatch Verification Email
    emailService.sendVerificationEmail({
      to: userEmail,
      code: initCode,
      name: newUser.fullName || `${userFirstName} ${userLastName}`.trim(),
    }).catch((err) => console.error('Registration email verification error:', err));
  }

  // 3. Create initial wallet
  await firestoreService.create('wallets', {
    user: newUser.id,
    balances: [
      { coin: 'USD', available: 100000, locked: 0 },
      { coin: 'USDT', available: 100000, locked: 0 },
      { coin: 'BTC', available: 0, locked: 0 },
      { coin: 'ETH', available: 0, locked: 0 },
    ],
  });

  // If user is admin, mandatory 2FA setup is required
  if (newUser.role === 'admin') {
    const preAuthToken = tokenService.generatePreAuthToken(newUser.id);
    const userData = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName,
      mobile: newUser.mobile,
      role: newUser.role,
      kycStatus: newUser.kycStatus,
      twoFactorEnabled: false,
    };
    return ApiResponse.created(res, {
      requires2FA: true,
      setupRequired: true,
      preAuthToken,
      user: userData,
    }, 'Admin account created. 2FA setup is mandatory before accessing admin features.');
  }

  // Standard User Registration -> Dual-Token Generation
  const accessToken = tokenService.generateAccessToken(newUser);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.socket?.remoteAddress || 'Unknown';

  const refreshTokenObj = await tokenService.createRefreshTokenDoc(
    newUser.id,
    null,
    userAgent,
    ipAddress
  );

  tokenService.setRefreshCookie(res, refreshTokenObj.rawToken);

  const userData = {
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    fullName: newUser.fullName,
    mobile: newUser.mobile,
    role: newUser.role,
    kycStatus: newUser.kycStatus,
    twoFactorEnabled: false,
  };

  return ApiResponse.created(res, { accessToken, user: userData }, 'User registered successfully');
}));

// -------------------- Login --------------------
router.post('/login', validate(loginRules), asyncHandler(async (req, res) => {
  const { email, mobile, password } = req.body;

  const userEmail = email ? email.toLowerCase().trim() : null;
  const userMobile = mobile ? String(mobile).trim() : null;

  if (!userEmail && !userMobile) {
    throw new BadRequestError('Email or mobile is required');
  }

  // 1. Find user in Firestore
  let users = [];
  if (userEmail) {
    users = await firestoreService.getWhere('users', 'email', '==', userEmail);
  }
  if (users.length === 0 && userMobile) {
    users = await firestoreService.getWhere('users', 'mobile', '==', userMobile);
  }

  if (users.length === 0) {
    throw new BadRequestError('Invalid credentials');
  }

  const user = users[0];

  // Check if account is suspended/deactivated
  if (user.status === 'suspended' || user.status === 'banned' || user.status === 'deactivated') {
    throw new UnauthorizedError('Account access has been restricted');
  }

  // 2. Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new BadRequestError('Invalid credentials');
  }

  // 3. 2FA Check
  const is2FARequired = user.role === 'admin' || user.twoFactorEnabled === true;

  if (is2FARequired) {
    const setupRequired = user.role === 'admin' && !user.twoFactorEnabled;
    const preAuthToken = tokenService.generatePreAuthToken(user.id);

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      mobile: user.mobile,
      role: user.role,
      kycStatus: user.kycStatus || 'not_submitted',
      twoFactorEnabled: !!user.twoFactorEnabled,
    };

    // Return ONLY pre-auth token (NO access token, NO refresh cookie)
    return ApiResponse.success(res, {
      requires2FA: true,
      setupRequired,
      preAuthToken,
      user: userData,
    }, '2FA verification required');
  }

  // 4. Standard Dual-Token Generation for non-2FA regular users
  const accessToken = tokenService.generateAccessToken(user);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.socket?.remoteAddress || 'Unknown';

  const refreshTokenObj = await tokenService.createRefreshTokenDoc(
    user.id,
    null,
    userAgent,
    ipAddress
  );

  tokenService.setRefreshCookie(res, refreshTokenObj.rawToken);

  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    mobile: user.mobile,
    role: user.role,
    kycStatus: user.kycStatus || 'not_submitted',
    twoFactorEnabled: false,
  };

  return ApiResponse.success(res, { accessToken, user: userData }, 'Logged in successfully');
}));

// -------------------- 2FA Login Verification --------------------
router.post('/2fa/login-verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
  const preAuthToken = req.body.preAuthToken || tokenFromHeader;

  if (!preAuthToken) {
    throw new UnauthorizedError('Pre-auth token required');
  }

  const decoded = tokenService.verifyPreAuthToken(preAuthToken);
  const userId = decoded.id;

  const rateKey = `2fa_${userId}_${req.ip}`;
  if (twoFactorService.isRateLimited(rateKey)) {
    throw new ForbiddenError('Too many failed 2FA verification attempts. Please try again after 15 minutes.');
  }

  const user = await firestoreService.getById('users', userId);
  if (!user) {
    throw new NotFoundError('User account not found');
  }

  const { code, recoveryCode } = req.body;
  let isVerified = false;

  if (code) {
    isVerified = twoFactorService.verifyTOTP(code, user.twoFactorSecret);
  } else if (recoveryCode) {
    const hashedInput = twoFactorService.hashRecoveryCode(recoveryCode);
    const codesArray = user.twoFactorRecoveryCodes || [];
    const codeIndex = codesArray.indexOf(hashedInput);

    if (codeIndex !== -1) {
      isVerified = true;
      // Remove used recovery code hash (single use enforced!)
      const updatedCodes = codesArray.filter((_, idx) => idx !== codeIndex);
      await firestoreService.update('users', user.id, { twoFactorRecoveryCodes: updatedCodes });
    }
  } else {
    throw new BadRequestError('Authenticator code or recovery code is required');
  }

  if (!isVerified) {
    twoFactorService.recordFailedAttempt(rateKey);
    throw new BadRequestError('Invalid 2FA authenticator code or recovery code');
  }

  // Verification successful -> Reset rate limiter
  twoFactorService.resetRateLimit(rateKey);

  // Issue full Access Token + Refresh Token Cookie
  const accessToken = tokenService.generateAccessToken(user);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.socket?.remoteAddress || 'Unknown';

  const refreshTokenObj = await tokenService.createRefreshTokenDoc(
    user.id,
    null,
    userAgent,
    ipAddress
  );

  tokenService.setRefreshCookie(res, refreshTokenObj.rawToken);

  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    mobile: user.mobile,
    role: user.role,
    kycStatus: user.kycStatus || 'not_submitted',
    twoFactorEnabled: true,
  };

  return ApiResponse.success(res, { accessToken, user: userData }, '2FA verification successful');
}));

// -------------------- 2FA Setup Init --------------------
router.post('/2fa/setup-init', asyncHandler(async (req, res) => {
  let userId = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      userId = decoded.id;
    } catch {
      throw new UnauthorizedError('Invalid authentication token');
    }
  } else if (req.body.preAuthToken) {
    const decoded = tokenService.verifyPreAuthToken(req.body.preAuthToken);
    userId = decoded.id;
  }

  if (!userId) {
    throw new UnauthorizedError('Authentication token required');
  }

  const user = await firestoreService.getById('users', userId);
  if (!user) throw new NotFoundError('User account not found');

  const { secret, qrCodeUrl } = await twoFactorService.generateSecret(user.email);
  await firestoreService.update('users', userId, { twoFactorTempSecret: secret });

  return ApiResponse.success(res, { secret, qrCodeUrl }, '2FA setup initialized');
}));

// -------------------- 2FA Setup Verify --------------------
router.post('/2fa/setup-verify', asyncHandler(async (req, res) => {
  const { code, preAuthToken } = req.body;
  let userId = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      userId = decoded.id;
    } catch {
      throw new UnauthorizedError('Invalid authentication token');
    }
  } else if (preAuthToken) {
    const decoded = tokenService.verifyPreAuthToken(preAuthToken);
    userId = decoded.id;
  }

  if (!userId) {
    throw new UnauthorizedError('Authentication token required');
  }

  const user = await firestoreService.getById('users', userId);
  if (!user) throw new NotFoundError('User account not found');

  const tempSecret = user.twoFactorTempSecret;
  if (!tempSecret) {
    throw new BadRequestError('2FA setup not initialized. Please request setup QR code first.');
  }

  const isValid = twoFactorService.verifyTOTP(code, tempSecret);
  if (!isValid) {
    throw new BadRequestError('Invalid 6-digit authenticator code');
  }

  // Generate 8 one-time recovery codes
  const { rawCodes, hashedCodes } = twoFactorService.generateRecoveryCodes();

  await firestoreService.update('users', userId, {
    twoFactorEnabled: true,
    twoFactorSecret: tempSecret,
    twoFactorTempSecret: null,
    twoFactorRecoveryCodes: hashedCodes,
    twoFactorEnabledAt: new Date().toISOString(),
  });

  const updatedUser = { ...user, twoFactorEnabled: true };

  // If completing setup with pre-auth token (e.g., admin setup on login), issue full session tokens!
  let sessionData = null;
  if (preAuthToken || req.body.isLoginSetup) {
    const accessToken = tokenService.generateAccessToken(updatedUser);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket?.remoteAddress || 'Unknown';

    const refreshTokenObj = await tokenService.createRefreshTokenDoc(
      updatedUser.id,
      null,
      userAgent,
      ipAddress
    );

    tokenService.setRefreshCookie(res, refreshTokenObj.rawToken);
    sessionData = { accessToken };
  }

  const userData = {
    id: updatedUser.id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    fullName: updatedUser.fullName || `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
    role: updatedUser.role,
    kycStatus: updatedUser.kycStatus || 'not_submitted',
    twoFactorEnabled: true,
  };

  return ApiResponse.success(res, {
    recoveryCodes: rawCodes,
    user: userData,
    ...(sessionData ? { accessToken: sessionData.accessToken } : {}),
  }, '2FA activated successfully');
}));

// -------------------- Forgot Password (POST /api/auth/forgot-password) --------------------
router.post('/forgot-password', validate(forgotPasswordRules), asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userEmail = email.toLowerCase().trim();

  const users = await firestoreService.getWhere('users', 'email', '==', userEmail);
  if (users.length === 0) {
    return ApiResponse.success(res, null, 'If that email address exists in our system, a password reset link has been generated');
  }

  const user = users[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = tokenService.hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await firestoreService.create(
    'password_resets',
    {
      userId: user.id,
      token: hashedResetToken,
      expiresAt,
      used: false,
    },
    hashedResetToken
  );

  // Dispatch Password Reset Email
  emailService.sendPasswordResetEmail({
    to: user.email,
    resetToken,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  }).catch((err) => console.error('Forgot password email dispatch error:', err));

  return ApiResponse.success(
    res,
    { resetToken },
    'If that email address exists in our system, a password reset link has been generated'
  );
}));

// -------------------- Reset Password (POST /api/auth/reset-password) --------------------
router.post('/reset-password', validate(resetPasswordRules), asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedResetToken = tokenService.hashToken(token);
  const resetDoc = await firestoreService.getById('password_resets', hashedResetToken);

  if (!resetDoc || resetDoc.used) {
    throw new BadRequestError('Invalid or expired password reset token');
  }

  if (new Date(resetDoc.expiresAt) < new Date()) {
    throw new BadRequestError('Password reset token expired');
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  await firestoreService.update('users', resetDoc.userId, { password: newHashedPassword });
  await firestoreService.update('password_resets', resetDoc.id, { used: true });

  // Dispatch Password Change Security Alert Email
  const user = await firestoreService.getById('users', resetDoc.userId);
  if (user && user.email) {
    emailService.sendPasswordChangeAlertEmail({
      to: user.email,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      ip: req.ip || req.socket?.remoteAddress || 'Unknown',
      timestamp: new Date().toISOString(),
    }).catch((err) => console.error('Reset password email security alert error:', err));
  }

  await tokenService.revokeAllUserTokens(resetDoc.userId);
  tokenService.clearRefreshCookie(res);

  return ApiResponse.success(res, null, 'Password reset successfully. Please log in with your new password.');
}));

// -------------------- Verify Email (POST /api/auth/verify-email) --------------------
router.post('/verify-email', validate(verifyEmailRules), asyncHandler(async (req, res) => {
  const { code, email } = req.body;
  const cleanCode = String(code).trim();
  const userEmail = email ? email.toLowerCase().trim() : null;

  const hashedToken = tokenService.hashToken(cleanCode);

  let verificationRecord = await firestoreService.getById('email_verifications', hashedToken);

  if (!verificationRecord) {
    const records = await firestoreService.getWhere('email_verifications', 'token', '==', hashedToken);
    if (records.length > 0) {
      verificationRecord = records[0];
    }
  }

  if (!verificationRecord || verificationRecord.used) {
    throw new BadRequestError('Invalid or already used verification code');
  }

  if (new Date(verificationRecord.expiresAt) < new Date()) {
    throw new BadRequestError('Verification code has expired. Please request a new code.');
  }

  let userId = verificationRecord.userId;
  let user = null;
  if (userId) {
    user = await firestoreService.getById('users', userId);
  }
  if (!user && userEmail) {
    const users = await firestoreService.getWhere('users', 'email', '==', userEmail);
    if (users.length > 0) user = users[0];
  }

  if (!user) {
    throw new NotFoundError('User account associated with this verification code was not found');
  }

  const timestamp = new Date().toISOString();
  await firestoreService.update('users', user.id, {
    isEmailVerified: true,
    emailVerifiedAt: timestamp,
  });

  await firestoreService.update('email_verifications', verificationRecord.id, {
    used: true,
    verifiedAt: timestamp,
  });

  return ApiResponse.success(res, { isEmailVerified: true, email: user.email }, 'Email address verified successfully!');
}));

// -------------------- Resend Verification (POST /api/auth/resend-verification) --------------------
router.post('/resend-verification', validate(resendVerificationRules), asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userEmail = email.toLowerCase().trim();

  const users = await firestoreService.getWhere('users', 'email', '==', userEmail);
  if (users.length === 0) {
    return ApiResponse.success(res, null, 'If that email address exists in our system, a verification code has been sent.');
  }

  const user = users[0];

  if (user.isEmailVerified) {
    return ApiResponse.success(res, { isEmailVerified: true }, 'Email address is already verified.');
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const hashedToken = tokenService.hashToken(verificationCode);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await firestoreService.create(
    'email_verifications',
    {
      userId: user.id,
      email: user.email,
      token: hashedToken,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    },
    hashedToken
  );

  // Dispatch Resend Verification Email
  emailService.sendVerificationEmail({
    to: user.email,
    code: verificationCode,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  }).catch((err) => console.error('Resend verification email error:', err));

  return ApiResponse.success(
    res,
    { verificationCode },
    'Verification code generated and sent successfully.'
  );
}));

// -------------------- Refresh Token (POST /api/auth/refresh) --------------------
router.post('/refresh', asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.socket?.remoteAddress || 'Unknown';

  if (!rawToken) {
    tokenService.clearRefreshCookie(res);
    throw new UnauthorizedError('Refresh token missing');
  }

  try {
    const result = await tokenService.rotateRefreshToken(rawToken, userAgent, ipAddress);

    if (result.rawRefreshToken) {
      tokenService.setRefreshCookie(res, result.rawRefreshToken);
    }

    const userData = {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      fullName: result.user.fullName || `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim(),
      role: result.user.role,
      kycStatus: result.user.kycStatus || 'not_submitted',
      twoFactorEnabled: !!result.user.twoFactorEnabled,
    };

    return ApiResponse.success(res, { accessToken: result.accessToken, user: userData }, 'Token refreshed successfully');
  } catch (err) {
    tokenService.clearRefreshCookie(res);
    throw err;
  }
}));

// -------------------- Logout (POST /api/auth/logout) --------------------
router.post('/logout', asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;

  if (rawToken) {
    const tokenId = tokenService.hashToken(rawToken);
    const tokenDoc = await firestoreService.getById('refreshTokens', tokenId);
    if (tokenDoc && tokenDoc.familyId) {
      await tokenService.revokeFamily(tokenDoc.familyId);
    }
  }

  tokenService.clearRefreshCookie(res);
  return ApiResponse.success(res, null, 'Logged out successfully');
}));

// -------------------- Logout Everywhere (POST /api/auth/logout-all) --------------------
router.post('/logout-all', verifyAccessToken, asyncHandler(async (req, res) => {
  await tokenService.revokeAllUserTokens(req.user.id);
  tokenService.clearRefreshCookie(res);
  return ApiResponse.success(res, null, 'Logged out from all devices successfully');
}));

module.exports = router;