const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestoreService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');
const require2FA = require('../middleware/require2FAMiddleware');
const checkIdempotency = require('../middleware/idempotency');
const { getPrice } = require('../utils/priceFeed');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { BadRequestError, NotFoundError } = require('../utils/ApiError');
const crypto = require('crypto');
const validate = require('../middleware/validate');
const { marketOrderRules, limitOrderRules, cancelOrderRules, transactionQueryRules, buyTradeRules, sellTradeRules } = require('../middleware/validationRules');
const money = require('../utils/money');

const FEE_PERCENT = 0.002; // 0.2%

// -------------------- Live Price Endpoint --------------------
router.get('/price/:pair', asyncHandler(async (req, res) => {
  const price = await getPrice(req.params.pair);
  return ApiResponse.success(res, { pair: req.params.pair, price }, 'Price retrieved');
}));

// -------------------- Instant Buy Endpoint --------------------
router.post('/buy', authMiddleware, checkIdempotency, validate(buyTradeRules), asyncHandler(async (req, res) => {
  const { pair, amount, price: reqPrice } = req.body;
  const numAmount = Number(amount);
  const userId = req.user.id;

  // Determine execution price and financial precision values
  const price = reqPrice ? Number(reqPrice) : await getPrice(pair);
  const total = money.mul(numAmount, price);
  const fee = money.calcFee(total, FEE_PERCENT);
  const totalNeeded = money.calcTotalCost(total, fee);

  const [baseCoin, quoteCoin] = pair.split('/');

  const result = await firestoreService.executeAtomicTransaction(async (txn) => {
    const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
    let wallet = wallets[0];
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    // Check quote currency available balance (e.g. USDT)
    const quoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
    if (!quoteBal || quoteBal.available < totalNeeded) {
      throw new BadRequestError(`Insufficient ${quoteCoin} balance for buy transaction. Required: $${totalNeeded.toFixed(2)}`);
    }

    // Perform atomic wallet updates with precision subtraction & addition
    quoteBal.available = money.sub(quoteBal.available, totalNeeded);

    let baseBal = wallet.balances.find((b) => b.coin === baseCoin);
    if (!baseBal) {
      baseBal = { coin: baseCoin, available: 0, locked: 0 };
      wallet.balances.push(baseBal);
    }
    baseBal.available = money.add(baseBal.available, numAmount);

    const updatedWallet = await txn.set('wallets', wallet.id, { balances: wallet.balances });

    // Record Buy Transaction
    const txHash = crypto.randomBytes(32).toString('hex');
    const transaction = await txn.create('transactions', {
      user: userId,
      type: 'buy',
      coin: baseCoin,
      quantity: numAmount,
      amount: numAmount,
      price,
      total,
      fee,
      totalCost: totalNeeded,
      status: 'completed',
      txHash,
      timestamp: new Date().toISOString(),
    });

    return { transaction, wallet: updatedWallet || wallet, txHash };
  });

  const { transaction, wallet, txHash } = result;

  // Dispatch TRADING notification
  notificationService.createNotification({
    userId,
    type: 'TRADING',
    title: 'Buy Order Executed',
    message: `Bought ${numAmount} ${baseCoin} at $${price.toLocaleString()} for ${totalNeeded.toFixed(2)} ${quoteCoin}.`,
    metadata: { pair, side: 'BUY', amount: numAmount, price, total: totalNeeded },
  }).catch((err) => console.error('Buy notification error:', err));

  // Dispatch Transaction Receipt Email
  firestoreService.getById('users', userId).then((user) => {
    if (user && user.email) {
      emailService.sendTransactionReceiptEmail({
        to: user.email,
        type: 'BUY',
        amount: numAmount,
        asset: baseCoin,
        price,
        txId: transaction.id || txHash,
        timestamp: transaction.timestamp,
      }).catch((err) => console.error('Buy email receipt error:', err));
    }
  }).catch(() => {});

  return ApiResponse.created(
    res,
    { transaction, wallet },
    `Buy transaction completed successfully: Purchased ${numAmount} ${baseCoin} at $${price}`
  );
}));

