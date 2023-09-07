const Constants = require("../utils/constants")
const Email = require("./email")


class Notifications {
    static async sendWelcomeEmail(user) {
        const to = [{ email: user.email }]
        const template_id = Constants.DYNAMIC_TEMPLATES.WELCOME_EMAIL
        await Email.sendDynamicTemplate({ to, template_id })
    }

    static async remindAboutFlashCards(email, totalCards) {
        const to = [{ email: email }]
        const template_id = Constants.DYNAMIC_TEMPLATES.REMIND_ABOUT_FLASHCARDS
        await Email.sendDynamicTemplate({ to, template_id, dynamic_template_data: { cards: totalCards } })
    }
}

module.exports = Notifications;