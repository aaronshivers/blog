const jwt = require('jsonwebtoken')

const createToken = (user) => {
  const payload = { _id: user._id, admin: user.admin }
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '1d' }

  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      err ? reject(err) : resolve(token)
    })
  })
}

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      err ? reject(err) : resolve(decoded._id)
    })
  })
}

module.exports = {
  createToken,
  verifyToken
}
