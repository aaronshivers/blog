const jwt = require('jsonwebtoken')

const User = require(`../models/user-model`)

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).render('error', {
          statusCode: '401',
          errorMessage: err.message
        })
      } else {
        User.findById(decoded._id).then((user) => {
          if (user.admin) {
            next()
          } else {
            res.status(401).render('error', {
              statusCode: '401',
              errorMessage: `Sorry, you must be an admin to view this page.`
            })
          }
        }).catch(err => res.status(401).render('error', {
          statusCode: '401',
          errorMessage: `Sorry, you must be an admin to view this page.`
        }))
      }
    })
  } else {
    res.status(401).render('error', {
      statusCode: '401',
      errorMessage: 'You must login to view this page.'
    })
  }
}

module.exports = authenticateAdmin
