class Constants {
    static DECKS = 'decks';
    static FLASHCARDS = 'flashcards';
    static NOTES = 'notes';
    static STUDYSETS = 'studysets';
    static USERS = 'users';
    static BOXES = 'boxes';
    static PREFERENCES = 'preferences';

    static BOX1 = 'box1';
    static BOX2 = 'box2';
    static BOX3 = 'box3';
    static STUDY_PREFERENCES = 'study-preferences';
    static NOTIFICATION_PREFERENCES = 'notification-preferences';

    static DYNAMIC_TEMPLATES = {
        WELCOME_EMAIL: 'd-ad90adb8d70544c89af2b1bb5dae46fb',
        REMIND_ABOUT_FLASHCARDS: 'd-bc7fb111995e4c37844f506eeafa552d'
    }

    static CRON_EXPRESSIONS = {
        MORNING7AM: '0 7 * * *'
    }
}

module.exports = Constants;