const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const { auth } = require('../utils/auth');
const { validateDeck } = require('../utils/validators');

// GET all flashcards for a user
router.get('/', auth, deckController.getAllDecks);

// GET details of a single flashcard for a user
router.get('/:id', auth, deckController.getDeckById);

// CREATE a new flashcard for a user
router.post('/', [auth, validateDeck], deckController.createDeck);

// UPDATE an existing flashcard for a user
router.put('/:id', [auth, validateDeck], deckController.updateDeck);

// DELETE an existing flashcard for a user
router.delete('/:id', auth, deckController.deleteDeck);

module.exports = router;
