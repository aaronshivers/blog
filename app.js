process.env.NODE_ENV === 'development' ? null : require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const mongoose = require('./db/mongoose')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const paginate = require('express-paginate')

const { populateUsers, populateBlogs } = require('./middleware/populate-database')

const app = express()
const { PORT } = process.env

const userRoutes = require('./routes/user-routes')
const blogRoutes = require('./routes/blog-routes')

app.set('view engine', 'ejs')

app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(paginate.middleware(10, 50))
app.use(cookieParser())
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.use(userRoutes)
app.use(blogRoutes)

app.get('/', (req, res) => res.redirect('/blogs'))

app.get('/populate', (req, res) => {
  populateUsers()
  
  setTimeout(() => populateBlogs(), 5000)

  setTimeout(() => res.redirect('/'), 10000)
})

app.use((req, res, next) => {
  res.status(404).render('error', {
    statusCode: '404',
    errorMessage: 'Sorry, we cannot find that!'
  })
})

app.use((err, req, res, next) => {
  res.status(500).render('error', {
    statusCode: '500',
    errorMessage: err.message
  })
})

app.listen(PORT)

module.exports = app
