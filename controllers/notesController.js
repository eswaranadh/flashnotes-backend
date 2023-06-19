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
    const resNote = noteData;
    resNote.noteId = doc.id;
    res.json(resNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
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
    res.status(500).json({ error: err.code });
  }
};

// Get a single note by noteId
exports.getNoteById = async (req, res) => {
  try {
    const doc = await db.doc(`/${Constants.NOTES}/${req.params.noteId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Note not found" });
    }
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const noteData = doc.data();
    noteData.noteId = doc.id;
    res.json(noteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
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
      return res.status(404).json({ error: "Note not found" });
    }
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await doc.ref.update(noteData);
    const resNote = noteData;
    resNote.noteId = doc.id;
    res.json(resNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const doc = await db.doc(`/${Constants.NOTES}/${req.params.noteId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Note not found" });
    }
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await doc.ref.delete();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
  }
};