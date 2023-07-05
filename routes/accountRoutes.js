const express = require('express');
const { auth } = require('../utils/auth');
const { } = require('../utils/validators');
const {
    updateStudyPreferences,
    updateNotificationPreferences,
    updateAccountDetails,
    getStudyPreferences,
    getNotificationPreferences,
    getAccountDetails,
    forgotPassword
} = require('../controllers/accountController');

const router = express.Router();

// update study preferences
router.put('/study-preferences', auth, updateStudyPreferences);

// update notification preferences
router.put('/notification-preferences', auth, updateNotificationPreferences);

// update account details
router.put('/account-details', auth, updateAccountDetails);

// get study preferences
router.get('/study-preferences', auth, getStudyPreferences);

// get notification preferences
router.get('/notification-preferences', auth, getNotificationPreferences);

// get account details
router.get('/account-details', auth, getAccountDetails);

module.exports = router;
