const { db } = require('../utils/admin');
const { validationResult } = require('express-validator');

// Create a new flashcard
exports.createFlashcard = async (req, res) => {
  const { front, back, deckId } = req.body;
  const flashcardData = {
    front,
    back,
    deckId,
    createdAt: new Date().toISOString(),
    createdBy: req.user.uid,
  };

  try {
    const ref = db.collection("flashcards").doc()
    await ref.set({
      ...flashcardData,
      id: ref.id
    });
    res.status(201).json({ id: ref.id, ...flashcardData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get all flashcards for a user
exports.getAllFlashcards = async (req, res) => {
  const { uid } = req.user;
  const { deckId } = req.query
  try {
    let snapshot
    if (deckId)
      snapshot = await db.collection('flashcards')
        .where('createdBy', '==', uid)
        .where('deckId', '==', deckId)
        .get();
    else
      snapshot = await db.collection('flashcards').where('createdBy', '==', uid).get();
    const flashcards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get a single flashcard by ID
exports.getFlashcardById = async (req, res) => {
  const { id } = req.params;

  try {
    const flashcard = await db.collection('flashcards').doc(id).get();
    if (!flashcard.exists) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.json({ id: flashcard.id, ...flashcard.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
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
    const flashcard = await db.collection('flashcards').doc(id).get();
    if (!flashcard.exists) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    if (flashcard.data().createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await db.collection('flashcards').doc(id).update(flashcardData);
    res.json({ message: 'Flashcard updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Delete a flashcard by ID
exports.deleteFlashcard = async (req, res) => {
  const { id } = req.params;

  try {
    const flashcard = await db.collection('flashcards').doc(id).get();
    if (!flashcard.exists) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    if (flashcard.data().createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await db.collection('flashcards').doc(id).delete();
    res.json({ message: 'Flashcard deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
