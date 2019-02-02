const jwt = require('jsonwebtoken')

const createToken = async (user) => {
  const payload = { _id: user._id, admin: user.admin }
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '1d' }

  try {
    return token = await jwt.sign(payload, secret, options)
  } catch (error) {
    throw new Error (error)
  }
}

const verifyToken = async (token) => {
  const secret = process.env.JWT_SECRET

  try {
    const decoded = await jwt.verify(token, secret)
    return decoded._id
  } catch (error) {
    throw new Error (error)
  }
}

module.exports = {
  createToken,
  verifyToken
}
