function getRandomColor() {
    var letters = 'BCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function defaultUserPreferences() {
    const studyPreferences = {
        studyMode: 'flashcards',
    }

    const notificationPreferences = {
        pushNotifications: true,
        emailNotifications: true,
        notifyBox1FrequencyInDays: 1,
        notifyBox2FrequencyInDays: 3,
        notifyBox3FrequencyInDays: 7
    }

    return {
        studyPreferences,
        notificationPreferences
    }
}

module.exports = {
    getRandomColor,
    defaultUserPreferences
}