const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog-model')
const authenticateUser = require('../middleware/authenticate-user')
const verifyCreator = require('../middleware/verify-creator')

// Required to prevent getting infinite results during pagination
router.all('*', (req, res, next) => {
  if (req.query.limit <= 10) req.query.limit = 10
  next()
})

router.get('/blogs/new', authenticateUser, (req, res) => {
  res.render('new-blog')
})

router.post('/blogs', authenticateUser, (req, res) => {
  const { title, body, image } = req.body
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET
  const decoded = jwt.verify(token, secret)
  const creator = decoded._id
  const newBlog = { title, body, image, creator }
  const blog = new Blog(newBlog)

  blog.save().then((blog) => {
    res.status(302).redirect('/blogs')
  }).catch(err => res.status(400).render('error', {
      statusCode: '400',
      errorMessage: err.message
    }))
})

router.get('/blogs', async (req, res, next) => {

  try {
    const [ results, itemCount ] = await Promise.all([
      Blog.find().populate('creator').sort({ date: -1 }).limit(req.query.limit).skip(req.skip).lean().exec(),
      Blog.countDocuments()
    ])

    const pageCount = Math.ceil(itemCount / req.query.limit)

    res.render('blogs', {
      blogs: results,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(4, pageCount, req.query.page)
    })
  } catch (err) {
    next(err)
  }
})

router.get('/blogs/:id/view', (req, res) => {
  const { id } = req.params

  Blog.findById(id).populate('creator').then((blog) => {
    if (blog) return res.render('view-blog', { blog })
  
    res.status(404).render('error', {
      statusCode: '404',
      errorMessage: `Sorry, we can't find a blog with that Id in our database.`
    })
  }).catch(err => res.status(400).render('error', {
      statusCode: '400',
      errorMessage: `Sorry, That seems to be an invalid ObjectId.`
    }))
})

// GET /blogs/search
router.get('/blogs/search', async (req, res, next) => {
  const { find } = req.query

  try {
    const [ results, itemCount ] = await Promise.all([
      Blog.find( { $text: { $search: find } } ).populate('creator').limit(req.query.limit).skip(req.skip).lean().exec(),
      Blog.countDocuments( { $text: { $search: find } } )
    ])

    const pageCount = Math.ceil(itemCount / req.query.limit)

    res.render('blogs', {
      blogs: results,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(4, pageCount, req.query.page)
    })
  } catch (err) {
    next(err)
  }
})

// GET /blogs/:creator/list
router.get('/blogs/:creator/list', authenticateUser, async (req, res, next) => {
  const { token } = req.cookies
  const { creator } = req.params
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  verifyCreator(token).then((creatorId) => {

    if (creatorId !== decoded._id) {
      return res.status(401).render('error', {
        statusCode: '401',
        errorMessage: `Sorry, it doesn't look like you are the creator of those blogs.`
      })
    } else {
      Blog.find({ creatorId }).sort({ date: -1 }).then((blogs) => {
        res.render('blog-list', { blogs })
      })
    }
  })
})

// GET /blogs/:id/edit
router.get('/blogs/:id/edit', authenticateUser, (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id

  verifyCreator(token).then((creator) => {
    Blog.findOne({ _id, creator }).then((blog) => {
      if (!blog) return res.status(401).render('error', {
        statusCode: '401',
        errorMessage: `Sorry, it doesn't look like you created that blog.`
      })
      res.render('edit-blog', { blog })
    })
  })
})

// PATCH /blogs/:id
router.patch('/blogs/:id', (req, res) => {
  const { id } = req.params
  const { title, body, image } = req.body
  const updatedBlog = { title, body, image }

  Blog.findByIdAndUpdate(id, updatedBlog).then(() => {
    res.redirect('/blogs')
  })
})

module.exports = router
