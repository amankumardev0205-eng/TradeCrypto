import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe, ArrowRight, TrendingUp, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* 1. NEON GLASS NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <TrendingUp className="text-black" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Crypto<span className="text-emerald-400">Flow</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
            <a href="#market" className="hover:text-emerald-400 transition">Market</a>
            <a href="#security" className="hover:text-emerald-400 transition">Vault</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition">LOGIN</Link>
            <Link to="/register" className="bg-emerald-500 text-black px-6 py-3 rounded-lg text-sm font-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              OPEN ACCOUNT
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. PRO TRADING HERO */}
      <main className="relative pt-44 pb-32 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black mb-10 border border-emerald-500/20 tracking-widest uppercase">
            <BarChart3 size={14} /> Live Market Execution Enabled
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase italic">
            Liquidate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Digital Assets
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Professional-grade liquidation for USDT and Ethereum. 
            Direct bank settlements with millisecond execution speeds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register" className="group w-full sm:w-auto bg-emerald-500 text-black px-10 py-5 rounded-xl font-black text-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
              SELL NOW
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-xl font-black text-lg border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
              VIEW TERMINAL
            </Link>
          </div>
        </div>
      </main>

      {/* 3. TRADING STATS / FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<ShieldCheck className="text-emerald-400" size={32} />}
            title="Encrypted KYC"
            desc="Military-grade video verification ensures your account is protected 24/7."
          />
          <StatCard 
            icon={<Zap className="text-emerald-400" size={32} />}
            title="Instant Fiat"
            desc="Automated settlement system pushes funds to your bank the moment the trade clears."
          />
          <StatCard 
            icon={<Globe className="text-emerald-400" size={32} />}
            title="Global Liquidity"
            desc="Access deep pools for USDT and ETH to ensure the best market rates for every sale."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, title, desc }) {
  return (
    <div className="p-10 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-500 group">
      <div className="mb-8 p-4 bg-slate-950 w-fit rounded-2xl border border-slate-800 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 uppercase italic">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}