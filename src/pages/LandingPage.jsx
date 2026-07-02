import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Shield, Zap, Globe, BookOpen, Clock, ArrowRight, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const marketData = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$68,420.50', change: '+2.3%', up: true, color: 'bg-indigo-500' },
    { name: 'Ethereum', symbol: 'ETH', price: '$3,520.18', change: '+1.8%', up: true, color: 'bg-purple-500' },
    { name: 'Tether', symbol: 'USDT', price: '$1.00', change: '-0.01%', up: false, color: 'bg-slate-400' },
  ];

  const blogPosts = [
    {
      title: 'Understanding Liquidity: Why Millisecond Settlement Matters',
      excerpt: 'Deep dive into institutional-grade slippage mitigation and how fast settlement protects capital.',
      category: 'Trading Guides',
      readTime: '4 min read',
      date: 'July 2, 2026',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Ethereum Q3 Market Outlook and Volatility Forecast',
      excerpt: 'An analytical breakdown of macro liquidity pools, staking derivatives, and key support levels.',
      category: 'Market Analysis',
      readTime: '6 min read',
      date: 'June 30, 2026',
      image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f3fb] text-slate-900 font-sans antialiased selection:bg-indigo-100">
      
      {/* 1. Header Inspired by Kraken-1.png.webp Color Theme */}
      <header className="bg-[#5741d9] sticky top-0 z-50 px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-black text-xl tracking-wide text-white">
          <span className="text-white text-2xl font-normal">⋔</span> CRYPTO<span className="text-white/80">FLOW</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90">
          <a href="#market" className="hover:text-white transition-colors">Explore</a>
          <a href="#vault" className="hover:text-white transition-colors">Prices</a>
          <a href="#insights" className="hover:text-white transition-colors">Learn</a>
          <a href="#support" className="hover:text-white transition-colors">Support</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-white border border-white/40 hover:border-white px-4 py-2 rounded-full transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="bg-white hover:bg-slate-50 text-[#5741d9] text-sm font-bold px-5 py-2 rounded-full shadow-md transition-all transform active:scale-95">
            Sign up
          </Link>
        </div>
      </header>

      {/* 2. Main Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-16 pt-16 md:pt-24 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Buy bitcoin <br />
              & digital assets
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-md font-normal leading-relaxed">
              Sign up today to easily liquidate or acquire <strong>200+ cryptocurrencies</strong>. Get started in minutes with as little as <strong>$10</strong>.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-[#5741d9] hover:bg-[#4833c4] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-indigo-600/10 text-center">
                Buy crypto with $10
              </Link>
              <Link to="/terminal" className="inline-flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-full transition-all text-center shadow-sm">
                View Terminal
              </Link>
            </div>
          </div>

          {/* Right Interface Block */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-indigo-950/[0.03]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#5741d9]"/> Market Overview
                </h3>
                <span className="text-slate-400 font-bold cursor-pointer hover:text-slate-600">•••</span>
              </div>
              
              <div className="space-y-3">
                {marketData.map((coin, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${coin.color} bg-opacity-10 flex items-center justify-center font-black text-xs text-slate-700`}>
                        {coin.symbol[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{coin.name}</h4>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">{coin.symbol}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{coin.price}</p>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${coin.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {coin.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{coin.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Value Props Panel */}
        <section id="market" className="grid sm:grid-cols-3 gap-6 mt-28">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5741d9] flex items-center justify-center mb-4"><Shield size={20} /></div>
            <h3 className="font-extrabold text-slate-900 mb-1.5 text-base">Encrypted KYC</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Military-grade protection standards verifying parameters 24/7 without delays.</p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5741d9] flex items-center justify-center mb-4"><Zap size={20} /></div>
            <h3 className="font-extrabold text-slate-900 mb-1.5 text-base">Instant Fiat</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Automated settlement protocols pushing real money orders instantly into accounts.</p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5741d9] flex items-center justify-center mb-4"><Globe size={20} /></div>
            <h3 className="font-extrabold text-slate-900 mb-1.5 text-base">Global Liquidity</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Deep dynamic trading pools matching institutional spreads natively globally.</p>
          </div>
        </section>

        {/* 4. Minimalist Modern Blog Integration */}
        <section id="insights" className="mt-32 pt-12 border-t border-slate-200">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2 text-[#5741d9] text-xs font-bold tracking-widest uppercase">
                <BookOpen size={14} /> Learn Hub
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Stay ahead of the crypto flow.</h2>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">Clear guides and straightforward asset management analyses without the confusing jargon.</p>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
              {blogPosts.map((post, index) => (
                <article key={index} className="group cursor-pointer bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">{post.category}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#5741d9] transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}