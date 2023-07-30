const { db } = require('../utils/admin');
const { validationResult } = require('express-validator');
const Constants = require('../utils/constants');
const { initializeAllBoxes } = require('./boxController');

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
        res.status(201).json({ message: 'Deck created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create deck', error: err.code });
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
        res.status(500).json({ message: 'Failed to get decks', error: err.code });
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
        res.status(500).json({ message: 'Failed to get deck', error: err.code });
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
            return res.status(404).json({ message: 'Deck not found' });
        }
        if (deck.data().createdBy !== req.user.uid) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await db.collection(Constants.DECKS).doc(id).update(deckData);
        res.json({ message: 'Deck updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update deck', error: err.code });
    }
};

// Delete a deck by ID
exports.deleteDeck = async (req, res) => {
    const { id } = req.params;

    try {
        const deck = await db.collection(Constants.DECKS).doc(id).get();
        if (!deck.exists) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        if (deck.data().createdBy !== req.user.uid) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await db.collection(Constants.DECKS).doc(id).delete();
        res.json({ message: 'Deck deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete deck', error: err.code });
    }
};


// study now
exports.studyNow = async (req, res) => {
    const { id: deckId } = req.params

    try {
        const deckDetails = (await db.collection(Constants.DECKS).doc(deckId).get()).data()
        if (!deckDetails) return res.status(404).json({ message: 'Deck not found' })
        if (deckDetails?.studySetId) return res.status(400).json({ message: 'Deck already in study set', hideToast: true })
        const studySetData = {
            title: deckDetails.title,
            createdAt: new Date().toISOString(),
            userId: deckDetails.createdBy,
            decks: [deckId]
        };
        const ref = db.collection(Constants.STUDYSETS).doc()
        await ref.set({
            ...studySetData,
            id: ref.id
        });
        await initializeAllBoxes(ref.id, studySetData.decks)

        await db.collection(Constants.DECKS).doc(deckId).set({ studySetId: ref.id }, { merge: true })

        res.status(201).json({ message: 'Study set created successfully', hideToast: true, studySetId: ref.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create study set', error: error.code });
    }
}