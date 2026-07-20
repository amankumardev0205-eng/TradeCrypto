import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  PieChart as PieIcon,
  ShieldCheck,
  TrendingUp,
  History
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DepositModal from '../components/ui/DepositModal';
import WithdrawModal from '../components/ui/WithdrawModal';
import TransferModal from '../components/ui/TransferModal';

const WalletPage = () => {
  const { wallet, transactions } = useMarket();
  const [search, setSearch] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const assets = wallet?.assets || [];
  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const COLORS = ['#F0B90B', '#0ECB81', '#6D5EF7', '#00F2FE', '#F6465D'];

  const pieData = assets.map((a) => ({
    name: a.symbol,
    value: a.value,
  }));

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-hidden">
          
          {/* Net Worth & Quick Action Header */}
          <div className="glass-card-gold p-6 sm:p-8 rounded-3xl border border-[#F0B90B]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <Wallet className="w-4 h-4 text-[#F0B90B]" /> Estimated Net Worth
              </div>
              <h1 className="font-mono font-extrabold text-3xl sm:text-4xl text-white">
                ${wallet?.totalUsdValue?.toLocaleString() || '45,892.40'}
              </h1>
              <p className="text-xs text-[#0ECB81] font-mono font-semibold">
                24h Profit: +${wallet?.pnl24h || '1,240.80'} (+{wallet?.pnl24hPercentage || '2.78'}%)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setDepositOpen(true)}
                className="px-5 py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowDownRight className="w-4 h-4" /> Deposit
              </button>
              <button
                onClick={() => setWithdrawOpen(true)}
                className="px-5 py-3 bg-[#1E2329] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
              <button
                onClick={() => setTransferOpen(true)}
                className="px-5 py-3 bg-[#1E2329] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" /> Transfer
              </button>
            </div>
          </div>

          {/* Asset Allocation Pie Chart & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#F0B90B]" /> Spot Assets & Balances
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search asset..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#F0B90B]"
                  />
                </div>
              </div>

              {/* Assets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Total Balance</th>
                      <th className="pb-3">Available</th>
                      <th className="pb-3">In Order</th>
                      <th className="pb-3">USD Value</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.symbol} className="table-row-hover">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-white/5 text-[#F0B90B] font-bold flex items-center justify-center">
                            {asset.symbol[0]}
                          </span>
                          <div>
                            <span className="block">{asset.symbol}</span>
                            <span className="text-[10px] text-gray-400 font-sans">{asset.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-white font-bold">{asset.total}</td>
                        <td className="py-3 text-gray-300">{asset.available}</td>
                        <td className="py-3 text-gray-400">{asset.inOrder}</td>
                        <td className="py-3 text-[#F0B90B] font-bold">${asset.value?.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setDepositOpen(true)}
                            className="px-2.5 py-1 text-[#F0B90B] hover:bg-[#F0B90B]/10 rounded font-bold transition-all mr-1"
                          >
                            Deposit
                          </button>
                          <button
                            onClick={() => setWithdrawOpen(true)}
                            className="px-2.5 py-1 text-gray-400 hover:bg-white/10 hover:text-white rounded font-bold transition-all"
                          >
                            Withdraw
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Asset Allocation Pie Chart */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <PieIcon className="w-4 h-4 text-[#F0B90B]" /> Portfolio Breakdown
              </h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: '#1E2329', borderColor: '#F0B90B', borderRadius: '10px' }} />
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                {assets.map((asset, i) => (
                  <div key={asset.symbol} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="font-bold text-white">{asset.symbol}</span>
                    </span>
                    <span className="font-mono text-gray-300">
                      {((asset.value / (wallet?.totalUsdValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
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

export default WalletPage;