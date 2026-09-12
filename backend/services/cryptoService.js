const axios = require('axios');
const config = require('../config/env');
const { ApiError, BadRequestError } = require('../utils/ApiError');

/**
 * In-Memory Cache Store with Expiry Tracking and Stale Fallback
 */
class CryptoCache {
  constructor() {
    this.store = new Map();
  }

  generateKey(prefix, params) {
    const sortedKeys = Object.keys(params).sort();
    const queryStr = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
    return `${prefix}:${queryStr}`;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    const now = Date.now();
    const isExpired = now > item.expiresAt;

    return {
      data: item.data,
      isExpired,
      fetchedAt: item.fetchedAt,
    };
  }

  set(key, data, ttlSeconds) {
    const now = Date.now();
    this.store.set(key, {
      data,
      fetchedAt: new Date(now).toISOString(),
      expiresAt: now + ttlSeconds * 1000,
    });
  }

  clear() {
    this.store.clear();
  }
}

const cacheInstance = new CryptoCache();

/**
 * Service handling CoinGecko API interactions, caching, and payload normalization.
 */
class CryptoService {
  constructor() {
    this.axiosClient = axios.create({
      baseURL: config.coingeckoApiUrl,
      timeout: config.coingeckoTimeoutMs,
      headers: {
        Accept: 'application/json',
        ...(config.coingeckoApiKey ? { 'x-cg-demo-api-key': config.coingeckoApiKey } : {}),
      },
    });
  }

  /**
   * Normalize CoinGecko market item to application domain schema
   */
  normalizeCoinMarket(coin) {
    return {
      id: coin.id,
      symbol: coin.symbol ? String(coin.symbol).toUpperCase() : '',
      name: coin.name || '',
      image: coin.image || '',
      currentPrice: coin.current_price ?? 0,
      marketCap: coin.market_cap ?? 0,
      marketCapRank: coin.market_cap_rank ?? null,
      fullyDilutedValuation: coin.fully_diluted_valuation ?? null,
      totalVolume: coin.total_volume ?? 0,
      high24h: coin.high_24h ?? null,
      low24h: coin.low_24h ?? null,
      priceChange24h: coin.price_change_24h ?? null,
      priceChangePercentage24h: coin.price_change_percentage_24h ?? null,
      marketCapChange24h: coin.market_cap_change_24h ?? null,
      marketCapChangePercentage24h: coin.market_cap_change_percentage_24h ?? null,
      circulatingSupply: coin.circulating_supply ?? 0,
      totalSupply: coin.total_supply ?? null,
      maxSupply: coin.max_supply ?? null,
      ath: coin.ath ?? null,
      athChangePercentage: coin.ath_change_percentage ?? null,
      athDate: coin.ath_date || null,
      atl: coin.atl ?? null,
      atlChangePercentage: coin.atl_change_percentage ?? null,
      atlDate: coin.atl_date || null,
      sparklineIn7d: coin.sparkline_in_7d?.price || null,
      lastUpdated: coin.last_updated || null,
    };
  }

  /**
   * Fetch market data with caching & upstream error handling
   */
  async getMarketListings(options = {}) {
    const currency = (options.currency || 'usd').toLowerCase();
    const order = options.order || 'market_cap_desc';
    const perPage = Math.min(Math.max(parseInt(options.perPage || '50', 10), 1), 250);
    const page = Math.max(parseInt(options.page || '1', 10), 1);
    const sparkline = options.sparkline === 'true' || options.sparkline === true;
    const category = options.category ? String(options.category).trim() : null;

    const cacheQueryParams = {
      currency,
      order,
      perPage,
      page,
      sparkline,
      category: category || 'all',
    };

    const cacheKey = cacheInstance.generateKey('markets', cacheQueryParams);
    const cachedEntry = cacheInstance.get(cacheKey);

    // Cache HIT (unexpired)
    if (cachedEntry && !cachedEntry.isExpired) {
      return {
        markets: cachedEntry.data,
        pagination: { page, perPage, count: cachedEntry.data.length },
        cache: {
          fromCache: true,
          isStale: false,
          fetchedAt: cachedEntry.fetchedAt,
          ttlSeconds: config.coingeckoCacheTtlSec,
        },
      };
    }

    // Fetch from CoinGecko API
    try {
      const queryParams = {
        vs_currency: currency,
        order,
        per_page: perPage,
        page,
        sparkline,
        price_change_percentage: '24h',
      };

      if (category) {
        queryParams.category = category;
      }

      const response = await this.axiosClient.get('/coins/markets', { params: queryParams });

      if (!Array.isArray(response.data)) {
        throw new ApiError(502, 'Invalid response format from market data provider');
      }

      const normalizedData = response.data.map(this.normalizeCoinMarket);

      // Store in Cache
      cacheInstance.set(cacheKey, normalizedData, config.coingeckoCacheTtlSec);

      return {
        markets: normalizedData,
        pagination: { page, perPage, count: normalizedData.length },
        cache: {
          fromCache: false,
          isStale: false,
          fetchedAt: new Date().toISOString(),
          ttlSeconds: config.coingeckoCacheTtlSec,
        },
      };
    } catch (err) {
      // Stale Cache Fallback if upstream error occurs (Rate limit / Timeout / Server Error)
      if (cachedEntry && cachedEntry.data) {
        console.warn(`[UPSTREAM NOTICE] CoinGecko request failed (${err.message}). Serving stale cache.`);
        return {
          markets: cachedEntry.data,
          pagination: { page, perPage, count: cachedEntry.data.length },
          cache: {
            fromCache: true,
            isStale: true,
            fetchedAt: cachedEntry.fetchedAt,
            ttlSeconds: config.coingeckoCacheTtlSec,
          },
        };
      }

      // Handle Axios/Upstream Errors
      if (err.response) {
        const status = err.response.status;
        if (status === 429) {
          throw new ApiError(429, 'Cryptocurrency market data rate limit exceeded. Please try again in a few moments.');
        }
        if (status >= 500) {
          throw new ApiError(503, 'Cryptocurrency market data provider is currently unavailable. Please try again later.');
        }
        throw new ApiError(status, err.response.data?.error || 'Market data provider returned an error.');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        throw new ApiError(504, 'Market data request timed out. Please try again.');
      } else if (err instanceof ApiError) {
        throw err;
      }

      throw new ApiError(500, 'Failed to fetch cryptocurrency market data.');
    }
  }

