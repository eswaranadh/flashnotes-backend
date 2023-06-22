const express = require('express');
const router = express.Router();
const boxController = require('../controllers/boxController');
const { auth } = require('../utils/auth');

// promote a card to the next box
router.post('/:studySetId/boxes/promote', auth, boxController.promoteCard);

// demote a card to the box1
router.post('/:studySetId/boxes/demote', auth, boxController.demoteCard);

// get all cards in a box
router.get('/:studySetId/boxes/:box', auth, boxController.loadCardsFromBox);

module.exports = router;
