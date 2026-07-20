import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import { History, Download, Search, CheckCircle2, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

const TransactionsPage = () => {
  const { transactions } = useMarket();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'
  const [search, setSearch] = useState('');

  const filteredTx = transactions.filter((tx) => {
    if (activeTab !== 'ALL' && tx.type !== activeTab) return false;
    if (
      search &&
      !tx.coin.toLowerCase().includes(search.toLowerCase()) &&
      !tx.txHash.toLowerCase().includes(search.toLowerCase()) &&
      !tx.id.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // CSV Exporter Generator
  const handleExportCSV = () => {
    if (filteredTx.length === 0) {
      addToast('No transaction data to export', 'error');
      return;
    }

    const headers = ['Transaction ID', 'Type', 'Coin', 'Amount', 'Address/Target', 'TxHash', 'Status', 'Timestamp'];
    const rows = filteredTx.map((tx) => [
      tx.id,
      tx.type,
      tx.coin,
      tx.amount,
      `"${tx.address}"`,
      tx.txHash,
      tx.status,
      `"${tx.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEXUS_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Transaction report exported as CSV file!', 'success', 'Export Complete');
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
                <History className="w-6 h-6 text-[#F0B90B]" /> Wallet Transaction Records
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Complete audit trail for deposits, withdrawals, and internal account transfers
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <Download className="w-4 h-4" /> Export CSV Report
            </button>
          </div>

          {/* Filter Bar & Tabs */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === t ? 'bg-[#F0B90B] text-[#0B0E11]' : 'bg-[#1E2329] text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'ALL' ? 'All Transactions' : t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coin or TxHash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#F0B90B]"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase font-sans">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Coin</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Destination / Address</th>
                  <th className="p-4">TxHash</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="table-row-hover">
                    <td className="p-4 text-gray-400">{tx.id}</td>
                    <td className="p-4 font-sans font-bold">
                      <span className={`inline-flex items-center gap-1 ${
                        tx.type === 'DEPOSIT'
                          ? 'text-[#0ECB81]'
                          : tx.type === 'WITHDRAW'
                          ? 'text-[#F6465D]'
                          : 'text-[#F0B90B]'
                      }`}>
                        {tx.type === 'DEPOSIT' && <ArrowDownRight className="w-3.5 h-3.5" />}
                        {tx.type === 'WITHDRAW' && <ArrowUpRight className="w-3.5 h-3.5" />}
                        {tx.type === 'TRANSFER' && <ArrowLeftRight className="w-3.5 h-3.5" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white font-sans">{tx.coin}</td>
                    <td className="p-4 font-bold text-white">${tx.amount}</td>
                    <td className="p-4 text-gray-300 max-w-[150px] truncate">{tx.address}</td>
                    <td className="p-4 text-gray-400 underline cursor-pointer">{tx.txHash}</td>
                    <td className="p-4 font-sans">
                      <span className="bg-[#0ECB81]/15 text-[#0ECB81] px-2.5 py-1 rounded text-[10px] font-bold">
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-400">{tx.timestamp}</td>
                  </tr>
                ))}
                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 italic font-sans">
                      No transaction history found matching filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TransactionsPage;