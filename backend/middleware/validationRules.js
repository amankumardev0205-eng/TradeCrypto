const { body, param, query } = require('express-validator');
const passwordStrengthRules = require('../validators/password.validator');

// Auth Rules
const registerRules = [
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('mobile')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .withMessage('Mobile number must be a valid string'),
  passwordStrengthRules('password'),
  body('fullName')
    .optional()
    .isString()
    .trim()
    .escape(),
];

const loginRules = [
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('token')
    .notEmpty()
    .withMessage('Password reset token is required'),
  passwordStrengthRules('newPassword'),
];

const verifyEmailRules = [
  body('code')
    .notEmpty()
    .withMessage('Verification code is required')
    .isString()
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const resendVerificationRules = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];


// User Profile Rules
const updateProfileRules = [
  body('firstName').optional().isString().trim(),
  body('lastName').optional().isString().trim(),
  body('fullName').optional().isString().trim(),
  body('mobile').optional().isString().trim(),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  passwordStrengthRules('newPassword'),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm new password is required'),
];

// KYC Rules
const kycUploadRules = [
  body('bankName')
    .optional()
    .isString()
    .trim(),
  body('accountNumber')
    .optional()
    .isString()
    .trim(),
  body('ifsc')
    .optional()
    .isString()
    .trim(),
];

const adminKycVerifyRules = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('status')
    .isIn(['approved', 'rejected', 'verified', 'under_review'])
    .withMessage('Invalid status value'),
];

const adminKycApproveRules = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
];

const adminKycRejectRules = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('rejectionReason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isString()
    .trim(),
];

// Wallet Rules
const depositRules = [
  body('coin')
    .notEmpty()
    .withMessage('Coin symbol is required')
    .isString()
    .trim(),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Deposit amount must be a positive number'),
];

const withdrawRules = [
  body('coin')
    .notEmpty()
    .withMessage('Coin symbol is required')
    .isString()
    .trim(),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Withdrawal amount must be a positive number'),
  body('address')
    .notEmpty()
    .withMessage('Withdrawal wallet address is required')
    .isString()
    .trim(),
];

// Trade Rules
const marketOrderRules = [
  body('pair')
    .notEmpty()
    .withMessage('Trading pair is required (e.g. BTC/USDT)'),
  body('side')
    .isIn(['buy', 'sell'])
    .withMessage('Order side must be buy or sell'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Order amount must be a positive number'),
];

const limitOrderRules = [
  body('pair')
    .notEmpty()
    .withMessage('Trading pair is required (e.g. BTC/USDT)'),
  body('side')
    .isIn(['buy', 'sell'])
    .withMessage('Order side must be buy or sell'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Limit order price must be a positive number'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Order amount must be a positive number'),
];

const cancelOrderRules = [
  param('id')
    .notEmpty()
    .withMessage('Order ID parameter is required'),
];

// Crypto Market Rules
const cryptoMarketRules = [
  query('currency')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Currency parameter must be a valid string (e.g. usd, eur, btc)'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page parameter must be an integer greater than or equal to 1'),
  query('perPage')
    .optional()
    .isInt({ min: 1, max: 250 })
    .withMessage('perPage parameter must be an integer between 1 and 250'),
  query('order')
    .optional()
    .isIn(['market_cap_desc', 'market_cap_asc', 'volume_desc', 'volume_asc', 'id_asc', 'id_desc', 'gecko_desc', 'gecko_asc'])
    .withMessage('Invalid order parameter'),
  query('sparkline')
    .optional()
    .isBoolean()
    .withMessage('Sparkline parameter must be boolean'),
];

const cryptoHistoryRules = [
  param('coinId')
    .notEmpty()
    .withMessage('Coin ID parameter is required (e.g. bitcoin)')
    .isString()
    .trim(),
  query('currency')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Currency parameter must be a valid string (e.g. usd, eur, btc)'),
  query('days')
    .optional()
    .isString()
    .trim()
    .isIn(['1', '7', '14', '30', '90', '180', '365', 'max'])
    .withMessage('Days parameter must be one of: 1, 7, 14, 30, 90, 180, 365, max'),
];

const transactionQueryRules = [
  query('type')
    .optional()
    .isIn(['buy', 'sell', 'deposit', 'withdrawal', 'fee', 'all'])
    .withMessage('Type parameter must be one of: buy, sell, deposit, withdrawal, fee, all'),
  query('coin')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Coin parameter must be a valid coin symbol'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit parameter must be an integer between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page parameter must be an integer >= 1'),
];

const buyTradeRules = [
  body('pair')
    .notEmpty()
    .withMessage('Trading pair is required (e.g. BTC/USDT)'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Buy amount must be a positive number'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
];

const sellTradeRules = [
  body('pair')
    .notEmpty()
    .withMessage('Trading pair is required (e.g. BTC/USDT)'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Sell amount must be a positive number'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
];

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
  resendVerificationRules,
  updateProfileRules,
  changePasswordRules,
  kycUploadRules,
  adminKycVerifyRules,
  adminKycApproveRules,
  adminKycRejectRules,
  depositRules,
  withdrawRules,
  marketOrderRules,
  limitOrderRules,
  cancelOrderRules,
  cryptoMarketRules,
  cryptoHistoryRules,
  transactionQueryRules,
  buyTradeRules,
  sellTradeRules,
};
