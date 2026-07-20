import React, { useState } from 'react';
import Modal from './Modal';
import { useMarket } from '../../context/MarketContext';
import { useToast } from '../../context/ToastContext';
import { ArrowUpRight } from 'lucide-react';

const WithdrawModal = ({ isOpen, onClose }) => {
  const { wallet, addTransaction } = useMarket();
  const { addToast } = useToast();
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const currentAsset = wallet?.assets?.find((a) => a.symbol === selectedCoin) || { available: 0 };
  const fee = selectedCoin === 'USDT' ? 1.0 : selectedCoin === 'BTC' ? 0.0002 : 0.005;

  const handleWithdraw = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!address) {
      addToast('Please enter a valid recipient address', 'error');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      addToast('Please enter a valid withdrawal amount', 'error');
      return;
    }
    if (numAmount > currentAsset.available) {
      addToast(`Insufficient ${selectedCoin} balance`, 'error');
      return;
    }

    addTransaction({
      type: 'WITHDRAW',
      coin: selectedCoin,
      amount: numAmount,
      address,
      txHash: '0x' + Math.random().toString(16).substring(2, 14),
      status: 'COMPLETED',
    });

    addToast(`Withdrawal of ${numAmount} ${selectedCoin} submitted successfully!`, 'success', 'Withdrawal Processing');
    setAddress('');
    setAmount('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Crypto" maxWidth="max-w-lg">
      <form onSubmit={handleWithdraw} className="space-y-4">
        {/* Coin Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Select Coin</label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:border-[#F0B90B] outline-none"
          >
            <option value="USDT">USDT - Tether USD</option>
            <option value="BTC">BTC - Bitcoin</option>
            <option value="ETH">ETH - Ethereum</option>
            <option value="SOL">SOL - Solana</option>
          </select>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Recipient Address</label>
          <input
            type="text"
            placeholder="Paste withdrawal address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-[#F0B90B] outline-none placeholder:text-gray-600"
          />
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-400">Amount</label>
            <span className="text-xs text-gray-400">
              Available: <span className="text-white font-medium">{currentAsset.available} {selectedCoin}</span>
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-[#F0B90B] outline-none pr-16"
            />
            <button
              type="button"
              onClick={() => setAmount(currentAsset.available)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#F0B90B] hover:text-[#FCD535]"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Fee & Summary */}
        <div className="bg-[#0B0E11] p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Network Fee:</span>
            <span className="text-white font-mono">{fee} {selectedCoin}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>You Will Receive:</span>
            <span className="text-[#0ECB81] font-bold font-mono">
              {amount && parseFloat(amount) > fee ? (parseFloat(amount) - fee).toFixed(4) : '0.00'} {selectedCoin}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ArrowUpRight className="w-4 h-4" /> Confirm Withdrawal
        </button>
      </form>
    </Modal>
  );
};

export default WithdrawModal;
