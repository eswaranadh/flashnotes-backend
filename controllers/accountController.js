const Email = require('../services/email');
const { admin, db } = require('../utils/admin');
const Constants = require('../utils/constants');


// update study preferences
exports.updateStudyPreferences = async (req, res) => {
    const userId = req.user.uid;
    const studyPreferences = req.body;

    try {
        const docRef = db.collection(`${Constants.USERS}/${userId}/${Constants.PREFERENCES}`).doc(Constants.STUDY_PREFERENCES);
        const docData = (await docRef.get()).data();
        if (!docData) {
            return res.status(404).json({ error: "Study preferences not found" });
        }

        if (docData.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await docRef.update(studyPreferences);
        return res.status(200).json({ message: 'Study preferences updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.code });
    }
}

// update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
    const userId = req.user.uid;
    const notificationPreferences = req.body;

    try {
        const docRef = db.collection(`${Constants.USERS}/${userId}/${Constants.PREFERENCES}`).doc(Constants.NOTIFICATION_PREFERENCES);
        const docData = (await docRef.get()).data();
        if (!docData) {
            return res.status(404).json({ error: "Notification preferences not found" });
        }

        if (docData.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await docRef.update(notificationPreferences);
        return res.status(200).json({ message: 'Notification preferences updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.code });
    }
}

// update account details
exports.updateAccountDetails = async (req, res) => {
    const userId = req.user.uid;
    const accountDetails = req.body;

    try {
        const docRef = db.collection(Constants.USERS).doc(userId);
        const docData = (await docRef.get()).data();
        if (!docData) {
            return res.status(404).json({ error: "User not found" });
        }

        if (docData.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await docRef.update(accountDetails);
        return res.status(200).json({ message: 'Account details updated successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.code });
    }
}


// get study preferences
exports.getStudyPreferences = async (req, res) => {
    const userId = req.user.uid;

    try {
        const docRef = db.collection(`${Constants.USERS}/${userId}/${Constants.PREFERENCES}`).doc(Constants.STUDY_PREFERENCES);
        const docData = (await docRef.get()).data();
        if (!docData) {
            return res.status(404).json({ error: "Study preferences not found" });
        }

        if (docData.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        return res.status(200).json(docData);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.code });
    }
}

// get notification preferences
exports.getNotificationPreferences = async (req, res) => {
    const userId = req.user.uid;

    try {
        const docRef = db.collection(`${Constants.USERS}/${userId}/${Constants.PREFERENCES}`).doc(Constants.NOTIFICATION_PREFERENCES);
        const docData = (await docRef.get()).data();
        if (!docData) {
            return res.status(404).json({ error: "Notification preferences not found" });
        }

        if (docData.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        return res.status(200).json(docData);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.code });
    }
}

// get account details
exports.getAccountDetails = async (req, res) => {
    const userId = req.user.uid;

    try {
        const docRef = db.collection(Constants.USERS).doc(userId);
        const docData = (await docRef.get()).data();
        if (!docData) {
            return res.status(404).json({ error: "User not found" });
        }

        if (docData.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        return res.status(200).json(docData);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.code });
    }
}
