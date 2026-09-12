const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { db } = require('./config/firebase');

// ---------- Middleware ----------
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('./middleware/cookieParser');

// ---------- Route handlers ----------
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/cryptoRoutes');
const userRoutes = require('./routes/user');
const kycRoutes = require('./routes/kyc');
const adminRoutes = require('./routes/adminRoutes');
const walletRoutes = require('./routes/wallet');
const tradeRoutes = require('./routes/trade');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ---------- Global Middleware ----------
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser);

// Public static assets (Restricted: KYC files are stored in private-uploads and served exclusively via authenticated /api/kyc/media routes)
app.use('/public-assets', express.static(path.join(__dirname, 'uploads/public')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'Firestore',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Routes ----------
// Public Auth & Crypto Market Data
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Protected User Routes
app.use('/api/user', userRoutes);
app.use('/api/kyc', authMiddleware, kycRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use('/api/trade', authMiddleware, tradeRoutes);
app.use('/api/notifications', notificationRoutes);

// Protected Admin Routes
app.use('/api/admin', [authMiddleware, adminMiddleware], adminRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  const { NotFoundError } = require('./utils/ApiError');
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// ---------- Global Error Handler ----------
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = config.port || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} with Firestore Database & Dual-Token Auth`);
  });
}

module.exports = app;