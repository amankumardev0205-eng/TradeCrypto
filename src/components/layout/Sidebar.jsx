import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Wallet,
  PieChart,
  ClipboardList,
  History,
  UserCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const Sidebar = ({ collapsed = false }) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/terminal', icon: LayoutDashboard },
    { name: 'Spot Trading', path: '/trading', icon: LineChart },
    { name: 'Markets', path: '/markets', icon: TrendingUp },
    { name: 'Wallet Assets', path: '/wallet', icon: Wallet },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Open Orders', path: '/orders', icon: ClipboardList },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Security & Profile', path: '/profile', icon: UserCheck },
    ...(isAdmin ? [{ name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck, isPro: true }] : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#0B0E11] border-r border-white/10 transition-all duration-300 ${
        collapsed ? 'w-16 p-2' : 'w-64 p-4'
      }`}
    >
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F0B90B] text-[#0B0E11] shadow-lg shadow-[#F0B90B]/20 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="truncate flex-1 flex items-center justify-between">
                  {item.name}
                  {item.isPro && (
                    <span className="bg-[#0ECB81] text-[#0B0E11] text-[9px] px-1.5 py-0.5 rounded font-black">
                      ADMIN
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {!collapsed && (
        <div className="mt-auto pt-6">
          <div className="glass-card-gold p-4 rounded-2xl border border-[#F0B90B]/30 relative overflow-hidden text-xs">
            <div className="flex items-center gap-2 text-[#F0B90B] font-bold mb-1">
              <Zap className="w-4 h-4" /> NEXUS Futures 100x
            </div>
            <p className="text-[11px] text-gray-300 mb-3">
              Trade crypto derivatives with up to 100x leverage and zero slippage.
            </p>
            <NavLink
              to="/trading"
              className="inline-block w-full py-2 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] text-center font-bold rounded-xl transition-all"
            >
              Trade Futures
            </NavLink>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
