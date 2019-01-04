const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')

const Blog = require('../models/blog-model')

// Required to prevent getting infinite results
router.all('*', (req, res, next) => {
  if (req.query.limit <= 10) req.query.limit = 10
  next()
})

router.get('/blogs/new', (req, res) => {
  res.render('new-blog')
})

router.post('/blogs', (req, res) => {
  const { title, body, image } = req.body
  const newBlog = { title, body, image }
  const blog = new Blog(newBlog)

  blog.save().then(() => {
    res.redirect('/blogs')
  })
})

router.get('/blogs', async (req, res, next) => {

  try {
    const [ results, itemCount ] = await Promise.all([
      Blog.find({}).limit(req.query.limit).skip(req.skip).lean().exec(),
      Blog.count({})
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

module.exports = router
