const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'crypto_market_super_secret_jwt_key_2026',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '7', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tradecrypto-baee9.firebasestorage.app',
  coingeckoApiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
  coingeckoCacheTtlSec: parseInt(process.env.COINGECKO_CACHE_TTL_SEC || '60', 10),
  coingeckoTimeoutMs: parseInt(process.env.COINGECKO_TIMEOUT_MS || '10000', 10),
};

module.exports = config;
