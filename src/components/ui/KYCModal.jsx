import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';

const KYCModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [docType, setDocType] = useState('Passport');
  const [uploaded, setUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploaded) {
      addToast('Please select or upload a document photo', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      updateUser({ kycLevel: 'Level 2 Verified', kycStatus: 'APPROVED' });
      addToast('KYC Verification request submitted and approved!', 'success', 'Verification Success');
      setSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identity Verification (KYC Level 2)" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#F0B90B] shrink-0" />
          <p className="text-xs text-gray-300">
            Unlocks unlimited fiat deposits, higher 100 BTC daily withdrawal limits, and P2P trading access.
          </p>
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Select ID Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#F0B90B] outline-none"
          >
            <option value="Passport">National Passport</option>
            <option value="ID Card">Government Issued ID Card</option>
            <option value="Driver License">Driver's License</option>
          </select>
        </div>

        {/* File Upload Simulation */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Upload Document Photo</label>
          <div
            onClick={() => setUploaded(true)}
            className={`cursor-pointer p-6 rounded-xl border-2 border-dashed text-center transition-all ${
              uploaded
                ? 'border-[#0ECB81] bg-[#0ECB81]/10 text-[#0ECB81]'
                : 'border-white/10 hover:border-[#F0B90B] bg-[#0B0E11] text-gray-400'
            }`}
          >
            {uploaded ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-[#0ECB81]" />
                <span className="text-xs font-semibold text-white">{docType}_front.jpg selected</span>
                <span className="text-[10px] text-gray-400">Click to re-select</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-[#F0B90B]" />
                <span className="text-xs font-semibold text-white">Click to upload document front</span>
                <span className="text-[10px] text-gray-400">JPG, PNG or PDF (Max 10MB)</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
        >
          {submitting ? 'Verifying Documents...' : 'Submit Verification'}
        </button>
      </form>
    </Modal>
  );
};

export default KYCModal;
