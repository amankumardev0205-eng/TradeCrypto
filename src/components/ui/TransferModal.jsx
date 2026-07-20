import React, { useState } from 'react';
import Modal from './Modal';
import { useMarket } from '../../context/MarketContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeftRight } from 'lucide-react';

const TransferModal = ({ isOpen, onClose }) => {
  const { wallet, addTransaction } = useMarket();
  const { addToast } = useToast();
  const [fromAccount, setFromAccount] = useState('Spot Wallet');
  const [toAccount, setToAccount] = useState('Futures Account');
  const [coin, setCoin] = useState('USDT');
  const [amount, setAmount] = useState('');

  const currentAsset = wallet?.assets?.find((a) => a.symbol === coin) || { available: 0 };

  const handleSwapAccounts = () => {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    if (numAmount > currentAsset.available) {
      addToast('Insufficient funds in Spot Wallet', 'error');
      return;
    }

    addTransaction({
      type: 'TRANSFER',
      coin,
      amount: numAmount,
      address: `${fromAccount} -> ${toAccount}`,
      txHash: 'INTERNAL',
      status: 'COMPLETED',
    });

    addToast(`Transferred ${numAmount} ${coin} from ${fromAccount} to ${toAccount}`, 'success', 'Transfer Complete');
    setAmount('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Internal Transfer" maxWidth="max-w-md">
      <form onSubmit={handleTransfer} className="space-y-4">
        {/* Account Selector */}
        <div className="bg-[#0B0E11] p-3.5 rounded-xl border border-white/10 relative space-y-3">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">From</span>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full bg-[#1E2329] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none mt-1"
            >
              <option value="Spot Wallet">Spot Wallet</option>
              <option value="Funding Account">Funding Account</option>
              <option value="Futures Account">Futures Account</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwapAccounts}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] rounded-full hover:scale-110 transition-transform"
          >
            <ArrowLeftRight className="w-4 h-4 rotate-90" />
          </button>

          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">To</span>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full bg-[#1E2329] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none mt-1"
            >
              <option value="Futures Account">Futures Account</option>
              <option value="Spot Wallet">Spot Wallet</option>
              <option value="Funding Account">Funding Account</option>
            </select>
          </div>
        </div>

        {/* Coin Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Coin</label>
          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:border-[#F0B90B] outline-none"
          >
            <option value="USDT">USDT - Tether USD</option>
            <option value="BTC">BTC - Bitcoin</option>
            <option value="ETH">ETH - Ethereum</option>
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-400">Amount</label>
            <span className="text-xs text-gray-400">
              Available: <span className="text-white font-medium">{currentAsset.available} {coin}</span>
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

        <button
          type="submit"
          className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all text-sm"
        >
          Confirm Transfer
        </button>
      </form>
    </Modal>
  );
};

export default TransferModal;
