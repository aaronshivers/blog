require('dotenv').config()

// Require:
var postmark = require("postmark");

// Send an email:
var client = new postmark.ServerClient("98df6d2e-9122-4502-8007-2a2d1d5e358e");

const sendWelcomeEmail = email => {
  client.sendEmail({
    "To": 'test@blackhole.postmarkapp.com',
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Welcome to the Blog',
    "TextBody": `Welcome to the Blog, ${ email }. I hope that you enjoy it.`
  })
}

const sendCancelationEmail = email => {
  client.sendEmail({
    "To": 'test@blackhole.postmarkapp.com',
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Sorry, to see you go.',
    "TextBody": `Goodbye, ${ email }. I hope to see you again.`
  })
}


// const sgMail = require('@sendgrid/mail')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// const sendWelcomeEmail = email => {
//   sgMail.send({
//     to: email,
//     from: 'no-reply@aaronshivers.com',
//     subject: 'Welcome to the Blog',
//     text: `Welcome to the Blog, ${ email }. I hope that you enjoy it.`
//   })
// }

// const sendCancelationEmail = email => {
//   sgMail.send({
//     to: email,
//     from: 'no-reply@aaronshivers.com',
//     subject: 'Sorry, to see you go.',
//     text: `Goodbye, ${ email }. I hope to see you again.`
//   })
// }

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
