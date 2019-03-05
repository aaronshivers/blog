var postmark = require("postmark")

const serverToken = process.env.POSTMARK_TOKEN

// Send an email:
var client = new postmark.ServerClient(serverToken)

const sendWelcomeEmail = email => {
  client.sendEmail({
    "To": email,
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Welcome to the Blog',
    "TextBody": `Welcome to the Blog, ${ email }. I hope that you enjoy it.`
  })
}

const sendCancelationEmail = email => {
  client.sendEmail({
    "To": email,
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Sorry, to see you go.',
    "TextBody": `Goodbye, ${ email }. I hope to see you again.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
