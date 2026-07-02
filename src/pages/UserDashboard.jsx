import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Wallet, History, Radio, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function UserDashboard() {
  const transactions = [
    { type: 'Sell ETH', time: '2 minutes ago', value: '- 2.50 ETH', status: 'down' },
    { type: 'Sell USDT', time: '1 hour ago', value: '- 1,500.00 USDT', status: 'down' },
    { type: 'Account Deposit', time: '3 days ago', value: '+ 5.00 ETH', status: 'up' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f3fb] text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-100">
      
      {/* 1. Header Inspired by Kraken Color Theme */}
      <header className="bg-[#5741d9] px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-wide text-white">
            <span className="text-white text-2xl font-normal">⋔</span> CRYPTO<span className="text-white/80">FLOW</span>
          </Link>
          <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white px-3 py-1.5 rounded-full transition-colors">
            <ArrowLeft size={12} /> Back to Hub
          </Link>
        </div>
        
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-white tracking-wide">
          <Radio size={12} className="animate-pulse text-emerald-400" /> 
          LIVE MARKET EXECUTION ENABLED
        </div>
      </header>

      {/* 2. Main Terminal Content Cockpit */}
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-16 pt-10 pb-16 space-y-6">
        
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Terminal</h1>
          <p className="text-xs text-slate-400 font-medium">Manage instant assets routing logs and custom liquidation operations.</p>
        </div>

        {/* Balance Segment Cards Row */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-indigo-950/[0.015] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current USDT Balance</p>
              <p className="text-3xl font-black text-slate-900 mt-2">0.00 <span className="text-base font-medium text-slate-400 ml-1">USDT</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-indigo-950/[0.015] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current ETH Balance</p>
              <p className="text-3xl font-black text-slate-900 mt-2">0.00 <span className="text-base font-medium text-slate-400 ml-1">ETH</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5741d9] flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        {/* Lower Workspace Split Block */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Execution Box Left Panel */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-indigo-950/[0.015] space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-[#5741d9]"/> Execute Asset Liquidation
              </h3>
              <p className="text-xs text-slate-500 mt-1">Professional-grade liquidation interface with instant fiat distribution paths.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Asset</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#5741d9] rounded-xl text-sm font-bold text-slate-700 focus:outline-none cursor-pointer">
                  <option>USDT (Tether)</option>
                  <option>ETH (Ethereum)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#5741d9] rounded-xl text-sm font-black focus:outline-none focus:bg-white transition-all text-slate-800" 
                />
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-[#5741d9] hover:bg-[#4833c4] text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-600/10 transition-all text-sm mt-4">
                Secure Sell Now <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Activity Logs Sidebar Right Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-indigo-950/[0.015] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <History size={16} className="text-[#5741d9]" />
                <h3 className="font-extrabold text-slate-900 text-sm">Recent Activity</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                        {tx.status === 'up' ? <ArrowUpRight size={12} className="text-emerald-500"/> : <ArrowDownRight size={12} className="text-rose-500" />}
                        {tx.type}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium ml-4">{tx.time}</p>
                    </div>
                    <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                      tx.status === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}>
                      {tx.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Platform Specifications Metadata */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400 text-center">
              <div>
                <p className="text-[#5741d9] text-[9px]">Security</p>
                <p className="text-slate-600 mt-0.5">256-bit AES</p>
              </div>
              <div>
                <p className="text-[#5741d9] text-[9px]">Liquidity</p>
                <p className="text-slate-600 mt-0.5">Connected</p>
              </div>
              <div>
                <p className="text-[#5741d9] text-[9px]">Version</p>
                <p className="text-slate-600 mt-0.5">v4.0.2 Stable</p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}