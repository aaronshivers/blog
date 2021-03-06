const mongoose = require('mongoose')

const Schema = mongoose.Schema

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 500
  },
  image: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.index({
  title: 'text',
  body: 'text'
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
