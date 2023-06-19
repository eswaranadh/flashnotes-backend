const { db } = require('../utils/admin');
const { validationResult } = require('express-validator');
const Constants = require('../utils/constants');

// Create a new deck
exports.createDeck = async (req, res) => {
    const { title, description } = req.body;
    const deckData = {
        title,
        description,
        createdAt: new Date().toISOString(),
        createdBy: req.user.uid,
    };

    try {
        const ref = db.collection(Constants.DECKS).doc()
        await ref.set({
            ...deckData,
            id: ref.id
        });
        res.status(201).json({ id: ref.id, ...deckData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Get all decks for a user
exports.getAllDecks = async (req, res) => {
    const { uid } = req.user;

    try {
        const snapshot = await db.collection(Constants.DECKS).where('createdBy', '==', uid).get();
        const decks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(decks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Get a single deck by ID
exports.getDeckById = async (req, res) => {
    const { id } = req.params;

    try {
        const deck = await db.collection(Constants.DECKS).doc(id).get();
        if (!deck.exists) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        res.json({ id: deck.id, ...deck.data() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Update a deck by ID
exports.updateDeck = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const deckData = {
        title,
        description,
        updatedAt: new Date().toISOString(),
    };

    try {
        const deck = await db.collection(Constants.DECKS).doc(id).get();
        if (!deck.exists) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        if (deck.data().createdBy !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await db.collection(Constants.DECKS).doc(id).update(deckData);
        res.json({ message: 'Deck updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Delete a deck by ID
exports.deleteDeck = async (req, res) => {
    const { id } = req.params;

    try {
        const deck = await db.collection(Constants.DECKS).doc(id).get();
        if (!deck.exists) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        if (deck.data().createdBy !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await db.collection(Constants.DECKS).doc(id).delete();
        res.json({ message: 'Deck deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
