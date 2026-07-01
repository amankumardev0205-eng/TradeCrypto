import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, LogIn, TrendingUp } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-[40px] shadow-2xl relative z-10">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <TrendingUp className="text-black" size={24} />
            </div>
            <span className="text-2xl font-black text-white italic tracking-tighter uppercase">Crypto<span className="text-emerald-400">Flow</span></span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Welcome <span className="text-emerald-400">Back</span></h2>
          <p className="text-slate-400 mt-2 font-medium">Secure access to your trading terminal.</p>
        </div>

        <form className="space-y-6">
          {/* Mobile Number */}
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium"
              placeholder="Mobile Number" 
              type="tel"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium"
              placeholder="Your Password" 
              type={showPassword ? "text" : "password"}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition uppercase tracking-wider">
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button className="w-full group bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 active:scale-95">
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            SECURE LOGIN
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center pt-8 border-t border-slate-800/50">
          <p className="text-slate-400 font-medium">
            New to the floor? <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition underline underline-offset-4 decoration-emerald-500/30">Create Free Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}