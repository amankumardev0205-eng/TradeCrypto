const express = require('express');
const router = express.Router();
const cryptoService = require('../services/cryptoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const validate = require('../middleware/validate');
const cryptoRateLimiter = require('../middleware/cryptoRateLimiter');
const { cryptoMarketRules, cryptoHistoryRules } = require('../middleware/validationRules');

// Apply narrowly-scoped rate limiter for all crypto market routes (60 reqs/min per IP)
router.use(cryptoRateLimiter({ max: 60, windowMs: 60 * 1000 }));

/**
 * @route   GET /api/crypto/markets
 * @desc    Get cryptocurrency market listings (prices, 24h volume, market cap, ATH/ATL, supply)
 * @access  Public
 */
router.get(
  '/markets',
  validate(cryptoMarketRules),
  asyncHandler(async (req, res) => {
    const result = await cryptoService.getMarketListings(req.query);

    // Set Cache Header indicator for debugging & transparency
    const cacheHeader = result.cache.fromCache
      ? result.cache.isStale
        ? 'STALE'
        : 'HIT'
      : 'MISS';

    res.setHeader('X-Cache', cacheHeader);
    res.setHeader('X-Cache-TTL', `${result.cache.ttlSeconds}s`);

    return ApiResponse.success(
      res,
      result,
      'Cryptocurrency market data retrieved successfully'
    );
  })
);

/**
 * @route   GET /api/crypto/history/:coinId
 * @desc    Get historical market chart data (OHLC / price points) for trading charts
 * @access  Public
 */
router.get(
  '/history/:coinId',
  validate(cryptoHistoryRules),
  asyncHandler(async (req, res) => {
    const { coinId } = req.params;
    const result = await cryptoService.getCoinHistory(coinId, req.query);

    const cacheHeader = result.cache.fromCache
      ? result.cache.isStale
        ? 'STALE'
        : 'HIT'
      : 'MISS';

    res.setHeader('X-Cache', cacheHeader);
    res.setHeader('X-Cache-TTL', `${result.cache.ttlSeconds}s`);

    return ApiResponse.success(
      res,
      result,
      `Historical market data for ${coinId} retrieved successfully`
    );
  })
);

module.exports = router;
