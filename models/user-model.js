const mongoose = require('mongoose')
const validator = require('validator')

const hashPassword = require('../middleware/hash-password')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 8,
    maxlength: 100,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email address.`
    }
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 100
  },
  admin: {
    type: Boolean,
    required: false,
    default: false
  },
  avatar: { type: String },
  jobTitle: { type: String }
})

hashPassword(userSchema)

// Maximum Ranges
// A collection cannot have more than 64 indexes.
// The length of the index name cannot be longer than 125 characters.
// A compound index can have maximum 31 fields indexed.

userSchema.index({
  email: 'text',
  firstName: 'text',
  lastName: 'text',
  // fullName: 'text',
  jobTitle: 'text',
  // jobDescriptor: 'text',
  // jobArea: 'text',
  // jobType: 'text',
  // streetAddress: 'text',
  // streetPrefix: 'text',
  // streetName: 'text',
  // streetSuffix: 'text',
  // city: 'text',
  // state: 'text',
  // zipCode: 'text'
})

const User = mongoose.model('User', userSchema)

module.exports = User
