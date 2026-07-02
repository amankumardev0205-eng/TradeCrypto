import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f3fb] text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-100">
      
      {/* Brand Header */}
      <header className="bg-[#5741d9] px-6 lg:px-16 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-wide text-white">
          <span className="text-white text-2xl font-normal">⋔</span> CRYPTO<span className="text-white/80">FLOW</span>
        </Link>
        <Link to="/login" className="text-sm font-semibold text-white border border-white/40 hover:border-white px-4 py-2 rounded-full transition-colors">
          Sign in
        </Link>
      </header>

      {/* Centered Register Card Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-indigo-950/[0.02] w-full max-w-md space-y-6">
          
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5741d9] flex items-center justify-center mb-1 mx-auto sm:mx-0">
              <Shield size={20} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Create <span className="text-[#5741d9]">Account</span>
            </h1>
            <p className="text-sm text-slate-500">Join our network of premium digital liquidity traders.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#5741d9] rounded-xl text-sm focus:outline-none focus:bg-white transition-all font-medium text-slate-800" 
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#5741d9] rounded-xl text-sm focus:outline-none focus:bg-white transition-all font-medium text-slate-800" 
                />
              </div>
            </div>

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
                placeholder="Create Password" 
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

            <p className="text-[11px] leading-relaxed text-slate-400 text-center px-2">
              By checking Open Account, you agree to our <span className="text-[#5741d9] hover:underline cursor-pointer font-bold">Terms of Service</span> and <span className="text-[#5741d9] hover:underline cursor-pointer font-bold">Privacy Policy</span>.
            </p>

            <button 
              type="submit" 
              className="w-full bg-[#5741d9] hover:bg-[#4833c4] text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-600/10 transition-all transform active:scale-98 text-sm mt-2"
            >
              Open Account
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#5741d9] font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}