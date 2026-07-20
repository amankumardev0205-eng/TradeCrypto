import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { PieChart as PieIcon, TrendingUp, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const PortfolioPage = () => {
  const { wallet } = useMarket();
  const [timeframe, setTimeframe] = useState('1M');

  const assets = wallet?.assets || [];
  const COLORS = ['#F0B90B', '#0ECB81', '#6D5EF7', '#00F2FE', '#F6465D'];

  const performanceData = [
    { date: 'Jul 01', value: 38200 },
    { date: 'Jul 05', value: 40100 },
    { date: 'Jul 10', value: 39500 },
    { date: 'Jul 15', value: 42800 },
    { date: 'Jul 20', value: 45892 },
  ];

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
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
                <PieIcon className="w-6 h-6 text-[#F0B90B]" /> Portfolio Analytics & P&L Tracker
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Comprehensive asset allocation, yield history, and investment ROI analysis
              </p>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Total Portfolio Value</span>
              <h3 className="font-mono font-extrabold text-2xl text-white">
                ${wallet?.totalUsdValue?.toLocaleString() || '45,892.40'}
              </h3>
              <span className="text-[11px] text-[#0ECB81] font-semibold">+$7,692.40 All-Time</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Total Investment Cost</span>
              <h3 className="font-mono font-extrabold text-2xl text-white">$38,200.00</h3>
              <span className="text-[11px] text-gray-400">Initial Capital</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Total Profit / ROI</span>
              <h3 className="font-mono font-extrabold text-2xl text-[#0ECB81]">+20.13%</h3>
              <span className="text-[11px] text-[#0ECB81] font-semibold">+$7,692.40 Net Gain</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Best Performer</span>
              <h3 className="font-mono font-extrabold text-2xl text-[#F0B90B]">SOL (+84.5%)</h3>
              <span className="text-[11px] text-gray-400">Top Yielding Asset</span>
            </div>
          </div>

          {/* Performance Chart & Allocation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Performance Graph */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0ECB81]" /> Portfolio Valuation Growth
                </h3>
                <div className="flex gap-1 text-xs">
                  {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg font-bold font-mono transition-all ${
                        timeframe === tf ? 'bg-[#F0B90B] text-[#0B0E11]' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="portGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F0B90B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ backgroundColor: '#1E2329', borderColor: '#F0B90B', borderRadius: '10px' }} />
                    <Area type="monotone" dataKey="value" stroke="#F0B90B" strokeWidth={3} fill="url(#portGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Allocation Pie */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                <PieIcon className="w-4 h-4 text-[#F0B90B]" /> Allocation Breakdown
              </h3>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
                {assets.map((asset, i) => (
                  <div key={asset.symbol} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="font-bold text-white">{asset.symbol}</span>
                    </span>
                    <span className="text-gray-300">
                      ${asset.value?.toLocaleString()} ({((asset.value / (wallet?.totalUsdValue || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PortfolioPage;
