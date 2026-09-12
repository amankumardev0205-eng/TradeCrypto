const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pair: { type: String, required: true },           // 'BTC/USD', 'ETH/USD'
  side: { type: String, enum: ['buy', 'sell'], required: true },
  type: { type: String, enum: ['limit', 'market'], default: 'limit' },
  price: { type: Number },                          // required for limit, optional for market
  amount: { type: Number, required: true },
  filled: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['open', 'partially_filled', 'filled', 'cancelled'],
    default: 'open'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);