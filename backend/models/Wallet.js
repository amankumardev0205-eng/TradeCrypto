const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  coin: { type: String, required: true },   // e.g., 'USD', 'BTC', 'ETH'
  available: { type: Number, default: 0 },
  locked: { type: Number, default: 0 }
}, { _id: false });

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  balances: [balanceSchema]
});

module.exports = mongoose.model('Wallet', walletSchema);