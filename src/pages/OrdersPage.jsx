import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import { ClipboardList, Trash2, Filter, Search } from 'lucide-react';
import Modal from '../components/ui/Modal';

const OrdersPage = () => {
  const { orders, cancelOrder, cancelAllOrders } = useMarket();
  const { addToast } = useToast();

  const [tab, setTab] = useState('open'); // 'open', 'history'
  const [pairFilter, setPairFilter] = useState('ALL');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [confirmCancelAll, setConfirmCancelAll] = useState(false);

  const filteredOrders = orders.filter((ord) => {
    if (tab === 'open' && ord.status !== 'OPEN') return false;
    if (tab === 'history' && ord.status === 'OPEN') return false;
    if (pairFilter !== 'ALL' && ord.pair !== pairFilter) return false;
    if (sideFilter !== 'ALL' && ord.side !== sideFilter) return false;
    return true;
  });

  const handleCancelAll = () => {
    cancelAllOrders();
    addToast('All open orders have been cancelled successfully', 'info', 'Orders Cancelled');
    setConfirmCancelAll(false);
  };

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
                <ClipboardList className="w-6 h-6 text-[#F0B90B]" /> Orders & Execution History
              </h1>
              <p className="text-xs text-gray-400 mt-1">Manage active open orders and view completed execution logs</p>
            </div>

            {orders.some(o => o.status === 'OPEN') && (
              <button
                onClick={() => setConfirmCancelAll(true)}
                className="px-4 py-2.5 bg-[#F6465D]/15 hover:bg-[#F6465D] text-[#F6465D] hover:text-white border border-[#F6465D]/30 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Cancel All Open Orders
              </button>
            )}
          </div>

          {/* Filter Bar & Tabs */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('open')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'open' ? 'bg-[#F0B90B] text-[#0B0E11]' : 'bg-[#1E2329] text-gray-400 hover:text-white'
                }`}
              >
                Open Orders ({orders.filter(o => o.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'history' ? 'bg-[#F0B90B] text-[#0B0E11]' : 'bg-[#1E2329] text-gray-400 hover:text-white'
                }`}
              >
                Order History
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={pairFilter}
                onChange={(e) => setPairFilter(e.target.value)}
                className="bg-[#1E2329] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none"
              >
                <option value="ALL">All Pairs</option>
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="SOL/USDT">SOL/USDT</option>
              </select>

              <select
                value={sideFilter}
                onChange={(e) => setSideFilter(e.target.value)}
                className="bg-[#1E2329] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none"
              >
                <option value="ALL">All Sides</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase font-sans">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Pair</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Side</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Filled</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="table-row-hover">
                    <td className="p-4 text-gray-400">{ord.id}</td>
                    <td className="p-4 text-gray-400">{ord.timestamp}</td>
                    <td className="p-4 font-bold text-white font-sans">{ord.pair}</td>
                    <td className="p-4 text-gray-300">{ord.type}</td>
                    <td className={`p-4 font-bold ${ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>{ord.side}</td>
                    <td className="p-4 font-bold text-white">${ord.price?.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">{ord.amount}</td>
                    <td className="p-4 text-gray-400">{ord.filled}</td>
                    <td className="p-4 font-sans">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        ord.status === 'FILLED'
                          ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                          : ord.status === 'CANCELLED'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-[#F0B90B]/15 text-[#F0B90B]'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-sans">
                      {ord.status === 'OPEN' && (
                        <button
                          onClick={() => {
                            cancelOrder(ord.id);
                            addToast(`Cancelled order ${ord.id}`, 'info');
                          }}
                          className="px-3 py-1 bg-[#F6465D]/15 text-[#F6465D] hover:bg-[#F6465D] hover:text-white rounded-lg font-bold transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500 italic font-sans">
                      No matching orders found in record
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <Footer />

      {/* Confirmation Modal */}
      <Modal isOpen={confirmCancelAll} onClose={() => setConfirmCancelAll(false)} title="Cancel All Open Orders">
        <div className="space-y-4 text-center">
          <p className="text-xs text-gray-300">
            Are you sure you want to cancel all active open limit orders? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setConfirmCancelAll(false)}
              className="flex-1 py-2.5 bg-[#1E2329] hover:bg-white/10 text-white font-bold rounded-xl text-xs"
            >
              Back
            </button>
            <button
              onClick={handleCancelAll}
              className="flex-1 py-2.5 bg-[#F6465D] hover:bg-rose-400 text-white font-bold rounded-xl text-xs"
            >
              Confirm Cancel All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;