// -------------------- Instant Sell Endpoint --------------------
router.post('/sell', authMiddleware, checkIdempotency, validate(sellTradeRules), asyncHandler(async (req, res) => {
  const { pair, amount, price: reqPrice } = req.body;
  const numAmount = Number(amount);
  const userId = req.user.id;

  // Determine execution price and financial precision values
  const price = reqPrice ? Number(reqPrice) : await getPrice(pair);
  const total = money.mul(numAmount, price);
  const fee = money.calcFee(total, FEE_PERCENT);
  const netProceeds = money.calcNetProceeds(total, fee);

  const [baseCoin, quoteCoin] = pair.split('/');

  const result = await firestoreService.executeAtomicTransaction(async (txn) => {
    const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
    let wallet = wallets[0];
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    // Check base currency available balance (e.g. BTC)
    const baseBal = wallet.balances.find((b) => b.coin === baseCoin);
    if (!baseBal || baseBal.available < numAmount) {
      throw new BadRequestError(`Insufficient ${baseCoin} balance for sell transaction. Available: ${baseBal ? baseBal.available : 0} ${baseCoin}`);
    }

    // Perform atomic wallet updates with precision subtraction & addition
    baseBal.available = money.sub(baseBal.available, numAmount);

    let quoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
    if (!quoteBal) {
      quoteBal = { coin: quoteCoin, available: 0, locked: 0 };
      wallet.balances.push(quoteBal);
    }
    quoteBal.available = money.add(quoteBal.available, netProceeds);

    const updatedWallet = await txn.set('wallets', wallet.id, { balances: wallet.balances });

    // Record Sell Transaction
    const txHash = crypto.randomBytes(32).toString('hex');
    const transaction = await txn.create('transactions', {
      user: userId,
      type: 'sell',
      coin: baseCoin,
      quantity: numAmount,
      amount: -numAmount,
      price,
      total,
      fee,
      netProceeds,
      status: 'completed',
      txHash,
      timestamp: new Date().toISOString(),
    });

    return { transaction, wallet: updatedWallet || wallet, txHash };
  });

  const { transaction, wallet, txHash } = result;

  // Dispatch TRADING notification
  notificationService.createNotification({
    userId,
    type: 'TRADING',
    title: 'Sell Order Executed',
    message: `Sold ${numAmount} ${baseCoin} at $${price.toLocaleString()} for ${netProceeds.toFixed(2)} ${quoteCoin}.`,
    metadata: { pair, side: 'SELL', amount: numAmount, price, netProceeds },
  }).catch((err) => console.error('Sell notification error:', err));

  // Dispatch Transaction Receipt Email
  firestoreService.getById('users', userId).then((user) => {
    if (user && user.email) {
      emailService.sendTransactionReceiptEmail({
        to: user.email,
        type: 'SELL',
        amount: numAmount,
        asset: baseCoin,
        price,
        txId: transaction.id || txHash,
        timestamp: transaction.timestamp,
      }).catch((err) => console.error('Sell email receipt error:', err));
    }
  }).catch(() => {});

  return ApiResponse.created(
    res,
    { transaction, wallet },
    `Sell transaction completed successfully: Sold ${numAmount} ${baseCoin} at $${price}`
  );
}));

