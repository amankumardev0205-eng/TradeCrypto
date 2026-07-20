import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Clock,
  Newspaper,
  Star,
  Zap,
  CheckCircle2,
  ShieldCheck,
  X
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import DepositModal from '../components/ui/DepositModal';
import WithdrawModal from '../components/ui/WithdrawModal';
import TransferModal from '../components/ui/TransferModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const { wallet, coins, orders, cancelOrder, transactions, watchlist, toggleWatchlist, createNewOrder } = useMarket();
  const { addToast } = useToast();

  const [hideBalance, setHideBalance] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Quick Swap State
  const [swapCoin, setSwapCoin] = useState('BTC');
  const [swapAmount, setSwapAmount] = useState('');

  // Sample News
  const newsItems = [
    { id: 1, title: 'Bitcoin Surge Passes $92,000 as Global Adoption Reaches New Peak', category: 'MARKET', time: '10m ago' },
    { id: 2, title: 'Solana Ecosystem DEX Volume Outpaces Ethereum Mainnet in 24h Rally', category: 'DEFI', time: '35m ago' },
    { id: 3, title: 'Federal Reserve Signals Favorable Regulatory Outlook for Spot Crypto Assets', category: 'POLICY', time: '2h ago' },
  ];

  // PnL Chart Data
  const pnlData = [
    { day: 'Mon', pnl: 420 },
    { day: 'Tue', pnl: 680 },
    { day: 'Wed', pnl: 510 },
    { day: 'Thu', pnl: 890 },
    { day: 'Fri', pnl: 1040 },
    { day: 'Sat', pnl: 920 },
    { day: 'Sun', pnl: 1240 },
  ];

  const handleQuickBuy = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      addToast('Enter a valid amount to swap', 'error');
      return;
    }
    const targetCoin = coins.find((c) => c.symbol === swapCoin);
    const price = targetCoin ? targetCoin.price : 91450;
    const cryptoAmount = parseFloat(swapAmount) / price;

    await createNewOrder({
      pair: `${swapCoin}/USDT`,
      side: 'BUY',
      type: 'Market',
      price: price,
      amount: cryptoAmount.toFixed(4),
    });

    addToast(`Quick Bought ${cryptoAmount.toFixed(4)} ${swapCoin} for $${swapAmount} USDT`, 'success', 'Instant Swap Success');
    setSwapAmount('');
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-hidden">
          
          {/* Welcome Banner */}
          <div className="glass-card-gold p-6 rounded-3xl border border-[#F0B90B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  Welcome Back, {user?.name || 'Trader'}!
                </h1>
                <span className="bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/30 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {user?.kycLevel || 'Level 2 Verified'}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                UID: <span className="font-mono text-white">{user?.uid || '89104829'}</span> | Security Level: <span className="text-[#0ECB81] font-semibold">High (2FA Active)</span>
              </p>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="flex items-center gap-2 shrink-0 relative z-10">
              <button
                onClick={() => setDepositOpen(true)}
                className="px-4 py-2.5 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <ArrowDownRight className="w-4 h-4" /> Deposit
              </button>
              <button
                onClick={() => setWithdrawOpen(true)}
                className="px-4 py-2.5 bg-[#1E2329] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
              <button
                onClick={() => setTransferOpen(true)}
                className="px-4 py-2.5 bg-[#1E2329] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
              >
                <ArrowLeftRight className="w-4 h-4" /> Transfer
              </button>
            </div>
          </div>

          {/* Portfolio & PnL Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Total Balance Card */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <Wallet className="w-4 h-4 text-[#F0B90B]" /> Total Portfolio Balance
                  <button onClick={() => setHideBalance(!hideBalance)} className="text-gray-400 hover:text-white">
                    {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-xs text-[#0ECB81] bg-[#0ECB81]/10 px-2 py-0.5 rounded font-bold">
                  24h P&L +${wallet?.pnl24h || '1,240.80'} (+{wallet?.pnl24hPercentage || '2.78'}%)
                </span>
              </div>

              <div className="mb-6">
                <h2 className="font-mono font-extrabold text-3xl sm:text-4xl text-white">
                  {hideBalance ? '•••••••• USD' : `$${wallet?.totalUsdValue?.toLocaleString() || '45,892.40'}`}
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  ≈ {hideBalance ? '••••' : '0.5018 BTC'}
                </p>
              </div>

              {/* Wallet Summary Assets Progress */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <span className="text-[11px] text-gray-400 font-semibold uppercase">Top Asset Holdings</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {wallet?.assets?.slice(0, 4).map((asset) => (
                    <div key={asset.symbol} className="bg-[#0B0E11] p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{asset.symbol}</span>
                        <span className="text-[10px] text-gray-400">{asset.total}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#F0B90B]">
                        {hideBalance ? '••••' : `$${asset.value?.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profit & Loss Visual Card */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0ECB81]" /> Weekly P&L Growth
                </h3>
                <span className="text-xs font-mono text-gray-400">Last 7 Days</span>
              </div>

              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData}>
                    <defs>
                      <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ECB81" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ECB81" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ backgroundColor: '#1E2329', border: '1px solid #0ECB81', borderRadius: '10px' }} />
                    <Area type="monotone" dataKey="pnl" stroke="#0ECB81" strokeWidth={3} fill="url(#pnlGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-white/10">
                <span className="text-gray-400">Total Net Profit: <strong className="text-[#0ECB81] font-mono">+$4,680.00</strong></span>
                <span className="text-gray-400">Win Rate: <strong className="text-white font-mono">84.2%</strong></span>
              </div>
            </div>
          </div>

          {/* Main Content Split: Open Orders & Watchlist / Quick Trade */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Open Orders & Recent Transactions */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Open Orders Table Widget */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F0B90B]" /> Open Orders ({orders.filter(o => o.status === 'OPEN').length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold">
                        <th className="pb-3">Pair</th>
                        <th className="pb-3">Side</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {orders.filter(o => o.status === 'OPEN').map((ord) => (
                        <tr key={ord.id} className="table-row-hover">
                          <td className="py-3 font-bold text-white">{ord.pair}</td>
                          <td className={`py-3 font-bold ${ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>{ord.side}</td>
                          <td className="py-3 text-gray-300">{ord.type}</td>
                          <td className="py-3 font-bold text-white">${ord.price?.toLocaleString()}</td>
                          <td className="py-3 text-gray-300">{ord.amount}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                cancelOrder(ord.id);
                                addToast(`Cancelled order ${ord.id}`, 'info');
                              }}
                              className="px-2.5 py-1 bg-[#F6465D]/15 text-[#F6465D] hover:bg-[#F6465D] hover:text-white rounded-lg font-bold transition-all"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.filter(o => o.status === 'OPEN').length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-gray-500 italic">No open orders right now</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* News Feed Section */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#F0B90B]" /> Live Crypto News Feed
                </h3>

                <div className="space-y-3">
                  {newsItems.map((news) => (
                    <div key={news.id} className="p-3.5 bg-[#0B0E11] rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-[#F0B90B]/10 text-[#F0B90B] px-1.5 py-0.5 rounded font-bold">
                            {news.category}
                          </span>
                          <span className="text-[10px] text-gray-500">{news.time}</span>
                        </div>
                        <h4 className="font-semibold text-white text-xs hover:text-[#F0B90B] cursor-pointer transition-colors">
                          {news.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quick Buy/Sell & Watchlist */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Swap Widget */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F0B90B]" /> Instant Buy / Swap
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">Spend (USDT)</label>
                    <input
                      type="number"
                      placeholder="100.00"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3 py-2 font-mono text-white outline-none focus:border-[#F0B90B]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Receive Asset</label>
                    <select
                      value={swapCoin}
                      onChange={(e) => setSwapCoin(e.target.value)}
                      className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3 py-2 font-bold text-white outline-none focus:border-[#F0B90B]"
                    >
                      <option value="BTC">BTC - Bitcoin</option>
                      <option value="ETH">ETH - Ethereum</option>
                      <option value="SOL">SOL - Solana</option>
                    </select>
                  </div>

                  <button
                    onClick={handleQuickBuy}
                    className="w-full py-3 bg-[#0ECB81] hover:bg-emerald-400 text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all text-xs"
                  >
                    Execute Instant Buy
                  </button>
                </div>
              </div>

              {/* Watchlist Widget */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#F0B90B] fill-[#F0B90B]" /> Favorite Watchlist
                </h3>

                <div className="space-y-2">
                  {coins.filter(c => watchlist.includes(c.symbol)).map((c) => (
                    <div key={c.id} className="p-3 bg-[#0B0E11] rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleWatchlist(c.symbol)}>
                          <Star className="w-3.5 h-3.5 text-[#F0B90B] fill-[#F0B90B]" />
                        </button>
                        <span className="font-bold text-white text-xs">{c.symbol}</span>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="font-bold text-white">${c.price.toLocaleString()}</span>
                        <span className={`block text-[10px] ${c.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                          {c.change24h >= 0 ? '+' : ''}{c.change24h}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      <Footer />

      {/* Operation Modals */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
      <TransferModal isOpen={transferOpen} onClose={() => setTransferOpen(false)} />
    </div>
  );
};

export default UserDashboard;