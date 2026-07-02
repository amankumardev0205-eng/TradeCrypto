import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

const AssetRow = ({ name, code, price, change, isUp, chart }) => (
  <div className="grid grid-cols-4 items-center py-3 border-b border-slate-800/50 last:border-none">
    <div className="col-span-2 flex items-center gap-3">
      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
        {chart}
      </div>
      <div>
        <p className="font-bold text-white">{name}</p>
        <p className="text-xs text-slate-500">{code}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-mono text-white">${price}</p>
      <p className={`text-xs font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '+' : '-'}{change}%
      </p>
    </div>
    <div className="flex justify-end">
      {isUp ? <ArrowUpRight className="text-emerald-400" size={20} /> : <ArrowDownRight className="text-red-400" size={20} />}
    </div>
  </div>
);

export default function HeroDashboard({ className }) {
  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Market Overview</h3>
        <button className="text-slate-500 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Placeholder Chart */}
      <div className="h-32 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-lg mb-4 flex items-end p-2">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
          <path d="M0 40 Q 10 20, 20 30 T 40 25 T 60 40 T 80 30 T 100 20" stroke="#00ffa3" fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </div>
      
      <div>
        <AssetRow name="Bitcoin" code="BTC" price="68,420.50" change="2.3" isUp={true} chart={<div className="w-4 h-4 bg-orange-500 rounded-full" />} />
        <AssetRow name="Ethereum" code="ETH" price="3,520.18" change="1.8" isUp={true} chart={<div className="w-4 h-4 bg-blue-500 rotate-45" />} />
        <AssetRow name="Tether" code="USDT" price="1.00" change="0.01" isUp={false} chart={<div className="w-4 h-4 bg-emerald-500" />} />
      </div>
    </div>
  );
}