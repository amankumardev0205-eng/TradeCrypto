const express = require('express');
const router = express.Router();
const axios = require('axios');

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

/**
 * @route   GET /api/crypto/market
 * @desc    Get market data for cryptocurrencies
 * @access  Public
 */
router.get('/market', async (req, res) => {
    try {
        const { page = 1, per_page = 100 } = req.query;
        const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: parseInt(per_page),
                page: parseInt(page),
                sparkline: false,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching market data from CoinGecko:', error.message);
        res.status(500).json({ message: 'Failed to fetch market data.' });
    }
});

/**
 * @route   GET /api/crypto/trending
 * @desc    Get trending cryptocurrencies
 * @access  Public
 */
router.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`${COINGECKO_API_URL}/search/trending`);
        res.json(response.data.coins);
    } catch (error) {
        console.error('Error fetching trending data from CoinGecko:', error.message);
        res.status(500).json({ message: 'Failed to fetch trending data.' });
    }
});

/**
 * @route   GET /api/crypto/search
 * @desc    Search for a cryptocurrency
 * @access  Public
 */
router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }
    try {
        const response = await axios.get(`${COINGECKO_API_URL}/search`, { params: { query } });
        res.json(response.data.coins);
    } catch (error) {
        console.error('Error searching coins on CoinGecko:', error.message);
        res.status(500).json({ message: 'Failed to perform search.' });
    }
});

module.exports = router;