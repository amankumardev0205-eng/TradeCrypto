const request = require('supertest');
const app = require('../../server');
const cryptoService = require('../../services/cryptoService');

describe('Crypto Markets API Integration Tests (/api/crypto)', () => {
  beforeEach(() => {
    cryptoService.clearCache();
  });

  describe('GET /api/crypto/markets', () => {
    it('returns cryptocurrency market listings with X-Cache response header', async () => {
      const mockData = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000 },
      ];

      const spyAxios = vi.spyOn(cryptoService.axiosClient, 'get').mockResolvedValue({ data: mockData });

      const res = await request(app).get('/api/crypto/markets');

      expect(res.statusCode).toBe(200);
      expect(res.headers['x-cache']).toBe('MISS');
      expect(res.body.data).toHaveProperty('markets');
      expect(res.body.data.markets).toHaveLength(1);
      expect(res.body.data.markets[0].symbol).toBe('BTC');

      spyAxios.mockRestore();
    });

    it('validates query parameters (e.g. invalid order or perPage out of bounds)', async () => {
      const res = await request(app).get('/api/crypto/markets?perPage=999');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/crypto/history/:coinId', () => {
    it('returns market chart OHLC data for requested coin', async () => {
      const mockOhlc = [
        [1700000000000, 60000, 61000, 59000, 60500],
      ];

      const spyAxios = vi.spyOn(cryptoService.axiosClient, 'get').mockResolvedValue({ data: mockOhlc });

      const res = await request(app).get('/api/crypto/history/bitcoin?days=7');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('coinId', 'bitcoin');
      expect(res.body.data.points).toHaveLength(1);
      expect(res.body.data.points[0].open).toBe(60000);

      spyAxios.mockRestore();
    });
  });
});
