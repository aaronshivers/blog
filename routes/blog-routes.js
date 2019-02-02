const express = require('express')
const router = express.Router()
const paginate = require('express-paginate')

const Blog = require('../models/blog-model')
const authenticateUser = require('../middleware/authenticate-user')
const { verifyToken } = require('../middleware/handle-tokens')

// Required to prevent getting infinite results during pagination
router.all('*', (req, res, next) => {
  if (req.query.limit <= 10) req.query.limit = 10
  next()
})

// GET /blogs/new
router.get('/blogs/new', authenticateUser, (req, res) => {
  res.render('new-blog')
})

// POST /blogs
router.post('/blogs', authenticateUser, async (req, res) => {
  const { title, body, image } = req.body
  const token = req.cookies.token

  try {
    const creator = await verifyToken(token)
    const newBlog = { title, body, image, creator }
    const blog = await new Blog(newBlog)
    await blog.save()
    res.status(302).redirect('/blogs')
  } catch (error) {
    res.status(400).render('error', {
      statusCode: '400',
      errorMessage: error
    })
  }
})

// GET /blogs
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

// GET /blogs/:id/view
router.get('/blogs/:id/view', async (req, res) => {
  const { id } = req.params

  try {
    const blog = await Blog.findById(id).populate('creator')
    if (blog) return res.render('view-blog', { blog })
  
    res.status(404).render('error', {
      statusCode: '404',
      errorMessage: `Sorry, we can't find a blog with that Id in our database.`
    })
  } catch (error) {
    res.status(400).render('error', {
      statusCode: '400',
      errorMessage: `Sorry, That seems to be an invalid ObjectId.`
    })
  }
})

// GET /blogs/search
router.get('/blogs/search', async (req, res, next) => {
  const { term } = req.query

  try {
    const [ results, itemCount ] = await Promise.all([
      Blog.find( { $text: { $search: term } } ).populate('creator').limit(req.query.limit).skip(req.skip).lean().exec(),
      Blog.countDocuments( { $text: { $search: term } } )
    ])

    if (results < 1) return res.status(404).render('error', {
      statusCode: '404',
      errorMessage: 'Sorry, we cannot find that!'
    })

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

// GET /blogs/list
router.get('/blogs/list', authenticateUser, async (req, res, next) => {
  const { token } = req.cookies

  try {
    const creator = await verifyToken(token)
    const blogs = await Blog.find({ creator }).sort({ date: -1 })

    res.render('blog-list', { blogs })
  } catch (error) {
    throw new Error (error)
  }
})

// GET /blogs/:id/edit
router.get('/blogs/:id/edit', authenticateUser, async (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id

  try {
    const creator = await verifyToken(token)
    const conditions = { _id, creator }
    const blog = await Blog.findOne(conditions)

    if (!blog) return res.status(401).render('error', {
      statusCode: '401',
      errorMessage: `Sorry, it doesn't look like you created that blog.`
    })
    res.render('edit-blog', { blog })
  } catch (error) {
    throw new Error (error)
  }
})

// PATCH /blogs/:id
router.patch('/blogs/:id', authenticateUser, async (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id
  const { title, body, image } = req.body
  const update = { title, body, image }
  const options = { runValidators: true }

  try {
    const creator = await verifyToken(token, _id)
    const conditions = { _id, creator }
    const blog = await Blog.findOneAndUpdate(conditions, update, options)

    if (!blog) {
      res.status(404).render('error', {
        statusCode: '404',
        errorMessage: `Sorry, we couldn't find that blog in our database.`
      })
    } else {
      res.status(302).redirect('/blogs')
    }

  } catch (error) {
    res.status(400).render('error', {
      statusCode: '400',
      errorMessage: error
    })
  }
})

// DELETE /blogs/:id
router.delete('/blogs/:id', authenticateUser, async (req, res) => {
  const { token } = req.cookies
  const _id = req.params.id

  try {
    const creator = await verifyToken(token)
    const conditions = { _id, creator }
    const blog = await Blog.findOneAndDelete(conditions)

    if (!blog) {
      res.status(404).render('error', {
        statusCode: '404',
        errorMessage: `Sorry, we couldn't find that blog in our database.`
      })
    } else {
      res.status(302).redirect('/blogs')
    }
  } catch (error) {
    res.status(400).render('error', {
      statusCode: '400',
      errorMessage: error
    })
  }
})

module.exports = router
