const express = require('express');
const router = express.Router();

const notesController = require('../controllers/notesController');
const { auth } = require('../utils/auth');
const { validateNote } = require('../utils/validators');

// Get all notes
router.get('/', auth, notesController.getAllNotes);

// Create new note
router.post('/', [auth, validateNote], notesController.createNote);

// Get single note
router.get('/:noteId', auth, notesController.getNoteById);

// Update note
router.put('/:noteId', [auth, validateNote], notesController.updateNote);

// Delete note
router.delete('/:noteId', auth, notesController.deleteNote);

module.exports = router;
