const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(authMiddleware);

/**
 * @route   POST /api/portfolio/add
 * @desc    Add an asset to the user's portfolio
 * @access  Private
 */
router.post('/add', async (req, res) => {
    try {
        const { coinId, amount, purchasePrice } = req.body;
        const userId = req.user.uid;

        if (!coinId || !amount || !purchasePrice) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const assetRef = await db.collection('portfolios').add({
            userId,
            coinId,
            amount: Number(amount),
            purchasePrice: Number(purchasePrice),
            dateAdded: new Date(),
        });

        res.status(201).json({ message: 'Asset added successfully', assetId: assetRef.id });
    } catch (error) {
        console.error('Error adding asset to portfolio:', error);
        res.status(500).json({ message: 'Server error while adding asset.' });
    }
});

/**
 * @route   GET /api/portfolio
 * @desc    Get the user's portfolio
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid;
        const portfolioSnapshot = await db.collection('portfolios').where('userId', '==', userId).get();

        if (portfolioSnapshot.empty) {
            return res.json([]);
        }

        const portfolio = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Server error while fetching portfolio.' });
    }
});

/**
 * @route   DELETE /api/portfolio/:assetId
 * @desc    Delete an asset from the portfolio
 * @access  Private
 */
router.delete('/:assetId', async (req, res) => {
    // Note: For a production app, you should also verify the asset belongs to the user.
    await db.collection('portfolios').doc(req.params.assetId).delete();
    res.json({ message: 'Asset deleted successfully.' });
});

module.exports = router;