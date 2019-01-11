const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/user-model')
const validatePassword = require('../middleware/validate-password')
const authenticateUser = require('../middleware/authenticate-user')
const authenticateAdmin = require('../middleware/authenticate-admin')
const { createToken, verifyToken } = require('../middleware/handle-tokens')

const cookieExpiration = { expires: new Date(Date.now() + 86400000) }
const saltRounds = 10

// Required to prevent getting infinite results during pagination
router.all('*', (req, res, next) => {
  if (req.query.limit <= 10) req.query.limit = 10
  next()
})

// POST /users
router.post('/users', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!password || !email) return res.status(400).render('error', {
    statusCode: '400',
    errorMessage: 'You must provide an email, and a password.'
  })

  validatePassword(password).then((password) => {
    const newUser = { email, password }
    const user = new User(newUser)

    user.save().then((user) => {
      createToken(user).then((token) => {
        res
          .cookie('token', token, cookieExpiration)
          .status(201)
          .redirect(`/profile`)
      })
    }).catch(err => res.status(400).send(err.message))
  }).catch(err => res.status(400).render('error', {
    statusCode: '400',
    errorMessage: err.message
  }))
})

// GET /profile
router.get('/profile', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET
  const decoded = jwt.verify(token, secret)
  const { _id } = decoded

  User.findById(_id).then((user) => {
    if (user) {
      res.render('profile', { user })
    } else {
      res.status(401).render('error', {
        statusCode: '401',
        errorMessage: 'Sorry, you must be logged in to view this page.'
      })
    }
  })
})

// GET /users
router.get('/users', authenticateAdmin, async (req, res, next) => {
  
  try {
    const [ results, itemCount ] = await Promise.all([
      User
        .find({})
        .sort({ signupDate: -1 })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      User.countDocuments({})
    ])

    const pageCount = Math.ceil(itemCount / req.query.limit)

    if (Object.keys(results) == 0) {
      return res.status(500).send('Sorry, the database must be empty.')
    } 

    res.render('users', {
      users: results,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(4, pageCount, req.query.page)
    })
  } catch (err) {
    next(err)
  }
})

router.get('/users/:id/view', authenticateUser, (req, res) => {
  const { id } = req.params

  User.findById(id).then((user) => {
    res.render('view-user', { user })
  })
})

// GET /users/search
router.get('/users/search', authenticateAdmin, async (req, res, next) => {
  const { term } = req.query

  try {
    const [ results, itemCount ] = await Promise.all([
      User.find( { $text: { $search: term } } ).limit(req.query.limit).skip(req.skip).lean().exec(),
      User.countDocuments( { $text: { $search: term } } )
    ])

    if (results < 1) return res.status(404).render('error', {
      statusCode: '404',
      errorMessage: 'Sorry, we cannot find that!'
    })

    const pageCount = Math.ceil(itemCount / req.query.limit)

    res.render('results', {
      users: results,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(4, pageCount, req.query.page)
    })
  } catch (err) {
    next(err)
  }
})

// GET /signup
router.get('/signup', (req, res) => res.render('signup'))

// GET /login
router.get('/login', (req, res) => res.render('login'))

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  User.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          createToken(user).then((token) => {
            res
              .cookie('token', token, cookieExpiration)
              .status(200)
              .redirect(`/profile`)
          })
        } else {
          res.status(401).render('error', {
            statusCode: '401',
            errorMessage: 'Please check your login credentials, and try again.'
          })
        }
      })
    } else {
      res.status(401).render('error', {
        statusCode: '401',
        errorMessage: 'Please check your login credentials, and try again.'
      })
    }
  }).catch(err => res.status(401)
    .send('Please check your login credentials, and try again.'))
})

// GET /logout
router.get('/logout', (req, res) => {
  res.clearCookie('token').redirect(`/blogs`)
})

// GET /users/:id/edit
router.get('/users/edit', authenticateUser, (req, res) => {
  const { token } = req.cookies

  verifyToken(token).then((id) => {
    User.findById(id).then((user) => {
      if (!user) {
        res.status(404).render('error', {
          statusCode: '404',
          errorMessage: `Sorry, we can't find that user in our database.`
        })
      } else {
        res.render('edit-user', { user })
      }
    })
  })
})

// PATCH /users/:id
router.patch('/users/:id', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const { id } = req.params
  const { email, password, firstName, lastName, jobTitle, avatar } = req.body

  User.findById(id).then((user) => {
    if (!user) {
      res.status(404).render('error', {
        statusCode: '404',
        errorMessage: 'Sorry, that user was not found in our database.'
      })
    } else {
      
      verifyToken(token).then((creator) => {

        if (creator !== id) {
          return res.status(401).render('error', {
            statusCode: '401',
            errorMessage: `Sorry, it appears that you 
            are not the owner of that account.`
          })
        }

        validatePassword(password).then((password) => {

          bcrypt.hash(password, saltRounds).then((hash) => {
            const updatedUser = {
              email,
              password: hash,
              firstName,
              lastName,
              jobTitle,
              avatar
            }
            const options = { runValidators: true }

            User.findByIdAndUpdate(id, updatedUser, options).then((user) => {

              if (user) return res.status(302).redirect('/profile')

              res.status(404).render('error', {
                statusCode: '404',
                errorMessage: `Sorry, that user Id 
                was not found in our database.`
              })
            }).catch(err => res.status(400).render('error', {
              statusCode: '400',
              errorMessage: `Sorry, that email already exists in our database.`
            }))
          }).catch(err => res.status(400).render('error', {
            statusCode: '400',
            errorMessage: err.message
          }))
        }).catch(err => res.status(400).render('error', {
          statusCode: '400',
          errorMessage: err.message
        }))
      })
    }
  })
})

// DELETE /users/:id
router.delete('/users/delete', authenticateUser, (req, res) => {
  const { token } = req.cookies

  verifyToken(token).then((id) => {
    User.findByIdAndDelete(id).then((user) => {

      if (user) {
        res.clearCookie('token').redirect('/blogs')
      } else {
        res.status(404).render('error', {
          statusCode: '404',
          errorMessage: 'Sorry, we could not find that user in our database.'
        })
      }
    })
  })
})

module.exports = router
