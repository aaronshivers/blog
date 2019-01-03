const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')

const User = require('../models/user-model')
const populateDatabase = require('../middleware/populate-database')

// Required to prevent getting infinite results
router.all('*', (req, res, next) => {
  if (req.query.limit <= 10) req.query.limit = 10
  next()
})

router.post('/users', (req, res) => {
  const { email, password } = req.body
  const newUser = { email, password }
  const user = new User(newUser)

  user.save().then((user) => {
    res.status(201).send(user)
  }).catch(err => res.status(400).send(err.message))
})

router.get('/users', async (req, res, next) => {
  
  try {
    const [ results, itemCount ] = await Promise.all([
      User.find({}).limit(req.query.limit).skip(req.skip).lean().exec(),
      User.count({})
    ])

    const pageCount = Math.ceil(itemCount / req.query.limit)

    if (Object.keys(results) == 0) return res.status(500).send('Sorry, the database must be empty.')

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

router.get('/users/:id/view', (req, res) => {
  const { id } = req.params

  User.findById(id).then((user) => {
    res.render('view-user', { user })
  })
})

router.get('/users/search', (req, res) => {
  res.render('search')
})

router.get('/users/results', async (req, res, next) => {
  const { query } = req.query

  try {
    const [ results, itemCount ] = await Promise.all([
      User.find( { $text: { $search: query } } ).limit(req.query.limit).skip(req.skip).lean().exec(),
      User.count( { $text: { $search: query } } )
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

router.get('/login', (req, res) => res.render('login'))

router.get('/users/populate', (req, res) => {
  populateDatabase()

  setTimeout(() => res.redirect('/users'), 5000)
})

module.exports = router
