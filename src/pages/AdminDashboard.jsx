import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  FileCheck,
  Coins,
  MessageSquare,
  Check,
  X,
  Lock,
  Unlock,
  Plus
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import Modal from '../components/ui/Modal';

const AdminDashboard = () => {
  const { coins } = useMarket();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'kyc', 'coins', 'tickets'

  // Mock Admin Users DB
  const [usersList, setUsersList] = useState([
    { id: 'usr-901', name: 'Alex Vance', email: 'alex@nexustrade.io', role: 'user', kyc: 'Level 2 Verified', status: 'ACTIVE' },
    { id: 'usr-902', name: 'Elena Rostova', email: 'elena@fund.io', role: 'user', kyc: 'Level 2 Verified', status: 'ACTIVE' },
    { id: 'usr-903', name: 'Jake Paul', email: 'jake@crypto.com', role: 'user', kyc: 'Pending Approval', status: 'SUSPENDED' },
  ]);

  // Mock KYC Queue DB
  const [kycQueue, setKycQueue] = useState([
    { id: 'KYC-104', name: 'Samantha Miller', docType: 'Passport', submitted: '2026-07-20 11:30', status: 'PENDING' },
    { id: 'KYC-105', name: 'David Beckham', docType: 'Driver License', submitted: '2026-07-20 10:15', status: 'PENDING' },
  ]);

  // Support Tickets
  const [tickets, setTickets] = useState([
    { id: 'TCK-801', user: 'alex@nexustrade.io', subject: 'Withdrawal Delay on Solana', status: 'OPEN' },
    { id: 'TCK-798', user: 'elena@fund.io', subject: 'API Rate Limit Upgrade', status: 'RESOLVED' },
  ]);

  // Selected Ticket Modal
  const [replyTicket, setReplyTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Revenue Analytics Data
  const revenueData = [
    { month: 'Jan', revenue: 145000 },
    { month: 'Feb', revenue: 189000 },
    { month: 'Mar', revenue: 210000 },
    { month: 'Apr', revenue: 245000 },
    { month: 'May', revenue: 290000 },
    { month: 'Jun', revenue: 340000 },
    { month: 'Jul', revenue: 420000 },
  ];

  const handleToggleUserStatus = (id) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u
      )
    );
    addToast(`User status toggled for ${id}`, 'info');
  };

  const handleKycAction = (id, decision) => {
    setKycQueue((prev) => prev.filter((k) => k.id !== id));
    addToast(`KYC ${id} has been ${decision}`, decision === 'APPROVED' ? 'success' : 'error');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === replyTicket.id ? { ...t, status: 'RESOLVED' } : t))
    );
    addToast(`Reply sent to ticket ${replyTicket.id}`, 'success');
    setReplyText('');
    setReplyTicket(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#0ECB81]" /> System Administration Dashboard
              </h1>
              <p className="text-xs text-gray-400 mt-1">Platform management, user access control, and revenue metrics</p>
            </div>
            <span className="bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/30 text-xs px-3 py-1 rounded-xl font-bold">
              SYSTEM LIVE
            </span>
          </div>

          {/* Admin Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Total Registered Users</span>
              <h3 className="font-mono font-extrabold text-2xl text-white">12,490</h3>
              <span className="text-[11px] text-[#0ECB81] font-semibold">+142 Today</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">24h Platform Trading Volume</span>
              <h3 className="font-mono font-extrabold text-2xl text-white">$84,210,950</h3>
              <span className="text-[11px] text-gray-400">All Spot & Futures Pairs</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Monthly Platform Revenue</span>
              <h3 className="font-mono font-extrabold text-2xl text-[#F0B90B]">$420,000</h3>
              <span className="text-[11px] text-[#0ECB81] font-semibold">+18.5% MoM</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 font-semibold">Pending KYC Applications</span>
              <h3 className="font-mono font-extrabold text-2xl text-[#F6465D]">{kycQueue.length}</h3>
              <span className="text-[11px] text-gray-400">Requires Review</span>
            </div>
          </div>

          {/* Platform Revenue Graph */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#F0B90B]" /> Platform Fee Revenue Growth ($USD)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <Tooltip contentStyle={{ backgroundColor: '#1E2329', borderColor: '#F0B90B', borderRadius: '10px' }} />
                  <Bar dataKey="revenue" fill="#F0B90B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Admin Management Tabs */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap gap-2">
            {[
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'kyc', label: `KYC Queue (${kycQueue.length})`, icon: FileCheck },
              { id: 'coins', label: 'Coin Listings', icon: Coins },
              { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-[#F0B90B] text-[#0B0E11]'
                      : 'bg-[#1E2329] text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Admin Content */}
          {activeTab === 'users' && (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold font-sans">
                    <th className="p-4">User ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">KYC</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map((u) => (
                    <tr key={u.id} className="table-row-hover">
                      <td className="p-4 text-gray-400">{u.id}</td>
                      <td className="p-4 font-bold text-white font-sans">{u.name}</td>
                      <td className="p-4 text-gray-300 font-sans">{u.email}</td>
                      <td className="p-4 font-bold text-[#F0B90B] uppercase">{u.role}</td>
                      <td className="p-4 text-[#0ECB81] font-sans font-semibold">{u.kyc}</td>
                      <td className="p-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE' ? 'bg-[#0ECB81]/15 text-[#0ECB81]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-sans">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="px-3 py-1 bg-[#1E2329] border border-white/10 hover:bg-white/10 text-white rounded-lg font-bold transition-all text-xs"
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold font-sans">
                    <th className="p-4">Queue ID</th>
                    <th className="p-4">User Name</th>
                    <th className="p-4">Document Type</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4 text-right">Approve / Reject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kycQueue.map((k) => (
                    <tr key={k.id} className="table-row-hover">
                      <td className="p-4 text-gray-400">{k.id}</td>
                      <td className="p-4 font-bold text-white font-sans">{k.name}</td>
                      <td className="p-4 text-gray-300 font-sans">{k.docType}</td>
                      <td className="p-4 text-gray-400">{k.submitted}</td>
                      <td className="p-4 text-right font-sans space-x-2">
                        <button
                          onClick={() => handleKycAction(k.id, 'APPROVED')}
                          className="px-3 py-1 bg-[#0ECB81] text-[#0B0E11] hover:bg-emerald-400 rounded-lg font-bold transition-all text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleKycAction(k.id, 'REJECTED')}
                          className="px-3 py-1 bg-[#F6465D] text-white hover:bg-rose-400 rounded-lg font-bold transition-all text-xs"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                  {kycQueue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 italic font-sans">
                        No pending KYC applications in queue
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'coins' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-base">Active Exchange Asset Listings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coins.map((c) => (
                  <div key={c.id} className="p-4 bg-[#0B0E11] rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/5 font-bold text-[#F0B90B] flex items-center justify-center text-sm">
                        {c.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-white">{c.name}</h4>
                        <span className="text-gray-400 font-mono">${c.price}</span>
                      </div>
                    </div>
                    <span className="bg-[#0ECB81]/15 text-[#0ECB81] px-2 py-0.5 rounded font-bold">Trading Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold font-sans">
                    <th className="p-4">Ticket ID</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((t) => (
                    <tr key={t.id} className="table-row-hover">
                      <td className="p-4 text-gray-400">{t.id}</td>
                      <td className="p-4 text-gray-300 font-sans">{t.user}</td>
                      <td className="p-4 font-bold text-white font-sans">{t.subject}</td>
                      <td className="p-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'RESOLVED' ? 'bg-[#0ECB81]/15 text-[#0ECB81]' : 'bg-[#F0B90B]/15 text-[#F0B90B]'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-sans">
                        {t.status === 'OPEN' && (
                          <button
                            onClick={() => setReplyTicket(t)}
                            className="px-3 py-1 bg-[#F0B90B] text-[#0B0E11] hover:bg-[#FCD535] rounded-lg font-bold transition-all text-xs"
                          >
                            Reply
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>

      <Footer />

      {/* Ticket Reply Modal */}
      <Modal isOpen={!!replyTicket} onClose={() => setReplyTicket(null)} title={`Reply to Ticket ${replyTicket?.id}`}>
        <form onSubmit={handleSendReply} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Subject</label>
            <input
              type="text"
              disabled
              value={replyTicket?.subject || ''}
              className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Admin Response</label>
            <textarea
              rows={4}
              placeholder="Type official support response..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-[#1E2329] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#F0B90B]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#F0B90B] text-[#0B0E11] font-bold rounded-xl shadow transition-all"
          >
            Send Support Response
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;