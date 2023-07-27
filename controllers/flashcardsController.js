const { db } = require('../utils/admin');
const { validationResult } = require('express-validator');
const Constants = require('../utils/constants');

// Create a new flashcard
exports.createFlashcard = async (req, res) => {
  const { front, back, deckId } = req.body;
  const flashcardData = {
    front,
    back,
    deckId,
    createdAt: new Date().toISOString(),
    createdBy: req.user.uid,
    promoteCount: 0,
    demoteCount: 0,
    timeSpentOnCard: 0,
  };

  try {
    const ref = db.collection(Constants.FLASHCARDS).doc()
    await ref.set({
      ...flashcardData,
      id: ref.id
    });
    res.status(201).json({ message: 'Flashcard created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create flash card' });
  }
};

// Get all flashcards for a user
exports.getAllFlashcards = async (req, res) => {
  const { uid } = req.user;
  const { deckId } = req.query
  try {
    let snapshot
    if (deckId)
      snapshot = await db.collection(Constants.FLASHCARDS)
        .where('createdBy', '==', uid)
        .where('deckId', '==', deckId)
        .get();
    else
      snapshot = await db.collection(Constants.FLASHCARDS).where('createdBy', '==', uid).get();
    const flashcards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get flashcards', error: err.code });
  }
};

// Get a single flashcard by ID
exports.getFlashcardById = async (req, res) => {
  const { id } = req.params;

  try {
    const flashcard = await db.collection(Constants.FLASHCARDS).doc(id).get();
    if (!flashcard.exists) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.json({ id: flashcard.id, ...flashcard.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get flash card', message: err.code });
  }
};

// Update a flashcard by ID
exports.updateFlashcard = async (req, res) => {
  const { id } = req.params;
  const { front, back } = req.body;
  const flashcardData = {
    front,
    back,
    updatedAt: new Date().toISOString(),
  };

  try {
    const flashcard = await db.collection(Constants.FLASHCARDS).doc(id).get();
    if (!flashcard.exists) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    if (flashcard.data().createdBy !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await db.collection(Constants.FLASHCARDS).doc(id).update(flashcardData);
    res.json({ message: 'Flashcard updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update flash card', error: err.code });
  }
};

// Delete a flashcard by ID
exports.deleteFlashcard = async (req, res) => {
  const { id } = req.params;

  try {
    const flashcard = await db.collection(Constants.FLASHCARDS).doc(id).get();
    if (!flashcard.exists) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    if (flashcard.data().createdBy !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await db.collection(Constants.FLASHCARDS).doc(id).delete();
    res.json({ message: 'Flashcard deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete flash card', error: err.code });
  }
};
