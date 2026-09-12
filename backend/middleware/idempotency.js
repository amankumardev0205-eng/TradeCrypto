/**
 * Idempotency & Duplicate Request Protection Middleware
 * Prevents duplicate financial transactions caused by retried network requests.
 */
const idempotencyCache = new Map();
const TTL_MS = 60 * 1000; // 60 seconds TTL

// Clean up expired keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyCache.entries()) {
    if (now > entry.expiresAt) {
      idempotencyCache.delete(key);
    }
  }
}, 30 * 1000);

const checkIdempotency = (req, res, next) => {
  // Only process POST/PUT financial mutations
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }

  const clientKey = req.headers['x-idempotency-key'];
  if (!clientKey) {
    return next();
  }

  const userId = req.user ? req.user.id : 'anonymous';
  const cacheKey = `${userId}:${req.originalUrl}:${clientKey}`;
  const now = Date.now();

  const cached = idempotencyCache.get(cacheKey);
  if (cached && now <= cached.expiresAt) {
    console.log(`[Idempotency] Returning cached response for key: ${clientKey}`);
    return res.status(cached.statusCode).json(cached.body);
  }

  // Intercept res.json to cache response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(cacheKey, {
        statusCode: res.statusCode,
        body,
        expiresAt: Date.now() + TTL_MS,
      });
    }
    return originalJson(body);
  };

  next();
};

module.exports = checkIdempotency;
