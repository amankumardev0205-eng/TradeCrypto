import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f3fb] text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-100">
      
      {/* Brand Header */}
      <header className="bg-[#5741d9] px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-wide text-white">
          <span className="text-white text-2xl font-normal">⋔</span> CRYPTO<span className="text-white/80">FLOW</span>
        </Link>
        <Link to="/register" className="bg-white hover:bg-slate-50 text-[#5741d9] text-sm font-bold px-5 py-2 rounded-full shadow-md transition-all">
          Sign up
        </Link>
      </header>

      {/* Centered Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-indigo-950/[0.02] w-full max-w-md space-y-6">
          
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Welcome <span className="text-[#5741d9]">Back</span>
            </h1>
            <p className="text-sm text-slate-500">Secure access to your institutional trading desk.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#5741d9] rounded-xl text-sm focus:outline-none focus:bg-white transition-all font-medium text-slate-800" 
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Your Password" 
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-[#5741d9] rounded-xl text-sm focus:outline-none focus:bg-white transition-all font-bold text-slate-800 tracking-wide" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end">
              <span className="text-xs font-bold text-[#5741d9] hover:underline cursor-pointer">
                Forgot Password?
              </span>
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-[#5741d9] hover:bg-[#4833c4] text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-600/10 transition-all transform active:scale-98 text-sm pt-3.5"
            >
              <LogIn size={16} /> Secure Login
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            New to the floor?{' '}
            <Link to="/register" className="text-[#5741d9] font-bold hover:underline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}