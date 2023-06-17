const express = require('express');
const router = express.Router();
const flashcardsController = require('../controllers/flashcardsController');
const { auth } = require('../utils/auth');
const { validateFlashcard, validateUpdateFlashcard } = require('../utils/validators');

// GET all flashcards for a user
router.get('/', auth, flashcardsController.getAllFlashcards);

// GET details of a single flashcard for a user
router.get('/:id', auth, flashcardsController.getFlashcardById);

// CREATE a new flashcard for a user
router.post('/', [auth, validateFlashcard], flashcardsController.createFlashcard);

// UPDATE an existing flashcard for a user
router.put('/:id', [auth, validateUpdateFlashcard], flashcardsController.updateFlashcard);

// DELETE an existing flashcard for a user
router.delete('/:id', auth, flashcardsController.deleteFlashcard);

module.exports = router;
