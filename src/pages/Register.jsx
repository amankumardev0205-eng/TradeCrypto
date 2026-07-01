import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 rounded-[40px] shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <ShieldCheck className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Create <span className="text-emerald-400">Account</span></h2>
          <p className="text-slate-400 mt-2 font-medium">Join the elite network of digital traders.</p>
        </div>

        <form className="space-y-6">
          {/* Name Row */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium"
                placeholder="First Name" 
                type="text"
              />
            </div>
            <div className="flex-1 relative">
              <input 
                className="w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium"
                placeholder="Last Name" 
                type="text"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium"
              placeholder="Mobile Number" 
              type="tel"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium"
              placeholder="Create Password" 
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

          {/* Terms */}
          <p className="text-xs text-slate-500 text-center px-4 leading-relaxed">
            By clicking Sign Up, you agree to our <span className="text-emerald-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-emerald-400 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>

          {/* Submit Button */}
          <button className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-[0.98]">
            OPEN ACCOUNT
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
          <p className="text-slate-400 font-medium">
            Already have an account? <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}