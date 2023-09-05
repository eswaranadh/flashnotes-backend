const Constants = require("../utils/constants")
const Email = require("./email")


class Notification {
    static async sendWelcomeEmail(user) {
        const to = [{ email: user.email }]
        const template_id = Constants.DYNAMIC_TEMPLATES.WELCOME_EMAIL
        await Email.sendDynamicTemplate({ to, template_id })
    }
}

module.exports = Notification;