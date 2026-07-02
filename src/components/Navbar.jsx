import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <TrendingUp className="text-black" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Crypto<span className="text-emerald-400">Flow</span></span>
        </Link>
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
  );
}