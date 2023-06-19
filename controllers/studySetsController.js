const { db } = require("../utils/admin");
const Constants = require("../utils/constants");

// Create a new studySet
exports.createStudySet = async (req, res) => {
    try {
        let cardsFromDecks = [];
        const decks = req.body.decks;
        const promises = decks.map(async (deckId) => {
            const flashCardsThisDeck = (await db.collection(Constants.FLASHCARDS).where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);
            cardsFromDecks = [...cardsFromDecks, ...flashCardsThisDeck];
        });
        await Promise.all(promises);
        const shuffledCards = cardsFromDecks.sort(() => Math.random() - 0.5);
        const studySetData = {
            title: req.body.title,
            createdAt: new Date().toISOString(),
            userId: req.user.uid,
            decks: req.body.decks,
            box1: shuffledCards,
            box2: [],
            box3: []
        };
        const doc = db.collection(Constants.STUDYSETS).doc()
        await doc.set({ ...studySetData, id: doc.id })
        const resStudySet = studySetData;
        resStudySet.studySetId = doc.id;
        res.json(resStudySet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
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
                studySetId: doc.id,
                title: doc.data().title,
                createdAt: doc.data().createdAt,
                userId: doc.data().userId,
                decks: doc.data().decks,
                box1: doc.data().box1,
                box2: doc.data().box2,
                box3: doc.data().box3
            });
        });
        res.json(studySets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Get a single studySet by studySetId
exports.getStudySetById = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        studySetData.studySetId = doc.id;
        res.json(studySetData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Update a studySet
exports.updateStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await doc.ref.update(req.body);
        res.json({ message: "StudySet updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Delete a studySet
exports.deleteStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await doc.ref.delete();
        res.json({ message: "StudySet deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box1 to box2
exports.moveCardFromBox1ToBox2 = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = studySetData.box1.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        studySetData.box1 = studySetData.box1.filter(card => card.id !== cardId);
        studySetData.box2.push(card);
        await doc.ref.update(studySetData);
        res.json({ message: "Card moved to box2 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box2 to box3
exports.moveCardFromBox2ToBox3 = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = studySetData.box2.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        studySetData.box2 = studySetData.box2.filter(card => card.id !== cardId);
        studySetData.box3.push(card);
        await doc.ref.update(studySetData);
        res.json({ message: "Card moved to box3 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box2 to box1
exports.moveCardFromBox2ToBox1 = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = studySetData.box2.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        studySetData.box2 = studySetData.box2.filter(card => card.id !== cardId);
        studySetData.box1.push(card);
        await doc.ref.update(studySetData);
        res.json({ message: "Card moved to box1 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box3 to box1
exports.moveCardFromBox3ToBox1 = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = studySetData.box3.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        studySetData.box3 = studySetData.box3.filter(card => card.id !== cardId);
        studySetData.box1.push(card);
        await doc.ref.update(studySetData);
        res.json({ message: "Card moved to box1 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// add deckId to studySet
exports.addDeckToStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const deckId = req.params.deckId;
        const deck = studySetData.decks.find(deck => deck.id === deckId);
        if (deck) {
            return res.status(400).json({ error: "Deck already added" });
        }
        studySetData.decks.push({ id: deckId });
        let cardsFromDeck = [];
        const flashCardsThisDeck = (await db.collection(Constants.FLASHCARDS).where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);
        cardsFromDeck = [...cardsFromDeck, ...flashCardsThisDeck];
        const shuffledCards = cardsFromDeck.sort(() => Math.random() - 0.5);
        studySetData.box1 = [...studySetData.box1, ...shuffledCards];
        await doc.ref.set(studySetData, { merge: true });
        res.json({ message: "Deck added to studySet successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// remove deckId from studySet
exports.removeDeckFromStudySet = async (req, res) => {
    try {
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const studySetData = doc.data() ?? {};
        const deckId = req.params.deckId;
        const deck = studySetData.decks.find(deck => deck.id === deckId);
        if (!deck) {
            return res.status(400).json({ error: "Deck not found" });
        }
        studySetData.decks = studySetData.decks.filter(deck => deck.id !== deckId);
        const flashCardsThisDeck = (await db.collection(Constants.FLASHCARDS).where("deckId", "==", deckId).get()).docs.map(doc => doc.data());
        studySetData.box1 = studySetData.box1.filter(card => !flashCardsThisDeck.includes(card.id));
        studySetData.box2 = studySetData.box2.filter(card => !flashCardsThisDeck.includes(card.id));
        studySetData.box3 = studySetData.box3.filter(card => !flashCardsThisDeck.includes(card.id));
        await doc.ref.set(studySetData, { merge: true });
        res.json({ message: "Deck removed from studySet successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}