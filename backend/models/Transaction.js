const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'buy', 'sell', 'fee'],
    required: true
  },
  coin: { type: String, required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  trade: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade' },
  txHash: { type: String, default: null },          // simulated external TXID
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
