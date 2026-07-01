export default function UserDashboard() {
  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 mb-2">USDT Balance</p>
          <h2 className="text-4xl font-bold">0.00</h2>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 mb-2">ETH Balance</p>
          <h2 className="text-4xl font-bold">0.00</h2>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="flex-1 bg-slate-200 text-slate-500 py-4 rounded-2xl font-bold cursor-not-allowed">BUY (Coming Soon)</button>
        <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">SELL NOW</button>
      </div>
    </div>
  );
}