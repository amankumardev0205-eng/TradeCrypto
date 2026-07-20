const HeroDashboard = () => {
  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_30px_80px_-35px_rgba(240,185,11,0.45)] backdrop-blur-xl">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Portfolio Value</span>
          <span className="text-emerald-400">+12.4%</span>
        </div>
        <div className="mt-3 text-3xl font-bold text-white">$128,420</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-900 p-4">
          <div className="text-xs text-slate-400">BTC / USD</div>
          <div className="mt-2 text-xl font-bold text-yellow-400">$68,240</div>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4">
          <div className="text-xs text-slate-400">ETH / USD</div>
          <div className="mt-2 text-xl font-bold text-emerald-400">$3,840</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Live Pairs</span>
          <span>24 markets</span>
        </div>
        <div className="mt-3 space-y-3">
          {[
            ["BTC/USDT", "+2.34%"],
            ["ETH/USDT", "+1.12%"],
            ["SOL/USDT", "+4.88%"],
          ].map(([pair, change]) => (
            <div key={pair} className="flex items-center justify-between rounded-xl bg-slate-800/90 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-200">{pair}</span>
              <span className="text-emerald-400">{change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
