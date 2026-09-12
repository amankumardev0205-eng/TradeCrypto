const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const firestoreService = require('../services/firestoreService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');
const require2FA = require('../middleware/require2FAMiddleware');
const checkIdempotency = require('../middleware/idempotency');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { BadRequestError, NotFoundError } = require('../utils/ApiError');
const validate = require('../middleware/validate');
const { depositRules, withdrawRules } = require('../middleware/validationRules');
const money = require('../utils/money');

// Get wallet balance
router.get('/balance', authMiddleware, asyncHandler(async (req, res) => {
  const wallets = await firestoreService.getWhere('wallets', 'user', '==', req.user.id);
  let wallet = wallets[0];

  if (!wallet) {
    wallet = await firestoreService.create('wallets', {
      user: req.user.id,
      balances: [
        { coin: 'USD', available: 100000, locked: 0 },
        { coin: 'USDT', available: 100000, locked: 0 },
        { coin: 'BTC', available: 0, locked: 0 },
        { coin: 'ETH', available: 0, locked: 0 },
      ],
    });
  }

  const balances = {};
  (wallet.balances || []).forEach((b) => {
    balances[b.coin] = {
      available: b.available,
      locked: b.locked,
      total: b.available + b.locked,
    };
  });

  return ApiResponse.success(res, balances, 'Wallet balance retrieved');
}));

// Simulated deposit
router.post('/deposit', authMiddleware, checkIdempotency, validate(depositRules), asyncHandler(async (req, res) => {
  const { coin, amount } = req.body;
  const numAmount = Number(amount);
  const coinSymbol = coin.toUpperCase();

  const result = await firestoreService.executeAtomicTransaction(async (txn) => {
    const wallets = await firestoreService.getWhere('wallets', 'user', '==', req.user.id);
    let wallet = wallets[0];

    if (!wallet) {
      wallet = await txn.create('wallets', {
        user: req.user.id,
        balances: [{ coin: coinSymbol, available: numAmount, locked: 0 }],
      });
    } else {
      let balance = wallet.balances.find((b) => b.coin === coinSymbol);
      if (!balance) {
        balance = { coin: coinSymbol, available: 0, locked: 0 };
        wallet.balances.push(balance);
      }
      balance.available = money.add(balance.available, numAmount);
      await txn.set('wallets', wallet.id, { balances: wallet.balances });
    }

    const txHash = crypto.randomBytes(32).toString('hex');
    const transaction = await txn.create('transactions', {
      user: req.user.id,
      type: 'deposit',
      coin: coinSymbol,
      quantity: numAmount,
      amount: numAmount,
      price: 1.0,
      total: numAmount,
      fee: 0,
      status: 'completed',
      txHash,
      timestamp: new Date().toISOString(),
    });

    return { wallet, txHash, transaction };
  });

  const { wallet, txHash } = result;

  // Dispatch WALLET notification
  notificationService.createNotification({
    userId: req.user.id,
    type: 'WALLET',
    title: 'Deposit Credited',
    message: `Successfully deposited ${numAmount} ${coinSymbol} to your wallet.`,
    metadata: { coin: coinSymbol, amount: numAmount, txHash },
  }).catch((err) => console.error('Deposit notification error:', err));

  // Dispatch Transaction Receipt Email
  firestoreService.getById('users', req.user.id).then((user) => {
    if (user && user.email) {
      emailService.sendTransactionReceiptEmail({
        to: user.email,
        type: 'DEPOSIT',
        amount: numAmount,
        asset: coinSymbol,
        txId: txHash,
        timestamp: new Date().toISOString(),
      }).catch((err) => console.error('Deposit email receipt error:', err));
    }
  }).catch(() => {});

  return ApiResponse.success(res, { wallet, txHash }, 'Deposit processed successfully');
}));

// Simulated withdrawal
router.post('/withdraw', authMiddleware, require2FA, checkIdempotency, validate(withdrawRules), asyncHandler(async (req, res) => {
  const { coin, amount, address } = req.body;
  const numAmount = Number(amount);
  const coinSymbol = coin.toUpperCase();

  const result = await firestoreService.executeAtomicTransaction(async (txn) => {
    const wallets = await firestoreService.getWhere('wallets', 'user', '==', req.user.id);
    const wallet = wallets[0];
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    const balance = wallet.balances.find((b) => b.coin === coinSymbol);
    if (!balance || balance.available < numAmount) {
      throw new BadRequestError('Insufficient available balance for withdrawal');
    }

    balance.available = money.sub(balance.available, numAmount);
    await txn.set('wallets', wallet.id, { balances: wallet.balances });

    const txHash = crypto.randomBytes(32).toString('hex');
    const transaction = await txn.create('transactions', {
      user: req.user.id,
      type: 'withdrawal',
      coin: coinSymbol,
      quantity: numAmount,
      amount: numAmount,
      price: 1.0,
      total: numAmount,
      fee: 0,
      address,
      status: 'completed',
      txHash,
      timestamp: new Date().toISOString(),
    });

    return { wallet, txHash, transaction };
  });

  const { wallet, txHash } = result;

  // Dispatch WALLET notification
  notificationService.createNotification({
    userId: req.user.id,
    type: 'WALLET',
    title: 'Withdrawal Executed',
    message: `Successfully withdrew ${numAmount} ${coinSymbol} to ${address}.`,
    metadata: { coin: coinSymbol, amount: numAmount, address, txHash },
  }).catch((err) => console.error('Withdrawal notification error:', err));

  // Dispatch Transaction Receipt Email
  firestoreService.getById('users', req.user.id).then((user) => {
    if (user && user.email) {
      emailService.sendTransactionReceiptEmail({
        to: user.email,
        type: 'WITHDRAWAL',
        amount: numAmount,
        asset: coinSymbol,
        txId: txHash,
        recipientAddress: address,
        timestamp: new Date().toISOString(),
      }).catch((err) => console.error('Withdrawal email receipt error:', err));
    }
  }).catch(() => {});

  return ApiResponse.success(res, { wallet, txHash }, 'Withdrawal processed successfully');
}));

// Reset demo trading wallet balance ($100,000 USDT)
router.post('/reset-demo', authMiddleware, asyncHandler(async (req, res) => {
  const wallets = await firestoreService.getWhere('wallets', 'user', '==', req.user.id);
  let wallet = wallets[0];

  const resetBalances = [
    { coin: 'USD', available: 100000, locked: 0 },
    { coin: 'USDT', available: 100000, locked: 0 },
    { coin: 'BTC', available: 0, locked: 0 },
    { coin: 'ETH', available: 0, locked: 0 },
    { coin: 'SOL', available: 0, locked: 0 },
  ];

  if (!wallet) {
    wallet = await firestoreService.create('wallets', {
      user: req.user.id,
      balances: resetBalances,
    });
  } else {
    wallet.balances = resetBalances;
    await firestoreService.update('wallets', wallet.id, { balances: resetBalances });
  }

  // Record Demo Reset Transaction
  const txHash = crypto.randomBytes(32).toString('hex');
  await firestoreService.create('transactions', {
    user: req.user.id,
    type: 'deposit',
    coin: 'USDT',
    quantity: 100000,
    amount: 100000,
    price: 1.0,
    total: 100000,
    fee: 0,
    status: 'completed',
    txHash,
    timestamp: new Date().toISOString(),
  });

  return ApiResponse.success(res, { wallet }, 'Demo trading wallet reset to $100,000 USDT successfully');
}));

module.exports = router;