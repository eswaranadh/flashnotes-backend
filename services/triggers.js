const { db, admin } = require("../utils/admin");
const Constants = require("../utils/constants");


class Triggers {
    static async addFlashCardToBox(snap, context) {
        const flashcard = snap.data();
        const { deckId } = flashcard;
        const deck = (await db.collection(Constants.DECKS).doc(deckId).get()).data();
        const { studySetId } = deck;

        const studySetRef = db.collection(Constants.STUDYSETS).doc(studySetId)
        const box1Ref = studySetRef.collection(Constants.BOXES).doc(Constants.BOX1)
        const FieldValue = admin.firestore.FieldValue;
        await box1Ref.update({
            cards: FieldValue.arrayUnion(flashcard.id)
        })

        console.log(`Added flashcard ${flashcard.id} to box1 of studySet ${studySetId} through trigger`);
    }

    static async removeFlashCardFromBox(snap, context) {
        const flashcard = snap.data();
        const { deckId } = flashcard;
        const deck = (await db.collection(Constants.DECKS).doc(deckId).get()).data();
        const { studySetId } = deck;

        const studySetRef = db.collection(Constants.STUDYSETS).doc(studySetId)
        const box1Ref = studySetRef.collection(Constants.BOXES).doc(Constants.BOX1)
        const box2Ref = studySetRef.collection(Constants.BOXES).doc(Constants.BOX2)
        const box3Ref = studySetRef.collection(Constants.BOXES).doc(Constants.BOX3)

        const FieldValue = admin.firestore.FieldValue;
        await box1Ref.update({
            cards: FieldValue.arrayRemove(flashcard.id)
        })

        await box2Ref.update({
            cards: FieldValue.arrayRemove(flashcard.id)
        })

        await box3Ref.update({
            cards: FieldValue.arrayRemove(flashcard.id)
        })

        console.log(`Removed flashcard ${flashcard.id} from the studySet ${studySetId} through trigger`);
    }
}

module.exports = Triggers;