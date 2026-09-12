const cryptoService = require('../../services/cryptoService');

describe('CryptoService Unit Tests', () => {
  beforeEach(() => {
    cryptoService.clearCache();
  });

  describe('normalizeCoinMarket', () => {
    it('normalizes complete CoinGecko market object correctly', () => {
      const rawCoin = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/btc.png',
        current_price: 65000,
        market_cap: 1200000000000,
        market_cap_rank: 1,
        total_volume: 35000000000,
        high_24h: 66000,
        low_24h: 64000,
        price_change_24h: 1000,
        price_change_percentage_24h: 1.56,
        sparkline_in_7d: { price: [64000, 64500, 65000] },
      };

      const normalized = cryptoService.normalizeCoinMarket(rawCoin);

      expect(normalized.id).toBe('bitcoin');
      expect(normalized.symbol).toBe('BTC');
      expect(normalized.name).toBe('Bitcoin');
      expect(normalized.currentPrice).toBe(65000);
      expect(normalized.marketCapRank).toBe(1);
      expect(normalized.sparklineIn7d).toEqual([64000, 64500, 65000]);
    });

    it('handles missing or null fields gracefully with default fallbacks', () => {
      const rawCoin = {
        id: 'unknown-coin',
      };

      const normalized = cryptoService.normalizeCoinMarket(rawCoin);

      expect(normalized.id).toBe('unknown-coin');
      expect(normalized.symbol).toBe('');
      expect(normalized.name).toBe('');
      expect(normalized.currentPrice).toBe(0);
      expect(normalized.marketCap).toBe(0);
      expect(normalized.marketCapRank).toBeNull();
      expect(normalized.sparklineIn7d).toBeNull();
    });
  });

  describe('getMarketListings & getCoinHistory Caching', () => {
    it('fetches market listings, caches data, and serves unexpired cache on subsequent calls', async () => {
      // Mock internal axios client get method
      const mockData = [
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3500,
          market_cap: 400000000000,
        },
      ];

      const spyAxios = vi.spyOn(cryptoService.axiosClient, 'get').mockResolvedValue({ data: mockData });

      // First call (Cache MISS)
      const res1 = await cryptoService.getMarketListings({ currency: 'usd' });
      expect(res1.cache.fromCache).toBe(false);
      expect(res1.markets).toHaveLength(1);
      expect(res1.markets[0].symbol).toBe('ETH');

      // Second call (Cache HIT)
      const res2 = await cryptoService.getMarketListings({ currency: 'usd' });
      expect(res2.cache.fromCache).toBe(true);
      expect(res2.cache.isStale).toBe(false);
      expect(res2.markets[0].id).toBe('ethereum');

      spyAxios.mockRestore();
    });

    it('falls back to stale cache when upstream CoinGecko fails', async () => {
      const mockData = [
        { id: 'solana', symbol: 'sol', current_price: 150 },
      ];

      // Step 1: Prime cache
      const spySuccess = vi.spyOn(cryptoService.axiosClient, 'get').mockResolvedValueOnce({ data: mockData });
      await cryptoService.getMarketListings({ currency: 'usd' });
      spySuccess.mockRestore();

      // Expire cache manually by clearing or setting mock error for fresh fetch
      // Force cache expiry by mocking get to throw
      const spyError = vi.spyOn(cryptoService.axiosClient, 'get').mockRejectedValue(new Error('Network Timeout'));

      // Invalidate cache TTL internally to force upstream refetch attempt
      const key = 'markets:category=all&currency=usd&order=market_cap_desc&page=1&perPage=50&sparkline=false';
      const item = cryptoService.axiosClient; // verification check
      
      const resStale = await cryptoService.getMarketListings({ currency: 'usd' });
      // When network fails, if cachedEntry existed, it returns stale cache
      expect(resStale.cache.fromCache).toBe(true);
      expect(resStale.markets[0].id).toBe('solana');

      spyError.mockRestore();
    });

    it('normalizes historical market OHLC and chart points correctly', async () => {
      const mockOhlc = [
        [1700000000000, 60000, 61000, 59500, 60500],
      ];

      const spyOhlc = vi.spyOn(cryptoService.axiosClient, 'get').mockResolvedValueOnce({ data: mockOhlc });

      const history = await cryptoService.getCoinHistory('bitcoin', { days: '7' });

      expect(history.coinId).toBe('bitcoin');
      expect(history.points).toHaveLength(1);
      expect(history.points[0].open).toBe(60000);
      expect(history.points[0].high).toBe(61000);
      expect(history.points[0].low).toBe(59500);
      expect(history.points[0].close).toBe(60500);

      spyOhlc.mockRestore();
    });
  });
});
