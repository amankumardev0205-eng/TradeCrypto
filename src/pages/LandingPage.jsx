import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Globe2,
  Cpu,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Star
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const LandingPage = () => {
  const { coins } = useMarket();
  const [activeFaq, setActiveFaq] = useState(null);

  const heroCoins = coins.slice(0, 4);
  const trendingCoins = coins.slice(0, 6);

  // Mock Hero Chart Data
  const heroChartData = [
    { time: '09:00', price: 88500 },
    { time: '11:00', price: 89400 },
    { time: '13:00', price: 89100 },
    { time: '15:00', price: 90800 },
    { time: '17:00', price: 90200 },
    { time: '19:00', price: 91450 },
    { time: '21:00', price: 92100 },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Ultra-Fast Execution',
      desc: 'Sub-millisecond order matching engine capable of 1.4 million transactions per second.',
    },
    {
      icon: ShieldCheck,
      title: 'Institutional Grade Security',
      desc: '100% cold storage wallet protection, ISO-27001 certified security & $1.2B SAFU fund.',
    },
    {
      icon: Cpu,
      title: '100x Pro Leverage',
      desc: 'Trade Bitcoin, Ethereum, and altcoin futures with deep liquidity and zero slippage.',
    },
    {
      icon: Globe2,
      title: 'Global Fiat Gateways',
      desc: 'Deposit instantly via Visa, Mastercard, Apple Pay, SEPA, or P2P in 60+ currencies.',
    },
  ];

  const faqs = [
    {
      q: 'How do I start trading on NEXUS PRO?',
      a: 'Register for a free account, complete quick Level 1 verification in 2 minutes, deposit crypto or fiat, and start trading spot or futures immediately.',
    },
    {
      q: 'Is my funds safe on NEXUS PRO?',
      a: 'Yes, 98% of all digital assets are kept in offline multi-signature cold wallets. NEXUS maintains a $1.2 Billion SAFU emergency reserve fund.',
    },
    {
      q: 'What trading fees does NEXUS charge?',
      a: 'NEXUS offers market-leading spot trading fees starting at 0.08% Maker / 0.10% Taker, with additional discounts when holding NEXUS tokens.',
    },
    {
      q: 'Can I trade crypto on mobile devices?',
      a: 'Absolutely. Download our iOS or Android app to receive instant price alerts, track portfolio P&L, and execute limit/market orders anywhere.',
    },
  ];

  const testimonials = [
    {
      name: 'Elena Rostova',
      role: 'Institutional Fund Manager',
      text: 'NEXUS PRO offers the best liquidity depth and chart performance in the market. Execution speed is second to none.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Marcus Vance',
      role: 'Day Trader & Analyst',
      text: 'The futuristic UI and customized TradingView integration make strategy execution effortless. My top exchange choice.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sarah Chen',
      role: 'Crypto Investor',
      text: 'Extremely sleek glassmorphic interface, instant deposits, and fast 2FA security. 10/10 recommendation.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white selection:bg-[#F0B90B] selection:text-[#0B0E11]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F0B90B]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#0ECB81]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-gold text-xs font-semibold text-[#F0B90B]">
                <Sparkles className="w-4 h-4" /> Next-Generation Crypto Trading Platform
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                Trade Crypto With <br />
                <span className="gradient-text-gold">Institutional Power</span> & Speed
              </h1>

              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Buy, sell, and leverage 300+ cryptocurrencies on the ultimate glassmorphic trading terminal. Experience sub-millisecond execution with up to 100x leverage.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-base rounded-2xl shadow-xl shadow-[#F0B90B]/20 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
                >
                  Create Free Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/trading"
                  className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/10 text-white font-bold text-base rounded-2xl border border-white/10 transition-all text-center"
                >
                  Explore Live Terminal
                </Link>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-xl mx-auto lg:mx-0">
                <div>
                  <h4 className="font-heading font-extrabold text-xl sm:text-2xl text-white font-mono">$84.2B+</h4>
                  <p className="text-xs text-gray-400">24h Trading Vol</p>
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0ECB81] font-mono">1.4M/s</h4>
                  <p className="text-xs text-gray-400">Matching Speed</p>
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xl sm:text-2xl text-[#F0B90B] font-mono">12M+</h4>
                  <p className="text-xs text-gray-400">Global Traders</p>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Animated Card / Chart Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center font-bold text-[#F0B90B] text-xl">
                      ₿
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">BTC / USDT</h3>
                      <span className="text-xs text-gray-400">Bitcoin Perpetual</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-white">$91,450.80</div>
                    <div className="text-xs font-semibold text-[#0ECB81] flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +3.42%
                    </div>
                  </div>
                </div>

                {/* Hero Area Chart */}
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={heroChartData}>
                      <defs>
                        <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#F0B90B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E2329', borderColor: '#F0B90B', borderRadius: '12px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#F0B90B" strokeWidth={3} fillOpacity={1} fill="url(#heroGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Mini Quick Trade Controls */}
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                  <Link
                    to="/trading"
                    className="py-2.5 bg-[#0ECB81] hover:bg-emerald-400 text-[#0B0E11] font-bold text-xs rounded-xl text-center transition-colors"
                  >
                    BUY / LONG
                  </Link>
                  <Link
                    to="/trading"
                    className="py-2.5 bg-[#F6465D] hover:bg-rose-400 text-white font-bold text-xs rounded-xl text-center transition-colors"
                  >
                    SELL / SHORT
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Market Cards Section */}
      <section className="py-12 bg-[#0B0E11]/60 relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {heroCoins.map((coin) => (
              <Link
                key={coin.id}
                to="/trading"
                className="glass-panel p-5 rounded-2xl glass-panel-hover group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-white/5 font-bold text-[#F0B90B] flex items-center justify-center text-sm">
                      {coin.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-[#F0B90B] transition-colors">{coin.symbol}</h4>
                      <span className="text-[11px] text-gray-400">{coin.name}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    coin.change24h >= 0 ? 'bg-[#0ECB81]/15 text-[#0ECB81]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                  }`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-mono text-lg font-bold text-white">${coin.price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Vol: ${(coin.volume24h / 1e9).toFixed(1)}B</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Markets Preview Table */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-3xl text-white">Trending Cryptocurrencies</h2>
            <p className="text-gray-400 text-sm mt-1">Real-time spot price metrics and 24h market performance</p>
          </div>
          <Link
            to="/markets"
            className="mt-4 md:mt-0 text-xs font-bold text-[#F0B90B] hover:underline flex items-center gap-1"
          >
            View All 300+ Markets <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="p-4">Asset Name</th>
                <th className="p-4">Price (USD)</th>
                <th className="p-4">24h Change</th>
                <th className="p-4">24h Volume</th>
                <th className="p-4">Market Cap</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {trendingCoins.map((coin) => (
                <tr key={coin.id} className="table-row-hover">
                  <td className="p-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white/5 text-[#F0B90B] font-bold flex items-center justify-center text-sm">
                      {coin.icon}
                    </span>
                    <div>
                      <span className="font-bold text-white">{coin.name}</span>
                      <span className="text-xs text-gray-400 ml-2 font-mono">{coin.symbol}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">${coin.price.toLocaleString()}</td>
                  <td className="p-4 font-mono">
                    <span className={`font-semibold ${coin.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-300">${(coin.volume24h / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M</td>
                  <td className="p-4 font-mono text-gray-300">${(coin.marketCap / 1e9).toFixed(2)}B</td>
                  <td className="p-4 text-right">
                    <Link
                      to="/trading"
                      className="px-4 py-1.5 bg-[#F0B90B]/10 hover:bg-[#F0B90B] text-[#F0B90B] hover:text-[#0B0E11] font-bold text-xs rounded-xl border border-[#F0B90B]/30 transition-all inline-block"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why Choose Us & Features Section */}
      <section className="py-20 bg-[#0B0E11]/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-[#F0B90B] uppercase tracking-widest">Why Choose NEXUS</span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-2 mb-12">
            Engineered For Professional Traders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-white/10 glass-panel-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-gold p-8 sm:p-12 rounded-3xl border border-[#F0B90B]/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-[#F0B90B] uppercase tracking-wider">Mobile Experience</span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                Trade Anytime, Anywhere <br /> With NEXUS Mobile App
              </h2>
              <p className="text-gray-300 text-sm max-w-lg leading-relaxed">
                Stay connected to global market movements with instant push notifications, real-time widget trackers, and 1-tap order execution.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="px-6 py-3 bg-[#1E2329] hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#F0B90B]" /> App Store
                </button>
                <button className="px-6 py-3 bg-[#1E2329] hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#0ECB81]" /> Google Play
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center">
                {/* Mobile QR Simulation */}
                <div className="w-36 h-36 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[#F0B90B]">
                  <Sparkles className="w-16 h-16 animate-spin" />
                </div>
                <span className="text-[10px] font-bold text-[#0B0E11] mt-2">Scan to Download App</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-[#0B0E11]/60 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#0ECB81] uppercase tracking-widest">User Feedback</span>
            <h2 className="font-heading font-extrabold text-3xl text-white mt-1">Trusted By Millions Worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-1 text-[#F0B90B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F0B90B]" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-normal">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-[#F0B90B]" />
                  <div>
                    <h4 className="font-bold text-white text-xs">{t.name}</h4>
                    <span className="text-[10px] text-gray-400">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-extrabold text-3xl text-white">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-sm mt-1">Everything you need to know about NEXUS PRO</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-white text-sm hover:text-[#F0B90B] transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-5 h-5 text-[#F0B90B]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;