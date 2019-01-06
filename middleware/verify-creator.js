const express = require('express')
const jwt = require('jsonwebtoken')

const Blog = require(`../models/blog-model`)

const secret = process.env.JWT_SECRET

const verifyCreator = (token) => {
  return jwt.verify(token, secret, (err, decoded) => {
    return Promise.resolve(decoded._id)
  })
}

module.exports = verifyCreator
