import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import {
  TrendingUp,
  Wallet,
  PieChart,
  Repeat,
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
  Grid
} from 'lucide-react';
import DepositModal from '../ui/DepositModal';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { coins } = useMarket();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const topCoins = coins.slice(0, 4);

  const navLinks = [
    { name: 'Markets', path: '/markets', icon: TrendingUp },
    { name: 'Trading', path: '/trading', icon: Repeat },
    { name: 'Dashboard', path: '/terminal', icon: Grid },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Orders', path: '/orders', icon: Repeat },
    { name: 'Transactions', path: '/transactions', icon: ShieldAlert },
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldCheck, badge: 'PRO' }] : []),
  ];

  return (
    <>
      {/* Top Live Ticker Bar */}
      <div className="bg-[#0B0E11] border-b border-white/5 py-1 px-4 text-xs overflow-hidden hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1 text-[#F0B90B] font-semibold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Live Ticker
            </span>
            {topCoins.map((coin) => (
              <div key={coin.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold text-white">{coin.symbol}</span>
                <span className="font-mono text-gray-300">${coin.price.toLocaleString()}</span>
                <span className={`font-mono text-[11px] font-semibold ${coin.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-[11px] shrink-0">
            <span>24h Vol: <strong className="text-white font-mono">$84.2B</strong></span>
            <span>DOM: <strong className="text-white font-mono">BTC 56.4%</strong></span>
            <span className="flex items-center gap-1 text-[#0ECB81]">
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse"></span> Systems Normal
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0E11]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F0B90B] via-[#FCD535] to-amber-200 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-heading font-black text-[#0B0E11] text-xl tracking-tighter">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                NEXUS <span className="text-[#F0B90B] text-xs px-1.5 py-0.5 rounded bg-[#F0B90B]/10 border border-[#F0B90B]/30">PRO</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                  {link.badge && (
                    <span className="ml-1 text-[9px] bg-[#F0B90B] text-[#0B0E11] px-1 rounded font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setDepositOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg transition-all"
                >
                  <ArrowDownRight className="w-4 h-4" /> Deposit
                </button>

                <Link
                  to="/profile"
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F0B90B]"></span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 p-1.5 bg-[#1E2329] hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F0B90B] to-[#0ECB81] text-[#0B0E11] font-bold text-xs flex items-center justify-center uppercase">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-white hidden md:inline max-w-[100px] truncate">
                      {user?.name || 'Trader'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {userDropdown && (
                    <div
                      onMouseLeave={() => setUserDropdown(false)}
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-white/10 shadow-2xl p-2 z-50 text-xs"
                    >
                      <div className="p-2.5 border-b border-white/10 mb-1">
                        <p className="font-bold text-white truncate">{user?.name || 'Crypto Trader'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] bg-[#0ECB81]/20 text-[#0ECB81] px-2 py-0.5 rounded font-semibold border border-[#0ECB81]/30">
                          {user?.kycLevel || 'Level 2 Verified'}
                        </span>
                      </div>

                      <Link
                        to="/terminal"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/5 hover:text-white"
                      >
                        <Grid className="w-4 h-4 text-[#F0B90B]" /> Terminal Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/5 hover:text-white"
                      >
                        <User className="w-4 h-4 text-[#F0B90B]" /> Security & Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/5 hover:text-white"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#0ECB81]" /> Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#F6465D] hover:bg-[#F6465D]/10 text-left font-semibold mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-white hover:text-[#F0B90B] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-400 hover:text-white lg:hidden"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {menuOpen && (
          <div className="lg:hidden glass-panel border-b border-white/10 p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="w-4 h-4 text-[#F0B90B]" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Deposit Modal Container */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </>
  );
};

export default Navbar;