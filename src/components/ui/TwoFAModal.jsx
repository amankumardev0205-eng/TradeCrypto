import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QrCode, Lock, Key } from 'lucide-react';

const TwoFAModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [code, setCode] = useState('');

  const handleEnable2FA = (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      addToast('Please enter the 6-digit authenticator code', 'error');
      return;
    }
    updateUser({ twoFactorEnabled: true });
    addToast('Google Authenticator 2FA has been successfully activated!', 'success', 'Security Updated');
    setCode('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Setup 2-Factor Authentication" maxWidth="max-w-md">
      <form onSubmit={handleEnable2FA} className="space-y-4 text-center">
        <p className="text-xs text-gray-300">
          Scan the QR code with Google Authenticator or Authy app to link your account.
        </p>

        {/* QR Code Container */}
        <div className="bg-[#0B0E11] p-4 rounded-xl border border-white/10 flex flex-col items-center gap-3">
          <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
            <QrCode className="w-32 h-32 text-[#0B0E11]" />
          </div>
          <div className="flex items-center gap-2 bg-[#1E2329] px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-[#F0B90B]">
            <Key className="w-3.5 h-3.5" />
            <span>NEXUS-2FA-9821-X77A</span>
          </div>
        </div>

        {/* 6 Digit Verification Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 text-left">
            Enter 6-Digit Authenticator Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="000 000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-[#F0B90B] focus:border-[#F0B90B] outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" /> Enable 2FA Security
        </button>
      </form>
    </Modal>
  );
};

export default TwoFAModal;
