const mongoose = require('mongoose')

const Schema = mongoose.Schema

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: false,
    lowercase: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  body: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    minlength: 1,
    maxlength: 500
  },
  image: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    minlength: 1,
    maxlength: 50
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

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
