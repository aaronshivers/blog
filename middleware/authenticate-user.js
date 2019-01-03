const jwt = require('jsonwebtoken')

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!token) {
    return res.status(401).render('error', {
      statusCode: '401',
      errorMessage: 'You must login to view this page.'
    })
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).render('error', {
        statusCode: '401',
        errorMessage: err.message
      })
    }
    return next()
  })
}

module.exports = authenticateUser
