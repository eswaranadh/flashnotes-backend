const { db, admin } = require("../utils/admin");
const Constants = require("../utils/constants");

// add cards to box
exports.initializeAllBoxes = async function (studySetId, decks, userId) {
    // box 1 will be initialized with all cards
    // box 2 will be empty
    // box 3 will be empty

    const boxesRef = db.collection(`${Constants.STUDYSETS}/${studySetId}/${Constants.BOXES}`);
    const box1Ref = boxesRef.doc(Constants.BOX1);
    const box2Ref = boxesRef.doc(Constants.BOX2);
    const box3Ref = boxesRef.doc(Constants.BOX3);

    let cardsFromDecks = [];
    const promises = decks.map(async (deckId) => {
        const flashCardsThisDeck = (await db.collection(Constants.FLASHCARDS).where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);
        cardsFromDecks = [...cardsFromDecks, ...flashCardsThisDeck];
    });
    await Promise.all(promises);
    const shuffledCards = cardsFromDecks.sort(() => Math.random() - 0.5);

    const box1 = {
        cards: shuffledCards,
        id: Constants.BOX1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        lastRemindedDate: new Date().toISOString(),
        studySetId
    };

    const box2 = {
        cards: [],
        id: Constants.BOX2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        lastRemindedDate: new Date().toISOString(),
        studySetId
    };

    const box3 = {
        cards: [],
        id: Constants.BOX3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastRemindedDate: new Date().toISOString(),
        studySetId
    };

    box1Ref.set(box1);
    box2Ref.set(box2);
    box3Ref.set(box3);
}

// add cards to box1 by deckId
exports.addDeckCardsToBox1 = async function (studySetId, deckId) {
    const box1Ref = db.doc(`${Constants.STUDYSETS}/${studySetId}/${Constants.BOXES}/${Constants.BOX1}`);
    const box1Data = (await box1Ref.get()).data();
    const flashCardsThisDeck = (await db.collection(Constants.FLASHCARDS).where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);
    const shuffledCards = flashCardsThisDeck.sort(() => Math.random() - 0.5);
    const newBox1 = {
        ...box1Data,
        cards: [...box1Data.cards, ...shuffledCards],
        updatedAt: new Date().toISOString()
    };
    await box1Ref.update(newBox1);
}

// remove deck cards from box 
exports.removeDeckCardsFromAllBoxes = async function (studySetId, deckId) {
    const box1Ref = db.doc(`${Constants.STUDYSETS}/${studySetId}/${Constants.BOXES}/${Constants.BOX1}`);
    const box2Ref = db.doc(`${Constants.STUDYSETS}/${studySetId}/${Constants.BOXES}/${Constants.BOX2}`);
    const box3Ref = db.doc(`${Constants.STUDYSETS}/${studySetId}/${Constants.BOXES}/${Constants.BOX3}`);

    const box1Data = (await box1Ref.get()).data();
    const box2Data = (await box2Ref.get()).data();
    const box3Data = (await box3Ref.get()).data();

    const flashCardsThisDeck = (await db.collection(Constants.FLASHCARDS).where("deckId", "==", deckId).get()).docs.map(doc => doc.data()).map(item => item.id);

    const newBox1 = {
        ...box1Data,
        cards: box1Data.cards.filter(card => !flashCardsThisDeck.includes(card)),
        updatedAt: new Date().toISOString()
    };

    const newBox2 = {
        ...box2Data,
        cards: box2Data.cards.filter(card => !flashCardsThisDeck.includes(card)),
        updatedAt: new Date().toISOString()
    };

    const newBox3 = {
        ...box3Data,
        cards: box3Data.cards.filter(card => !flashCardsThisDeck.includes(card)),
        updatedAt: new Date().toISOString()
    };

    await box1Ref.update(newBox1);
    await box2Ref.update(newBox2);
    await box3Ref.update(newBox3);
}

