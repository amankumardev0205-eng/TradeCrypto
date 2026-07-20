import React, { useState } from 'react';
import Modal from './Modal';
import { useMarket } from '../../context/MarketContext';
import { useToast } from '../../context/ToastContext';
import { Copy, Check, QrCode, ArrowDownRight } from 'lucide-react';

const DepositModal = ({ isOpen, onClose }) => {
  const { coins, addTransaction } = useMarket();
  const { addToast } = useToast();
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [copied, setCopied] = useState(false);

  const walletAddresses = {
    USDT: {
      TRC20: 'T9xQ2J4K8n1P7L9m0a5B3c1V4e6F7g8H9',
      ERC20: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    },
    BTC: {
      Bitcoin: 'bc1q9x2j4k8n1p7l9m0a5b3c1v4e6f7g8h9j0k',
    },
    ETH: {
      ERC20: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    },
    SOL: {
      Solana: 'Sol9xQ2J4K8n1P7L9m0a5B3c1V4e6F7g8H9j0k',
    },
  };

  const address = walletAddresses[selectedCoin]?.[network] || walletAddresses.USDT.TRC20;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    addToast('Wallet address copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    const amount = selectedCoin === 'BTC' ? 0.05 : selectedCoin === 'ETH' ? 0.5 : 1000;
    addTransaction({
      type: 'DEPOSIT',
      coin: selectedCoin,
      amount,
      address,
      txHash: '0x' + Math.random().toString(16).substring(2, 12),
      status: 'COMPLETED',
    });
    addToast(`Simulated deposit of ${amount} ${selectedCoin} received!`, 'success', 'Deposit Success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit Crypto" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Coin Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Select Coin</label>
          <select
            value={selectedCoin}
            onChange={(e) => {
              setSelectedCoin(e.target.value);
              setNetwork(e.target.value === 'BTC' ? 'Bitcoin' : e.target.value === 'SOL' ? 'Solana' : 'TRC20');
            }}
            className="w-full bg-[#1E2329] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:border-[#F0B90B] outline-none"
          >
            <option value="USDT">USDT - Tether USD</option>
            <option value="BTC">BTC - Bitcoin</option>
            <option value="ETH">ETH - Ethereum</option>
            <option value="SOL">SOL - Solana</option>
          </select>
        </div>

        {/* Network Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Select Deposit Network</label>
          <div className="flex gap-2">
            {selectedCoin === 'USDT' && (
              <>
                <button
                  onClick={() => setNetwork('TRC20')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                    network === 'TRC20'
                      ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  TRC20 (Tron)
                </button>
                <button
                  onClick={() => setNetwork('ERC20')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                    network === 'ERC20'
                      ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  ERC20 (Ethereum)
                </button>
              </>
            )}
            {selectedCoin === 'BTC' && (
              <button className="w-full py-2 rounded-xl text-xs font-semibold border border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]">
                Bitcoin Network
              </button>
            )}
            {selectedCoin === 'ETH' && (
              <button className="w-full py-2 rounded-xl text-xs font-semibold border border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]">
                Ethereum (ERC20)
              </button>
            )}
            {selectedCoin === 'SOL' && (
              <button className="w-full py-2 rounded-xl text-xs font-semibold border border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]">
                Solana Network
              </button>
            )}
          </div>
        </div>

        {/* QR Code & Address Display */}
        <div className="bg-[#0B0E11] p-4 rounded-xl border border-white/10 flex flex-col items-center text-center gap-3">
          <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
            {/* SVG QR Code Simulation */}
            <QrCode className="w-28 h-28 text-[#0B0E11]" />
          </div>
          <p className="text-xs text-gray-400">Scan QR Code or copy deposit address</p>

          <div className="w-full bg-[#1E2329] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-gray-200 truncate">{address}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F0B90B] transition-colors shrink-0 flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#0ECB81]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-xl text-xs text-gray-300">
          <p className="font-semibold text-[#F0B90B] mb-0.5">⚠️ Important Notice</p>
          Send only <span className="font-bold text-white">{selectedCoin}</span> to this deposit address. Ensure the network selected matches.
        </div>

        {/* Action Button */}
        <button
          onClick={handleSimulateDeposit}
          className="w-full py-3 bg-[#F0B90B] hover:bg-[#FCD535] text-[#0B0E11] font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ArrowDownRight className="w-4 h-4" /> Simulate Instant Deposit
        </button>
      </div>
    </Modal>
  );
};

export default DepositModal;