  /**
   * Fetch historical market chart data (OHLC / price points) for a coin
   */
  async getCoinHistory(coinId, options = {}) {
    const cleanCoinId = String(coinId || 'bitcoin').toLowerCase().trim();
    const currency = (options.currency || 'usd').toLowerCase();
    const days = String(options.days || '7').toLowerCase();
    const ttlSeconds = parseInt(options.ttl || '300', 10); // 5 minutes cache

    const cacheKey = cacheInstance.generateKey('history', { coinId: cleanCoinId, currency, days });
    const cachedEntry = cacheInstance.get(cacheKey);

    // Cache HIT (unexpired)
    if (cachedEntry && !cachedEntry.isExpired) {
      return {
        coinId: cleanCoinId,
        currency,
        days,
        points: cachedEntry.data,
        cache: {
          fromCache: true,
          isStale: false,
          fetchedAt: cachedEntry.fetchedAt,
          ttlSeconds,
        },
      };
    }

    try {
      // 1. Try CoinGecko OHLC Endpoint first
      let rawPoints = [];
      let isOhlc = false;

      try {
        const ohlcRes = await this.axiosClient.get(`/coins/${cleanCoinId}/ohlc`, {
          params: { vs_currency: currency, days },
        });
        if (Array.isArray(ohlcRes.data) && ohlcRes.data.length > 0) {
          rawPoints = ohlcRes.data;
          isOhlc = true;
        }
      } catch (e) {
        // Fallback to market_chart if OHLC endpoint fails
      }

      // 2. Fallback to market_chart if OHLC returned no data
      if (rawPoints.length === 0) {
        const chartRes = await this.axiosClient.get(`/coins/${cleanCoinId}/market_chart`, {
          params: { vs_currency: currency, days },
        });
        if (Array.isArray(chartRes.data?.prices)) {
          rawPoints = chartRes.data.prices;
          isOhlc = false;
        }
      }

      // Normalize points
      const normalizedPoints = rawPoints.map((item) => {
        const timestamp = item[0];
        const dateObj = new Date(timestamp);

        if (isOhlc) {
          return {
            timestamp,
            time: dateObj.toISOString(),
            date: dateObj.toLocaleDateString(),
            formattedTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            price: item[4],
          };
        } else {
          const priceVal = item[1];
          return {
            timestamp,
            time: dateObj.toISOString(),
            date: dateObj.toLocaleDateString(),
            formattedTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: priceVal,
            high: priceVal,
            low: priceVal,
            close: priceVal,
            price: priceVal,
          };
        }
      });

      if (normalizedPoints.length > 0) {
        cacheInstance.set(cacheKey, normalizedPoints, ttlSeconds);
      }

      return {
        coinId: cleanCoinId,
        currency,
        days,
        points: normalizedPoints,
        cache: {
          fromCache: false,
          isStale: false,
          fetchedAt: new Date().toISOString(),
          ttlSeconds,
        },
      };
    } catch (err) {
      // Stale cache fallback if available
      if (cachedEntry && cachedEntry.data) {
        console.warn(`[UPSTREAM NOTICE] CoinGecko history request failed (${err.message}). Serving stale cache.`);
        return {
          coinId: cleanCoinId,
          currency,
          days,
          points: cachedEntry.data,
          cache: {
            fromCache: true,
            isStale: true,
            fetchedAt: cachedEntry.fetchedAt,
            ttlSeconds,
          },
        };
      }

      // Operational Error Handling
      if (err.response) {
        const status = err.response.status;
        if (status === 429) {
          throw new ApiError(429, 'Historical market data rate limit exceeded. Please try again shortly.');
        }
        if (status === 404) {
          throw new BadRequestError(`Cryptocurrency asset '${cleanCoinId}' not found.`);
        }
        throw new ApiError(status, err.response.data?.error || 'Market chart provider returned an error.');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        throw new ApiError(504, 'Historical market data request timed out.');
      } else if (err instanceof ApiError) {
        throw err;
      }

      throw new ApiError(500, 'Failed to fetch historical market data.');
    }
  }

  /**
   * Helper to manually clear in-memory cache (for testing or administrative tasks)
   */
  clearCache() {
    cacheInstance.clear();
  }
}

module.exports = new CryptoService();
