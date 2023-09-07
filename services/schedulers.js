const { db } = require("../utils/admin")
const Constants = require("../utils/constants")
const Notifications = require("./notifications")


class Schedulers {
    static async checkDueFlashCards() {
        try {
            const users = (await db.collection(Constants.USERS).get()).docs.map(doc => doc.data())
            users.forEach(async user => {
                const boxes = (await db.collectionGroup(Constants.BOXES).where("userId", "==", user.userId).get()).docs.map(doc => doc.data())
                const boxesWithNumberOne = []
                const boxesWithNumberTwo = []
                const boxesWithNumberThree = []

                boxes.forEach(box => {
                    if (box.id === Constants.BOX1)
                        boxesWithNumberOne.push(box)
                    else if (box.id === Constants.BOX2) {
                        // check if last reminded date is 3 days or more
                        const lastRemindedDate = new Date(box.lastRemindedDate)
                        const currentDate = new Date()
                        const diffTime = Math.abs(currentDate - lastRemindedDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        if (diffDays >= 3)
                            boxesWithNumberTwo.push(box)
                    }
                    else if (box.id === Constants.BOX3) {
                        // check if last reminded date is 5 days or more
                        const lastRemindedDate = new Date(box.lastRemindedDate)
                        const currentDate = new Date()
                        const diffTime = Math.abs(currentDate - lastRemindedDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        if (diffDays >= 5)
                            boxesWithNumberThree.push(box)
                    }
                })

                const totalCards = boxesWithNumberOne.reduce((acc, box) => acc + box.cards.length, 0) +
                    boxesWithNumberTwo.reduce((acc, box) => acc + box.cards.length, 0) +
                    boxesWithNumberThree.reduce((acc, box) => acc + box.cards.length, 0)

                if (totalCards > 0) {
                    await Notifications.remindAboutFlashCards(user.email, totalCards)
                    const combinedBoxes = [...boxesWithNumberOne, ...boxesWithNumberTwo, ...boxesWithNumberThree]
                    combinedBoxes.forEach(async box => {
                        await db.collection(Constants.STUDYSETS).doc(box.studySetId).collection(Constants.BOXES).doc(box.id).update({
                            lastRemindedDate: new Date().toISOString()
                        })
                    })
                }
            })
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = Schedulers;