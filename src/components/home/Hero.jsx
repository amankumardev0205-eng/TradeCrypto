import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import HeroDashboard from "./HeroDashboard";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B0E11] text-white">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-400/15 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
              <TrendingUp size={16} />
              Trusted by 250K+ Traders
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white lg:text-6xl">
              Trade Crypto
              <span className="block bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                Smarter.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 lg:text-lg">
              Buy, sell, and manage crypto with a secure, lightning-fast exchange built for modern investors.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:scale-[1.02]"
              >
                Get Started
              </Link>

              <Link
                to="/trading"
                className="flex items-center gap-2 rounded-full border border-slate-700 px-6 py-3 font-semibold text-slate-100 transition hover:border-yellow-400 hover:text-yellow-300"
              >
                Explore Markets
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-black/20">
                <Wallet className="mb-3 text-yellow-400" size={24} />
                <h3 className="text-2xl font-black text-white">$24B+</h3>
                <p className="text-sm text-slate-400">Daily Volume</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-black/20">
                <ShieldCheck className="mb-3 text-emerald-400" size={24} />
                <h3 className="text-2xl font-black text-white">350+</h3>
                <p className="text-sm text-slate-400">Coins Listed</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-black/20">
                <TrendingUp className="mb-3 text-sky-400" size={24} />
                <h3 className="text-2xl font-black text-white">99.98%</h3>
                <p className="text-sm text-slate-400">Uptime</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <HeroDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}