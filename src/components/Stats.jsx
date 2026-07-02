import { ShieldCheck, Zap, Globe } from 'lucide-react';

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

export default function Stats() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={<ShieldCheck className="text-emerald-400" size={32} />}
          title="Encrypted KYC"
          desc="Military-grade video verification ensures your account is protected 24/7." />
        <StatCard
          icon={<Zap className="text-emerald-400" size={32} />}
          title="Instant Fiat"
          desc="Automated settlement system pushes funds to your bank the moment the trade clears." />
        <StatCard
          icon={<Globe className="text-emerald-400" size={32} />}
          title="Global Liquidity"
          desc="Access deep pools for USDT and ETH to ensure the best market rates for every sale." />
      </div>
    </section>
  );
}