exports.promoteCard = async (req, res) => {
    try {
        const { sourceBox, cardId } = req.query;
        const { timeSpentOnCard } = req.body;
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const box1Ref = doc.ref.collection(Constants.BOXES).doc(Constants.BOX1);
        const box2Ref = doc.ref.collection(Constants.BOXES).doc(Constants.BOX2);
        const box3Ref = doc.ref.collection(Constants.BOXES).doc(Constants.BOX3);

        if (sourceBox === Constants.BOX1) {
            // promote cardId from box1 to box2
            const box1Data = (await box1Ref.get()).data();
            const box2Data = (await box2Ref.get()).data();
            const card = box1Data.cards.find(card => card === cardId);
            if (!card) {
                return res.status(404).json({ message: "Card not found" });
            }

            box1Data.cards = box1Data.cards.filter(card => card !== cardId);
            box2Data.cards.push(cardId);

            await box1Ref.update({
                cards: box1Data.cards,
                updatedAt: new Date().toISOString()
            });

            await box2Ref.update({
                cards: box2Data.cards,
                updatedAt: new Date().toISOString()
            });
        } else if (sourceBox === Constants.BOX2) {
            // promote cardId from box2 to box3
            const box2Data = (await box2Ref.get()).data();
            const box3Data = (await box3Ref.get()).data();
            const card = box2Data.cards.find(card => card === cardId);
            if (!card) {
                return res.status(404).json({ message: "Card not found" });
            }

            box2Data.cards = box2Data.cards.filter(card => card !== cardId);
            box3Data.cards.push(cardId);

            await box2Ref.update({
                cards: box2Data.cards,
                updatedAt: new Date().toISOString()
            });

            await box3Ref.update({
                cards: box3Data.cards,
                updatedAt: new Date().toISOString()
            });
        } else if (sourceBox === Constants.BOX3) {
            // keep cardId in box3
        } else {
            return res.status(400).json({ message: "Invalid sourceBox" });
        }


        // increase promoteCount
        const cardRef = db.doc(`/${Constants.FLASHCARDS}/${cardId}`);

        const FieldValue = admin.firestore.FieldValue;
        await cardRef.update({
            promoteCount: FieldValue.increment(1),
            timeSpentOnCard: FieldValue.increment(timeSpentOnCard)
        });

        res.json({ message: "Card promoted successfully", hideToast: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: 'Failed to promote card' });
    }
}

exports.demoteCard = async (req, res) => {
    try {
        const { sourceBox, cardId } = req.query;
        const { timeSpentOnCard } = req.body;
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const box1Ref = doc.ref.collection(Constants.BOXES).doc(Constants.BOX1);
        const box2Ref = doc.ref.collection(Constants.BOXES).doc(Constants.BOX2);
        const box3Ref = doc.ref.collection(Constants.BOXES).doc(Constants.BOX3);

        if (sourceBox === Constants.BOX1) {
            // keep cardId in box1
        } else if (sourceBox === Constants.BOX2) {
            // demote cardId from box2 to box1
            const box1Data = (await box1Ref.get()).data();
            const box2Data = (await box2Ref.get()).data();
            const card = box2Data.cards.find(card => card === cardId);
            if (!card) {
                return res.status(404).json({ message: "Card not found" });
            }

            box2Data.cards = box2Data.cards.filter(card => card !== cardId);
            box1Data.cards.push(cardId);

            await box1Ref.update({
                cards: box1Data.cards,
                updatedAt: new Date().toISOString()
            });

            await box2Ref.update({
                cards: box2Data.cards,
                updatedAt: new Date().toISOString()
            });
        } else if (sourceBox === Constants.BOX3) {
            // demote cardId from box3 to box1
            const box1Data = (await box1Ref.get()).data();
            const box3Data = (await box3Ref.get()).data();
            const card = box3Data.cards.find(card => card === cardId);
            if (!card) {
                return res.status(404).json({ message: "Card not found" });
            }

            box3Data.cards = box3Data.cards.filter(card => card !== cardId);
            box1Data.cards.push(cardId);

            await box1Ref.update({
                cards: box1Data.cards,
                updatedAt: new Date().toISOString()
            });

            await box3Ref.update({
                cards: box3Data.cards,
                updatedAt: new Date().toISOString()
            });
        } else {
            // invalid sourceBox
            return res.status(400).json({ message: "Invalid sourceBox" });
        }

        // increase demoteCount
        const cardRef = db.doc(`/${Constants.FLASHCARDS}/${cardId}`);

        console.log("timeSpentOnCard", timeSpentOnCard);
        const FieldValue = admin.firestore.FieldValue;
        await cardRef.update({
            demoteCount: FieldValue.increment(1),
            timeSpentOnCard: FieldValue.increment(timeSpentOnCard)
        });

        res.json({ message: "Card demoted successfully", hideToast: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: 'Failed to demote card' });
    }
}

// load cards from box
exports.loadCardsFromBox = async (req, res) => {
    try {
        const { box } = req.params;
        const doc = await db.doc(`/${Constants.STUDYSETS}/${req.params.studySetId}`).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "StudySet not found" });
        }
        if (doc?.data()?.userId !== req.user.uid) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const boxRef = doc.ref.collection(Constants.BOXES).doc(box);
        const boxData = (await boxRef.get()).data();

        const cardIdsFromBox = boxData.cards;
        const cards = [];
        for (const cardId of cardIdsFromBox) {
            const cardRef = db.collection(Constants.FLASHCARDS).doc(cardId);
            const cardData = (await cardRef.get()).data();
            cards.push(cardData);
        }

        res.json(cards);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.code, message: 'Failed to load cards from box' });
    }
}