import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  UserCheck,
  ShieldCheck,
  Lock,
  Key,
  Bell,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';
import KYCModal from '../components/ui/KYCModal';
import TwoFAModal from '../components/ui/TwoFAModal';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [kycOpen, setKycOpen] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 'KEY-9910', name: 'TradingBot-Pro', permissions: ['Read', 'Trade'], createdAt: '2026-06-10' },
  ]);
  const [keyName, setKeyName] = useState('');

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(true);
  const [securityNotif, setSecurityNotif] = useState(true);
  const [tradeNotif, setTradeNotif] = useState(true);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      addToast('Please enter both current and new password', 'error');
      return;
    }
    addToast('Password changed successfully!', 'success', 'Security Updated');
    setOldPassword('');
    setNewPassword('');
  };

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!keyName) {
      addToast('Enter a key label/name', 'error');
      return;
    }
    const newKey = {
      id: 'KEY-' + Math.floor(1000 + Math.random() * 9000),
      name: keyName,
      permissions: ['Read', 'Trade'],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApiKeys([...apiKeys, newKey]);
    addToast(`New API key "${keyName}" generated`, 'success', 'API Key Created');
    setKeyName('');
  };

  const handleDeleteKey = (id) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    addToast('API Key revoked and deleted', 'info');
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
                <UserCheck className="w-6 h-6 text-[#F0B90B]" /> Security & Account Settings
              </h1>
              <p className="text-xs text-gray-400 mt-1">Manage KYC identity, 2FA authentication, and API access keys</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Personal Profile & KYC */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* User Identity Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F0B90B] to-[#0ECB81] text-[#0B0E11] font-heading font-black text-2xl flex items-center justify-center shadow-lg">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{user?.name || 'Alex Vance'}</h2>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">
                      UID: {user?.uid || '89104829'}
                    </span>
                  </div>
                </div>

                {/* KYC Status Banner */}
                <div className="p-4 bg-[#0B0E11] rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#0ECB81]" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{user?.kycLevel || 'Level 2 Verified'}</h4>
                      <p className="text-[10px] text-gray-400">Daily limit: 100 BTC / Unlimited Fiat</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setKycOpen(true)}
                    className="px-3.5 py-1.5 bg-[#F0B90B] text-[#0B0E11] hover:bg-[#FCD535] font-bold text-xs rounded-xl shadow transition-all"
                  >
                    Upgrade KYC
                  </button>
                </div>
              </div>

              {/* Security & 2FA Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#F0B90B]" /> 2-Factor Authentication (2FA)
                </h3>

                <div className="p-4 bg-[#0B0E11] rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-[#F0B90B]" />
                    <div>
                      <h4 className="font-bold text-white text-xs">Google Authenticator</h4>
                      <p className="text-[10px] text-gray-400">
                        {user?.twoFactorEnabled ? '2FA Enabled for login and withdrawals' : 'Not setup'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFaOpen(true)}
                    className="px-3.5 py-1.5 bg-[#1E2329] border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    {user?.twoFactorEnabled ? 'Re-Configure' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Change Password */}
                <form onSubmit={handlePasswordChange} className="space-y-3 pt-2 border-t border-white/10 text-xs">
                  <h4 className="font-bold text-white">Change Account Password</h4>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#F0B90B]"
                  />
                  <input
                    type="password"
                    placeholder="New Strong Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#F0B90B]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1E2329] hover:bg-white/10 border border-white/10 font-bold rounded-xl text-white transition-all"
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: API Keys & Preferences */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* API Keys Management */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#F0B90B]" /> API Keys & Automated Trading
                </h3>

                <form onSubmit={handleGenerateKey} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Key Label (e.g. TradingBot)"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="flex-1 bg-[#1E2329] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#F0B90B]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F0B90B] text-[#0B0E11] font-bold rounded-xl shadow hover:bg-[#FCD535] transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Create Key
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="p-3 bg-[#0B0E11] rounded-2xl border border-white/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-white block">{key.name}</span>
                        <span className="text-[10px] text-gray-500">{key.id} | Scopes: Read, Trade</span>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1.5 text-[#F6465D] hover:bg-[#F6465D]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Settings */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F0B90B]" /> Notification Preferences
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-[#0B0E11] rounded-2xl border border-white/10">
                    <div>
                      <span className="font-bold text-white block">Email Trading Notifications</span>
                      <span className="text-[10px] text-gray-400">Receive order filled and liquidation alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      className="w-4 h-4 accent-[#F0B90B]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#0B0E11] rounded-2xl border border-white/10">
                    <div>
                      <span className="font-bold text-white block">Security Warnings</span>
                      <span className="text-[10px] text-gray-400">Receive alerts on new IP logins</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={securityNotif}
                      onChange={(e) => setSecurityNotif(e.target.checked)}
                      className="w-4 h-4 accent-[#F0B90B]"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      <Footer />

      {/* Modals */}
      <KYCModal isOpen={kycOpen} onClose={() => setKycOpen(false)} />
      <TwoFAModal isOpen={twoFaOpen} onClose={() => setTwoFaOpen(false)} />
    </div>
  );
};

export default ProfilePage;
