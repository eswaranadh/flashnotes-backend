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

// move cardId from box1 to box2
router.put('/:studySetId/box1-to-box2/:cardId', auth, studySetsController.moveCardFromBox1ToBox2);

// move cardId from box2 to box3
router.put('/:studySetId/box2-to-box3/:cardId', auth, studySetsController.moveCardFromBox2ToBox3);

// move cardId from box3 to box1
router.put('/:studySetId/box3-to-box1/:cardId', auth, studySetsController.moveCardFromBox3ToBox1);

// move cardId from box2 to box1
router.put('/:studySetId/box2-to-box1/:cardId', auth, studySetsController.moveCardFromBox2ToBox1);

module.exports = router;