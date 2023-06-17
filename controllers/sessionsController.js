const { db } = require("../utils/admin");

// Create a new session
exports.createSession = async (req, res) => {
    try {
        let cardsFromDecks = [];
        const decks = req.body.decks;
        const promises = decks.map(async (deckId) => {
            const flashCardsThisDeck = (await db.collection("flashCards").where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);
            cardsFromDecks = [...cardsFromDecks, ...flashCardsThisDeck];
        });
        await Promise.all(promises);
        const shuffledCards = cardsFromDecks.sort(() => Math.random() - 0.5);
        const sessionData = {
            title: req.body.title,
            createdAt: new Date().toISOString(),
            userId: req.user.uid,
            decks: req.body.decks,
            box1: shuffledCards,
            box2: [],
            box3: []
        };
        const doc = db.collection("sessions").doc()
        await doc.set({ ...sessionData, id: doc.id })
        const resSession = sessionData;
        resSession.sessionId = doc.id;
        res.json(resSession);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Get all sessions for a user
exports.getAllSessions = async (req, res) => {
    try {
        const snapshot = await db
            .collection("sessions")
            .where("userId", "==", req.user.uid)
            .orderBy("createdAt", "desc")
            .get();
        const sessions = [];
        snapshot.forEach((doc) => {
            sessions.push({
                sessionId: doc.id,
                title: doc.data().title,
                createdAt: doc.data().createdAt,
                userId: doc.data().userId,
                decks: doc.data().decks,
                box1: doc.data().box1,
                box2: doc.data().box2,
                box3: doc.data().box3
            });
        });
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Get a single session by sessionId
exports.getSessionById = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        sessionData.sessionId = doc.id;
        res.json(sessionData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Update a session
exports.updateSession = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await doc.ref.update(req.body);
        res.json({ message: "Session updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// Delete a session
exports.deleteSession = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await doc.ref.delete();
        res.json({ message: "Session deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box1 to box2
exports.moveCardFromBox1ToBox2 = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = sessionData.box1.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        sessionData.box1 = sessionData.box1.filter(card => card.id !== cardId);
        sessionData.box2.push(card);
        await doc.ref.update(sessionData);
        res.json({ message: "Card moved to box2 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box2 to box3
exports.moveCardFromBox2ToBox3 = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = sessionData.box2.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        sessionData.box2 = sessionData.box2.filter(card => card.id !== cardId);
        sessionData.box3.push(card);
        await doc.ref.update(sessionData);
        res.json({ message: "Card moved to box3 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box2 to box1
exports.moveCardFromBox2ToBox1 = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = sessionData.box2.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        sessionData.box2 = sessionData.box2.filter(card => card.id !== cardId);
        sessionData.box1.push(card);
        await doc.ref.update(sessionData);
        res.json({ message: "Card moved to box1 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// move cardId from box3 to box1
exports.moveCardFromBox3ToBox1 = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        const cardId = req.params.cardId;
        const card = sessionData.box3.find(card => card.id === cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        sessionData.box3 = sessionData.box3.filter(card => card.id !== cardId);
        sessionData.box1.push(card);
        await doc.ref.update(sessionData);
        res.json({ message: "Card moved to box1 successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// add deckId to session
exports.addDeckToSession = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        const deckId = req.params.deckId;
        const deck = sessionData.decks.find(deck => deck.id === deckId);
        if (deck) {
            return res.status(400).json({ error: "Deck already added" });
        }
        sessionData.decks.push({ id: deckId });
        let cardsFromDeck = [];
        const flashCardsThisDeck = (await db.collection("flashCards").where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);
        cardsFromDeck = [...cardsFromDeck, ...flashCardsThisDeck];
        const shuffledCards = cardsFromDeck.sort(() => Math.random() - 0.5);
        sessionData.box1 = [...sessionData.box1, ...shuffledCards];
        await doc.ref.set(sessionData, { merge: true });
        res.json({ message: "Deck added to session successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}

// remove deckId from session
exports.removeDeckFromSession = async (req, res) => {
    try {
        const doc = await db.doc(`/sessions/${req.params.sessionId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Session not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const sessionData = doc.data() ?? {};
        const deckId = req.params.deckId;
        const deck = sessionData.decks.find(deck => deck.id === deckId);
        if (!deck) {
            return res.status(400).json({ error: "Deck not found" });
        }
        sessionData.decks = sessionData.decks.filter(deck => deck.id !== deckId);
        const flashCardsThisDeck = (await db.collection("flashCards").where("deckId", "==", deckId).get()).docs.map(doc => doc.data());
        sessionData.box1 = sessionData.box1.filter(card => !flashCardsThisDeck.includes(card.id));
        sessionData.box2 = sessionData.box2.filter(card => !flashCardsThisDeck.includes(card.id));
        sessionData.box3 = sessionData.box3.filter(card => !flashCardsThisDeck.includes(card.id));
        await doc.ref.set(sessionData, { merge: true });
        res.json({ message: "Deck removed from session successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code });
    }
}