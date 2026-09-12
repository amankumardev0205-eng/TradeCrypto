const axios = require('axios');

const coinIdMap = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  // add more coins as needed
};

async function getPrice(pair) {
  const [base, quote] = pair.split('/');
  if (quote !== 'USD') throw new Error('Only USD quote supported');

  const coinId = coinIdMap[base];
  if (!coinId) throw new Error('Unsupported coin');

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
  const { data } = await axios.get(url);
  return data[coinId].usd;
}

module.exports = { getPrice };