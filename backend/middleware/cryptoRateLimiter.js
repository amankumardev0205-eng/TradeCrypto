/**
 * Narrowly-scoped Rate Limiter Middleware for Crypto Market Endpoints.
 * Enforces per-IP request limits (e.g., 60 requests per minute) to protect upstream CoinGecko API.
 */
const cryptoRateLimiter = (options = {}) => {
  const maxRequests = options.max || 60;
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const requestsMap = new Map();

  // Periodic cleanup of expired entries (every 5 minutes)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestsMap.entries()) {
      if (now - record.startTime > windowMs) {
        requestsMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const clientRecord = requestsMap.get(ip);

    if (!clientRecord || now - clientRecord.startTime > windowMs) {
      requestsMap.set(ip, { count: 1, startTime: now });
      return next();
    }

    if (clientRecord.count >= maxRequests) {
      const retryAfterSec = Math.ceil((windowMs - (now - clientRecord.startTime)) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: 'Too many requests to market endpoints. Please wait before retrying.',
        retryAfterSeconds: retryAfterSec,
        timestamp: new Date().toISOString(),
      });
    }

    clientRecord.count += 1;
    next();
  };
};

module.exports = cryptoRateLimiter;