// -------------------- Market Order --------------------
router.post('/market', authMiddleware, require2FA, validate(marketOrderRules), asyncHandler(async (req, res) => {
  const { pair, side, amount } = req.body;
  const numAmount = Number(amount);

  const userId = req.user.id;
  const price = await getPrice(pair);
  const total = numAmount * price;
  const fee = total * FEE_PERCENT;

  const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
  const wallet = wallets[0];
  if (!wallet) throw new NotFoundError('Wallet not found');

  const [baseCoin, quoteCoin] = pair.split('/');

  if (side === 'buy') {
    const needed = total + fee;
    const quoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
    if (!quoteBal || quoteBal.available < needed) {
      throw new BadRequestError('Insufficient available balance');
    }
    quoteBal.available -= needed;
    let baseBal = wallet.balances.find((b) => b.coin === baseCoin);
    if (!baseBal) {
      baseBal = { coin: baseCoin, available: 0, locked: 0 };
      wallet.balances.push(baseBal);
    }
    baseBal.available += numAmount;
  } else { // sell
    const baseBal = wallet.balances.find((b) => b.coin === baseCoin);
    if (!baseBal || baseBal.available < numAmount) {
      throw new BadRequestError('Insufficient available balance');
    }
    baseBal.available -= numAmount;
    let quoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
    if (!quoteBal) {
      quoteBal = { coin: quoteCoin, available: 0, locked: 0 };
      wallet.balances.push(quoteBal);
    }
    quoteBal.available += (total - fee);
  }

  await firestoreService.update('wallets', wallet.id, { balances: wallet.balances });

  const marketOrder = await firestoreService.create('orders', {
    user: userId,
    pair,
    side,
    type: 'market',
    amount: numAmount,
    filled: numAmount,
    status: 'filled',
    price,
  });

  const trade = await firestoreService.create('trades', {
    pair,
    price,
    amount: numAmount,
    total,
    fee,
    side,
    taker: userId,
    takerOrder: marketOrder.id,
    maker: null,
    makerOrder: null,
    timestamp: new Date().toISOString(),
  });

  const txHash = crypto.randomBytes(32).toString('hex');
  await firestoreService.create('transactions', {
    user: userId,
    type: side,
    coin: baseCoin,
    quantity: numAmount,
    amount: side === 'buy' ? numAmount : -numAmount,
    price,
    total,
    fee,
    trade: trade.id,
    status: 'completed',
    txHash,
    timestamp: new Date().toISOString(),
  });

  return ApiResponse.created(res, { trade }, 'Market order executed successfully');
}));

