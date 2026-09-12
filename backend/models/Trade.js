const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  pair: String,
  price: Number,
  amount: Number,
  total: Number,
  fee: Number,
  side: String,                                     // side of the taker (buy/sell)
  maker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  makerOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  takerOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);