const sgMail = require('@sendgrid/mail')
const emailConfiguration = require('../config/backendconfig.json').email
sgMail.setApiKey(emailConfiguration.sendGridApiKey)

class Email {
    static async send({
        subject,
        body,
        to = [],
        cc = [],
        bcc = []
    }) {
        const msg = {
            to,
            cc,
            bcc,
            from: emailConfiguration.fromEmail,
            subject,
            text: body,
            html: body,
        }
        try {
            await sgMail.send(msg)
            console.log('Email sent successfully to: ', to, cc, bcc, ' with subject: ', subject)
        } catch (error) {
            console.error(error)
            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    static async sendDynamicTemplate({
        template_id,
        dynamic_template_data = {},
        to = [],
        cc = [],
        bcc = []
    }) {
        // to, cc, bcc should be in the format of [{email: 'email1'}, {email: 'email2'}]
        const msg = {
            to,
            cc,
            bcc,
            from: emailConfiguration.fromEmail,
            template_id,
            personalizations: [{
                to,
                cc,
                bcc,
                dynamic_template_data
            }]
        }
        try {
            await sgMail.send(msg)
            console.log('Email sent successfully to: ', to, cc, bcc, ' with template_id: ', template_id, ' and dynamic_template_data: ', dynamic_template_data)
        } catch (error) {
            console.error(error)
            if (error.response) {
                console.error(error.response.body)
            }
        }
    }
}

module.exports = Email