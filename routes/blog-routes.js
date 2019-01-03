const express = require('express')
const router = express.Router()

const Blog = require('../models/blog-model')

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

router.get('/blogs', (req, res) => {
  Blog.find().then((blogs) => {
    res.render('blogs', { blogs })
  })
})

module.exports = router
