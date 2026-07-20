const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { check, validationResult } = require('express-validator');

/**
 * @route   GET /api/watchlist
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(doc.data().watchlist || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/watchlist/add
 * @desc    Add a coin to user's watchlist
 * @access  Private
 */
router.post('/add', [
    check('coinId', 'Coin ID is required').not().isEmpty().isString().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { coinId } = req.body;
        const userRef = db.collection('users').doc(req.user.uid);
        await userRef.update({
            watchlist: FieldValue.arrayUnion(coinId)
        });
        res.status(200).json({ msg: 'Coin added to watchlist' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/watchlist/remove
 * @desc    Remove a coin from user's watchlist
 * @access  Private
 */
router.post('/remove', [
    check('coinId', 'Coin ID is required').not().isEmpty().isString().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { coinId } = req.body;
        const userRef = db.collection('users').doc(req.user.uid);
        await userRef.update({
            watchlist: FieldValue.arrayRemove(coinId)
        });
        res.status(200).json({ msg: 'Coin removed from watchlist' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;