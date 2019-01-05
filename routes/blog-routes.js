const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog-model')
const authenticateUser = require('../middleware/authenticate-user')

// Required to prevent getting infinite results during pagination
router.all('*', (req, res, next) => {
  if (req.query.limit <= 10) req.query.limit = 10
  next()
})

router.get('/blogs/new', authenticateUser, (req, res) => {
  res.render('new-blog')
})

router.post('/blogs', (req, res) => {
  const { title, body, image } = req.body
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET
  const decoded = jwt.verify(token, secret)
  const creator = decoded._id
  const newBlog = { title, body, image, creator }
  const blog = new Blog(newBlog)

  blog.save().then(() => {
    res.redirect('/blogs')
  })
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
    res.render('view-blog', { blog })
  })
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

// GET /blogs/:id/user
router.get('/blogs/:creator/user', async (req, res, next) => {
  const { creator } = req.params

  Blog.find({ creator }).then((blogs) => {
    res.render('blog-list', { blogs })
  })
})

module.exports = router
