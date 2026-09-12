const request = require('supertest');
const app = require('../../server');
const firestoreService = require('../../services/firestoreService');
const tokenService = require('../../services/tokenService');

describe('Stage 9.3 Financial Correctness & E2E Integration Test Suite', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    // Reset test memory store before each test
    firestoreService.clearMemoryStore();

    const user = await firestoreService.create('users', {
      email: `trader_${Date.now()}@example.com`,
      role: 'user',
      status: 'active',
      twoFactorEnabled: true,
    });
    userId = user.id;

    userToken = tokenService.generateAccessToken(user);

    // Seed wallet with 10,000 USDT for testing
    await firestoreService.create('wallets', {
      user: userId,
      balances: [
        { coin: 'USDT', available: 10000, locked: 0 },
        { coin: 'BTC', available: 0, locked: 0 },
      ],
    });
  });

  // ----------------------------------------------------------------
  // 1. BUY ACCOUNTING & INVARIANTS
  // ----------------------------------------------------------------
  describe('BUY Accounting & Validation', () => {
    it('executes a valid BUY order with accurate fee and balance updates', async () => {
      const res = await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0.1, price: 50000 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction).toBeDefined();
      expect(res.body.data.transaction.type).toBe('buy');
      expect(res.body.data.transaction.fee).toBe(10); // 5000 * 0.002 = 10
      expect(res.body.data.transaction.totalCost).toBe(5010); // 5000 + 10

      // Verify wallet balances after trade
      const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
      const wallet = wallets[0];
      const usdtBal = wallet.balances.find((b) => b.coin === 'USDT');
      const btcBal = wallet.balances.find((b) => b.coin === 'BTC');

      expect(usdtBal.available).toBe(4990); // 10000 - 5010
      expect(btcBal.available).toBe(0.1);
    });

    it('rejects BUY order with 400 Bad Request when quote balance is insufficient and leaves state untouched', async () => {
      const res = await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 1.0, price: 50000 }); // Requires 50100 USDT (only 10000 available)

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Insufficient USDT balance/i);

      // Verify ZERO state mutation
      const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
      const usdtBal = wallets[0].balances.find((b) => b.coin === 'USDT');
      expect(usdtBal.available).toBe(10000);

      const txs = await firestoreService.getWhere('transactions', 'user', '==', userId);
      expect(txs.length).toBe(0);
    });

    it('rejects BUY order with zero or negative quantity', async () => {
      const res1 = await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0, price: 50000 });

      expect(res1.statusCode).toBe(400);

      const res2 = await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: -0.5, price: 50000 });

      expect(res2.statusCode).toBe(400);
    });

    it('rejects unauthenticated BUY requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/trade/buy')
        .send({ pair: 'BTC/USDT', amount: 0.1, price: 50000 });

      expect(res.statusCode).toBe(401);
    });
  });

  // ----------------------------------------------------------------
  // 2. SELL ACCOUNTING & INVARIANTS
  // ----------------------------------------------------------------
  describe('SELL Accounting & Validation', () => {
    it('executes a valid SELL order with net proceeds crediting', async () => {
      // First buy 0.1 BTC
      await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0.1, price: 50000 });

      // Sell 0.1 BTC at $60,000 (tradeValue = 6000, fee = 12, netProceeds = 5988)
      const res = await request(app)
        .post('/api/trade/sell')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0.1, price: 60000 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.transaction.netProceeds).toBe(5988);

      const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
      const wallet = wallets[0];
      const usdtBal = wallet.balances.find((b) => b.coin === 'USDT');
      const btcBal = wallet.balances.find((b) => b.coin === 'BTC');

      expect(usdtBal.available).toBe(10978); // 4990 + 5988
      expect(btcBal.available).toBe(0);
    });

    it('rejects SELL order when user does not hold sufficient asset quantity', async () => {
      const res = await request(app)
        .post('/api/trade/sell')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0.5, price: 50000 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Insufficient BTC balance/i);

      // Verify ZERO transaction created
      const txs = await firestoreService.getWhere('transactions', 'user', '==', userId);
      expect(txs.length).toBe(0);
    });
  });

  // ----------------------------------------------------------------
  // 3. SEQUENCE & BALANCE INVARIANTS
  // ----------------------------------------------------------------
  describe('Trading Sequences & Invariants', () => {
    it('BUY -> SELL full holding leaves 0 asset balance and exact USDT fee deduction', async () => {
      // Deposit 10,000 more USDT so total is 20,000 USDT
      await request(app)
        .post('/api/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ coin: 'USDT', amount: 10000 });

      // Buy 0.2 BTC @ $50,000 -> Cost: $10,000 + $20 fee = $10,020 Total
      await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0.2, price: 50000 });

      // Sell 0.2 BTC @ $50,000 -> Proceeds: $10,000 - $20 fee = $9,980
      await request(app)
        .post('/api/trade/sell')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pair: 'BTC/USDT', amount: 0.2, price: 50000 });

      const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
      const btcBal = wallets[0].balances.find((b) => b.coin === 'BTC');
      const usdtBal = wallets[0].balances.find((b) => b.coin === 'USDT');

      expect(btcBal.available).toBe(0);
      // Started with 20000 USDT. Spent 10020 on buy. Received 9980 on sell. Final = 19960 (40 USDT total 2-way fee)
      expect(usdtBal.available).toBe(19960);
    });
  });

  // ----------------------------------------------------------------
  // 4. IDEMPOTENCY & DUPLICATE PROTECTION
  // ----------------------------------------------------------------
  describe('Idempotency & Retry Protection', () => {
    it('deduplicates retried requests with same X-Idempotency-Key and prevents double balance deduction', async () => {
      const idempotencyKey = `tx-key-${Date.now()}`;

      // First request
      const res1 = await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-Idempotency-Key', idempotencyKey)
        .send({ pair: 'BTC/USDT', amount: 0.1, price: 50000 });

      expect(res1.statusCode).toBe(201);
      const initialTxId = res1.body.data.transaction.id;

      // Retried request with identical key
      const res2 = await request(app)
        .post('/api/trade/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-Idempotency-Key', idempotencyKey)
        .send({ pair: 'BTC/USDT', amount: 0.1, price: 50000 });

      expect(res2.statusCode).toBe(201);
      expect(res2.body.data.transaction.id).toBe(initialTxId);

      // Verify USDT balance was ONLY deducted ONCE ($5010), not twice ($10020)
      const wallets = await firestoreService.getWhere('wallets', 'user', '==', userId);
      const usdtBal = wallets[0].balances.find((b) => b.coin === 'USDT');
      expect(usdtBal.available).toBe(4990);
    });
  });
});
