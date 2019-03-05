require('dotenv').config()
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = email => {
  sgMail.send({
    to: email,
    from: 'no-reply@aaronshivers.com',
    subject: 'Welcome to the Blog',
    text: `Welcome to the Blog, ${ email }. I hope that you enjoy it.`
  })
}

module.exports = {
  sendWelcomeEmail
}
