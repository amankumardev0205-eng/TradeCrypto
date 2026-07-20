import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Sliders,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart2,
  Layers
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const TradingPage = () => {
  const { coins, selectedPair, setSelectedPair, currentCoin, createNewOrder, orders, cancelOrder } = useMarket();
  const { addToast } = useToast();

  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('area'); // 'area' or 'candles'
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [orderType, setOrderType] = useState('Limit'); // 'Limit', 'Market', 'Stop Limit'
  
  const [priceInput, setPriceInput] = useState(currentCoin?.price ? String(currentCoin.price) : '91450.80');
  const [amountInput, setAmountInput] = useState('');
  const [leverage, setLeverage] = useState('10x');
  const [sliderPercent, setSliderPercent] = useState(0);

  const [bottomTab, setBottomTab] = useState('open'); // 'open', 'history', 'positions'

  // Generate Candlestick / Area Chart Data based on current price
  const generateChartData = () => {
    const base = currentCoin?.price || 91450;
    const data = [];
    const times = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    let current = base * 0.96;

    times.forEach((t) => {
      const open = current;
      const change = (Math.random() - 0.45) * (base * 0.02);
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (base * 0.008);
      const low = Math.min(open, close) - Math.random() * (base * 0.008);
      current = close;
      data.push({
        time: t,
        price: Number(close.toFixed(2)),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
      });
    });
    return data;
  };

  const chartData = generateChartData();

  // Simulated Order Book Data
  const basePrice = currentCoin?.price || 91450;
  const asks = [
    { price: (basePrice * 1.0025).toFixed(2), amount: '0.4520', total: '41,380' },
    { price: (basePrice * 1.0020).toFixed(2), amount: '1.2050', total: '110,210' },
    { price: (basePrice * 1.0015).toFixed(2), amount: '0.8500', total: '77,730' },
    { price: (basePrice * 1.0010).toFixed(2), amount: '2.1400', total: '195,700' },
    { price: (basePrice * 1.0005).toFixed(2), amount: '0.3100', total: '28,340' },
  ];

  const bids = [
    { price: (basePrice * 0.9995).toFixed(2), amount: '0.6200', total: '56,690' },
    { price: (basePrice * 0.9990).toFixed(2), amount: '1.8500', total: '169,180' },
    { price: (basePrice * 0.9985).toFixed(2), amount: '0.9400', total: '85,960' },
    { price: (basePrice * 0.9980).toFixed(2), amount: '3.1000', total: '283,490' },
    { price: (basePrice * 0.9975).toFixed(2), amount: '1.1500', total: '105,160' },
  ];

  // Handle Order Submit
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const targetPrice = orderType === 'Market' ? currentCoin.price : parseFloat(priceInput);
    const amount = parseFloat(amountInput);

    if (!amount || amount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    const res = await createNewOrder({
      pair: selectedPair,
      side: activeTab.toUpperCase(),
      type: orderType,
      price: targetPrice,
      amount: amount,
    });

    if (res.success) {
      addToast(
        `${activeTab.toUpperCase()} order for ${amount} ${selectedCoinSymbol} placed successfully!`,
        'success',
        'Order Submitted'
      );
      setAmountInput('');
      setSliderPercent(0);
    }
  };

  const selectedCoinSymbol = selectedPair.split('/')[0];

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex w-full">
        <Sidebar collapsed={true} />

        <main className="flex-1 p-2 sm:p-4 space-y-4 overflow-x-hidden">
          
          {/* Header Pair Selector & Stats Bar */}
          <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={selectedPair}
                onChange={(e) => {
                  setSelectedPair(e.target.value);
                  const coin = coins.find(c => e.target.value.startsWith(c.symbol));
                  if (coin) setPriceInput(String(coin.price));
                }}
                className="bg-[#1E2329] border border-[#F0B90B]/30 rounded-xl px-3 py-1.5 font-bold text-sm text-[#F0B90B] outline-none cursor-pointer"
              >
                {coins.map((c) => (
                  <option key={c.id} value={`${c.symbol}/USDT`}>
                    {c.symbol} / USDT
                  </option>
                ))}
              </select>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-extrabold text-white">
                  ${currentCoin?.price?.toLocaleString() || '91,450.80'}
                </span>
                <span className={`text-xs font-bold font-mono ${
                  currentCoin?.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                }`}>
                  {currentCoin?.change24h >= 0 ? '+' : ''}{currentCoin?.change24h}%
                </span>
              </div>
            </div>

            {/* 24h Stats */}
            <div className="flex items-center gap-6 text-xs text-gray-400 font-mono hidden sm:flex">
              <div>
                <span className="block text-[10px] text-gray-500 uppercase">24h High</span>
                <span className="text-white font-bold">${currentCoin?.high24h?.toLocaleString() || '92,800.00'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 uppercase">24h Low</span>
                <span className="text-white font-bold">${currentCoin?.low24h?.toLocaleString() || '88,200.00'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 uppercase">24h Volume (USDT)</span>
                <span className="text-white font-bold">${(currentCoin?.volume24h / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Chart + Orderbook + Order Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Trading Chart Container */}
            <div className="lg:col-span-6 glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              
              {/* Timeframe & Chart Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-1">
                  {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                        timeframe === tf
                          ? 'bg-[#F0B90B] text-[#0B0E11]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChartType(chartType === 'area' ? 'candles' : 'area')}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart Graphics */}
              <div className="h-96 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="tradeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F0B90B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#848E9C" fontSize={10} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#848E9C" fontSize={10} tickLine={false} orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E2329', borderColor: '#F0B90B', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="price" stroke="#F0B90B" strokeWidth={2} fill="url(#tradeGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Middle: Order Book & Market Trades */}
            <div className="lg:col-span-3 glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white uppercase">Order Book</span>
                <span className="text-[10px] text-gray-500">Size (USDT)</span>
              </div>

              {/* Asks (Sells) in Red */}
              <div className="space-y-1 my-2">
                {asks.map((ask, i) => (
                  <div key={i} className="flex justify-between items-center relative py-0.5 px-1 rounded hover:bg-white/5">
                    <div className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/10 rounded" style={{ width: `${(i + 2) * 18}%` }} />
                    <span className="text-[#F6465D] font-bold z-10">${ask.price}</span>
                    <span className="text-gray-300 z-10">{ask.amount}</span>
                  </div>
                ))}
              </div>

              {/* Current Spread Price */}
              <div className="py-2 border-y border-white/10 my-1 text-center bg-[#0B0E11] rounded-lg">
                <span className="font-bold text-base text-[#0ECB81]">${currentCoin?.price?.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 block">Spread: $0.50</span>
              </div>

              {/* Bids (Buys) in Green */}
              <div className="space-y-1 my-2">
                {bids.map((bid, i) => (
                  <div key={i} className="flex justify-between items-center relative py-0.5 px-1 rounded hover:bg-white/5">
                    <div className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/10 rounded" style={{ width: `${(i + 1) * 20}%` }} />
                    <span className="text-[#0ECB81] font-bold z-10">${bid.price}</span>
                    <span className="text-gray-300 z-10">{bid.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Submission Form */}
            <div className="lg:col-span-3 glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
              
              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#0B0E11] p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'buy'
                      ? 'bg-[#0ECB81] text-[#0B0E11] shadow-lg shadow-[#0ECB81]/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'sell'
                      ? 'bg-[#F6465D] text-white shadow-lg shadow-[#F6465D]/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Order Types */}
              <div className="flex gap-2 text-xs border-b border-white/10 pb-2">
                {['Limit', 'Market', 'Stop Limit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`font-semibold transition-colors ${
                      orderType === type ? 'text-[#F0B90B]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Order Inputs */}
              <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
                {orderType !== 'Market' && (
                  <div>
                    <label className="block text-gray-400 mb-1">Order Price (USDT)</label>
                    <input
                      type="number"
                      step="any"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3 py-2 font-mono text-white outline-none focus:border-[#F0B90B]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 mb-1">Amount ({selectedCoinSymbol})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3 py-2 font-mono text-white outline-none focus:border-[#F0B90B]"
                  />
                </div>

                {/* Percentage Sliders */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => {
                        setSliderPercent(pct);
                        setAmountInput(String((0.1 * (pct / 100)).toFixed(4)));
                      }}
                      className={`py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
                        sliderPercent === pct
                          ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Order Execution Button */}
                <button
                  type="submit"
                  className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider mt-2 ${
                    activeTab === 'buy'
                      ? 'bg-[#0ECB81] hover:bg-emerald-400 text-[#0B0E11]'
                      : 'bg-[#F6465D] hover:bg-rose-400 text-white'
                  }`}
                >
                  {activeTab === 'buy' ? `Buy / Long ${selectedCoinSymbol}` : `Sell / Short ${selectedCoinSymbol}`}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Orders & Trades Panel */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex gap-4 border-b border-white/10 pb-2 text-xs font-semibold">
              <button
                onClick={() => setBottomTab('open')}
                className={`pb-1 ${bottomTab === 'open' ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]' : 'text-gray-400'}`}
              >
                Open Orders ({orders.filter(o => o.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setBottomTab('history')}
                className={`pb-1 ${bottomTab === 'history' ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]' : 'text-gray-400'}`}
              >
                Order History
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Pair</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders
                    .filter((o) => (bottomTab === 'open' ? o.status === 'OPEN' : true))
                    .map((ord) => (
                      <tr key={ord.id} className="table-row-hover">
                        <td className="py-2 text-gray-400">{ord.id}</td>
                        <td className="py-2 text-gray-400">{ord.timestamp}</td>
                        <td className="py-2 font-bold text-white">{ord.pair}</td>
                        <td className="py-2 text-gray-300">{ord.type}</td>
                        <td className={`py-2 font-bold ${ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>{ord.side}</td>
                        <td className="py-2 font-bold text-white">${ord.price?.toLocaleString()}</td>
                        <td className="py-2 text-gray-300">{ord.amount}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'FILLED'
                              ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                              : ord.status === 'CANCELLED'
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-[#F0B90B]/15 text-[#F0B90B]'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          {ord.status === 'OPEN' && (
                            <button
                              onClick={() => {
                                cancelOrder(ord.id);
                                addToast(`Order ${ord.id} cancelled`, 'info');
                              }}
                              className="px-2 py-0.5 bg-[#F6465D]/15 text-[#F6465D] hover:bg-[#F6465D] hover:text-white rounded font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TradingPage;