import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, Server, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0B0E11] border-t border-white/10 text-gray-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F0B90B] flex items-center justify-center font-bold text-[#0B0E11] text-lg">
                N
              </div>
              <span className="font-heading font-bold text-lg text-white">NEXUS PRO</span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              The world's leading futuristic cryptocurrency exchange. Fast execution, institutional-grade security, and 100x leverage on spot & derivative markets.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
              <span className="flex items-center gap-1.5 text-[#0ECB81]">
                <Server className="w-3.5 h-3.5" /> API Response: 1.2ms
              </span>
              <span className="flex items-center gap-1.5 text-[#F0B90B]">
                <ShieldCheck className="w-3.5 h-3.5" /> SAFU Reserve: $1.2B
              </span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Products</h4>
            <ul className="space-y-2">
              <li><Link to="/markets" className="hover:text-white transition-colors">Spot Markets</Link></li>
              <li><Link to="/trading" className="hover:text-white transition-colors">Futures 100x</Link></li>
              <li><Link to="/wallet" className="hover:text-white transition-colors">Yield Staking</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio Tracker</Link></li>
              <li><Link to="/terminal" className="hover:text-white transition-colors">PRO Terminal</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Support & Services</h4>
            <ul className="space-y-2">
              <li><Link to="/profile" className="hover:text-white transition-colors">KYC Verification</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">API Documentation</Link></li>
              <li><Link to="/transactions" className="hover:text-white transition-colors">Fee Schedule</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Help Center / FAQ</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Community</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#F0B90B] transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-[#F0B90B] transition-colors">Telegram Global</a></li>
              <li><a href="#" className="hover:text-[#F0B90B] transition-colors">Discord Hub</a></li>
              <li><a href="#" className="hover:text-[#F0B90B] transition-colors">Reddit Community</a></li>
              <li><a href="#" className="hover:text-[#F0B90B] transition-colors">YouTube Tutorials</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-gray-500">
          <p>© 2026 NEXUS Crypto Exchange. All rights reserved. High risk investment warning.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