// -------------------- Limit Order (with matching) --------------------
router.post('/limit', authMiddleware, require2FA, validate(limitOrderRules), asyncHandler(async (req, res) => {
  const { pair, side, price, amount } = req.body;
  const numPrice = Number(price);
  const numAmount = Number(amount);

  const userId = req.user.id;
  const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
  const wallet = wallets[0];
  if (!wallet) throw new NotFoundError('Wallet not found');

  const [baseCoin, quoteCoin] = pair.split('/');

  // Lock funds
  if (side === 'buy') {
    const total = numPrice * numAmount;
    const quoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
    if (!quoteBal || quoteBal.available < total) {
      throw new BadRequestError('Insufficient available balance');
    }
    quoteBal.available -= total;
    quoteBal.locked += total;
  } else { // sell
    const baseBal = wallet.balances.find((b) => b.coin === baseCoin);
    if (!baseBal || baseBal.available < numAmount) {
      throw new BadRequestError('Insufficient available balance');
    }
    baseBal.available -= numAmount;
    baseBal.locked += numAmount;
  }
  await firestoreService.update('wallets', wallet.id, { balances: wallet.balances });

  // Create limit order doc
  let newOrder = await firestoreService.create('orders', {
    user: userId,
    pair,
    side,
    type: 'limit',
    price: numPrice,
    amount: numAmount,
    filled: 0,
    status: 'open',
  });

  // Match order against open orders in Firestore
  const oppositeSide = side === 'buy' ? 'sell' : 'buy';
  const allOpenOrders = await firestoreService.getWhere('orders', 'pair', '==', pair);
  const eligibleOrders = allOpenOrders.filter((o) => {
    if (o.side !== oppositeSide) return false;
    if (o.status !== 'open' && o.status !== 'partially_filled') return false;
    if (side === 'buy') return o.price <= numPrice;
    return o.price >= numPrice;
  });

  eligibleOrders.sort((a, b) => side === 'buy' ? a.price - b.price : b.price - a.price);

  let remaining = numAmount;
  for (const oppOrder of eligibleOrders) {
    if (remaining <= 0) break;
    const oppRemaining = oppOrder.amount - (oppOrder.filled || 0);
    const fillAmount = Math.min(remaining, oppRemaining);
    if (fillAmount <= 0) continue;

    const tradePrice = oppOrder.price;
    const tradeTotal = fillAmount * tradePrice;
    const tradeFee = tradeTotal * FEE_PERCENT;

    const oppWallets = await firestoreService.getWhere('wallets', 'user', '==', oppOrder.user);
    const oppWallet = oppWallets[0];

    if (oppWallet) {
      if (side === 'buy') {
        let takerBaseBal = wallet.balances.find((b) => b.coin === baseCoin);
        if (!takerBaseBal) {
          takerBaseBal = { coin: baseCoin, available: 0, locked: 0 };
          wallet.balances.push(takerBaseBal);
        }
        takerBaseBal.available += fillAmount;

        const makerBaseBal = oppWallet.balances.find((b) => b.coin === baseCoin);
        if (makerBaseBal) makerBaseBal.locked = Math.max(0, makerBaseBal.locked - fillAmount);
        let makerQuoteBal = oppWallet.balances.find((b) => b.coin === quoteCoin);
        if (!makerQuoteBal) {
          makerQuoteBal = { coin: quoteCoin, available: 0, locked: 0 };
          oppWallet.balances.push(makerQuoteBal);
        }
        makerQuoteBal.available += (tradeTotal - tradeFee);
      } else {
        let takerBaseBal = oppWallet.balances.find((b) => b.coin === baseCoin);
        if (!takerBaseBal) {
          takerBaseBal = { coin: baseCoin, available: 0, locked: 0 };
          oppWallet.balances.push(takerBaseBal);
        }
        takerBaseBal.available += fillAmount;
        const takerQuoteBal = oppWallet.balances.find((b) => b.coin === quoteCoin);
        if (takerQuoteBal) takerQuoteBal.locked = Math.max(0, takerQuoteBal.locked - tradeTotal);

        let makerQuoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
        if (!makerQuoteBal) {
          makerQuoteBal = { coin: quoteCoin, available: 0, locked: 0 };
          wallet.balances.push(makerQuoteBal);
        }
        makerQuoteBal.available += (tradeTotal - tradeFee);
        const makerBaseBal = wallet.balances.find((b) => b.coin === baseCoin);
        if (makerBaseBal) makerBaseBal.locked = Math.max(0, makerBaseBal.locked - fillAmount);
      }

      await firestoreService.update('wallets', oppWallet.id, { balances: oppWallet.balances });
    }

    const newOppFilled = (oppOrder.filled || 0) + fillAmount;
    const oppStatus = newOppFilled >= oppOrder.amount ? 'filled' : 'partially_filled';
    await firestoreService.update('orders', oppOrder.id, { filled: newOppFilled, status: oppStatus });

    const newOrderFilled = (newOrder.filled || 0) + fillAmount;
    newOrder = await firestoreService.update('orders', newOrder.id, {
      filled: newOrderFilled,
      status: newOrderFilled >= newOrder.amount ? 'filled' : 'partially_filled',
    });

    const trade = await firestoreService.create('trades', {
      pair,
      price: tradePrice,
      amount: fillAmount,
      total: tradeTotal,
      fee: tradeFee,
      side,
      maker: side === 'buy' ? oppOrder.user : userId,
      taker: side === 'buy' ? userId : oppOrder.user,
      makerOrder: side === 'buy' ? oppOrder.id : newOrder.id,
      takerOrder: side === 'buy' ? newOrder.id : oppOrder.id,
      timestamp: new Date().toISOString(),
    });

    const makerTxHash = crypto.randomBytes(32).toString('hex');
    await firestoreService.create('transactions', {
      user: trade.maker,
      type: side === 'buy' ? 'sell' : 'buy',
      coin: baseCoin,
      quantity: fillAmount,
      amount: side === 'buy' ? -fillAmount : fillAmount,
      price: tradePrice,
      total: tradeTotal,
      fee: tradeFee,
      trade: trade.id,
      status: 'completed',
      txHash: makerTxHash,
      timestamp: new Date().toISOString(),
    });

    const takerTxHash = crypto.randomBytes(32).toString('hex');
    await firestoreService.create('transactions', {
      user: trade.taker,
      type: side,
      coin: baseCoin,
      quantity: fillAmount,
      amount: side === 'buy' ? fillAmount : -fillAmount,
      price: tradePrice,
      total: tradeTotal,
      fee: tradeFee,
      trade: trade.id,
      status: 'completed',
      txHash: takerTxHash,
      timestamp: new Date().toISOString(),
    });

    remaining -= fillAmount;
  }

  return ApiResponse.created(res, { order: newOrder }, 'Limit order placed successfully');
}));

