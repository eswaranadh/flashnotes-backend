const express = require('express');
const router = express.Router();

const sessionsController = require('../controllers/sessionsController');
const { auth } = require('../utils/auth');
const { validateSession } = require('../utils/validators');

// Get all sessions
router.get('/', auth, sessionsController.getAllSessions);

// Create new session
router.post('/', [auth, validateSession], sessionsController.createSession);

// Get single session
router.get('/:sessionId', auth, sessionsController.getSessionById);

// Update session
router.put('/:sessionId', [auth, validateSession], sessionsController.updateSession);

// Delete session
router.delete('/:sessionId', auth, sessionsController.deleteSession);

// move cardId from box1 to box2
router.put('/:sessionId/box1-to-box2/:cardId', auth, sessionsController.moveCardFromBox1ToBox2);

// move cardId from box2 to box3
router.put('/:sessionId/box2-to-box3/:cardId', auth, sessionsController.moveCardFromBox2ToBox3);

// move cardId from box3 to box1
router.put('/:sessionId/box3-to-box1/:cardId', auth, sessionsController.moveCardFromBox3ToBox1);

// move cardId from box2 to box1
router.put('/:sessionId/box2-to-box1/:cardId', auth, sessionsController.moveCardFromBox2ToBox1);

module.exports = router;