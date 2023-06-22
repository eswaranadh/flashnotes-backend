const express = require('express');
const router = express.Router();

const studySetsController = require('../controllers/studySetsController');
const { auth } = require('../utils/auth');
const { validateStudySet } = require('../utils/validators');

// Get all studySets
router.get('/', auth, studySetsController.getAllStudySets);

// Create new studySet
router.post('/', [auth, validateStudySet], studySetsController.createStudySet);

// Get single studySet
router.get('/:studySetId', auth, studySetsController.getStudySetById);

// Update studySet
router.put('/:studySetId', [auth, validateStudySet], studySetsController.updateStudySet);

// Delete studySet
router.delete('/:studySetId', auth, studySetsController.deleteStudySet);

// Add deck to studySet
router.post('/:studySetId/decks/:deckId', auth, studySetsController.addDeckToStudySet);

// Remove deck from studySet
router.delete('/:studySetId/decks/:deckId', auth, studySetsController.removeDeckFromStudySet);

module.exports = router;