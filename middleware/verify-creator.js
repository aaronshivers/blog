const express = require('express')
const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET

const verifyCreator = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err)

      return resolve(decoded._id)
    })
  })
}

module.exports = verifyCreator
