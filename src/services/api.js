import axios from 'axios';

// Create Axios client
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Mock Data Initializer
const INITIAL_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 91450.80, change24h: 3.42, volume24h: 42890120450, marketCap: 1790400000000, high24h: 92800.00, low24h: 88200.00, category: 'Layer 1', icon: '₿', sparkline: [88500, 89200, 89100, 90400, 89800, 91200, 91450] },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3420.50, change24h: -1.15, volume24h: 21450890120, marketCap: 412000000000, high24h: 3510.00, low24h: 3380.00, category: 'Layer 1', icon: 'Ξ', sparkline: [3490, 3510, 3450, 3400, 3440, 3410, 3420] },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 214.30, change24h: 8.75, volume24h: 9450120300, marketCap: 99400000000, high24h: 218.50, low24h: 195.10, category: 'Layer 1', icon: '◎', sparkline: [196, 201, 205, 202, 210, 212, 214] },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 1.48, change24h: 5.12, volume24h: 6120450120, marketCap: 84100000000, high24h: 1.54, low24h: 1.39, category: 'Layer 1', icon: '✕', sparkline: [1.40, 1.42, 1.39, 1.45, 1.46, 1.44, 1.48] },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.88, change24h: 2.10, volume24h: 1840500120, marketCap: 31200000000, high24h: 0.91, low24h: 0.85, category: 'Layer 1', icon: '₳', sparkline: [0.85, 0.86, 0.87, 0.86, 0.89, 0.87, 0.88] },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.38, change24h: -3.40, volume24h: 3410800000, marketCap: 55400000000, high24h: 0.41, low24h: 0.36, category: 'Meme', icon: 'Ð', sparkline: [0.40, 0.41, 0.39, 0.38, 0.37, 0.39, 0.38] },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 42.15, change24h: 4.80, volume24h: 1250900000, marketCap: 17200000000, high24h: 43.50, low24h: 39.80, category: 'Layer 1', icon: '▲', sparkline: [40.1, 40.8, 41.2, 40.5, 41.8, 42.0, 42.15] },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 18.90, change24h: 1.45, volume24h: 890400000, marketCap: 11400000000, high24h: 19.40, low24h: 18.20, category: 'DeFi', icon: '⬡', sparkline: [18.3, 18.6, 18.4, 18.8, 18.7, 18.9, 18.90] },
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai', price: 1.95, change24h: 12.30, volume24h: 1450000000, marketCap: 4900000000, high24h: 2.05, low24h: 1.70, category: 'AI', icon: '🤖', sparkline: [1.71, 1.75, 1.82, 1.80, 1.91, 1.89, 1.95] },
  { id: 'render', symbol: 'RENDER', name: 'Render', price: 7.40, change24h: 9.15, volume24h: 920000000, marketCap: 3800000000, high24h: 7.80, low24h: 6.65, category: 'AI', icon: '🎨', sparkline: [6.7, 6.9, 7.1, 7.0, 7.3, 7.2, 7.40] },
];

const INITIAL_WALLET = {
  totalUsdValue: 45892.40,
  pnl24h: 1240.80,
  pnl24hPercentage: 2.78,
  assets: [
    { symbol: 'USDT', name: 'Tether USD', total: 15420.00, available: 12420.00, inOrder: 3000.00, price: 1.00, value: 15420.00 },
    { symbol: 'BTC', name: 'Bitcoin', total: 0.285, available: 0.285, inOrder: 0, price: 91450.80, value: 26063.48 },
    { symbol: 'ETH', name: 'Ethereum', total: 0.85, available: 0.85, inOrder: 0, price: 3420.50, value: 2907.43 },
    { symbol: 'SOL', name: 'Solana', total: 7.00, available: 7.00, inOrder: 0, price: 214.30, value: 1500.10 },
  ]
};

const INITIAL_ORDERS = [
  { id: 'ORD-9821', pair: 'BTC/USDT', side: 'BUY', type: 'Limit', price: 90000.00, amount: 0.0333, filled: '0%', status: 'OPEN', timestamp: '2026-07-20 12:45:10' },
  { id: 'ORD-9818', pair: 'ETH/USDT', side: 'SELL', type: 'Limit', price: 3550.00, amount: 0.5, filled: '0%', status: 'OPEN', timestamp: '2026-07-20 11:20:00' },
  { id: 'ORD-9750', pair: 'SOL/USDT', side: 'BUY', type: 'Market', price: 208.50, amount: 5.0, filled: '100%', status: 'FILLED', timestamp: '2026-07-19 18:30:15' },
  { id: 'ORD-9610', pair: 'BTC/USDT', side: 'SELL', type: 'Stop-Limit', price: 87500.00, amount: 0.1, filled: '0%', status: 'CANCELLED', timestamp: '2026-07-18 09:15:40' },
];

const INITIAL_TRANSACTIONS = [
  { id: 'TX-8801', type: 'DEPOSIT', coin: 'USDT', amount: 5000.00, address: '0x71C...92A1', txHash: '0x3a4f...991e', status: 'COMPLETED', timestamp: '2026-07-20 10:15:22' },
  { id: 'TX-8742', type: 'WITHDRAW', coin: 'ETH', amount: 0.50, address: '0x99B...44E0', txHash: '0x882c...110a', status: 'COMPLETED', timestamp: '2026-07-19 14:05:00' },
  { id: 'TX-8699', type: 'TRANSFER', coin: 'USDT', amount: 1000.00, address: 'Spot -> Futures', txHash: 'INTERNAL', status: 'COMPLETED', timestamp: '2026-07-18 22:11:45' },
  { id: 'TX-8520', type: 'DEPOSIT', coin: 'BTC', amount: 0.15, address: 'bc1q9...83xl', txHash: '0xf41b...7739', status: 'COMPLETED', timestamp: '2026-07-15 08:30:10' },
];

