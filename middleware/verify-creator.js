const express = require('express')
const jwt = require('jsonwebtoken')

const verifyCreator = (token) => {
  const secret = process.env.JWT_SECRET
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      err ? reject(err) : resolve(decoded._id)
    })
  })
}

module.exports = verifyCreator
