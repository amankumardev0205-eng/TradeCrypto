import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useMarket } from '../context/MarketContext';
import { Search, Star, TrendingUp, TrendingDown, ArrowUpDown, Filter, Sparkles } from 'lucide-react';

const MarketsPage = () => {
  const { coins, watchlist, toggleWatchlist, setSelectedPair } = useMarket();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');

  const categories = ['All', 'Favorites', 'Layer 1', 'DeFi', 'AI', 'Meme', 'Gainers', 'Losers'];

  const filteredCoins = coins.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (category === 'Favorites') return watchlist.includes(coin.symbol);
    if (category === 'Gainers') return coin.change24h > 0;
    if (category === 'Losers') return coin.change24h < 0;
    if (category !== 'All') return coin.category === category;
    return true;
  });

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortOrder === 'desc') return valB - valA;
    return valA - valB;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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
                <TrendingUp className="w-6 h-6 text-[#F0B90B]" /> Cryptocurrency Markets Overview
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Real-time spot and derivative market metrics for 300+ digital assets
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coin or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#F0B90B]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-[#F0B90B] text-[#0B0E11] font-bold shadow-lg shadow-[#F0B90B]/20'
                    : 'bg-[#1E2329] text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Coin Market Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                  <th className="p-4">Fav</th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('name')}>
                    Asset Name <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('price')}>
                    Price (USD) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('change24h')}>
                    24h Change <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('volume24h')}>
                    24h Volume <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('marketCap')}>
                    Market Cap <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-4 text-right">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {sortedCoins.map((coin) => (
                  <tr key={coin.id} className="table-row-hover">
                    <td className="p-4">
                      <button onClick={() => toggleWatchlist(coin.symbol)} className="text-gray-500 hover:text-[#F0B90B]">
                        <Star className={`w-4 h-4 ${watchlist.includes(coin.symbol) ? 'text-[#F0B90B] fill-[#F0B90B]' : ''}`} />
                      </button>
                    </td>
                    <td className="p-4 font-sans font-bold text-white flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/5 text-[#F0B90B] font-bold flex items-center justify-center text-sm font-mono">
                        {coin.icon}
                      </span>
                      <div>
                        <span className="font-bold text-white">{coin.name}</span>
                        <span className="text-xs text-gray-400 font-mono ml-2 uppercase">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">${coin.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`font-bold ${coin.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">${(coin.volume24h / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M</td>
                    <td className="p-4 text-gray-300">${(coin.marketCap / 1e9).toFixed(2)}B</td>
                    <td className="p-4 text-right">
                      <Link
                        to="/trading"
                        onClick={() => setSelectedPair(`${coin.symbol}/USDT`)}
                        className="px-4 py-1.5 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold text-xs rounded-xl shadow transition-all inline-block font-sans"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MarketsPage;
