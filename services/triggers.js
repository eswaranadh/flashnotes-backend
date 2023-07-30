const { db, admin } = require("../utils/admin");
const Constants = require("../utils/constants");


class Triggers {
    static async addFlashCard(snap, context) {
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
}

module.exports = Triggers;