import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    if (!agreed) {
      addToast('Please accept terms of service to proceed', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        addToast('Registration successful! Please verify your email.', 'success', 'Account Created');
        navigate('/verify-email');
      }
    } catch {
      addToast('Failed to register account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0ECB81]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F0B90B] to-[#0ECB81] text-[#0B0E11] font-heading font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              N
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-white">Create NEXUS Account</h2>
            <p className="text-xs text-gray-400 mt-1">Start trading with 100x leverage in 2 minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Alex Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#F0B90B] outline-none placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#F0B90B] outline-none placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#F0B90B] outline-none placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                placeholder="NEXUS-PRO-2026"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:border-[#F0B90B] outline-none placeholder:text-gray-600"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-[#F0B90B] rounded cursor-pointer"
              />
              <label htmlFor="agree" className="cursor-pointer">
                I agree to the <span className="text-[#F0B90B] hover:underline">Terms of Service</span> and <span className="text-[#F0B90B] hover:underline">Privacy Policy</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="text-[#F0B90B] font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;