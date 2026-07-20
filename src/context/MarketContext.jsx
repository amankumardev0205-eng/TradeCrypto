import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [watchlist, setWatchlist] = useState(['BTC', 'ETH', 'SOL']);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const refreshMarketData = async () => {
    try {
      const [coinsRes, walletRes, ordersRes, txRes] = await Promise.all([
        apiService.getCoins(),
        apiService.getWallet(),
        apiService.getOrders(),
        apiService.getTransactions(),
      ]);

      if (coinsRes.success) setCoins(coinsRes.data);
      if (walletRes.success) setWallet(walletRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load market data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMarketData();
  }, []);

  // Simulate real-time live WebSocket price updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          const deltaPercent = (Math.random() - 0.48) * 0.4; // slight random tick
          const newPrice = Number((coin.price * (1 + deltaPercent / 100)).toFixed(coin.price > 10 ? 2 : 4));
          const newSparkline = [...coin.sparkline.slice(1), newPrice];
          return {
            ...coin,
            price: newPrice,
            change24h: Number((coin.change24h + deltaPercent * 0.1).toFixed(2)),
            sparkline: newSparkline,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (symbol) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const createNewOrder = async (orderPayload) => {
    const res = await apiService.createOrder(orderPayload);
    if (res.success) {
      setOrders((prev) => [res.data, ...prev]);
      // Refresh wallet
      const wRes = await apiService.getWallet();
      if (wRes.success) setWallet(wRes.data);
    }
    return res;
  };

  const cancelOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    );
  };

  const cancelAllOrders = () => {
    setOrders((prev) =>
      prev.map((o) => (o.status === 'OPEN' ? { ...o, status: 'CANCELLED' } : o))
    );
  };

  const addTransaction = (tx) => {
    const newTx = {
      id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
      ...tx,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const currentCoin = coins.find((c) => selectedPair.startsWith(c.symbol)) || coins[0];

  return (
    <MarketContext.Provider
      value={{
        coins,
        selectedPair,
        setSelectedPair,
        currentCoin,
        watchlist,
        toggleWatchlist,
        wallet,
        setWallet,
        orders,
        cancelOrder,
        cancelAllOrders,
        createNewOrder,
        transactions,
        addTransaction,
        loading,
        refreshMarketData,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
