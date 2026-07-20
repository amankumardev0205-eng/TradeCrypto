import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }
    setSent(true);
    addToast('Password reset link sent to your email inbox', 'success', 'Reset Link Sent');
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="font-heading font-extrabold text-2xl text-white">Reset Password</h2>
            <p className="text-xs text-gray-400 mt-1">Enter registered email to receive password reset instructions</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-[#0ECB81]/15 text-[#0ECB81] rounded-full flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-300">
                We've sent a 6-digit recovery code and reset link to <strong className="text-white">{email}</strong>.
              </p>
              <Link
                to="/verify-email"
                className="block w-full py-3 bg-[#F0B90B] text-[#0B0E11] font-bold rounded-xl text-center text-sm"
              >
                Enter Verification Code
              </Link>
            </div>
          ) : (
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
                    className="w-full bg-[#1E2329] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#F0B90B] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all text-sm"
              >
                Send Recovery Instructions
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