// Helper to load/save mock DB from localStorage
const getDB = (key, fallback) => {
  const data = localStorage.getItem(`nexus_db_${key}`);
  return data ? JSON.parse(data) : fallback;
};

const saveDB = (key, data) => {
  localStorage.setItem(`nexus_db_${key}`, JSON.stringify(data));
};

// Mock API Call Handler
export const apiService = {
  // GET /api/coins
  getCoins: async () => {
    try {
      const res = await api.get('/coins');
      return res.data;
    } catch {
      const coins = getDB('coins', INITIAL_COINS);
      saveDB('coins', coins);
      return { success: true, data: coins };
    }
  },

  // GET /api/market
  getMarketOverview: async () => {
    try {
      const res = await api.get('/market');
      return res.data;
    } catch {
      const coins = getDB('coins', INITIAL_COINS);
      const totalVol = coins.reduce((acc, c) => acc + c.volume24h, 0);
      const totalCap = coins.reduce((acc, c) => acc + c.marketCap, 0);
      const btcDominance = 56.4;
      return {
        success: true,
        data: {
          coins,
          totalVolume24h: totalVol,
          totalMarketCap: totalCap,
          btcDominance,
          fearGreedIndex: 78, // Extreme Greed
        }
      };
    }
  },

  // POST /api/auth/login
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch {
      const token = 'mock_jwt_token_' + Date.now();
      const user = {
        id: 'usr-901',
        name: credentials.email.split('@')[0] || 'Trader',
        email: credentials.email,
        role: credentials.email.includes('admin') ? 'admin' : 'user',
        kycLevel: 'Level 2 Verified',
        kycStatus: 'APPROVED',
        twoFactorEnabled: true,
        antiPhishingCode: 'NEXUS-8821',
        uid: '89104829',
        createdAt: '2026-01-15',
      };
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('nexus_user', JSON.stringify(user));
      return { success: true, token, user };
    }
  },

  // POST /api/auth/register
  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch {
      const token = 'mock_jwt_token_' + Date.now();
      const user = {
        id: 'usr-' + Math.floor(Math.random() * 1000),
        name: userData.fullName || userData.email.split('@')[0],
        email: userData.email,
        role: 'user',
        kycLevel: 'Unverified',
        kycStatus: 'NOT_SUBMITTED',
        twoFactorEnabled: false,
        uid: String(Math.floor(10000000 + Math.random() * 90000000)),
        createdAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('nexus_user', JSON.stringify(user));
      return { success: true, token, user };
    }
  },

  // GET /api/user/profile
  getProfile: async () => {
    try {
      const res = await api.get('/user/profile');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('nexus_user');
      const user = userStr ? JSON.parse(userStr) : {
        id: 'usr-901',
        name: 'Alex Vance',
        email: 'alex@nexustrade.io',
        role: 'user',
        kycLevel: 'Level 2 Verified',
        kycStatus: 'APPROVED',
        twoFactorEnabled: true,
        antiPhishingCode: 'NEXUS-8821',
        uid: '89104829',
        createdAt: '2026-01-15',
      };
      return { success: true, data: user };
    }
  },

  // GET /api/wallet
  getWallet: async () => {
    try {
      const res = await api.get('/wallet');
      return res.data;
    } catch {
      const wallet = getDB('wallet', INITIAL_WALLET);
      saveDB('wallet', wallet);
      return { success: true, data: wallet };
    }
  },

  // POST /api/order
  createOrder: async (orderPayload) => {
    try {
      const res = await api.post('/order', orderPayload);
      return res.data;
    } catch {
      const orders = getDB('orders', INITIAL_ORDERS);
      const newOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        pair: orderPayload.pair || 'BTC/USDT',
        side: orderPayload.side,
        type: orderPayload.type,
        price: Number(orderPayload.price),
        amount: Number(orderPayload.amount),
        filled: orderPayload.type === 'Market' ? '100%' : '0%',
        status: orderPayload.type === 'Market' ? 'FILLED' : 'OPEN',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      orders.unshift(newOrder);
      saveDB('orders', orders);

      // Deduct/Add from wallet simulation
      const wallet = getDB('wallet', INITIAL_WALLET);
      if (newOrder.side === 'BUY') {
        const usdtAsset = wallet.assets.find(a => a.symbol === 'USDT');
        if (usdtAsset) usdtAsset.available -= (newOrder.price * newOrder.amount);
      }
      saveDB('wallet', wallet);

      return { success: true, data: newOrder };
    }
  },

  // GET /api/orders
  getOrders: async () => {
    try {
      const res = await api.get('/orders');
      return res.data;
    } catch {
      const orders = getDB('orders', INITIAL_ORDERS);
      saveDB('orders', orders);
      return { success: true, data: orders };
    }
  },

  // GET /api/transactions
  getTransactions: async () => {
    try {
      const res = await api.get('/transactions');
      return res.data;
    } catch {
      const txs = getDB('transactions', INITIAL_TRANSACTIONS);
      saveDB('transactions', txs);
      return { success: true, data: txs };
    }
  },
};

export default api;
