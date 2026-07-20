import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const API_BASE_URL = 'http://localhost:5000/api';

const Market = () => {
    const [marketData, setMarketData] = useState([]);
    const [trendingCoins, setTrendingCoins] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMarketData = useCallback(async () => {
        try {
            setLoading(true);
            const marketRes = await axios.get(`${API_BASE_URL}/crypto/market`);
            const trendingRes = await axios.get(`${API_BASE_URL}/crypto/trending`);
            setMarketData(marketRes.data);
            setTrendingCoins(trendingRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch cryptocurrency data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarketData();
    }, [fetchMarketData]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query.length > 2) {
            try {
                const res = await axios.get(`${API_BASE_URL}/crypto/search`, { params: { query } });
                setSearchResults(res.data);
            } catch (err) {
                console.error('Search failed:', err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const formatPrice = (price) => {
        if (price == null) return 'N/A';
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const formatPercentage = (percentage) => {
        if (percentage == null) return 'N/A';
        const value = percentage.toFixed(2);
        const color = value >= 0 ? 'green' : 'red';
        return <span style={{ color }}>{value}%</span>;
    };

    if (loading) return <div className="container"><h2>Loading Market Data...</h2></div>;
    if (error) return <div className="container"><h2 className="error">{error}</h2></div>;

    const displayData = searchTerm.length > 2 ? searchResults : marketData;

    return (
        <div className="container">
            <h1>Crypto Market</h1>
            <div className="market-search">
                <input
                    type="text"
                    placeholder="Search for a cryptocurrency..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <h2>{searchTerm.length > 2 ? 'Search Results' : 'Top 100 Cryptocurrencies'}</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Coin</th>
                            <th>Price</th>
                            <th>24h Change</th>
                            <th>Market Cap</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((coin, index) => (
                            <tr key={coin.id}>
                                <td>{coin.market_cap_rank || index + 1}</td>
                                <td className="coin-cell">
                                    <img src={coin.image || coin.thumb} alt={coin.name} className="coin-icon" />
                                    {coin.name} ({coin.symbol.toUpperCase()})
                                </td>
                                <td>{formatPrice(coin.current_price)}</td>
                                <td>{formatPercentage(coin.price_change_percentage_24h)}</td>
                                <td>{formatPrice(coin.market_cap)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Market;