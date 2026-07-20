import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
        navigate('/terminal');
      }
    } catch {
      addToast('Invalid credentials. Try demo login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@nexustrade.io');
      setPassword('Admin@123456');
    } else {
      setEmail('alex@nexustrade.io');
      setPassword('Trader@123456');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F0B90B]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F0B90B] text-[#0B0E11] font-heading font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#F0B90B]/20">
              N
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-white">Log In To NEXUS PRO</h2>
            <p className="text-xs text-gray-400 mt-1">Access spot, futures, and wallet terminal</p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-[#1E2329] rounded-2xl border border-white/10 mb-6 text-xs flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="flex-1 py-1.5 bg-white/5 hover:bg-[#F0B90B]/20 text-[#F0B90B] rounded-xl font-bold transition-all text-center border border-[#F0B90B]/30"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1.5 bg-white/5 hover:bg-[#0ECB81]/20 text-[#0ECB81] rounded-xl font-bold transition-all text-center border border-[#0ECB81]/30"
            >
              Demo Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#F0B90B] outline-none placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#F0B90B] hover:underline">
                  Forgot Password?
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Authenticating...' : 'Log In To Terminal'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Don't have a NEXUS account?{' '}
            <Link to="/register" className="text-[#F0B90B] font-bold hover:underline">
              Register Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;