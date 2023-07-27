const AI = require("../services/ai");
const { db } = require("../utils/admin");
const Constants = require("../utils/constants");
const { getRandomColor } = require("../utils/helpers");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const noteData = {
      title: req.body.title,
      body: req.body.body,
      createdAt: new Date().toISOString(),
      userId: req.user.uid,
      color: getRandomColor()
    };
    const doc = db.collection(Constants.NOTES).doc()
    await doc.set({ ...noteData, id: doc.id })
    res.json({ message: "Note created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code, message: "Failed to create note" });
  }
};

// Get all notes for a user
exports.getAllNotes = async (req, res) => {
  try {
    const snapshot = await db
      .collection(Constants.NOTES)
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    const notes = [];
    snapshot.forEach((doc) => {
      notes.push({
        noteId: doc.id,
        title: doc.data().title,
        body: doc.data().body,
        createdAt: doc.data().createdAt,
        color: doc.data().color
      });
    });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code, message: "Failed to get notes" });
  }
};

// Get a single note by noteId
exports.getNoteById = async (req, res) => {
  try {
    const doc = await db.doc(`/${Constants.NOTES}/${req.params.noteId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const noteData = doc.data();
    noteData.noteId = doc.id;
    res.json(noteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code, message: "Failed to get note" });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const noteData = {
      title: req.body.title,
      body: req.body.body,
    };
    const doc = await db.doc(`/${Constants.NOTES}/${req.params.noteId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await doc.ref.update(noteData);
    res.json({ message: "Note updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code, message: "Failed to update note" });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const doc = await db.doc(`/${Constants.NOTES}/${req.params.noteId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await doc.ref.delete();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code, message: "Failed to delete note" });
  }
};

// generate flashcards from a note
exports.generateFlashcards = async (req, res) => {
  try {
    const noteData = (await db.doc(`/${Constants.NOTES}/${req.params.noteId}`).get()).data();
    if (!noteData) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (noteData.userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const generatedFlashcards = await AI.generateFlashcardsFromNotes(noteData.body)

    const newDeck = {
      title: noteData.title,
      description: 'Flash cards generated from note',
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
    }
    if (generatedFlashcards.length === 0) {
      console.log("No flashcards generated");
      return res.status(422).json({ message: "No flashcards generated" });
    }

    const deckRef = db.collection(Constants.DECKS).doc()
    await deckRef.set({ ...newDeck, id: deckRef.id })


    // insert into db
    generatedFlashcards.forEach(async (flashcard) => {
      const doc = db.collection(Constants.FLASHCARDS).doc()
      const front = flashcard.front
      const back = flashcard.back
      await doc.set({
        front: front,
        back: back,
        deckId: deckRef.id,
        id: doc.id,
        createdAt: new Date().toISOString(),
        createdBy: req.user.uid,
        promoteCount: 0,
        demoteCount: 0,
        timeSpentOnCard: 0,
      })
    })

    res.json({ message: "Flashcards generated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
  }
}