// -------------------- Get user's open orders --------------------
router.get('/orders', authMiddleware, asyncHandler(async (req, res) => {
  const userOrders = await firestoreService.getWhere('orders', 'user', '==', req.user.id);
  const openOrders = userOrders.filter((o) => o.status === 'open' || o.status === 'partially_filled');
  return ApiResponse.success(res, openOrders, 'Open orders retrieved');
}));

const verifyOwnership = require('../middleware/verifyOwnership');

// -------------------- Cancel an order --------------------
// Ownership Check: Verifies order ID parameter :id exists in 'orders' collection and belongs to 'user' field (or user is admin)
router.delete('/orders/:id', authMiddleware, validate(cancelOrderRules), verifyOwnership('orders', 'user', 'id'), asyncHandler(async (req, res) => {
  const order = req.resource;
  if (order.status !== 'open' && order.status !== 'partially_filled') {
    throw new BadRequestError('Order cannot be cancelled');
  }

  const wallets = await firestoreService.getWhere('wallets', 'user', '==', order.user);
  const wallet = wallets[0];

  if (wallet) {
    const [baseCoin, quoteCoin] = order.pair.split('/');
    const unlockAmount = order.amount - (order.filled || 0);

    if (order.side === 'buy') {
      const quoteBal = wallet.balances.find((b) => b.coin === quoteCoin);
      if (quoteBal) {
        quoteBal.locked = Math.max(0, quoteBal.locked - unlockAmount * order.price);
        quoteBal.available += unlockAmount * order.price;
      }
    } else {
      const baseBal = wallet.balances.find((b) => b.coin === baseCoin);
      if (baseBal) {
        baseBal.locked = Math.max(0, baseBal.locked - unlockAmount);
        baseBal.available += unlockAmount;
      }
    }

    await firestoreService.update('wallets', wallet.id, { balances: wallet.balances });
  }

  await firestoreService.update('orders', order.id, { status: 'cancelled' });

  // Dispatch TRADING notification for cancellation
  notificationService.createNotification({
    userId: order.user,
    type: 'TRADING',
    title: 'Order Cancelled',
    message: `Order ${order.id} for ${order.pair} (${order.side.toUpperCase()}) was cancelled. Locked funds returned to available balance.`,
    metadata: { orderId: order.id, pair: order.pair, side: order.side },
  }).catch((err) => console.error('Cancel order notification error:', err));

  return ApiResponse.success(res, { id: order.id }, 'Order cancelled successfully');
}));

// -------------------- Transaction history --------------------
router.get('/history', authMiddleware, validate(transactionQueryRules), asyncHandler(async (req, res) => {
  const limitVal = parseInt(req.query.limit || '50', 10);
  const typeFilter = req.query.type ? String(req.query.type).toLowerCase() : null;
  const coinFilter = req.query.coin ? String(req.query.coin).toUpperCase() : null;

  const conditions = [{ field: 'user', op: '==', value: req.user.id }];

  if (typeFilter && typeFilter !== 'all') {
    conditions.push({ field: 'type', op: '==', value: typeFilter });
  }
  if (coinFilter) {
    conditions.push({ field: 'coin', op: '==', value: coinFilter });
  }

  const rawTransactions = await firestoreService.query(
    'transactions',
    conditions,
    'timestamp',
    'desc',
    limitVal
  );

  // Normalize transaction fields for client consumption
  const transactions = rawTransactions.map((tx) => ({
    id: tx.id,
    user: tx.user,
    type: tx.type ? String(tx.type).toLowerCase() : 'trade',
    coin: tx.coin || tx.coinId || 'USDT',
    quantity: tx.quantity ?? (tx.amount ? Math.abs(tx.amount) : 0),
    amount: tx.amount ?? tx.quantity ?? 0,
    price: tx.price ?? 0,
    total: tx.total ?? (tx.price && tx.quantity ? tx.price * tx.quantity : Math.abs(tx.amount || 0)),
    fee: tx.fee ?? 0,
    status: tx.status || 'completed',
    txHash: tx.txHash || (tx.id ? `0x${tx.id.replace(/[^a-f0-9]/gi, '')}` : ''),
    address: tx.address || null,
    timestamp: tx.timestamp || new Date().toISOString(),
  }));

  return ApiResponse.success(res, transactions, 'Transaction history retrieved successfully');
}));

module.exports = router;