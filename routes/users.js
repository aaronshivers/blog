const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { sendWelcomeEmail } = require('../emails/account')

const User = require('../models/user-model')
const { validatePassword } = require('../middleware/validate-password')
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

// POST /
router.post('/', async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!password || !email) return res.status(400).render('error', {
    statusCode: '400',
    errorMessage: 'You must provide an email, and a password.'
  })

  try {
    const validatedPassword = await validatePassword(password)
    const newUser = { email, password: validatedPassword }
    const user = await new User(newUser)
    const savedUser = await user.save()
    const token = await createToken(savedUser)

    sendWelcomeEmail(email)

    res
      .cookie('token', token, cookieExpiration)
      .status(201)
      .redirect(`/profile`)
  } catch (error) {
    res.status(400).render('error', {
      statusCode: '400',
      errorMessage: error
    })
  }
})

// GET /profile
router.get('/profile', authenticateUser, async (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET
  const decoded = jwt.verify(token, secret)
  const { _id } = decoded

  const user = await User.findById(_id)
  if (user) {
    res.render('profile', { user })
  } else {
    res.status(401).render('error', {
      statusCode: '401',
      errorMessage: 'Sorry, you must be logged in to view this page.'
    })
  }
})

// GET /
router.get('/', authenticateAdmin, async (req, res, next) => {
  
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

// GET /:id/view
router.get('/:id/view', authenticateUser, async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id)
    res.render('view-user', { user })
  } catch (error) {
    throw new Error (error)
  }
})

// GET /search
router.get('/search', authenticateAdmin, async (req, res, next) => {
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
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (user) {
      bcrypt.compare(password, user.password, async (err, hash) => {
        if (hash) {
          try {
            const token = await createToken(user)
            res
              .cookie('token', token, cookieExpiration)
              .status(200)
              .redirect(`/profile`)
          } catch (error) {
            res.status(401).render('error', {
              statusCode: '401',
              errorMessage: 'Please check your login credentials, and try again.'
            })
          }
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
  } catch (error) {
    res.status(401).send('Please check your login credentials, and try again.')
  }
})

// GET /logout
router.get('/logout', (req, res) => {
  res.clearCookie('token').redirect(`/blogs`)
})

// GET /edit
router.get('/edit', authenticateUser, async (req, res) => {
  const { token } = req.cookies

  try {
    const id = await verifyToken(token)
    const user = await User.findById(id)
    res.render('edit-user', { user })
  } catch (error) {
    throw new Error(error)
  }
})

// PATCH /:id
router.patch('/:id', authenticateUser, async (req, res) => {
  const { token } = req.cookies
  const { id } = req.params
  const { email, password, firstName, lastName, jobTitle, avatar } = req.body

  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).render('error', { statusCode: '404', errorMessage: 'Sorry, that user was not found in our database.' })
    const creator = await verifyToken(token)
    if (creator !== id) return res.status(401).render('error', { statusCode: '401', errorMessage: `Sorry, it appears that you are not the owner of that account.` })
    const validatedPassword = await validatePassword(password)
    const hash = await bcrypt.hash(validatedPassword, saltRounds)
    const update = {
      email,
      password: hash,
      firstName,
      lastName,
      jobTitle,
      avatar
    }
    const options = { runValidators: true }
    const updatedUser = await User.findByIdAndUpdate(id, update, options)
    
    if (!updatedUser) return res.status(404).render('error', { statusCode: '404', errorMessage: `Sorry, that user Id was not found in our database.` })
    res.status(302).redirect('/profile')
  } catch (error) {
    res.status(400).render('error', {
      statusCode: '400',
      errorMessage: error
    })
  }
})

// DELETE /delete
router.delete('/delete', authenticateUser, async (req, res) => {
  const { token } = req.cookies

  try {
    const id = await verifyToken(token)
    const user = await User.findByIdAndDelete(id)
    res.clearCookie('token').redirect('/blogs')
  } catch (error) {
    return res.status(404).render('error', { statusCode: '404', errorMessage: 'Sorry, we could not find that user in our database.' })
  }
})

module.exports = router
