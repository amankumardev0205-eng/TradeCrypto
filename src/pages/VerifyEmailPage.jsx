import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, RefreshCw } from 'lucide-react';

const VerifyEmailPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.length < 6) {
      addToast('Please enter full 6-digit verification code', 'error');
      return;
    }
    addToast('Email verification confirmed!', 'success', 'Verification Success');
    navigate('/terminal');
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="font-heading font-extrabold text-2xl text-white">Email Verification</h2>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            We've sent a 6-digit security code to your registered email address.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              placeholder="0 0 0 0 0 0"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-[#1E2329] border border-white/10 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-[#F0B90B] focus:border-[#F0B90B] outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all text-sm"
            >
              Verify & Launch Terminal
            </button>
          </form>

          <button
            onClick={() => addToast('Verification code resent to email', 'info')}
            className="mt-6 text-xs text-gray-400 hover:text-[#F0B90B] inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Didn't receive code? Resend Code
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
