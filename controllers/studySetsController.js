const { db } = require("../utils/admin");
const Constants = require("../utils/constants");
const { addDeckCardsToBox1, removeDeckCardsFromAllBoxes, initializeAllBoxes } = require("./boxController");

// Create a new studySet
exports.createStudySet = async (req, res) => {
    try {
        const studySetData = {
            title: req.body.title,
            createdAt: new Date().toISOString(),
            userId: req.user.uid,
            decks: req.body.decks
        };
        const doc = db.collection(Constants.STUDYSETS).doc()
        await doc.set({ ...studySetData, id: doc.id })
        await initializeAllBoxes(doc.id, studySetData.decks)
        res.json({ message: "Study set created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to create study set" });
    }
}

// Get all studySets for a user
exports.getAllStudySets = async (req, res) => {
    try {
        const snapshot = await db
            .collection(Constants.STUDYSETS)
            .where("userId", "==", req.user.uid)
            .orderBy("createdAt", "desc")
            .get();
        const studySets = [];
        snapshot.forEach((doc) => {
            studySets.push({
                ...doc.data(),
                id: doc.id,
                studySetId: doc.id,
            });
        });
        res.json(studySets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to get study sets" });
    }
}

// Get a single studySet by studySetId
exports.getStudySetById = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Study set not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // count of cards in each box
        const totalCardsInBox1 = (await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}/${Constants.BOXES}/${Constants.BOX1}`).get()).data();
        const totalCardsInBox2 = (await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}/${Constants.BOXES}/${Constants.BOX2}`).get()).data();
        const totalCardsInBox3 = (await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}/${Constants.BOXES}/${Constants.BOX3}`).get()).data();

        const studySetData = doc.data() ?? {};
        studySetData.studySetId = doc.id;
        studySetData.totalCardsInBox1 = totalCardsInBox1?.cards?.length ?? 0;
        studySetData.totalCardsInBox2 = totalCardsInBox2?.cards?.length ?? 0;
        studySetData.totalCardsInBox3 = totalCardsInBox3?.cards?.length ?? 0;
        res.json(studySetData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to get study set" });
    }
}

// Update a studySet
exports.updateStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Study set not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const excludedFields = ["studySetId", "createdAt", "userId", "id", "decks"];
        Object.keys(req.body).forEach((key) => {
            if (excludedFields.includes(key)) {
                delete req.body[key];
            }
        });
        await doc.ref.update(req.body);
        res.json({ message: "Study set updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to update study set" });
    }
}

// Delete a studySet
exports.deleteStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Study set not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await doc.ref.delete();
        res.json({ message: "Study set deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to delete study set" });
    }
}

// add deckId to studySet
exports.addDeckToStudySet = async (req, res) => {
    try {
        const studySetId = req.params.studySetId;
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Study set not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const deckId = req.params.deckId;
        const deck = studySetData.decks.find(deck => deck.id === deckId);
        if (deck) {
            return res.status(400).json({ message: "Deck already added" });
        }
        studySetData.decks.push(deckId);
        await addDeckCardsToBox1(studySetId, deckId);
        await doc.ref.set(studySetData, { merge: true });
        res.json({ message: "Deck added to study set successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to add deck to study set" });
    }
}

// remove deckId from studySet
exports.removeDeckFromStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Study set not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const deckId = req.params.deckId;
        const deck = studySetData.decks.find(deck => deck.id === deckId);
        if (!deck) {
            return res.status(400).json({ message: "Deck not found" });
        }
        studySetData.decks = studySetData.decks.filter(deck => deck.id !== deckId);
        await removeDeckCardsFromAllBoxes(req.params.studySetId, deckId);
        await doc.ref.set(studySetData, { merge: true });
        res.json({ message: "Deck removed from study set successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: "Failed to remove deck from study set" });
    }
}